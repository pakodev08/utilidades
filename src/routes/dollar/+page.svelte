<script lang="ts">
	import { onMount } from 'svelte';
	interface ItemData {
		image?: string;
		price?: string;
		symbol?: string;
		color?: string;
		title?: string;
	}

	interface ItemDataNew {
		date?: string;
		nombre?: string;
		promedio: string | number | undefined;
	}

	// let promedioVar: ItemData = $state({
	// 	image: '',
	// 	price: '',
	// 	symbol: '',
	// 	color: '',
	// 	title: ''
	// });
	// let bcvVar: ItemData = $state({
	// 	image: '',
	// 	price: '',
	// 	symbol: '',
	// 	color: '',
	// 	title: ''
	// });
	// let enparalelovzlaVar: ItemData = $state({
	// 	image: '',
	// 	price: '',
	// 	symbol: '',
	// 	color: '',
	// 	title: ''
	// });
	// let binanceVar: ItemData = $state({
	// 	image: '',
	// 	price: '',
	// 	symbol: '',
	// 	color: '',
	// 	title: ''
	// });
let veterano = $state(false);
	let miData: ItemDataNew[] = $state([]);

	let dataDollar = $state({});

	onMount(async () => {
		const dollarUrl = `https://ve.dolarapi.com/v1/dolares`;
		const response = await fetch(dollarUrl);
		const data = await response.json();
		
		miData = data.slice(0, 2);
		



		// const { monitors } = data;
		// console.log(monitors)

		// dataDollar = monitors;

		// const { bcv, promedio, enparalelovzla, binance } = dataDollar;

		// promedioVar = promedio;
		// bcvVar = bcv;
		// enparalelovzlaVar = enparalelovzla;
		// binanceVar = binance;

		// promedioVar.image = `https://monitordolarvenezuela.com/img/logos/promedio.webp`;

		// miData.push(bcvVar, promedioVar, enparalelovzlaVar, binanceVar);
	});

	let inputCalculador: number | null = $state(null);
	const handleCalculator = () => {
		if (inputCalculador !== null) {
			console.log(`tiene un numero ${inputCalculador}`);
		}
	};
</script>

<article>
	<a class="volver mx-5 p-2" href="/">◀️ Volver</a>
	<h1 class="text-center">Calcular</h1>
	<input
		type="number"
		name=""
		id=""
		bind:value={inputCalculador}
		placeholder="0"
		class="input-number mx-auto block w-1/2 rounded-md border-2 border-sky-500 p-2"
		oninput={handleCalculator}
	/>

	{#if inputCalculador !== null}
		<article class="mx-auto my-2 w-[90%] rounded-2xl bg-sky-500 p-2">
			{#each miData as item}
				<p class="text-amber-50">
					Tasa {item.nombre}
					{(Number(item.promedio ?? 0) * Number(inputCalculador ?? 0)).toFixed(2)} Bs
				</p>
			{/each}
		</article>
	{/if}

	<article class=" mx-auto my-2 w-[90%] rounded-2xl bg-sky-500 p-2">
		<section class="flex flex-col gap-3">
			{#each miData as item}
				<section class="box-cu box flex items-center justify-between">
					<figure>
						<p class="text-center text-amber-50">{item.nombre}</p>
						<!-- <img src={item.image} alt="dolar a banco central" height="30px" width="80px" /> -->
					</figure>

					<section class="box-price flex items-center p-1">
						<p class="p-1 text-amber-100">{item.promedio} Bs</p>
						<!-- <p style={`color: ${item.color}`}>{item.symbol}</p> -->
					</section>
				</section>
			{/each}
		</section>
	</article>
</article>

<style>
	.input-number::-webkit-outer-spin-button,
	.input-number::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
