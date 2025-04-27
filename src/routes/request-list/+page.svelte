<script>
	import { onMount, onDestroy } from 'svelte';
	import Swal from 'sweetalert2';
	import TopButton from '../../components/TopButton.svelte';
	import axios from 'axios';

	let templates = [];
	let editingId = null;
	let editName = '';
	let editDescription = '';

	onMount(async () => {
		await fetchTemplates();
	});

	onDestroy(() => {
		templates = [];
	});

	async function fetchTemplates() {
		try {
			const response = await axios.get('http://localhost:3000/used-templates');
			console.log('Fetched used templates:', response.data);
			templates = response.data;
		} catch (e) {
			console.error('Fetch used templates error:', e);
			Swal.fire({
				title: 'Error!',
				text: 'Failed to fetch used templates',
				icon: 'error'
			});
		}
	}

	async function deleteTemplate(id) {
		try {
			await axios.delete(`http://localhost:3000/used-templates/${id}`);
			templates = templates.filter((template) => template.id !== id);
			Swal.fire({
				title: 'Success!',
				text: 'Template deleted successfully',
				icon: 'success',
				confirmButtonText: 'OK'
			});
		} catch (e) {
			console.error('Delete used template error:', e);
			Swal.fire({
				title: 'Error!',
				text: 'Failed to delete template',
				icon: 'error'
			});
		}
	}

	function startEdit(template) {
		editingId = template.id;
		editName = template.name;
		editDescription = template.description;
	}

	async function saveEdit(id) {
		try {
			const response = await axios.patch(`http://localhost:3000/used-templates/${id}`, {
				name: editName,
				description: editDescription
			});
			templates = templates.map((template) =>
				template.id === id ? response.data : template
			);
			editingId = null;
			Swal.fire({
				title: 'Success!',
				text: 'Template updated successfully',
				icon: 'success',
				confirmButtonText: 'OK'
			});
		} catch (e) {
			console.error('Update used template error:', e);
			Swal.fire({
				title: 'Error!',
				text: 'Failed to update template',
				icon: 'error'
			});
		}
	}

	async function downloadTemplate(id) {
		try {
			const response = await axios.get(`http://localhost:3000/used-templates/file/${id}`, { responseType: 'blob' });
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `used_template_${id}.pdf`);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (e) {
			console.error('Download used template error:', e);
			Swal.fire({
				title: 'Error!',
				text: 'Failed to download template',
				icon: 'error'
			});
		}
	}
</script>

<div class="template-list">
	<TopButton />
	<h2>Request List</h2>
	<table>
		<thead>
			<tr>
				<th>Title</th>
				<th>Description</th>
				<th>Create Date</th>
				<th>Action</th>
			</tr>
		</thead>
		<tbody>
			{#each templates as template (template.id)}
				<tr>
					{#if editingId === template.id}
						<td><input type="text" bind:value={editName} /></td>
						<td><input type="text" bind:value={editDescription} /></td>
						<td>{new Date(template.created_at).toLocaleDateString()}</td>
						<td>
							<button on:click={() => saveEdit(template.id)}>Save</button>
							<button on:click={() => (editingId = null)}>Cancel</button>
						</td>
					{:else}
						<td>{template.name}</td>
						<td>{template.description}</td>
						<td>{new Date(template.created_at).toLocaleDateString()}</td>
						<td>
							<button on:click={() => downloadTemplate(template.id)}>Download</button>
							<button class="delete-button" on:click={() => deleteTemplate(template.id)}>Delete</button>
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.template-list {
		padding: 20px;
	}
  h2{
    color: #33475b;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
  }
	table {
		width: 100%;
		border-collapse: collapse;
	}
	/* td {
		border: 1px solid #dde4ee;
		padding: 8px;
		text-align: left;
	} */
	th, td {
    border-radius: 6px;
    border: 1px solid #dde4ee;
		padding: 8px;
		text-align: center;
		background-color: #fff;
	}
  th{
    color: #33475b;
  }
	button {
		margin-right: 5px;
		padding: 5px 10px;
		cursor: pointer;
		background-color: #33475b;
		color: white;
		border: none;
		border-radius: 4px;
	}
	
	button:hover {
		background-color: #0056b3;
	}

	.delete-button{
		background-color: red;
	}

	.delete-button:hover{
		background-color: #ff0000;
	}
</style>