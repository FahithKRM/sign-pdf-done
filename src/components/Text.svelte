<svelte:options immutable={true} />

<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import { panModify } from '../utils/panModify.js';
	import { tapout } from '../utils/tapout.js';
	import { fonts } from '../utils/getFonts.js';

	export let size;
	export let text;
	export let x;
	export let y;
	export let fontFamily;
	export let width = 0;
	export let pageScale = 1;

	const Families = Object.keys(fonts);
	const dispatch = createEventDispatcher();
	let startX;
	let startY;
	let editable;
	let _size = size;
	let _fontFamily = fontFamily;
	let dx = 0;
	let dy = 0;
	let operation = '';
	let startWidth;
	let startXPos;
	let resizingLeft = false;
	let resizingRight = false;

	function handlePanMove(event) {
		if (resizingRight) {
			const newWidth = Math.max(100, startWidth + (event.detail.x - startX) / pageScale);
			dispatch('update', { width: newWidth });
		} else if (resizingLeft) {
			const deltaX = (event.detail.x - startX) / pageScale;
			const newWidth = Math.max(100, startWidth - deltaX);
			const newX = startXPos + deltaX;
			dispatch('update', { width: newWidth, x: newX });
		} else {
			dx = (event.detail.x - startX) / pageScale;
			dy = (event.detail.y - startY) / pageScale;
		}
	}

	function handlePanEnd(event) {
		if (resizingRight || resizingLeft) {
			resizingRight = false;
			resizingLeft = false;
		} else if (dx === 0 && dy === 0) {
			return editable.focus();
		} else {
			dispatch('update', {
				x: x + dx,
				y: y + dy
			});
			dx = 0;
			dy = 0;
			operation = '';
		}
	}

	function handlePanStart(event) {
		startX = event.detail.x;
		startY = event.detail.y;
		operation = 'move';
	}

	function handleResizeRightStart(event) {
		startX = event.detail.x;
		startWidth = width || editable.clientWidth;
		resizingRight = true;
		operation = 'resize';
	}

	function handleResizeLeftStart(event) {
		startX = event.detail.x;
		startWidth = width || editable.clientWidth;
		startXPos = x;
		resizingLeft = true;
		operation = 'resize';
	}

	function onFocus() {
		operation = 'edit';
	}

	async function onBlur() {
		if (operation !== 'edit' && operation !== 'tool') return;
		editable.blur();
		sanitize();
		dispatch('update', {
			lines: extractLines(),
			width: width || editable.clientWidth
		});
		operation = '';
	}

	async function onPaste(e) {
		const pastedText = e.clipboardData.getData('text');
		document.execCommand('insertHTML', false, pastedText);
		return await new Promise((res) => setTimeout(res, 0));
		sanitize();
	}

	function onKeydown(e) {
		const childNodes = Array.from(editable.childNodes);
		if (e.keyCode === 13) {
			e.preventDefault();
			const selection = window.getSelection();
			const focusNode = selection.focusNode;
			const focusOffset = selection.focusOffset;
			if (focusNode === editable) {
				editable.insertBefore(document.createElement('br'), childNodes[focusOffset]);
			} else if (focusNode instanceof HTMLBRElement) {
				editable.insertBefore(document.createElement('br'), focusNode);
			} else if (focusNode.textContent.length !== focusOffset) {
				document.execCommand('insertHTML', false, '<br>');
			} else {
				let br = focusNode.nextSibling;
				if (br) {
					editable.insertBefore(document.createElement('br'), br);
				} else {
					br = editable.appendChild(document.createElement('br'));
					br = editable.appendChild(document.createElement('br'));
				}
				selection.collapse(br, 0);
			}
		}
	}

	function onFocusTool() {
		operation = 'tool';
	}

	async function onBlurTool() {
		if (operation !== 'tool' || operation === 'edit') return;
		dispatch('update', {
			lines: extractLines(),
			size: _size,
			fontFamily: _fontFamily
		});
		operation = '';
	}

	function sanitize() {
		let weirdNode;
		while (
			(weirdNode = Array.from(editable.childNodes).find(
				(node) => !['#text', 'BR'].includes(node.nodeName)
			))
		) {
			editable.removeChild(weirdNode);
		}
	}

	function onChangeFont() {
		dispatch('selectFont', {
			name: _fontFamily
		});
	}

	function render() {
		editable.innerHTML = text;
		editable.focus();
	}

	function extractLines() {
		const nodes = editable.childNodes;
		const lines = [];
		let lineText = '';
		for (let index = 0; index < nodes.length; index++) {
			const node = nodes[index];
			if (node.nodeName === 'BR') {
				lines.push(lineText);
				lineText = '';
			} else {
				lineText += node.textContent;
			}
		}
		lines.push(lineText);
		return lines;
	}

	function onDelete() {
		dispatch('delete');
	}

	onMount(() => {
		render();
		if (!editable.innerHTML) {
			editable.innerHTML = text || ' ';
		}
	});

	let portal;
	$: portal && document.body.appendChild(portal);
</script>

<div
	use:tapout
	on:tapout={onBlur}
	class="absolute left-0 top-0 select-none"
	style="transform: translate({x + dx}px, {y + dy}px);"
>
	<div
		use:panModify
		on:panstart={handlePanStart}
		on:panmove={handlePanMove}
		on:panend={handlePanEnd}
		class="tag-box"
		class:cursor-grab={!operation}
		class:cursor-grabbing={operation === 'move'}
		class:editing={['edit', 'tool'].includes(operation)}
	>

	<div on:click={onDelete} class="cancel-btn">
		<!-- class="absolute top-0 right-0 w-3 h-3 m-auto rounded-full text-white bg-red-00 cursor-pointer transform -translate-y-1/2 md:scale-25 flex justify-center items-center" -->

		<i class="cancel-icon fa-solid fa-x"></i>
	</div>
    </div>
	<div
		bind:this={editable}
		on:focus={onFocus}
		on:keydown={onKeydown}
		on:paste|preventDefault={onPaste}
		contenteditable="!true"
		spellcheck="false"
		class="tag-text z-40 outline-none whitespace-pre"
		style="font-size: {_size}px; font-family: '{_fontFamily}', serif; -webkit-user-select: text; width: {width
			? `${width}px`
			: '120px'};"
	/>

	<div
		use:panModify
		on:panstart={handleResizeLeftStart}
		on:panmove={handlePanMove}
		on:panend={handlePanEnd}
		class="resize-handle absolute top-0 left-0 w-1 h-full cursor-ew-resize"
	/>

	<div
		use:panModify
		on:panstart={handleResizeRightStart}
		on:panmove={handlePanMove}
		on:panend={handlePanEnd}
		class="resize-handle absolute top-0 right-0 w-1 h-full cursor-ew-resize"
	/>
</div>

<style>
    .editing {
		@apply pointer-events-none border-gray-100 border-dashed;
	}
    
	.font-family {
		@apply block appearance-none h-6 w-full bg-white pl-2 pr-8 rounded-sm leading-tight;
	}

	.tag-box {
		position: absolute;
		cursor: grab;
	}

	.tag-text {
		width: 100px;
		background-color: #e0e7ff;
		color: #1f2937;
		border: 1px solid rgb(0, 149, 255);
		line-height: 1.4;
		padding: 0 5px;
	}

	.resize-handle {
		opacity: 0.7;
	}

	.resize-handle:hover {
		opacity: 1;
	}

	.cancel-btn {
        display: flex;
        align-items: center;
        justify-content: center;
		position: relative;
		background-color: #fff; 
		border: 1px solid red;
		padding: 6px;
		width: fit-content;
		border-radius: 50px;
        top: -8px;
        left: 110px;
	}

	.cancel-icon {
		position: absolute;
		font-size: 8px;
		color: red;
		cursor: pointer;
	}
</style>
