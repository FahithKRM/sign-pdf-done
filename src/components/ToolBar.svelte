<script>
   import IconifyIcon from '@iconify/svelte';

</script>


<main>
    <div class="tools">
        <div class="tool"><IconifyIcon icon="ci:undo" /></div>
        <div class="tool"><IconifyIcon icon="ci:redo" /></div>
        <div class="tool"><IconifyIcon icon="f7:printer-fill" /></div>
    </div>
    <hr class="hr-tools">
    <div class="tools">
        <div class="tool">H1</div>
        <div class="tool">H2</div>
    </div>
    <hr class="hr-tools">

    <div class="tools">
        <div class="tool"><IconifyIcon icon="mdi:dot" /></div>
        <div class="tool">1.</div>
    </div>
    <hr class="hr-tools">
                           
    <div class="tools">
        <div class="tool"><IconifyIcon icon="fluent:previous-32-filled" /></div>
        <div class="tool"><IconifyIcon icon="lets-icons:stop-fill" /></div>
        <div class="tool"><IconifyIcon icon="fluent:next-32-filled" /></div>
    </div>


    
</main>


<style>

    main{
        background-color: #f8f9fb;
        /* background-color: red; */
        height: 60px;
        /* width: 1200px; */
        display: flex;
        align-items: center;
		border-bottom: 2px solid #dde4ee;
        padding-left: 20px;
        border-radius: 6px 0 0 0 ;
        border-right: none;
    }

    .tools{
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .tool{
        color: #33475b;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
    }

    .hr-tools{
        width: 2px;
        border: none;
        height: 28px;
        background-color: #dde4ee;
        margin: 0 30px;
    }
</style>