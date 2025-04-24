<script>
	import { onMount, onDestroy } from 'svelte';
	import Swal from 'sweetalert2';
	import TopButton from '../../components/TopButton.svelte';
	import { goto } from '$app/navigation';
	import axios from 'axios';

	let templates = [];

	onMount(async () => {
		await fetchTemplates();
	});

	onDestroy(() => {
		templates = [];
	});

	async function fetchTemplates() {
		try {
			const response = await axios.get('http://localhost:3000/templates');
			templates = response.data;
			console.log('Fetched templates:', templates);
		} catch (e) {
			console.error('Fetch templates error:', e);
			Swal.fire({
				title: 'Error!',
				text: 'Failed to fetch templates',
				icon: 'error'
			});
		}
	}

	async function deleteTemplate(id) {
		try {
			await axios.delete(`http://localhost:3000/templates/${id}`);
			templates = templates.filter((template) => template.id !== id);
			Swal.fire({
				title: 'Success!',
				text: 'Template deleted successfully',
				icon: 'success',
				confirmButtonText: 'OK'
			});
		} catch (e) {
			console.error('Delete template error:', e);
			Swal.fire({
				title: 'Error!',
				text: 'Failed to delete template',
				icon: 'error'
			});
		}
	}

	function viewTemplate(id) {
		console.log('Navigating to use-template with templateId:', id);
		const url = `/use-template?templateId=${id}`;
		console.log('Navigation URL:', url);
		goto(url).then(() => {
			console.log('Navigation completed to:', url);
		}).catch(err => {
			console.error('Navigation error:', err);
			Swal.fire({
				title: 'Error!',
				text: 'Failed to navigate to template',
				icon: 'error'
			});
		});
	}

	function editTemplate(id) {
		console.log('Navigating to create-template with templateId:', id);
		const url = `/create-template?templateId=${id}`;
		console.log('Navigation URL:', url);
		goto(url).then(() => {
			console.log('Navigation completed to:', url);
		}).catch(err => {
			console.error('Navigation error:', err);
			Swal.fire({
				title: 'Error!',
				text: 'Failed to navigate to template',
				icon: 'error'
			});
		});
	}
</script>

<div class="template-list">
	<TopButton />
	<h2>Templates List</h2>
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
					<td>{template.name}</td>
					<td>{template.description}</td>
					<td>{new Date(template.created_at).toLocaleDateString()}</td>
					<td>
						<button on:click={() => viewTemplate(template.id)}>View</button>
						<button on:click={() => editTemplate(template.id)}>Edit</button>
						<button class="delete-button" on:click={() => deleteTemplate(template.id)}>Delete</button>
					</td>
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