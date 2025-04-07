<script lang="ts">
	import Cafe from "$lib/components/Cafe.svelte";


interface Item {
    id: number;
    src: string;
    alt: string;
    title: string;
    path : string
}
    
    let itemsShow : Item[] = $state([
        {id: 1, src: '/dolar.png', alt: 'dolar', title: 'Consulta el precio del dolar' , path : '/dollar'},
        {id: 2, src: '/bag.png', alt: 'shopping', title: 'Lista de Compras', path : '/shopping'},
    ])
</script>


<Cafe/>

<article class=" grid gap-2 my-1 maingrid h-1">

    {#each itemsShow as item}
    <section class="flex bg-amber-400 items-center">
        <a href={item.path} class="  w-full flex items-center ">
		<figure>
            <img src="{item.src}" alt="" width="80px" />
            </figure>
            <p>{item.title}</p>
        </a>
        </section>
    {/each}

</article>
