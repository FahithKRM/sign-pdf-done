<script>
	import { createEventDispatcher } from 'svelte';
	import { panModify } from '../utils/panModify.js';

	const dispatch = createEventDispatcher();

	let canvas;
	let x = 0;
	let y = 0;
	let path = '';
	let minX = Infinity;
	let maxX = 0;
	let minY = Infinity;
	let maxY = 0;
	let paths = [];
	let drawing = false;

	function handlePanStart(event) {
		if (event.detail.target !== canvas && !canvas.contains(event.detail.target)) {
			return (drawing = false);
		}

		drawing = true;
		x = event.detail.x;
		y = event.detail.y;

		const rect = canvas.getBoundingClientRect();
		const canvasX = x - rect.left;
		const canvasY = y - rect.top;
		minX = Math.min(minX, canvasX);
		maxX = Math.max(maxX, canvasX);
		minY = Math.min(minY, canvasY);
		maxY = Math.max(maxY, canvasY);
		paths.push(['M', canvasX, canvasY]);
		path += `M${canvasX},${canvasY}`;
	}

	function handlePanMove(event) {
		if (!drawing) return;
		x = event.detail.x;
		y = event.detail.y;

		const rect = canvas.getBoundingClientRect();
		const canvasX = x - rect.left;
		const canvasY = y - rect.top;
		minX = Math.min(minX, canvasX);
		maxX = Math.max(maxX, canvasX);
		minY = Math.min(minY, canvasY);
		maxY = Math.max(maxY, canvasY);
		paths.push(['L', canvasX, canvasY]);
		path += `L${canvasX},${canvasY}`;
	}
	function handlePanEnd() {
		drawing = false;
	}
	function finish() {
		if (!paths.length) return;
		const dx = -(minX - 10);
		const dy = -(minY - 10);
		const width = maxX - minX + 20;
		const height = maxY - minY + 20;
		dispatch('finish', {
			originWidth: width,
			originHeight: height,
			path: paths.reduce((acc, cur) => {
				return acc + cur[0] + (cur[1] + dx) + ',' + (cur[2] + dy);
			}, '')
		});
	}
	function cancel() {
		dispatch('cancel');
	}
</script>

<div
	bind:this={canvas}
	use:panModify
	on:panstart={handlePanStart}
	on:panmove={handlePanMove}
	on:panend={handlePanEnd}
	class="relative w-full h-full select-none"
>
<div class="flex justify-center items-center h-full">
	<svg class="w-full h-3/4 pointer-events-none">
		<path
			stroke-width="5"
			stroke-linejoin="round"
			stroke-linecap="round"
			d={path}
			stroke="black"
			fill="none"
		/>
	</svg>
</div>

<div class="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
	<button
		on:click={cancel}
		class="w-24 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
	>
		Cancel
	</button>
	<button
		on:click={finish}
		class="w-24 bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded"
	>
		Done
	</button>
</div>
</div>