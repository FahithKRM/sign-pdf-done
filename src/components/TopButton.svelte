<script>
	import '../app.css';
	import { goto } from '$app/navigation';
	
	// Track which button is active
	let activeButton = "template"; // Start with template list active
	
	function navigateToRequest() {
	  activeButton = "request";
	  goto('/request-list');
	}
  
	function navigateToTemplate() {
	  activeButton = "template";
	  goto('/template-list');
	}
	
	function navigateToCreate() {
	  goto('/create-template');
	}
	
	function navigateToUse() {
	  goto('/use-template');
	}
  </script>
  
  <main>
    	  <div class="button-tab">
		<div class="left-side">
		  <button class="request-list {activeButton === 'request' ? 'active' : ''}" on:click={navigateToRequest}>
			Request List
		  </button>
		  
		  <button class="template-list {activeButton === 'template' ? 'active' : ''}" on:click={navigateToTemplate}>
			Template List
		  </button>
		</div>
		<div class="right-side">
		  <button class="create-template" on:click={navigateToCreate}>
			Create Template
		  </button>
		</div>
	  </div>
	  <!-- <div class="edit-container">
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
	  </div> -->
  </main>

  <style>

	.button-tab{
		background-color: #fff;
		margin: 30px 50px;
		padding: 20px;
		border-radius: 6px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-height: 50px;
		width: 1400px;
	}
  
	.left-side, .right-side {
		display: flex;
		gap: 30px;
	}

.use-template, .create-template {
	  color: #fff;
	  border-radius: 6px;
	  background-color: #33475b;
	  padding: 6px 20px;
	  font-size: 18px;
	  font-weight: 600;
	}
	
.request-list, .template-list {
	  color: #666;
	  font-size: 18px;
	}

 .template-list.active {
	  background-color: #dde4ee;
	  color: #33475b;
	  border-radius: 6px;
	  padding: 6px 20px;
	}

	 .request-list.active {
	  background-color: #dde4ee;
	  color: #33475b;
	  border-radius: 6px;
	  padding: 6px 20px;
	}


	.edt-container {
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