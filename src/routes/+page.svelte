<script lang="ts">
	import Cafe from '$lib/components/Cafe.svelte';
	import Dollar from '$lib/components/Dollar.svelte';
	import Frao from '$lib/components/Frao.svelte';
	import QrGenerator from '$lib/components/QrGenerator.svelte';
	import YtDownloader from '$lib/components/YtDownloader.svelte';
	import { onMount } from 'svelte';

	interface Item {
		id: number;
		src: string;
		alt: string;
		title: string;
		path: string;
	}

	let itemsShow: Item[] = $state([
		{
			id: 1,
			src: '/currency.svg',
			alt: 'dolar',
			title: 'Consulta el precio del dolar',
			path: '/dollar'
		},
		{ id: 2, src: '/todo.svg', alt: 'shopping', title: 'Lista de Compras', path: '/shopping' },
		{ id: 3, src: '/qr.svg', alt: 'qr-generator', title: 'Generador de QR', path: '/qr-generator' },
		{ id: 4, src: '/dw.svg', alt: 'yt-downloader', title: 'Youtube Downloader', path: '/yt-downloader' }
	]);

	let activeView: number | null = $state(null);

	const handleNavClick = (id: number) => {
		activeView = id;
	};

	onMount(() => {
		activeView = itemsShow[0].id;
	})
</script>

<!-- <Cafe/> -->

<!-- <article class=" grid gap-2 my-1 maingrid h-1">

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

</article> -->

<main>
	<nav class="flex flex-col items-center gap-4 bg-sky-500 p-1">
		{#each itemsShow as item}
			<button
				onclick={() => handleNavClick(item.id)}
				class="flex flex-col items-center justify-center gap-2 rounded p-2 transition-colors"
				class:active={activeView === item.id}
			>
				<figure>
					<img src={item.src} alt="" width="40px" />
				</figure>
			</button>
		{/each}
	</nav>

	{#if activeView === 1}
		<Dollar />
	{/if}

	{#if activeView === 2}
		<Frao />
	{/if}

	{#if activeView === 3}
		<QrGenerator />
	<!-- {/if}{#if activeView === 4}
		<YtDownloader />
	{/if} -->
</main>

<style>
	main {
		/* height: 100dvh; */
		background: var(--rosa50);
		height: calc(100vh - 120px);
		display: grid;
		grid-template-columns: 50px 1fr;

		& nav {
			
			height: 100%;

			& button.active {
				background: var(--rosa100);
				border-radius: 20px;
			}
		}
	}
</style>
