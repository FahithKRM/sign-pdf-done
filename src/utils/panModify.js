export function panModify(node) {
	let lastX, lastY;

	function handlePointerDown(event) {
		if (event.pointerType === 'touch' && event.touches.length > 1) return;

		const { clientX, clientY } = event;
		lastX = clientX;
		lastY = clientY;

		node.dispatchEvent(
			new CustomEvent('panstart', {
				detail: { x: lastX, y: lastY, target: event.target }
			})
		);

		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', handlePointerUp);
	}

	function handlePointerMove(event) {
		const { clientX, clientY } = event;
		const dx = clientX - lastX;
		const dy = clientY - lastY;
		lastX = clientX;
		lastY = clientY;

		node.dispatchEvent(
			new CustomEvent('panmove', {
				detail: { x: lastX, y: lastY, dx, dy }
			})
		);
	}

	function handlePointerUp(event) {
		const { clientX, clientY } = event;
		lastX = clientX;
		lastY = clientY;

		node.dispatchEvent(
			new CustomEvent('panend', {
				detail: { x: lastX, y: lastY }
			})
		);

		window.removeEventListener('pointermove', handlePointerMove);
		window.removeEventListener('pointerup', handlePointerUp);
	}

	node.addEventListener('pointerdown', handlePointerDown);

	return {
		destroy() {
			node.removeEventListener('pointerdown', handlePointerDown);
		}
	};
}
