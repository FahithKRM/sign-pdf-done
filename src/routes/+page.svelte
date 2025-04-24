<script>
	import '../app.css';
	import TopButton from '../components/TopButton.svelte';
</script>

<main>
	<div class="container">
		<TopButton />
	</div>
</main>

<style>
	main {
		display: flex;
		margin: 40px;
		background-color: #fff;
		border-radius: 10px;
		min-height: 100vh;
		padding: 20px;
	}

	.container {
		display: flex;
		border-radius: 6px;
		border: 2px solid #dde4ee;
		min-width: 90vw;
		background-color: #dde4ee;
	}
</style>