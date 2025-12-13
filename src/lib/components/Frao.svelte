<script lang="ts">
	interface Objeto {
		name: string;
		id: string;
	}
	let inputValue = $state<string>(``);

	let arrResultado = $state<string[]>([]);

	let objetoAdd = $state<Objeto[]>([]);

	// Cargar datos desde localStorage al montar el componente
	$effect.root(() => {
		const checkData = localStorage.getItem(`check`);
		const through = localStorage.getItem(`through`);
		if (checkData) {
			objetoAdd = JSON.parse(checkData);
		}

		if (through) {
			arrResultado = JSON.parse(through);
		}
	});

	// Guardar objetoAdd en localStorage cada vez que cambie
	$effect(() => {
		localStorage.setItem(`check`, JSON.stringify(objetoAdd));
		localStorage.setItem(`through`, JSON.stringify(arrResultado));
	});

	const handleSubmit = (event: Event) => {
		event.preventDefault();
		if (inputValue.length <= 0) return;
		const newValue = {
			name: inputValue.toUpperCase(),
			id: crypto.randomUUID()
		};

		const exists = objetoAdd.some((item) => item.name === newValue.name);
		if (!exists) {
			objetoAdd = [...objetoAdd, newValue];
		} else {
			console.log('El articulo ya esta agregado');
		}

		inputValue = ``;
	};

	const RemoveElements = () => {
		objetoAdd = [];
		arrResultado = [];
	};
</script>

<!-- <a class="volver  p-2 mx-5 " href="/">◀️ Volver</a> -->
<article class="flex flex-col gap-2">
	<h1
		style="text-align: center; margin-top: 20px; width: 95%; color: #fff"
		class=" mainwidth mx-auto mb-1.5 rounded-2xl p-2"
	>
		Lista de compras
	</h1>
	<form action="" onsubmit={handleSubmit} class="flex items-center justify-center">
		<input
			type="text"
			name=""
			id=""
			class="inpo ml-1.5 w-[90%] rounded-md border-2"
			bind:value={inputValue}
			width="100"
			height="200"
			placeholder="Agregar a la lista"
		/>
		<button type="submit">
			<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="#3A4B81" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14"/></svg>
		</button>
	</form>
	{#if objetoAdd.some((item) => item.name === inputValue.toUpperCase())}
		<p style="color: red;">
			El articulo {inputValue.toUpperCase()} ya esta agregado
		</p>
	{/if}
	<section class="flex flex-col gap-2">
		{#each objetoAdd as item}
			<label for={item.id} class={arrResultado.includes(item.name) ? 'strikethrough' : ''}>
				<input
					class="chk a"
					type="checkbox"
					name=""
					id={item.id}
					value={item.name}
					bind:group={arrResultado}
				/>{item.name}
			</label>
		{/each}
	</section>
	<button  class="flex  items-center justify-end" > <img class="tra" onclick={RemoveElements} src="/trash.svg" alt="" width="26px" /></button>
</article>

<!-- <form action="" on:submit|preventDefault={handleSubmit} class="mainwidth">
	<input
		type="text"
		name=""
		id=""
		class="inpo"
		bind:value={inputValue}
		width="100"
		height="200"
		placeholder="Agregar a la lista"
	/>

	</form>
	<button class="btn btn-primary add text-m rounded-3xl bg-green-500">Agregar</button>

{#if objetoAdd.some((item) => item.name === inputValue.toUpperCase())}
	<p style="color: red;">
		El articulo {inputValue.toUpperCase()} ya esta agregado
	</p>
{/if}

<article class="mainwidth">
	<section>
		{#each objetoAdd as item}
			<label for={item.id} class={arrResultado.includes(item.name) ? 'strikethrough' : ''}>
				<input
					class="chk a"
					type="checkbox"
					name=""
					id={item.id}
					value={item.name}
					bind:group={arrResultado}
				/>{item.name}
			</label>
		{/each}
	</section>
	<button
		disabled={objetoAdd.length <= 0}
		on:click={RemoveElements}
		class="btn btn-danger remove rounded-2xl bg-red-500 p-1"
	>
		<figure>
			<img src="/trash.svg" alt="" width="20px" />
		</figure>
	</button>
</article> -->

<style>
	.strikethrough {
		text-decoration: line-through;
	}
	
	
</style>
