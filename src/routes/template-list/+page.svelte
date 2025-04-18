<script>
    import { onMount } from 'svelte';
    import Swal from 'sweetalert2';
  
    let templates = [];
    let editingId = null;
    let editName = '';
    let editDescription = '';
  
    onMount(async () => {
      await fetchTemplates();
    });
  
    async function fetchTemplates() {
      try {
        const response = await fetch('http://localhost:3000/templates');
        templates = await response.json();
      } catch (e) {
        console.log('Fetch error:', e);
      }
    }
  
    async function deleteTemplate(id) {
      try {
        const response = await fetch(`http://localhost:3000/templates/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          templates = templates.filter((template) => template.id !== id);
          Swal.fire({
            title: 'Success!',
            text: 'Template deleted successfully',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        }
      } catch (e) {
        console.log('Delete error:', e);
      }
    }
  
    function startEdit(template) {
      editingId = template.id;
      editName = template.name;
      editDescription = template.description;
    }
  
    async function saveEdit(id) {
      try {
        const response = await fetch(`http://localhost:3000/templates/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editName, description: editDescription }),
        });
        if (response.ok) {
          templates = templates.map((template) =>
            template.id === id ? { ...template, name: editName, description: editDescription } : template
          );
          editingId = null;
          Swal.fire({
            title: 'Success!',
            text: 'Template updated successfully',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        }
      } catch (e) {
        console.log('Update error:', e);
      }
    }
  </script>
  
  <div class="template-list">
    <h2>Templates</h2>
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
        {#each templates as template (template.id)}
          <tr>
            {#if editingId === template.id}
              <td><input type="text" bind:value={editName} /></td>
              <td><input type="text" bind:value={editDescription} /></td>
              <td>{new Date(template.date).toLocaleDateString()}</td>
              <td>
                <button on:click={() => saveEdit(template.id)}>Save</button>
                <button on:click={() => (editingId = null)}>Cancel</button>
              </td>
            {:else}
              <td>{template.name}</td>
              <td>{template.description}</td>
              <td>{new Date(template.date).toLocaleDateString()}</td>
              <td>
                <button on:click={() => startEdit(template)}>Edit</button>
                <button on:click={() => deleteTemplate(template.id)}>Delete</button>
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