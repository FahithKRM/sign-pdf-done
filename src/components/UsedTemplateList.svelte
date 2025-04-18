<script>
    import Swal from 'sweetalert2';
    import '@fortawesome/fontawesome-free/css/all.min.css';

    let usedTemplates = [];

    async function loadUsedTemplates() {
        const response = await fetch('http://localhost:3000/used-templates');
        usedTemplates = await response.json();
    }

    async function deleteUsedTemplate(id) {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            await fetch(`http://localhost:3000/used-templates/${id}`, { method: 'DELETE' });
            usedTemplates = usedTemplates.filter(t => t.id !== id);
            Swal.fire('Deleted!', 'Your used template has been deleted.', 'success');
        }
    }

    async function requestUsedTemplate(template) {
        Swal.fire('Request Sent!', 'Your request has been sent.', 'success');
    }

    loadUsedTemplates();
</script>

<div class="p-5">
    <h2 class="text-2xl font-bold mb-4">Used Template List</h2>
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
            {#each usedTemplates as template}
                <tr class="border-b">
                    <td class="p-2">{template.name}</td>
                    <td class="p-2">{template.description}</td>
                    <td class="p-2">{new Date(template.createdAt).toLocaleDateString()}</td>
                    <td class="p-2 flex gap-2">
                        <button
                            on:click={() => requestUsedTemplate(template)}
                            class="bg-sky-600 text-white p-1 rounded"
                        >
                            <i class="fa-solid fa-paper-plane"></i>
                        </button>
                        <a
                            href={template.filePath}
                            download
                            class="bg-sky-600 text-white p-1 rounded"
                        >
                            <i class="fa-solid fa-download"></i>
                        </a>
                        <button
                            on:click={() => deleteUsedTemplate(template.id)}
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