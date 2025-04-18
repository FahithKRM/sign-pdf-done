<script>
    import Swal from 'sweetalert2';
    import '@fortawesome/fontawesome-free/css/all.min.css';

    export let templates = [];

    async function loadTemplates() {
        const response = await fetch('http://localhost:3000/templates');
        templates = await response.json();
    }

    async function deleteTemplate(id) {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            await fetch(`http://localhost:3000/templates/${id}`, { method: 'DELETE' });
            templates = templates.filter(t => t.id !== id);
            Swal.fire('Deleted!', 'Your template has been deleted.', 'success');
        }
    }

    async function editTemplate(template) {
        const { value: formValues } = await Swal.fire({
            title: 'Edit Template',
            html:
                `<input id="swal-input1" class="swal2-input" value="${template.name}" placeholder="Name">` +
                `<input id="swal-input2" class="swal2-input" value="${template.description}" placeholder="Description">`,
            focusConfirm: false,
            preConfirm: () => {
                return {
                    name: document.getElementById('swal-input1').value,
                    description: document.getElementById('swal-input2').value,
                };
            },
        });

        if (formValues) {
            await fetch(`http://localhost:3000/templates/${template.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formValues),
            });
            templates = templates.map(t => t.id === template.id ? { ...t, ...formValues } : t);
            Swal.fire('Updated!', 'Your template has been updated.', 'success');
        }
    }

    loadTemplates();
</script>

<div class="p-5">
    <h2 class="text-2xl font-bold mb-4">Template List</h2>
    <table class="w-full border-collapse">
        <thead>
            <tr class="bg-sky-800 text-white">
                <th class="p-2">Name</th>
                <th class="p-2">Description</th>
                <th class="p-2">Date</th>
                <th class="p-2">Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each templates as template}
                <tr class="border-b">
                    <td class="p-2">{template.name}</td>
                    <td class="p-2">{template.description}</td>
                    <td class="p-2">{new Date(template.createdAt).toLocaleDateString()}</td>
                    <td class="p-2 flex gap-2">
                        <button
                            on:click={() => editTemplate(template)}
                            class="bg-sky-600 text-white p-1 rounded"
                        >
                            <i class="fa-solid fa-edit"></i>
                        </button>
                        <a
                            href={template.filePath}
                            target="_blank"
                            class="bg-sky-600 text-white p-1 rounded"
                        >
                            <i class="fa-solid fa-eye"></i>
                        </a>
                        <button
                            on:click={() => deleteTemplate(template.id)}
                            class="bg-red-600 text-white p-1 rounded"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>