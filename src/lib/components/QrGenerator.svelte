<script lang="ts">
	let selectFile = $state<null | File>(null);
	let preview = $state<string | null>(null);
	let wifiData = $state<any | null>(null);
	let error = $state<string | null>(null);
	let isLoading = $state<boolean>(false);
	let isDragging = $state<boolean>(false);

	const handleFileSelect = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file && file.type.startsWith('image/')) {
			processFile(file);
		}
	};

	const processFile = (file: File) => {
		selectFile = file;
		error = null;
		wifiData = null;

		const reader = new FileReader();
		reader.onloadend = () => {
			preview = reader.result as string;
		};
		reader.readAsDataURL(file);
	};

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		isDragging = true;
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		isDragging = false;
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		isDragging = false;

		const file = e.dataTransfer?.files?.[0];
		if (file && file.type.startsWith('image/')) {
			processFile(file);
		}
	};

	const handleScan = async () => {
		if (!selectFile) return;

		isLoading = true;
		error = null;
		wifiData = null;

		const formData = new FormData();
		formData.append('qrImage', selectFile);

	

		try {
			const response = await fetch('/api/wifi', {
				method: 'POST',
				body: formData
			});

			const data = await response.json();
		

			if (!response.ok) {
				// Mostrar el error específico del servidor
				const errorMsg = data.error || 'Error al procesar el QR';
				console.error('❌ Error del servidor:', errorMsg);
				if (data.rawData) {
					console.log('📄 Datos raw del QR:', data.rawData);
				}
				throw new Error(errorMsg);
			}

	
			wifiData = data;
		} catch (err: any) {
			console.error('💥 Error en handleScan:', err);
			error = err.message;
		} finally {
			isLoading = false;
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	const resetScanner = () => {
		selectFile = null;
		preview = null;
		wifiData = null;
		error = null;
	};
</script>

<article class="qr-scanner-container">
	<div class="header">
		<h1 class="title">
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
				<path
					fill="currentColor"
					d="M3 11h8V3H3zm2-6h4v4H5zM3 21h8v-8H3zm2-6h4v4H5zm8-12v8h8V3zm6 6h-4V5h4zm-5.99 4h2v2h-2zm2 2h2v2h-2zm-2 2h2v2h-2zm4 0h2v2h-2zm2 2h2v2h-2zm-4 0h2v2h-2zm2-6h2v2h-2zm2 2h2v2h-2z"
				/>
			</svg>
			Escáner de QR WiFi
		</h1>
		<p class="subtitle">Sube una imagen de un código QR para extraer la información de WiFi</p>
	</div>

	<div class="upload-section">
		<div
			class="drop-zone {isDragging ? 'dragging' : ''} {preview ? 'has-preview' : ''}"
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
			role="button"
			tabindex="0"
		>
			{#if !preview}
				<div class="upload-placeholder">
					<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24">
						<path
							fill="currentColor"
							d="M11 16V7.85l-2.6 2.6L7 9l5-5l5 5l-1.4 1.45l-2.6-2.6V16zm-5 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z"
						/>
					</svg>
					<p class="upload-text">Arrastra una imagen aquí</p>
					<p class="upload-subtext">o haz clic para seleccionar</p>
					<input
						type="file"
						accept="image/*"
						onchange={handleFileSelect}
						class="file-input"
						id="fileInput"
					/>
					<label for="fileInput" class="upload-button"> Seleccionar imagen </label>
				</div>
			{:else}
				<div class="preview-container">
					<img src={preview} alt="Preview" class="preview-image" />
					<button class="remove-button" onclick={resetScanner} aria-label="Eliminar imagen">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
							<path
								fill="currentColor"
								d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
							/>
						</svg>
					</button>
				</div>
			{/if}
		</div>

		{#if selectFile && !wifiData}
			<button
				class="scan-button {isLoading ? 'loading' : ''}"
				onclick={handleScan}
				disabled={isLoading}
			>
				{#if isLoading}
					<span class="spinner"></span>
					Escaneando...
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
						<path
							fill="currentColor"
							d="M9.5 6.5v3h-3v-3zM11 5H5v6h6zm-1.5 9.5v3h-3v-3zM11 13H5v6h6zm6.5-6.5v3h-3v-3zM19 5h-6v6h6zm-6 8h1.5v1.5H13zm1.5 1.5H16V16h-1.5zM16 13h1.5v1.5H16zm-3 3h1.5v1.5H13zm1.5 1.5H16V19h-1.5zM16 16h1.5v1.5H16zm1.5-1.5H19V16h-1.5zm0 3H19V19h-1.5zM22 7h-2V4h-3V2h5zm0 15v-5h-2v3h-3v2zM2 22h5v-2H4v-3H2zM2 2v5h2V4h3V2z"
						/>
					</svg>
					Escanear QR
				{/if}
			</button>
		{/if}
	</div>

	{#if error}
		<div class="alert error">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<path
					fill="currentColor"
					d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m1 15h-2v-2h2zm0-4h-2V7h2z"
				/>
			</svg>
			<div>
				<strong>Error</strong>
				<p>{error}</p>
			</div>
		</div>
	{/if}

	{#if wifiData}
		<div class="results-container">
			<div class="results-header">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path
						fill="currentColor"
						d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8z"
					/>
				</svg>
				<h2>Información de WiFi Extraída</h2>
			</div>

			<div class="wifi-info">
				<div class="info-item">
					<label>Nombre de Red (SSID)</label>
					<div class="info-value">
						<span>{wifiData.network}</span>
						<button
							class="copy-button"
							onclick={() => copyToClipboard(wifiData.network)}
							aria-label="Copiar SSID"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
								<path
									fill="currentColor"
									d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"
								/>
							</svg>
						</button>
					</div>
				</div>

				<div class="info-item">
					<label>Contraseña</label>
					<div class="info-value">
						<span class="password">{wifiData.password}</span>
						<button
							class="copy-button"
							onclick={() => copyToClipboard(wifiData.password)}
							aria-label="Copiar contraseña"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
								<path
									fill="currentColor"
									d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"
								/>
							</svg>
						</button>
					</div>
				</div>

				<div class="info-item">
					<label>Tipo de Seguridad</label>
					<div class="info-value">
						<span class="security-badge">{wifiData.security || 'No especificado'}</span>
					</div>
				</div>
			</div>

			<button class="scan-another-button" onclick={resetScanner}>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
					<path
						fill="currentColor"
						d="M17.65 6.35A7.96 7.96 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"
					/>
				</svg>
				Escanear otro QR
			</button>
		</div>
	{/if}
</article>

<style>
	.qr-scanner-container {
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.title {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		font-size: 2rem;
		font-weight: 700;
		color: #1a1a2e;
		margin: 0 0 0.5rem 0;
		background: var(--negro950);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		color: #64748b;
		font-size: 0.95rem;
		margin: 0;
	}

	.upload-section {
		margin-bottom: 1.5rem;
	}

	.drop-zone {
		border: 3px dashed #cbd5e1;
		border-radius: 1rem;
		padding: 3rem 2rem;
		text-align: center;
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.drop-zone.dragging {
		border-color: #667eea;
		background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
		transform: scale(1.02);
	}

	.drop-zone.has-preview {
		padding: 0;
		border: none;
		background: transparent;
	}

	.upload-placeholder svg {
		color: #94a3b8;
		margin-bottom: 1rem;
	}

	.upload-text {
		font-size: 1.1rem;
		font-weight: 600;
		color: #334155;
		margin: 0 0 0.25rem 0;
	}

	.upload-subtext {
		color: #94a3b8;
		font-size: 0.9rem;
		margin: 0 0 1.5rem 0;
	}

	.file-input {
		display: none;
	}

	.upload-button {
		display: inline-block;
		padding: 0.75rem 2rem;
		/* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
		color: var(--negro950);
        border: 1px solid var(--negro950);
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
	}

	.upload-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
	}

	.preview-container {
		position: relative;
		border-radius: 1rem;
		overflow: hidden;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
	}

	.preview-image {
		width: 100%;
		height: auto;
		display: block;
		max-height: 400px;
		object-fit: contain;
		background: #f8fafc;
	}

	.remove-button {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: rgba(239, 68, 68, 0.95);
		color: white;
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
	}

	.remove-button:hover {
		background: #dc2626;
		transform: scale(1.1);
	}

	.scan-button {
		width: 100%;
		margin-top: 1rem;
		padding: 1rem;
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		color: white;
		border: none;
		border-radius: 0.75rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
	}

	.scan-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
	}

	.scan-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.scan-button.loading {
		background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 3px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.alert {
		padding: 1rem 1.25rem;
		border-radius: 0.75rem;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1.5rem;
		animation: slideIn 0.3s ease;
	}

	.alert.error {
		background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
		border: 1px solid #fca5a5;
		color: #991b1b;
	}

	.alert svg {
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.alert strong {
		display: block;
		margin-bottom: 0.25rem;
	}

	.alert p {
		margin: 0;
		font-size: 0.9rem;
	}

	.results-container {
		background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
		border-radius: 1rem;
		padding: 1.5rem;
		border: 2px solid #86efac;
		animation: slideIn 0.4s ease;
	}

	.results-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		color: #166534;
	}

	.results-header svg {
		flex-shrink: 0;
	}

	.results-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
	}

	.wifi-info {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.info-item {
		background: white;
		padding: 1rem;
		border-radius: 0.75rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.info-item label {
		display: block;
		font-size: 0.85rem;
		font-weight: 600;
		color: #64748b;
		margin-bottom: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.info-value {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.info-value span {
		font-size: 1.1rem;
		font-weight: 600;
		color: #1e293b;
		word-break: break-all;
	}

	.password {
		font-family: 'Courier New', monospace;
		background: #f1f5f9;
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
		flex: 1;
	}

	.security-badge {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 2rem;
		font-size: 0.9rem !important;
	}

	.copy-button {
		background: #f1f5f9;
		border: none;
		padding: 0.5rem;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s ease;
		color: #64748b;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.copy-button:hover {
		background: #e2e8f0;
		color: #334155;
		transform: scale(1.1);
	}

	.scan-another-button {
		width: 100%;
		padding: 0.875rem;
		background: white;
		color: #166534;
		border: 2px solid #86efac;
		border-radius: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.scan-another-button:hover {
		background: #f0fdf4;
		border-color: #4ade80;
		transform: translateY(-2px);
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 640px) {
		.qr-scanner-container {
			padding: 1rem 0.5rem;
		}

		.title {
			font-size: 1.5rem;
		}

		.drop-zone {
			padding: 2rem 1rem;
		}
	}
</style>
