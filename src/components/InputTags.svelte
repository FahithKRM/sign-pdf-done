<script>
    import { createEventDispatcher } from 'svelte';
    export let detectedTags = [];

    const dispatch = createEventDispatcher();
    let inputValues = {};

    function handleInputChange(tag, event) {
        const newValue = event.target.value;
        inputValues[tag.x + tag.y + tag.page + tag.type] = newValue;
        
        if (newValue && tag.type === 'text') {
            dispatch('replaceTag', { 
                ...tag, 
                newText: newValue 
            });
        }
    }

    function handleSignatureClick(tag) {
        if (tag.type === 'signature') {
            dispatch('signatureClicked', tag);
        }
    }

    function formatTagName(tag) {
        switch (tag.type) {
            case 'text':
                return `Text${tag.defaultText.replace('Text', '')}`;
            case 'signature':
                return `Signature${tag.defaultText.replace('Signature', '')}`;
            case 'email':
                return `Email${tag.defaultText.replace('Email', '')}`;
            case 'number':
                return `Number${tag.defaultText.replace('Number', '')}`;
            case 'employeeName':
                return `EmployeeName${tag.defaultText.replace('EmployeeName', '')}`;
            case 'employeeJobTitle':
                return `EmployeeJobTitle${tag.defaultText.replace('EmployeeJobTitle', '')}`;
        }
    }
</script>

<main>
    <div class="tags-title">Detected Tags</div>

    <div class="tags">
        {#if detectedTags.length > 0}
            <div class="detected-tags">
                {#each detectedTags as tag (tag.x + tag.y + tag.page + tag.type)}
                    <div class="tag-container">
                        <div
                            class="label"
                            on:click={() => handleSignatureClick(tag)}
                            class:signature-label={tag.type === 'signature'}
                        >
                            {formatTagName(tag)} <span class="detail-text">Page {tag.page}</span>
                        </div>
                        {#if tag.type === 'text'}
                            <div class="input">
                                <input
                                    type="text"
                                    placeholder="Enter value"
                                    value={inputValues[tag.x + tag.y + tag.page + tag.type] || ''}
                                    on:blur={(e) => handleInputChange(tag, e)}
                                    on:keydown={(e) => e.key === 'Enter' && handleInputChange(tag, e)}
                                />
                            </div>
                        {:else if tag.type === 'signature'}
                            <div class="input">
                                <input
                                    type="text"
                                    placeholder="Click label to draw"
                                    disabled
                                />
                            </div>
                        {:else}
                            <div class="input">
                                <input
                                    type="text"
                                    value={tag.displayText}
                                    disabled
                                />
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        {:else}
            <div class="no-tag-found">
                <span style="color: gray;">No tags found.</span>
            </div>
        {/if}
    </div>
</main>


<style>
    main {
        width: 300px;
        display: flex;
        flex-direction: column;
        background-color: #ffffff;
    }
    
    .tags-title {
        height: 60px;
        border: 2px solid #dde4ee;
        border-bottom: none;
        padding: 15px;
        border-radius: 0 6px 0 0;
        color: #33475b;
        font-size: 18px;
        font-weight: 500;
        text-align: center;
    }

    .tags {
        display: flex;
        flex-direction: column;
        background-color: #fff;
        border: 2px solid #dde4ee;
        padding-top: 10px;
        border-radius: 0 0px 6px 0;
        height: fill;
    }

    .label {
        border: 2px solid #dde4ee;
        background-color: #fff;
        width: 250px;
        padding: 5px 15px;
        margin: 0 10px;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        align-items: start;
        font-weight: 500;
        font-size: 15px;
        color: #33475b;
        cursor: default;
    }

    .signature-label {
        cursor: pointer;
    }

    .signature-label:hover {
        background-color: #f5f8fa;
    }

    .detail-text {
        font-size: 13px;
        color: #999;
    }

    .detected-tags {
        padding: 10px;
    }

    .tag-container {
        margin-bottom: 10px;
    }

    .input input {
        border: 2px solid #dde4ee;
        border-radius: 6px;
        width: 250px;
        padding: 5px 10px;
        margin: 5px 0 0 10px;
    }

    .input input:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
    }

    .no-tag-found {
        display: flex;
        justify-content: center;
        padding-top: 30px;
    }
</style>