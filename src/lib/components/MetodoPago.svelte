<script>
	let paymentMethods = [
		{
			id: 'binance',
			value: 'Binance',
			src: 'binance.webp',
			email: 'pikrazstore@gmail.com',
			pay: `217734424`
		},
		{ id: 'bdv', value: 'Pago Movil', src: 'bdv.png', ci: '25096199', tlf: '04126829644' }
		// agregar más métodos de pago aquí
	];

	let selectedMethod = '';

	function selectMethod(method) {
		selectedMethod = method.id;
	}

	const handleCopy = (e) => {
		navigator.clipboard.writeText(e.target.textContent);
		console.log('Texto copiado al portapapeles:', e.target.textContent);
	};
</script>

<article class="payment-container">
	{#each paymentMethods as method}
		<label for={method.id}>
			<input
				type="radio"
				name="paymentMethod"
				id={method.id}
				value={method.id}
				onchange={() => selectMethod(method)}
			/>
			{method.value}
		</label>
		<!-- <img src={method.src} alt="" width="40"> -->
	{/each}
</article>

{#if selectedMethod}
	<section class="payment payment-info">
		<figure>
			<img src={paymentMethods.find((method) => method.id === selectedMethod)?.src} alt="" />
		</figure>

		

		<button onclick={handleCopy}>
        
			 {paymentMethods.find((method) => method.id === selectedMethod)?.pay}
		</button>
		<!-- <p onclick={handleCopy}>
			{paymentMethods.find((method) => method.id === selectedMethod)?.pay}
		</p> -->
		<button onclick={handleCopy}>   {paymentMethods.find((method) => method.id === selectedMethod)?.ci}</button>
		<button onclick={handleCopy}>{paymentMethods.find((method) => method.id === selectedMethod)?.tlf}</button>
	</section>
{/if}

<style>
	.payment-container {
		margin-bottom: 20px;
		margin-top: 20px;
		margin: 20px auto;
		display: flex;
		justify-content: center;
		gap: 10px;

		& label {
			margin-right: 10px;
		}
	}
	.payment {
		display: flex;
		justify-content: center;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		margin-top: 10px;
        width: 50%;
        margin: 0 auto;
	}

	figure {
		margin-top: 10px;
	}
	img {
		aspect-ratio: 1/1;
		width: 80px;
		object-fit: cover;
		height: 100%;
	}
</style>
