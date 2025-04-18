<script>
  import { onMount } from 'svelte';
  import Swal from 'sweetalert2';

  let documents = [];
  let editingId = null;
  let editName = '';
  let editDescription = '';

  onMount(async () => {
    await fetchDocuments();
  });

  async function fetchDocuments() {
    try {
      const response = await fetch('http://localhost:3000/documents');
      documents = await response.json();
    } catch (e) {
      console.log('Fetch error:', e);
    }
  }

  async function deleteDocument(id) {
    try {
      const response = await fetch(`http://localhost:3000/documents/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        documents = documents.filter((document) => document.id !== id);
        Swal.fire({
          title: 'Success!',
          text: 'Document deleted successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      }
    } catch (e) {
      console.log('Delete error:', e);
    }
  }

  function startEdit(document) {
    editingId = document.id;
    editName = document.name;
    editDescription = document.description;
  }

  async function saveEdit(id) {
    try {
      const response = await fetch(`http://localhost:3000/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, description: editDescription }),
      });
      if (response.ok) {
        documents = documents.map((document) =>
          document.id === id ? { ...document, name: editName, description: editDescription } : document
        );
        editingId = null;
        Swal.fire({
          title: 'Success!',
          text: 'Document updated successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      }
    } catch (e) {
      console.log('Update error:', e);
    }
  }
</script>

<div class="document-list">
  <h2>Documents</h2>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Description</th>
        <th>Date</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {#each documents as document (document.id)}
        <tr>
          {#if editingId === document.id}
            <td><input type="text" bind:value={editName} /></td>
            <td><input type="text" bind:value={editDescription} /></td>
            <td>{new Date(document.date).toLocaleDateString()}</td>
            <td>
              <button on:click={() => saveEdit(document.id)}>Save</button>
              <button on:click={() => (editingId = null)}>Cancel</button>
            </td>
          {:else}
            <td>{document.name}</td>
            <td>{document.description}</td>
            <td>{new Date(document.date).toLocaleDateString()}</td>
            <td>
              <button on:click={() => startEdit(document)}>Edit</button>
              <button on:click={() => deleteDocument(document.id)}>Delete</button>
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .document-list {
    padding: 20px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  th {
    background-color: #f2f2f2;
  }
  button {
    margin-right: 5px;
    padding: 5px 10px;
    cursor: pointer;
  }
</style>