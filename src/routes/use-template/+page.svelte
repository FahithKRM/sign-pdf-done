<script>
	import Swal from 'sweetalert2';
	import { v4 as uuidv4 } from 'uuid';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import axios from 'axios';
	import DrawingCanvas from '../../components/DrawingCanvas.svelte';
	import PDFPage from '../../components/PDFPage.svelte';
	import Drawing from '../../components/Drawing.svelte';
	import Text from '../../components/Text.svelte';
	import { fetchFont } from '../../utils/getFonts.js';
	import { readAsPDF, readAsArrayBuffer } from '../../utils/pdfReader.js';
	import '../../app.css';
	import ToolBar from '../../components/ToolBar.svelte';
	import InputTags from '../../components/InputTags.svelte';
	import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let pdfFile = null;
	let pdfName = '';
	let pages = [];
	let pagesScale = [];
	let allObjects = [];
	let selectedPageIndex = -1;
	let saving = false;
	let addingDrawing = false;
	let currentpage = null;
	let currentindex = 0;
	$: show = selectedPageIndex < 0 ? 'hidden' : '';
	let currentFont = 'Times-Roman';
	let detectedTags = [];
	let signaturePending = false;
	let modifiedPdf = false;
	let processedPdfs = [];
	let errorMessage = '';
	let clickedX = 0;
	let clickedY = 0;
	let userDetails = {
		employeeName: '',
		employeeJobTitle: ''
	};

	async function fetchUserDetails() {
		try {
			const response = await axios.get('http://localhost:3000/user-details');
			userDetails = response.data;
			console.log('Fetched user details:', userDetails);
			await autoReplaceTags();
		} catch (e) {
			console.error('Fetch user details error:', e);
			Swal.fire({
				title: 'Error!',
				text: 'Failed to fetch user details. Some tags may not be replaced.',
				icon: 'error'
			});
		}
	}

	async function autoReplaceTags() {
		for (const tag of detectedTags) {
			if (['employeeName', 'employeeJobTitle'].includes(tag.type)) {
				let newText = '';
				if (tag.type === 'employeeName') newText = userDetails.employeeName;
				if (tag.type === 'employeeJobTitle') newText = userDetails.employeeJobTitle;

				if (newText) {
					saving = true;
					try {
						const updatedPdfBytes = await replaceTextInPDF(
							pdfFile,
							tag.page - 1,
							tag.defaultText,
							newText,
							tag.x,
							tag.y,
							tag.size,
							tag.scale
						);

						pdfFile = new File([updatedPdfBytes], pdfName, { type: 'application/pdf' });
						await addPDF(pdfFile);

						detectedTags = detectedTags.map(t =>
							t.id === tag.id
								? { ...t, displayText: newText, newText, replaced: true }
								: t
						);

						modifiedPdf = true;
					} catch (e) {
						console.error(`Auto-replacement error for ${tag.type}:`, e);
						Swal.fire({
							title: 'Error!',
							text: `Failed to replace ${tag.type}: ${e.message}`,
							icon: 'error'
						});
					} finally {
						saving = false;
					}
				}
			}
		}
	}

	async function loadTemplate(templateId) {
		try {
			const response = await axios.get(`http://localhost:3000/templates/${templateId}`);
			const template = response.data;
			console.log('Template metadata:', template);

			if (!template || !template.name) {
				throw new Error('Template metadata is invalid or missing');
			}

			pdfName = template.name;
			detectedTags = template.tags && Array.isArray(template.tags)
				? template.tags.map(tag => ({
						id: uuidv4(),
						type: tag.type,
						page: tag.page,
						defaultText: tag.text,
						displayText: tag.text,
						newText: '',
						x: tag.x,
						y: tag.y,
						size: tag.size || 16,
						scale: pagesScale[tag.page - 1] || 1,
						replaced: false
					}))
				: [];
			console.log('Detected tags:', detectedTags);

			const fileResponse = await axios.get(`http://localhost:3000/templates/file/${templateId}`, { responseType: 'blob' });
			if (!fileResponse.data || fileResponse.data.size === 0) {
				throw new Error('PDF file is empty or not found');
			}

			const fileBlob = fileResponse.data;
			pdfFile = new File([fileBlob], template.name, { type: 'application/pdf' });
			await addPDF(pdfFile);
			errorMessage = '';
		} catch (e) {
			console.error('Load template error:', e);
			errorMessage = `Failed to load template: ${e.message}`;
			Swal.fire({
				title: 'Error!',
				text: errorMessage,
				icon: 'error'
			});
		}
	}

	async function addPDF(file) {
		try {
			const pdf = await readAsPDF(file);
			if (!pdf || pdf.numPages === 0) {
				throw new Error('PDF is invalid or has no pages');
			}

			pdfName = file.name;
			pdfFile = file;
			const numPages = pdf.numPages;
			pages = Array(numPages)
				.fill()
				.map((_, i) => pdf.getPage(i + 1));
			allObjects = pages.map(() => []);
			pagesScale = Array(numPages).fill(1);
			selectedPageIndex = 0;
			currentpage = pages[0];
			currentindex = 0;

			detectedTags = detectedTags.map(tag => ({
				...tag,
				scale: pagesScale[tag.page - 1] || 1
			}));
			console.log('PDF loaded with pages:', numPages);
		} catch (e) {
			console.error('Failed to add PDF:', e);
			pages = [];
			selectedPageIndex = -1;
			errorMessage = `Failed to add PDF: ${e.message}`;
			Swal.fire({
				title: 'Error!',
				text: errorMessage,
				icon: 'error'
			});
			throw e;
		}
	}

	function prevPage() {
		if (currentindex > 0) {
			if (modifiedPdf) {
				Swal.fire({
					title: 'Changes are automatically saved, are you sure?',
					showDenyButton: true,
					confirmButtonText: 'Previous page',
					denyButtonText: 'Stay'
				}).then((result) => {
					if (result.isConfirmed) {
						currentindex--;
						selectedPageIndex = currentindex;
						currentpage = pages[currentindex];
					}
				});
			} else {
				currentindex--;
				selectedPageIndex = currentindex;
				currentpage = pages[currentindex];
			}
		}
	}

	function nextPage() {
		if (currentindex < pages.length - 1) {
			if (modifiedPdf) {
				Swal.fire({
					title: 'Changes are automatically saved, are you sure?',
					showDenyButton: true,
					confirmButtonText: 'Next page',
					denyButtonText: 'Stay'
				}).then((result) => {
					if (result.isConfirmed) {
						currentindex++;
						selectedPageIndex = currentindex;
						currentpage = pages[currentindex];
					}
				});
			} else {
				currentindex++;
				selectedPageIndex = currentindex;
				currentpage = pages[currentindex];
			}
		}
	}

	function onAddSignature() {
		if (selectedPageIndex >= 0 && signaturePending) {
			addingDrawing = true;
			signaturePending = false;
		}
	}

	function addDrawing(originWidth, originHeight, path, scale = 1) {
		const id = uuidv4();
		const object = {
			id,
			path,
			type: 'drawing',
			x: clickedX || 0,
			y: clickedY || 0,
			originWidth,
			originHeight,
			width: originWidth * scale,
			scale
		};
		allObjects[selectedPageIndex] = [...allObjects[selectedPageIndex], object];
		detectedTags = detectedTags.map(tag =>
			tag.type === 'signature' && tag.page - 1 === selectedPageIndex && tag.x === clickedX && tag.y === clickedY
				? { ...tag, newText: 'Signature Added', displayText: 'Signature Added', replaced: true }
				: tag
		);
		addingDrawing = false;
		modifiedPdf = true;
	}

	function handleClick(event) {
		const rect = event.target.getBoundingClientRect();
		clickedX = event.clientX - rect.left;
		clickedY = event.clientY - rect.top;
	}

	function updateObject(objectId, payload) {
		allObjects = allObjects.map((objects, pIndex) =>
			pIndex === selectedPageIndex
				? objects.map((object) => (object.id === objectId ? { ...object, ...payload } : object))
				: objects
		);
	}

	function deleteObject(objectId) {
		allObjects = allObjects.map((objects, pIndex) =>
			pIndex === selectedPageIndex ? objects.filter((object) => object.id !== objectId) : objects
		);
	}

	function onMeasure(scale, i) {
		pagesScale[i] = scale;
		detectedTags = detectedTags.map(tag => ({
			...tag,
			scale: tag.page - 1 === i ? scale : tag.scale
		}));
	}

	async function savePDF() {
		if (!pdfFile || saving || !pages.length) return;
		saving = true;

		let finalPdfFile = pdfFile;
		if (allObjects.flat().some(obj => obj.type === 'drawing')) {
			const pdfBuffer = await readAsArrayBuffer(pdfFile);
			const pdfDoc = await PDFDocument.load(pdfBuffer);
			for (let i = 0; i < allObjects.length; i++) {
				const page = pdfDoc.getPage(i);
				for (const obj of allObjects[i]) {
					if (obj.type === 'drawing') {
						const img = await pdfDoc.embedPng(obj.path);
						const { width, height } = img.scale(obj.scale);
						page.drawImage(img, {
							x: obj.x,
							y: page.getHeight() - obj.y - height,
							width,
							height
						});
					}
				}
			}
			const pdfBytes = await pdfDoc.save();
			finalPdfFile = new File([pdfBytes], pdfName, { type: 'application/pdf' });
		}

		const { value: formValues } = await Swal.fire({
			title: 'Save Processed PDF',
			html:
				'<input id="swal-input1" class="swal2-input" placeholder="PDF Name">' +
				'<input id="swal-input2" class="swal2-input" placeholder="Description">',
			focusConfirm: false,
			preConfirm: () => {
				return [
					document.getElementById('swal-input1').value,
					document.getElementById('swal-input2').value
				];
			},
			didOpen: () => {
				document.getElementById('swal-input1').value = pdfName;
			}
		});

		if (formValues) {
			const [name, description] = formValues;
			if (!name) {
				Swal.fire({
					title: 'Error',
					text: 'PDF name is required',
					icon: 'error'
				});
				saving = false;
				return;
			}

			try {
				const formData = new FormData();
				formData.append('pdf', finalPdfFile);
				formData.append('name', name);
				formData.append('description', description);

				const response = await axios.post('http://localhost:3000/used-templates', formData, {
					headers: { 'Content-Type': 'multipart/form-data' }
				});
				console.log('Saved to used-templates:', response.data);

				processedPdfs = [...processedPdfs, response.data];
				Swal.fire({
					title: 'Success!',
					text: 'Processed PDF saved successfully',
					icon: 'success'
				});

				await goto('/request-list');
			} catch (e) {
				console.error('Save error:', e);
				Swal.fire({
					title: 'Error!',
					text: 'Failed to save processed PDF',
					icon: 'error'
				});
			} finally {
				saving = false;
			}
		} else {
			saving = false;
		}
	}

	async function fetchProcessedPdfs() {
		try {
			const response = await axios.get('http://localhost:3000/used-templates');
			processedPdfs = response.data;
			console.log('Fetched processed PDFs:', processedPdfs);
		} catch (e) {
			console.error('Fetch processed PDFs error:', e);
		}
	}

	async function replaceTextInPDF(pdfFile, pageIndex, oldText, newText, x, y, size, scale) {
		try {
			const pdfBuffer = await readAsArrayBuffer(pdfFile);
			const pdfDoc = await PDFDocument.load(pdfBuffer);
			const pages = pdfDoc.getPages();
			const page = pages[pageIndex];
			const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

			const oldTextWidth = font.widthOfTextAtSize(oldText, size);
			const textHeight = size;

			page.drawRectangle({
				x: x / scale,
				y: page.getHeight() - (y / scale) - textHeight,
				width: oldTextWidth,
				height: textHeight,
				color: rgb(1, 1, 1)
			});

			page.drawText(newText, {
				x: x / scale,
				y: page.getHeight() - (y / scale) - textHeight,
				size,
				font,
				color: rgb(0, 0, 0)
			});

			const pdfBytes = await pdfDoc.save();
			return pdfBytes;
		} catch (e) {
			console.error('Error in replaceTextInPDF:', e);
			throw e;
		}
	}

	async function handleTagReplace(event) {
		const { id, type, page, defaultText, x, y, size, scale, newText } = event.detail;

		if (type !== 'text') {
			Swal.fire({
				title: 'Invalid Action',
				text: 'Only text tags can be manually replaced.',
				icon: 'warning'
			});
			return;
		}

		if (page - 1 !== currentindex) {
			currentindex = page - 1;
			selectedPageIndex = currentindex;
			currentpage = pages[currentindex];
		}

		clickedX = x;
		clickedY = y;

		saving = true;
		try {
			const updatedPdfBytes = await replaceTextInPDF(
				pdfFile,
				page - 1,
				defaultText,
				newText || defaultText,
				x,
				y,
				size,
				scale
			);

			pdfFile = new File([updatedPdfBytes], pdfName, { type: 'application/pdf' });
			await addPDF(pdfFile);

			detectedTags = detectedTags.map(tag =>
				tag.id === id
					? { ...tag, displayText: newText || defaultText, newText, replaced: true }
					: tag
			);

			modifiedPdf = true;
		} catch (e) {
			console.error('Replacement error:', e);
			Swal.fire({
				title: 'Error!',
				text: `Failed to replace text: ${e.message}`,
				icon: 'error'
			});
		} finally {
			saving = false;
		}
	}

	async function handleSignatureClick(event) {
		const { id, page, x, y } = event.detail;

		if (page - 1 !== currentindex) {
			currentindex = page - 1;
			selectedPageIndex = currentindex;
			currentpage = pages[currentindex];
		}

		clickedX = x;
		clickedY = y;

		signaturePending = true;
		onAddSignature();
	}

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const templateId = urlParams.get('templateId');
		if (templateId) {
			console.log('Loading template with ID:', templateId);
			loadTemplate(templateId).then(() => {
				fetchUserDetails();
			});
		} else {
			console.warn('No templateId provided in URL');
			errorMessage = 'Select a template from the template list.';
		}
		fetchProcessedPdfs();
	});
</script>

<svelte:window
	on:dragenter|preventDefault
	on:dragover|preventDefault
	on:drop|preventDefault
/>

<main>
	<InputTags {detectedTags} on:replaceTag={handleTagReplace} on:signatureClicked={handleSignatureClick} />
	<div class="right-container">
		<ToolBar />
		<div class="edit-container">
			<div class="top-bar">
				<button
					on:click={savePDF}
					class="tools flex items-center w-24 bg-sky-800 hover:bg-sky-600 text-white font-bold py-1 px-3 md:px-4 mr-3 md:mr-4 rounded {show}"
					class:cursor-not-allowed={pages.length === 0 || saving || !pdfFile}
					class:bg-blue-700={pages.length === 0 || saving || !pdfFile}
				>
					<i class="fa-solid fa-download me-1"></i>{saving ? 'Saving' : 'Save'}
				</button>
			</div>

			{#if addingDrawing}
				<div
					class="fixed z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-dashed border-sky-800 bg-white shadow-lg rounded-lg"
					style="height: 50%; width: 500px;"
				>
					<DrawingCanvas
						on:finish={(e) => {
							const { originWidth, originHeight, path } = e.detail;
							let scale = 1;
							if (originWidth > 500) {
								scale = 500 / originWidth;
							}
							addDrawing(originWidth, originHeight, path, scale);
						}}
						on:cancel={() => (addingDrawing = false)}
					/>
				</div>
			{/if}

			{#if pages.length}
				<div
					class="flex justify-center items-center px-5 w-full md:hidden bg-sky-800 rounded-sm py-1"
				>
					<i class="fa-solid fa-pencil text-white me-3"></i>
					<input
						placeholder="Rename your PDF here"
						type="text"
						class="flex-grow bg-transparent text-white"
						bind:value={pdfName}
					/>
				</div>

				<div
					class="pdf-container p-5 w-full flex flex-col items-center overflow-hidden relative"
					on:click={handleClick}
				>
					{#if pages[selectedPageIndex]}
						<div class="relative shadow-lg border-sky-800 border-2">
							<PDFPage
								on:measure={(e) => onMeasure(e.detail.scale, selectedPageIndex)}
								page={pages[selectedPageIndex]}
							/>
							<div
								class="absolute top-0 left-0 transform origin-top-left"
								style="transform: scale({pagesScale[selectedPageIndex]}); touch-action: none;"
							>
								{#each allObjects[selectedPageIndex] as object (object.id)}
									{#if object.type === 'drawing'}
										<Drawing
											on:update={(e) => updateObject(object.id, e.detail)}
											on:delete={() => deleteObject(object.id)}
											path={object.path}
											x={object.x}
											y={object.y}
											width={object.width}
											originWidth={object.originWidth}
											originHeight={object.originHeight}
											pageScale={pagesScale[selectedPageIndex]}
										/>
									{/if}
								{/each}
								{#each detectedTags as tag (tag.id)}
									{#if tag.page - 1 === selectedPageIndex && !tag.replaced}
										<div
											class="tag-overlay"
											style="position: absolute; left: {tag.x}px; top: {tag.y}px; font-size: {tag.size}px; font-family: {currentFont}; color: black;"
										>
											{tag.displayText}
										</div>
									{/if}
								{/each}
							</div>
						</div>
					{/if}

					<div class="flex justify-between" style="width:50%">
						<div class="m-1 text-white px-3 rounded-md bg-sky-800 py-1 h-fit">
							{` ${currentindex + 1} / ${pages.length}`}
						</div>
						<div class="flex gap-1">
							<div>
								{#if currentindex > 0}
									<button
										on:click={prevPage}
										class="text-white m-2 bg-sky-600 hover:bg-sky-800 px-3 py-1 rounded"
									>
										<i class="fa-solid fa-circle-chevron-left"></i>
									</button>
								{/if}
							</div>
							<div>
								{#if currentindex < pages.length - 1}
									<button
										on:click={nextPage}
										class="text-white m-2 bg-sky-600 hover:bg-sky-800 px-3 py-1 rounded"
									>
										<i class="fa-solid fa-circle-chevron-right"></i>
									</button>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div class="choose-pdf flex items-center justify-center pt-4 w-72">
					<p>{errorMessage || 'Select a template from the template list'}</p>
				</div>
			{/if}
		</div>
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: row-reverse;
		margin: 40px;
		background-color: #fff;
		border-radius: 10px;
		min-height: 100vh;
		padding: 20px;
	}

	.right-container {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		border-radius: 6px 0 0 6px;
		border: 2px solid #dde4ee;
		width: 1200px;
	}

	.edit-container {
		background-color: #dde4ee;
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.top-bar {
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		justify-content: center;
		padding: 10px 0;
		background-color: #dde4ee;
	}

	.pdf-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10px;
		overflow: auto;
	}

	.choose-pdf {
		background-color: #fff;
		width: 500px;
		margin: 30px 0;
		min-height: 300px;
		border: 2px dashed #33475b;
		border-radius: 20px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.tag-overlay {
		pointer-events: none;
	}
</style>