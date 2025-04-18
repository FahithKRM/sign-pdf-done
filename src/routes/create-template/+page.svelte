<script>
    import Swal from 'sweetalert2';
    import { v4 as uuidv4 } from 'uuid';
    import '@fortawesome/fontawesome-free/css/all.min.css';
    import PDFPage from '../../components/PDFPage.svelte';
    import Drawing from '../../components/Drawing.svelte';
    import Text from '../../components/Text.svelte';
    import { fetchFont } from '../../utils/getFonts.js';
    import { readAsPDF } from '../../utils/pdfReader.js';
    import { save } from '../../utils/dlPDF.js';
    import '../../app.css';
    import ToolBar from '../../components/ToolBar.svelte';
    import AddTags from '../../components/AddTags.svelte';
    import TemplateList from '../../components/TemplateList.svelte';

    let pdfFile;
    let pdfName = '';
    let description = '';
    let pages = [];
    let pagesScale = [];
    let allObjects = [];
    let selectedPageIndex = -1;
    let saving = false;
    let currentpage = null;
    let currentindex = 0;
    let showList = false;
    $: show = selectedPageIndex < 0 ? 'hidden' : '';
    let currentFont = 'Times-Roman';
    let textOpened = false;
    let mouseIsWorking = false;
    let mouseX = 0;
    let mouseY = 0;
    let clickedX = 0;
    let clickedY = 0;

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

    function handleClick(event) {
        const rect = event.target.getBoundingClientRect();
        clickedX = event.clientX - rect.left;
        clickedY = event.clientY - rect.top;

        if (pendingTag) {
            addTextField(pendingTag.text, pendingTag.type, clickedX, clickedY);
            pendingTag = null;
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
            previewVisible = true;
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
        try {
            await save(pdfFile, allObjects, pdfName, pagesScale);
            const formData = new FormData();
            formData.append('file', pdfFile);
            formData.append('name', pdfName);
            formData.append('description', description);

            const response = await fetch('http://localhost:3000/templates', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to save template');
            console.log('PDF saved successfully');
            Swal.fire({
                title: 'Success!',
                text: 'PDF template saved successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        } catch (e) {
            console.log('Save error:', e);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to save PDF template',
                icon: 'error',
                confirmButtonText: 'OK'
            });
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
    <AddTags {addTag}/>
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
                <input
                    placeholder="Description"
                    type="text"
                    class="tools flex-grow bg-sky-800 text-white p-1 rounded mr-3"
                    bind:value={description}
                />
                <button
                    on:click={() => (showList = !showList)}
                    class="tools flex items-center w-24 bg-sky-800 hover:bg-sky-600 text-white font-bold py-1 px-3 md:px-4 mr-3 md:mr-4 rounded"
                >
                    <i class="fa-solid fa-list me-1"></i> Templates
                </button>
                <button
                    on:click={savePDF}
                    class="tools flex items-center w-24 bg-sky-800 hover:bg-sky-600 text-white font-bold py-1 px-3 md:px-4 mr-3 md:mr-4 rounded {show}"
                    class:cursor-not-allowed={pages.length === 0 || saving || !pdfFile}
                    class:bg-blue-700={pages.length === 0 || saving || !pdfFile}
                >
                    <i class="fa-solid fa-download me-1"></i>{saving ? 'Saving' : 'Save'}
                </button>
            </div>

            {#if showList}
                <TemplateList />
            {:else if pages.length}
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