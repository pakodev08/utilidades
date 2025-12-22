<script lang="ts">
	import { onMount } from 'svelte';
	import Spinner from './Spinner.svelte';

	type VideoFormat = {
		format_id: string;
		ext: string;
		resolution?: string;
		filesize?: number;
		vcodec?: string;
		acodec?: string;
		format_note?: string;
	};

	type VideoInfo = {
		title: string;
		formats: VideoFormat[];
		webpage_url: string;
		thumbnail?: string;
		duration?: number;
		uploader?: string;
	};

	let videoInformation: VideoInfo | null = $state(null);
	let infoSuccess: boolean = $state(false);
	let isLoading: boolean = $state(false);
	let isDownloading: boolean = $state(false);

	let urlVideo: string = $state('');
	let isValidURLBoolean: boolean = $state(false);
	let messageError: string = $state('');

	// Opciones de descarga
	let selectedFilter: 'videoonly' | 'audioonly' | 'audioandvideo' | 'mergevideo' =
		$state('mergevideo');
	let selectedQuality: string = $state('highest');
	let selectedFormat: string = $state('mp4');
	let selectedAudioFormat: string = $state('mp3');

	const getVideoInfo = async () => {
		isLoading = true;
		infoSuccess = false;
		try {
			const response = await fetch(`/api/yt-download`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ urlVideo })
			});

			const data = await response.json();

			if (data.success) {
				videoInformation = data.info;
				infoSuccess = true;
			} else {
				messageError = data.error || 'Error al obtener información del video';
				isValidURLBoolean = true;
			}
		} catch (error) {
			console.error('Error en fetch:', error);
			messageError = 'Error de conexión';
			isValidURLBoolean = true;
		} finally {
			isLoading = false;
		}
	};

	const downloadVideo = async () => {
		if (!videoInformation) return;

		isDownloading = true;
		try {
			let formatString = '';

			switch (selectedFilter) {
				case 'videoonly':
					// Solo video sin audio
					if (selectedQuality === 'highest') {
						formatString = `bestvideo[ext=${selectedFormat}]/bestvideo`;
					} else {
						const height = selectedQuality.replace('p', '');
						formatString = `bestvideo[height<=${height}]/bestvideo`;
					}
					break;
				case 'audioonly':
					formatString = 'bestaudio/best';
					break;
				case 'audioandvideo':
					formatString =
						selectedQuality === 'highest'
							? 'best'
							: `best[height<=${selectedQuality.replace('p', '')}]`;
					break;
				case 'mergevideo':
					// Video + Audio (mejor calidad, requiere merge)
					if (selectedQuality === 'highest') {
						formatString = 'bestvideo+bestaudio/best';
					} else {
						const height = selectedQuality.replace('p', '');
						formatString = `bestvideo[height<=${height}]+bestaudio/best`;
					}
					break;
			}

			const response = await fetch(`/api/yt-download/download`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					urlVideo,
					format: formatString,
					audioFormat: selectedAudioFormat
				})
			});

			const data = await response.json();

			if (data.success) {
				console.log('URL de descarga obtenida:', data.downloadUrl);
				console.log('Nombre del archivo:', data.filename);

				// Descargar usando el proxy para evitar popups y forzar descarga
				try {
					const form = document.createElement('form');
					form.method = 'POST';
					form.action = '/api/yt-download/proxy';
					form.style.display = 'none';

					const urlInput = document.createElement('input');
					urlInput.type = 'hidden';
					urlInput.name = 'url';
					urlInput.value = urlVideo; // Usar la URL original de YouTube
					form.appendChild(urlInput);

					const filenameInput = document.createElement('input');
					filenameInput.type = 'hidden';
					filenameInput.name = 'filename';
					filenameInput.value = data.filename;
					form.appendChild(filenameInput);

					const formatIdInput = document.createElement('input');
					formatIdInput.type = 'hidden';
					formatIdInput.name = 'formatId';
					formatIdInput.value = data.format_id;
					form.appendChild(formatIdInput);

					document.body.appendChild(form);
					form.submit();
					document.body.removeChild(form);
				} catch (downloadError) {
					console.error('Error al iniciar descarga:', downloadError);
					alert('❌ Error al iniciar la descarga');
				}
			} else {
				alert(`❌ Error: ${data.error}`);
			}
		} catch (error) {
			console.error('Error en descarga:', error);
			alert('❌ Error al procesar la descarga');
		} finally {
			isDownloading = false;
		}
	};

	const handleChangeURL = () => {
		if (urlVideo === '') {
			isValidURLBoolean = false;
			messageError = '';
			infoSuccess = false;
			videoInformation = null;
			return;
		}
		const isValidURL =
			urlVideo.startsWith('https://www.youtube.com/watch?v=') ||
			urlVideo.startsWith('https://youtu.be/');
		if (!isValidURL) {
			isValidURLBoolean = true;
			messageError = 'URL no válida. Debe ser de YouTube';
		} else {
			isValidURLBoolean = false;
			messageError = '';
		}
	};

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		if (!isValidURLBoolean && urlVideo) {
			getVideoInfo();
		}
	};

	const resetForm = () => {
		urlVideo = '';
		videoInformation = null;
		infoSuccess = false;
		isValidURLBoolean = false;
		messageError = '';
	};
</script>

<article class="yt-downloader">
	<h1>Descargador de Videos de YouTube ▶️</h1>

	<!-- Formulario de búsqueda -->
	<form class="search-form" onsubmit={handleSubmit}>
		<div class="input-group">
			<input
				type="text"
				name="urlVideo"
				id="urlVideo"
				placeholder="Pega aquí la URL del video de YouTube..."
				bind:value={urlVideo}
				oninput={handleChangeURL}
				disabled={isLoading}
			/>
			<button type="submit" disabled={isLoading || isValidURLBoolean || !urlVideo}>
				{isLoading ? 'Buscando...' : '🔍 Buscar'}
			</button>
		</div>

		{#if isValidURLBoolean}
			<p class="error-message">⚠️ {messageError}</p>
		{/if}
	</form>

	<!-- Spinner de carga -->
	{#if isLoading}
		<div class="loading-container">
			<Spinner />
			<p>Obteniendo información del video...</p>
		</div>
	{/if}

	<!-- Información del video y opciones de descarga -->
	{#if infoSuccess && videoInformation}
		<div class="video-info-container">
			<!-- Información del video -->
			<div class="video-preview">
				{#if videoInformation.thumbnail}
					<img src={videoInformation.thumbnail} alt={videoInformation.title} />
				{/if}
				<div class="video-details">
					<h2>{videoInformation.title}</h2>
					{#if videoInformation.uploader}
						<p class="uploader">👤 {videoInformation.uploader}</p>
					{/if}
					{#if videoInformation.duration}
						<p class="duration">
							⏱️ {Math.floor(videoInformation.duration / 60)}:{(videoInformation.duration % 60)
								.toString()
								.padStart(2, '0')}
						</p>
					{/if}
				</div>
			</div>

			<div class="download-options">
				<h3>⚙️ Opciones de Descarga</h3>

				<div class="option-group">
					<label for="filter">Tipo:</label>
					<select id="filter" bind:value={selectedFilter}>
						<option value="mergevideo">Video + Audio (Mejor calidad)</option>
						<option value="audioandvideo">Video con Audio</option>
						<option value="videoonly">Solo Video</option>
						<option value="audioonly">Solo Audio</option>
					</select>
				</div>

				<div class="option-group">
					<label for="quality">Calidad:</label>
					{#if selectedFilter === 'audioonly'}
						<select id="quality" bind:value={selectedQuality}>
							<option value="highest">Mejor calidad</option>
							<option value="lowest">Menor calidad</option>
						</select>
					{:else}
						<select id="quality" bind:value={selectedQuality}>
							<option value="highest">Mejor disponible</option>
							<option value="2160p">4K (2160p)</option>
							<option value="1440p">2K (1440p)</option>
							<option value="1080p">Full HD (1080p)</option>
							<option value="720p">HD (720p)</option>
							<option value="480p">SD (480p)</option>
							<option value="360p">360p</option>
							<option value="240p">240p</option>
						</select>
					{/if}
				</div>

				{#if selectedFilter === 'audioonly'}
					<div class="option-group">
						<label for="audioFormat">Formato de Audio:</label>
						<select id="audioFormat" bind:value={selectedAudioFormat}>
							<option value="mp3">MP3</option>
							<option value="m4a">M4A</option>
							<option value="aac">AAC</option>
							<option value="opus">OPUS</option>
							<option value="flac">FLAC</option>
							<option value="wav">WAV</option>
						</select>
					</div>
				{:else}
					<div class="option-group">
						<label for="format">Formato de Video:</label>
						<select id="format" bind:value={selectedFormat}>
							<option value="mp4">MP4</option>
							<option value="webm">WebM</option>
							{#if selectedFilter === 'mergevideo'}
								<option value="mkv">MKV</option>
								<option value="flv">FLV</option>
							{/if}
						</select>
					</div>
				{/if}

				<div class="action-buttons">
					<button class="download-btn" onclick={downloadVideo} disabled={isDownloading}>
						{isDownloading ? '⏳ Descargando...' : '⬇️ Descargar'}
					</button>
				</div>
			</div>
		</div>
	{/if}
</article>

<style>
	.yt-downloader {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
	}

	h1 {
		text-align: center;
		color: var(--color-text);
		margin-bottom: 2rem;
		font-size: 2rem;
	}

	.search-form {
		margin-bottom: 2rem;
	}

	.input-group {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	input[type='text'] {
		flex: 1;
		padding: 0.75rem 1rem;
		border: 2px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.3s;
	}

	input[type='text']:focus {
		outline: none;
		border-color: #ff0000;
	}

	input[type='text']:disabled {
		background-color: #f5f5f5;
		cursor: not-allowed;
	}

	button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s;
	}

	button[type='submit'] {
		background-color: var(--azulclaro800);
		color: white;
	}

	button[type='submit']:hover:not(:disabled) {
		background-color: #cc0000;
		transform: translateY(-2px);
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.error-message {
		color: #ff0000;
		font-size: 0.9rem;
		margin-top: 0.5rem;
	}

	.loading-container {
		text-align: center;
		padding: 3rem;
	}

	.loading-container p {
		margin-top: 1rem;
		color: #666;
	}

	.video-info-container {
		background: #f9f9f9;
		border-radius: 12px;
		padding: 2rem;
		margin-top: 2rem;
	}

	.video-preview {
		display: flex;
		gap: 1.5rem;
		margin-bottom: 2rem;
		padding-bottom: 2rem;
		border-bottom: 2px solid #ddd;
	}

	.video-preview img {
		width: 320px;
		height: 180px;
		object-fit: cover;
		border-radius: 8px;
	}

	.video-details {
		flex: 1;
	}

	.video-details h2 {
		margin: 0 0 1rem 0;
		color: #333;
		font-size: 1.5rem;
	}

	.uploader,
	.duration {
		color: #666;
		margin: 0.5rem 0;
	}

	.download-options h3 {
		margin-bottom: 1.5rem;
		color: #333;
	}

	.option-group {
		margin-bottom: 1.5rem;
	}

	.option-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #555;
	}

	select {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		background-color: white;
		cursor: pointer;
		transition: border-color 0.3s;
	}

	select:focus {
		outline: none;
		border-color: #ff0000;
	}

	.action-buttons {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
	}

	.download-btn {
		flex: 1;
		background-color: #00a000;
		color: white;
		padding: 1rem;
		font-size: 1.1rem;
	}

	.download-btn:hover:not(:disabled) {
		background-color: #008000;
		transform: translateY(-2px);
	}

	.reset-btn {
		background-color: #666;
		color: white;
	}

	.reset-btn:hover {
		background-color: #555;
		transform: translateY(-2px);
	}

	.formats-details {
		margin-top: 2rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 1rem;
		background: white;
	}

	.formats-details summary {
		cursor: pointer;
		font-weight: 600;
		color: #333;
		padding: 0.5rem;
	}

	.formats-details summary:hover {
		color: #ff0000;
	}

	.formats-list {
		margin-top: 1rem;
		max-height: 400px;
		overflow-y: auto;
	}

	.format-item {
		display: flex;
		gap: 1rem;
		padding: 0.75rem;
		border-bottom: 1px solid #eee;
		font-size: 0.9rem;
	}

	.format-item:hover {
		background-color: #f5f5f5;
	}

	.format-id {
		font-weight: 600;
		color: #ff0000;
		min-width: 60px;
	}

	.format-ext {
		color: #00a000;
		font-weight: 600;
	}

	.format-resolution {
		color: #0066cc;
	}

	.format-note {
		color: #666;
		font-style: italic;
	}

	@media (max-width: 768px) {
		.video-preview {
			flex-direction: column;
		}

		.video-preview img {
			width: 100%;
			height: auto;
		}

		.action-buttons {
			flex-direction: column;
		}
	}
</style>
