<script>
	import '../app.css';
	import ToolBar from '../components/ToolBar.svelte';
	import { goto } from '$app/navigation';
  
	function navigateToCreate() {
	  goto('/create-template');
	}
  
	function navigateToUse() {
	  goto('/use-template');
	}
  </script>
  
  <main>
	<div class="sidepanel"> </div>
	<div class="right-container">
	  <ToolBar />
	  <div class="edit-container">
		<div class="choose-pdf flex items-center justify-center pt-4 w-72">
		  <button
			class="whitespace-no-wrap w-fill bg-sky-800 hover:bg-sky-600 text-white font-bold py-4 px-3 md:px-4 rounded mr-3 cursor-pointer md:mr-4"
			on:click={navigateToCreate}
		  >
			Create Template
		  </button>
  
		  <span style="color: #33475b; font-size: 18px; font-weight: 600;">
			------------- OR -------------
		  </span>
  
		  <button
			class="whitespace-no-wrap w-fill bg-sky-800 hover:bg-sky-600 text-white font-bold py-4 px-3 md:px-4 rounded mr-3 cursor-pointer md:mr-4"
			on:click={navigateToUse}
		  >
			Use Template
		  </button>
		</div>
	  </div>
	</div>
  </main>
  
  <style>
	main {
	  display: flex;
	  flex-direction: row-reverse;
	  margin: 40px;
	  background-color: #fff;
	  border-radius: 10px;
	  min-height: 100vh;
	  padding: 20px;
	}
  
	.sidepanel {
	  width: 300px;
	  display: flex;
	  flex-direction: column;
	  background-color: #ffffff;
	  border: 2px solid #dde4ee;
	}
  
	.right-container {
	  display: flex;
	  flex-direction: column;
	  justify-content: flex-start;
	  border-radius: 6px 0 0 6px;
	  border: 2px solid #dde4ee;
	  width: 1200px;
	}
  
	.edit-container {
	  background-color: #dde4ee;
	  height: 100%;
	  width: 100%;
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: center;
	  position: relative;
	}
  
	.choose-pdf {
	  background-color: #fff;
	  width: 500px;
	  margin: 30px 0;
	  min-height: 300px;
	  border: 2px dashed #33475b;
	  border-radius: 20px;
	  display: flex;
	  flex-direction: column;
	}
  
	.choose-pdf button {
	  width: 250px;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  gap: 15px;
	  margin: 20px 0;
	  font-size: 18px;
	}
  </style>