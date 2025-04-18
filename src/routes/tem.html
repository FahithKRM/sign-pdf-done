<script>
    import Swal from 'sweetalert2';
    import { v4 as uuidv4 } from 'uuid';
    import '@fortawesome/fontawesome-free/css/all.min.css';

    import DrawingCanvas from '../components/DrawingCanvas.svelte';
    import PDFPage from '../components/PDFPage.svelte';
    import Drawing from '../components/Drawing.svelte';
    import Text from '../components/Text.svelte';
    import { fetchFont } from '../utils/getFonts.js';
    import { readAsPDF, extractTextFromPDF, readAsArrayBuffer } from '../utils/pdfReader.js';
    import { save } from '../utils/dlPDF.js';
    import '../app.css';
    import ToolBar from '../components/ToolBar.svelte';
    import SidePanel from '../components/SidePanel.svelte';
    import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

    let pdfFile;
    let pdfName = '';
    let pages = [];
    let pagesScale = [];
    let allObjects = [];
    let selectedPageIndex = -1;
    let saving = false;
    let addingDrawing = false;
    let currentpage = null;
    let currentindex = 0;
    let currentObject = null;
    $: show = selectedPageIndex < 0 ? 'hidden' : '';
    let currentFont = 'Times-Roman';
    let textOpened = false;
    let mouseIsWorking = false;
    let mouseX = 0;
    let mouseY = 0;
    let clickedX = 0;
    let clickedY = 0;
    let detectedTags = [];
    let signaturePending = false;

    let tagCounters = {
        text: 0,
        signature: 0,
        number: 0,
        email: 0
    };

    // New variables for tag preview
    let pendingTag = null; // Store the tag to be added
    let previewVisible = false; // Control preview visibility
    let previewX = 0; // Preview position
    let previewY = 0;

    let portal;
    $: portal && document.body.appendChild(portal);

    async function onUploadPDF(e) {
        const files = e.target.files || (e.dataTransfer && e.dataTransfer.files);
        const file = files[0];
        if (!file || file.type !== 'application/pdf') return;
        selectedPageIndex = -1;
        try {
            await addPDF(file);
            selectedPageIndex = 0;
            await detectTags(file);
        } catch (e) {
            console.log('Upload error:', e);
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
            allObjects = pages.map(() => []);
            pagesScale = Array(numPages).fill(1);
            selectedPageIndex = 0;
        } catch (e) {
            console.log('Failed to add pdf:', e);
            throw e;
        }
    }

    async function detectTags(file) {
        const pdf = await readAsPDF(file);
        const textByPage = await extractTextFromPDF(pdf);
        const tagDefaults = {
            'text': 'Text',
            'signature': 'Signature',
            'number': 'Number',
            'email': 'Email'
        };
        let tagsFound = [];
        tagCounters = { text: 0, signature: 0, number: 0, email: 0 };

        for (let index = 0; index < textByPage.length; index++) {
            const pageText = textByPage[index];
            const page = await pdf.getPage(index + 1);
            const textContent = await page.getTextContent();
            const scale = pagesScale[index] || 1;
            const pageHeight = (await page.getViewport({ scale: 1 })).height;

            for (const [type, defaultText] of Object.entries(tagDefaults)) {
                const regex = new RegExp(`${defaultText}\\d+`, 'g');
                const matches = pageText.match(regex) || [];

                for (const match of matches) {
                    const textItems = textContent.items.filter(item => item.str === match);
                    textItems.forEach((textItem) => {
                        const count = parseInt(match.match(/\d+$/)[0]);
                        tagCounters[type] = Math.max(tagCounters[type], count);
                        tagsFound.push({
                            type,
                            page: index + 1,
                            defaultText: match,
                            displayText: match,
                            x: textItem.transform[4],
                            y: pageHeight - textItem.transform[5] - textItem.height,
                            size: textItem.height,
                            scale,
                            count
                        });
                    });
                }
            }
        }

        detectedTags = tagsFound;
        console.log('Detected tags:', detectedTags);
    }

    function prevPage() {
        if (currentindex > 0) {
            if (
                allObjects[currentindex].some(
                    (object) => object.type === 'drawing' || object.type === 'text'
                )
            ) {
                Swal.fire({
                    title: 'Changes are automatically saved, are you sure ?',
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
            if (
                allObjects[currentindex].some(
                    (object) => object.type === 'drawing' || object.type === 'text'
                )
            ) {
                Swal.fire({
                    title: 'Changes are automatically saved, are you sure ?',
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
                title: 'Please upload a pdf',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return false;
        }
        return true;
    }

    function onAddTextField() {
        if (selectedPageIndex >= 0) {
            addTextField('Text Field', 'text');
            mouseIsWorking = false;
            textOpened = true;
        }
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
            y: posY
        };
        allObjects[selectedPageIndex] = [...allObjects[selectedPageIndex], object];
        mouseIsWorking = false;
        textOpened = false;
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
        addingDrawing = false;
    }

    function handleClick(event) {
        const rect = event.target.getBoundingClientRect();
        clickedX = event.clientX - rect.left;
        clickedY = event.clientY - rect.top;

        if (pendingTag) {
            // Place the pending tag at the click position
            addTextField(pendingTag.text, pendingTag.type, clickedX, clickedY);
            pendingTag = null; // Clear the pending tag
            previewVisible = false;
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
            previewVisible = true; // Show preview when cursor is in PDF area
        }
    }

    function handleMouseLeave() {
        previewVisible = false; // Hide preview when cursor leaves PDF area
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
        try {
            await save(pdfFile, allObjects, pdfName, pagesScale);
            console.log('PDF saved successfully');
        } catch (e) {
            console.log('Save error:', e);
        } finally {
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
        // Instead of adding immediately, set as pending tag
        pendingTag = {
            text: displayText,
            type
        };
    }

    async function replaceTextInPDF(pdfFile, pageIndex, oldText, newText, x, y, size, scale) {
        const pdfBuffer = await readAsArrayBuffer(pdfFile);
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pages = pdfDoc.getPages();
        const page = pages[pageIndex];
        const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

        const oldTextWidth = font.widthOfTextAtSize(oldText, size);
        const textHeight = size; 

        page.drawRectangle({
            x: x,
            y: page.getHeight() - y - textHeight,
            width: oldTextWidth,
            height: textHeight,
            color: rgb(1, 1, 1), 
        });

        page.drawText(newText, {
            x: x,
            y: page.getHeight() - y - textHeight,
            size: size,
            font: font,
            color: rgb(0, 0, 0), 
        });

        console.log(`Replacing '${oldText}' with '${newText}' at x:${x}, y:${page.getHeight() - y - textHeight}`);

        const pdfBytes = await pdfDoc.save();
        return pdfBytes; 
    }

    async function handleTagReplace(event) {
        const { type, page, defaultText, x, y, size, scale, newText } = event.detail;

        if (page - 1 !== currentindex) {
            currentindex = page - 1;
            selectedPageIndex = currentindex;
            currentpage = pages[currentindex];
        }

        clickedX = x;
        clickedY = y;

        if (type === 'signature') {
            signaturePending = true;
            onAddSignature();
            return;
        }

        if (type === 'email' && newText && !/\S+@\S+\.\S+/.test(newText)) {
            console.log('Invalid email format');
            return;
        }

        saving = true;
        try {
            console.log('Starting tag replacement:', { defaultText, newText, x, y, size });
            const updatedPdfBytes = await replaceTextInPDF(pdfFile, page - 1, defaultText, newText || defaultText, x, y, size, scale);
            pdfFile = new File([updatedPdfBytes], pdfName, { type: 'application/pdf' });
            await addPDF(pdfFile);
            await detectTags(pdfFile);
            await savePDF();
            console.log('Replacement successful, PDF saved');
        } catch (e) {
            console.log('Replacement error:', e);
        } finally {
            saving = false;
        }
    }

    async function handleSignatureClick(event) {
        const { page, x, y } = event.detail;

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
</script>

<svelte:window
    on:dragenter|preventDefault
    on:dragover|preventDefault
    on:drop|preventDefault={onUploadPDF}
/>

<main>
    <SidePanel {addTag} {detectedTags} on:replaceTag={handleTagReplace} on:signatureClicked={handleSignatureClick} />
    <div class="right-container">
        <ToolBar />
        <div class="edit-container">
            <div class="top-bar">
                <div
                    class="tools justify-center mx-3 md:mr-4 w-full max-w-xs hidden md:flex items-center bg-sky-800 rounded p-1 md:{show}"
                >
                    <i class="fa-solid fa-pencil text-white"></i>
                    <input
                        placeholder="Rename your PDF here"
                        type="text"
                        class="flex-grow bg-transparent ml-2 placeholder:text-white focus:outline-none text-white"
                        bind:value={pdfName}
                    />
                </div>

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
                    style="height: 50%; width:500px;"
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
                    on:mousemove={handleMouseMove}
                    on:mouseleave={handleMouseLeave}
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
                                        />
                                    {/if}
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- Tag Preview -->
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
                            />
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