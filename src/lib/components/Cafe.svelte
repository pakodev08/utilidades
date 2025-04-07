<script>
	import MetodoPago from "./MetodoPago.svelte";

    let showModal = $state(false);

    const handleModal = () => {
        showModal= true
        console.log(`click`, showModal)

      
    }
    
</script>

<button onclick={handleModal}>
    <img src="/cafe.png" alt="" width="50px">
</button>


<dialog open={showModal }   class="h-[70%] w-[90%] mx-auto p-2  ">
    <button class="close" onclick={() => (showModal = false)}>❌</button>
    <h1>Invitame un cafe☕</h1>

    <article>
        <MetodoPago/>
    </article>
</dialog>


<style>
    button{
        cursor: pointer;
        position: absolute;
        right: 5px;
        top: 50%;
        transform: translateY(-50%);
    }

    dialog{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--azulitodos);

        & h1{
            margin-top: 20px;
            text-align: center;
            font-size: 1.2rem;
        }
    }
    .close{
        display: inline-block;
        cursor: pointer;
        padding: 5px;
        border-radius: 50%;
        border: 2px solid white;
        position: absolute;
        top: 10px;
        right: 10px;
        margin-top: 20px;
    }
</style>