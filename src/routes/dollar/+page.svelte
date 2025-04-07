<script lang="ts">
	import { onMount } from 'svelte';
 interface ItemData {
    image: string;
    price: string;
    symbol: string;
    color: string;
 }
    
 let promedioVar: ItemData = $state({
    image: '',
    price: '',
    symbol: '',
    color: '',
 });
let bcvVar: ItemData = $state({
    image: '',
    price: '',
    symbol: '',
    color: '',
 });
let enparalelovzlaVar: ItemData = $state({
    image: '',
    price: '',
    symbol: '',
    color: '',
 });

	let dataDollar = $state({});


	onMount(async () => {
		const dollarUrl = `https://pydolarve.org/api/v1/dollar?page=criptodolar`;
		const response = await fetch(dollarUrl);
		const data = await response.json();
		const { monitors } = data;

		dataDollar = monitors;

		const { promedio, bcv, enparalelovzla } = dataDollar;

		promedioVar = promedio;
		console.log(promedioVar, `PROMEDIO`);
		bcvVar = bcv;
		enparalelovzlaVar = enparalelovzla;
	});
</script>

<article>
    <a class="volver  p-2 mx-5 " href="/">◀️ Volver</a>

    <article class=" mx-auto w-[90%] rounded-2xl bg-sky-500 p-2 my-2 ">
        <section class="flex flex-col gap-3">
            <section class="box-cu box flex items-center justify-between">
                <figure>
                    <p class="text-center text-amber-50">BCV</p>
                    <img src={bcvVar.image} alt="dolar a banco central" height="30px" width="80px" />
                </figure>
    
                <section class="box-price flex items-center p-1">
                    <p class="p-1 text-amber-100">{bcvVar.price} Bs</p>
                    <p style={`color: ${bcvVar.color}`}>{bcvVar.symbol}</p>
                </section>
            </section>
            <section class="box-cu box flex items-center justify-between">
                <figure>
                    <p class="text-center text-amber-50">Promedio</p>
                    <img
                        src="https://monitordolarvenezuela.com/img/logos/promedio.webp"
                        alt="Dolar promedio"
                        height="30px"
                        width="80px"
                        class="rounded-full"
                    />
                </figure>
    
                <section class="box-price flex items-center p-1">
                    <p class="p-1 text-amber-100">{promedioVar.price} Bs</p>
                    <p style={`color: ${promedioVar.color}`}>{promedioVar.symbol}</p>
                </section>
            </section>
            <section class="box-cu box flex items-center justify-between">
                <figure>
                    <p class="text-center text-amber-50">Paralelo</p>
                    <img src={enparalelovzlaVar.image} alt="Dolar paralelo" height="30px" width="80px" />
                </figure>
    
                <section class="box-price flex items-center p-1">
                    <p class="p-1 text-amber-100">{enparalelovzlaVar.price} Bs</p>
                    <p style={`color: ${enparalelovzlaVar.color}`}>{enparalelovzlaVar.symbol}</p>
                </section>
            </section>
        </section>
    </article>
    
</article>
