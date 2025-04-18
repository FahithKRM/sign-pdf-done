<script>

</script>

<main>
    <!-- <div class="tags-title">Available Tags</div>
    <div class="tags">
        <div class="search-box">
            <input type="search" placeholder="Search tags" />
        </div>

        <hr class="hr-tag" />
        <button class="tag-button" on:click={() => addTag('text')}>
            <div class="label">
                Add Text <span class="detail-text">Add text field</span>
            </div>
        </button>
        <button class="tag-button" on:click={() => addTag('signature')}>
            <div class="label">
                Add Signature <span class="detail-text">Add signature field</span>
            </div>
        </button>
        <button class="tag-button" on:click={() => addTag('number')}>
            <div class="label">
                Add Number <span class="detail-text">Add number field</span>
            </div>
        </button>
        <button class="tag-button" on:click={() => addTag('email')}>
            <div class="label">
                Add Email <span class="detail-text">Add email field</span>
            </div>
        </button>

        {#if detectedTags.length > 0}
            <hr class="hr-tag" />
            <div class="tags-title" style="margin: 10px 0; padding: 10px 15px; font-size: 16px; border-radius: 0; border-right: none; border-left: none;">
                Detected Tags in PDF
            </div>
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
                        {#if tag.type !== 'signature'}
                            <div class="input">
                                <input
                                    type={tag.type === 'number' ? 'number' : tag.type === 'email' ? 'email' : 'text'}
                                    placeholder="Enter value"
                                    value={inputValues[tag.x + tag.y + tag.page + tag.type] || ''}
                                    on:blur={(e) => handleInputChange(tag, e)}
                                    on:keydown={(e) => e.key === 'Enter' && handleInputChange(tag, e)}
                                />
                            </div>
                        {:else}
                            <div class="input">
                                <input
                                    type="text"
                                    placeholder="Click label to draw"
                                    disabled
                                />
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    </div> -->
</main>

<style>
    main {
        width: 300px;
        display: flex;
        flex-direction: column;
        background-color: #ffffff;
        border: 2px solid #dde4ee;

    }
/* 
    .tags-title {
        height: 60px;
        border: 2px solid #dde4ee;
        padding: 15px;
        border-radius: 0 6px 0 0;
        color: #33475b;
        font-size: 18px;
        font-weight: 500;
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

    .tag-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-bottom: 10px;
    }

    .tag-button:hover {
        transform: scale(1.03);
    }

    .search-box {
        margin: 5px 12px;
        color: #999;
        cursor: pointer;
    }

    .search-box input {
        border: 2px solid #dde4ee;
        border-radius: 6px;
        width: fill;
        padding: 5px 10px;
    }

    .hr-tag {
        border: none;
        width: fill;
        height: 1px;
        background-color: #dde4ee;
        margin: 10px 0;
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
        padding: 0 10px 10px 10px;
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
 */

</style>