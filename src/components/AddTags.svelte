<script>
    export let addTag;

    let tags = [
		{ label: "Employee Name", slug: "employeeName" },
        { label: "Employee Job Title", slug: "employeeJobTitle" },
        { label: "Add Text", slug: "text" },
        { label: "Add Signature", slug: "signature" },
    ];
</script>

<main>
    <div class="tags-title">Available Tags</div>
    
    <div class="tags">
        <div class="search-box">
            <input type="search" placeholder="Search tags" />
        </div>

        <hr class="hr-tag" />
        {#each tags as tag (tag.slug)}
            <button class="tag-button" on:click={() => addTag(tag.slug)}>
                <div class="label">
                    {tag.label} <span class="detail-text">Add {tag.label.toLowerCase()} field</span>
                </div>
            </button>
        {/each}
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
		cursor: pointer;
	}


	.detail-text {
		font-size: 13px;
		color: #999;
	}
</style>
