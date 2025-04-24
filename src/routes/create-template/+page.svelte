<script>
	import Swal from 'sweetalert2';
	import { v4 as uuidv4 } from 'uuid';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import axios from 'axios';
	import PDFPage from '../../components/PDFPage.svelte';
	import Drawing from '../../components/Drawing.svelte';
	import Text from '../../components/Text.svelte';
	import { fetchFont } from '../../utils/getFonts.js';
	import { readAsPDF } from '../../utils/pdfReader.js';
	import '../../app.css';
	import ToolBar from '../../components/ToolBar.svelte';
	import AddTags from '../../components/AddTags.svelte';
	import TopButton from '../../components/TopButton.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let pdfFile = null;
	let pdfName = '';
	let pages = [];
	let pagesScale = [];
	let allObjects = [];
	let selectedPageIndex = -1;
	let saving = false;
	let currentpage = null;
	let currentindex = 0;
	$: show = selectedPageIndex < 0 ? 'hidden' : '';
	let currentFont = 'Times-Roman';
	let textOpened = false;
	let mouseIsWorking = false;
	let mouseX = 0;
	let mouseY = 0;
	let clickedX = 0;
	let clickedY = 0;
	let templates = [];
	let templateId = null;

	let tagCounters = {
		text: 0,
		signature: 0,
		number: 0,
		email: 0
	};

	let pendingTag = null;
	let previewVisible = false;
	let previewX = 0;
	let previewY = 0;

	let portal;
	$: portal && document.body.appendChild(portal);

	onMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		templateId = urlParams.get('templateId');
		if (templateId) {
			await loadTemplate(templateId);
		}
	});

	async function loadTemplate(id) {
		try {
			const response = await axios.get(`http://localhost:3000/templates/${id}`);
			const template = response.data;
			if (!template || !template.name) {
				throw new Error('Template metadata is invalid or missing');
			}

			pdfName = template.name;
			const fileResponse = await axios.get(`http://localhost:3000/templates/file/${id}`, { responseType: 'blob' });
			if (!fileResponse.data || fileResponse.data.size === 0) {
				throw new Error('PDF file is empty or not found');
			}

			const fileBlob = fileResponse.data;
			pdfFile = new File([fileBlob], template.name, { type: 'application/pdf' });
			await addPDF(pdfFile);

			if (template.tags && Array.isArray(template.tags)) {
				allObjects = pages.map(() => []);
				template.tags.forEach(tag => {
					const pageIndex = tag.page - 1;
					const object = {
						id: uuidv4(),
						text: tag.text,
						type: tag.type,
						size: tag.size || 16,
						width: 0,
						lineHeight: 1.4,
						fontFamily: currentFont,
						x: tag.x,
						y: tag.y,
						page: tag.page
					};
					allObjects[pageIndex] = [...allObjects[pageIndex], object];
				});

				tagCounters = {
					text: 0,
					signature: 0,
					number: 0,
					email: 0
				};
				template.tags.forEach(tag => {
					if (tag.type === 'text') tagCounters.text = Math.max(tagCounters.text, parseInt(tag.text.replace('Text', '')) || 0);
					if (tag.type === 'signature') tagCounters.signature = Math.max(tagCounters.signature, parseInt(tag.text.replace('Signature', '')) || 0);
					if (tag.type === 'number') tagCounters.number = Math.max(tagCounters.number, parseInt(tag.text.replace('Number', '')) || 0);
					if (tag.type === 'email') tagCounters.email = Math.max(tagCounters.email, parseInt(tag.text.replace('Email', '')) || 0);
				});
			}

			// Ensure the UI updates after loading
			if (pages.length > 0) {
				selectedPageIndex = 0;
				currentindex = 0;
				currentpage = pages[0];
				// Force reactivity by reassigning
				pages = [...pages];
				allObjects = [...allObjects];
			}
		} catch (e) {
			console.error('Load template error:', e);
			Swal.fire({
				title: 'Error!',
				text: `Failed to load template: ${e.message}`,
				icon: 'error'
			});
		}
	}

	async function onUploadPDF(e) {
		const files = e.target.files || (e.dataTransfer && e.dataTransfer.files);
		const file = files[0];
		if (!file || file.type !== 'application/pdf') return;
		selectedPageIndex = -1;
		try {
			await addPDF(file);
			selectedPageIndex = 0;
		} catch (e) {
			console.log('Upload error:', e);
			Swal.fire({
				title: 'Error!',
				text: 'Failed to upload PDF',
				icon: 'error'
			});
		}
	}

	async function addPDF(file) {
		try {
			const pdf = await readAsPDF(file);
			pdfName = file.name;
			pdfFile = file;
			const numPages = pdf.numPages;
			pages = Array(numPages)
				.fill()
				.map((_, i) => pdf.getPage(i + 1));
			if (!templateId) {
				allObjects = pages.map(() => []);
			}
			pagesScale = Array(numPages).fill(1);
			selectedPageIndex = 0;
			currentpage = pages[0];
			currentindex = 0;
		} catch (e) {
			console.log('Failed to add pdf:', e);
			Swal.fire({
				title: 'Error!',
				text: 'Failed to add PDF',
				icon: 'error'
			});
			throw e;
		}
	}

	function prevPage() {
		if (currentindex > 0) {
			if (allObjects[currentindex].some((object) => object.type === 'drawing' || object.type === 'text')) {
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
			if (allObjects[currentindex].some((object) => object.type === 'drawing' || object.type === 'text')) {
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

	function selectFontFamily(event) {
		const name = event.detail.name;
		fetchFont(name);
		currentFont = name;
	}

	function IsPDFUploaded() {
		if (!pdfFile || pages.length === 0) {
			Swal.fire({
				title: 'Please upload a PDF',
				icon: 'warning',
				confirmButtonText: 'OK'
			});
			return false;
		}
		return true;
	}

	function addTextField(text, type, x, y) {
		const posX = x !== undefined ? x : (mouseIsWorking ? clickedX : 100);
		const posY = y !== undefined ? y : (mouseIsWorking ? clickedY : 100);

		const id = uuidv4();
		fetchFont(currentFont);
		const object = {
			id,
			text,
			type,
			size: 16,
			width: 0,
			lineHeight: 1.4,
			fontFamily: currentFont,
			x: posX,
			y: posY,
			page: selectedPageIndex + 1
		};
		allObjects[selectedPageIndex] = [...allObjects[selectedPageIndex], object];
		mouseIsWorking = false;
		textOpened = false;
		// Reset pending tag and preview
		pendingTag = null;
		previewVisible = false;
	}

	function handleClick(event) {
		const rect = event.target.getBoundingClientRect();
		clickedX = event.clientX - rect.left;
		clickedY = event.clientY - rect.top;

		if (pendingTag) {
			addTextField(pendingTag.text, pendingTag.type, clickedX, clickedY);
		} else {
			mouseX = event.clientX;
			mouseY = event.clientY;
			mouseIsWorking = true;
		}
	}

	function handleMouseMove(event) {
		if (pendingTag) {
			const rect = event.currentTarget.getBoundingClientRect();
			previewX = event.clientX - rect.left;
			previewY = event.clientY - rect.top;
			previewVisible = true;
		} else {
			previewVisible = false;
		}
	}

	function handleMouseLeave() {
		previewVisible = false;
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
	}

	async function savePDF() {
		if (!pdfFile || saving || !pages.length) return;
		saving = true;

		const { value: formValues } = await Swal.fire({
			title: templateId ? 'Update Template' : 'Save Template',
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
				if (templateId) {
					document.getElementById('swal-input1').value = pdfName;
					document.getElementById('swal-input2').value = templates.find(t => t.id === templateId)?.description || '';
				}
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
				formData.append('pdf', pdfFile);
				formData.append('name', name);
				formData.append('description', description);
				formData.append('tags', JSON.stringify(allObjects.flat()));

				let response;
				if (templateId) {
					response = await axios.patch(`http://localhost:3000/templates/${templateId}`, formData, {
						headers: { 'Content-Type': 'multipart/form-data' }
					});
					Swal.fire({
						title: 'Success!',
						text: 'Template updated successfully',
						icon: 'success'
					});
				} else {
					response = await axios.post('http://localhost:3000/templates', formData, {
						headers: { 'Content-Type': 'multipart/form-data' }
					});
					Swal.fire({
						title: 'Success!',
						text: 'Template saved successfully',
						icon: 'success'
					});
				}

				templates = [...templates, response.data];
				await goto('/template-list');
			} catch (e) {
				console.log('Save error:', e);
				Swal.fire({
					title: 'Error!',
					text: templateId ? 'Failed to update template' : 'Failed to save template',
					icon: 'error'
				});
			} finally {
				saving = false;
			}
		} else {
			saving = false;
		}
	}

	function addTag(type) {
		if (!IsPDFUploaded()) return;

		tagCounters[type]++;
		let displayText;
		switch (type) {
			case 'text':
				displayText = `Text${tagCounters.text}`;
				break;
			case 'signature':
				displayText = `Signature${tagCounters.signature}`;
				break;
			case 'number':
				displayText = `Number${tagCounters.number}`;
				break;
			case 'email':
				displayText = `Email${tagCounters.email}`;
				break;
		}
		pendingTag = {
			text: displayText,
			type
		};
	}
</script>

<svelte:window
	on:dragenter|preventDefault
	on:dragover|preventDefault
	on:drop|preventDefault={onUploadPDF}
/>

<main>
	<AddTags {addTag} />
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
					on:mousemove={handleMouseMove}
					on:mouseleave={handleMouseLeave}
				>
					{#if pages.length > 0 && pages[selectedPageIndex]}
						<div class="relative shadow-lg border-sky-800 border-2">
							<PDFPage
								on:measure={(e) => onMeasure(e.detail.scale, selectedPageIndex)}
								page={pages[selectedPageIndex]}
							/>
							<div
								class="absolute top-0 left-0 transform origin-top-left"
								style="transform: scale({pagesScale[selectedPageIndex]}); touch-action: none;"
							>
								{#each allObjects[selectedPageIndex] || [] as object (object.id)}
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
									{:else if ['text', 'signature', 'number', 'email'].includes(object.type)}
										<Text
											on:update={(e) => updateObject(object.id, e.detail)}
											on:delete={() => deleteObject(object.id)}
											on:selectFont={selectFontFamily}
											text={object.text}
											x={object.x}
											y={object.y}
											size={object.size}
											fontFamily={object.fontFamily}
											width={object.width}
											pageScale={pagesScale[selectedPageIndex]}
											draggable={true}
										/>
									{/if}
								{/each}
							</div>
						</div>
					{:else}
						<p>Loading PDF...</p>
					{/if}

					{#if previewVisible && pendingTag}
						<div
							class="tag-preview absolute"
							style="left: {previewX}px; top: {previewY}px; transform: translate(-50%, -50%); opacity: 0.7;"
						>
							<Text
								text={pendingTag.text}
								x={0}
								y={0}
								size={14}
								fontFamily={currentFont}
								width={0}
								pageScale={pagesScale[selectedPageIndex]}
								preview={true}
							/>
						</div>
					{/if}

					{#if pages.length > 0}
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
					{/if}
				</div>
			{:else}
				<div class="choose-pdf flex items-center justify-center pt-4 w-72">
					<input type="file" name="pdf" id="pdf" on:change={onUploadPDF} class="hidden" />
					<label
						class="whitespace-no-wrap w-fill bg-sky-800 hover:bg-sky-600 text-white font-bold py-4 px-3 md:px-4 rounded mr-3 cursor-pointer md:mr-4"
						for="pdf"
					>
						<i class="fa-solid fa-upload"></i>
						Choose PDF
					</label>
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
	}

	.tag-preview {
		pointer-events: none;
		z-index: 20;
	}
</style>