# 📥 YouTube Downloader - Documentación

## 🎯 Características

Esta implementación permite descargar videos de YouTube en diferentes formatos y calidades usando la librería `ytdlp-nodejs`.

### ✨ Funcionalidades

- ✅ Búsqueda de videos por URL
- ✅ Preview con thumbnail, título, autor y duración
- ✅ Múltiples opciones de descarga:
  - **Video + Audio (Mejor calidad)**: Combina el mejor video y audio disponible
  - **Video con Audio**: Video con audio integrado
  - **Solo Video**: Descarga únicamente el video
  - **Solo Audio**: Descarga únicamente el audio
- ✅ Selección de calidad (4K, 2K, 1080p, 720p, 480p, 360p, 240p)
- ✅ Múltiples formatos:
  - Video: MP4, WebM, MKV, FLV
  - Audio: MP3, M4A, AAC, OPUS, FLAC, WAV
- ✅ Lista completa de formatos disponibles
- ✅ Indicadores de carga y progreso

## 🏗️ Estructura de Archivos

```
src/
├── lib/
│   └── components/
│       ├── YtDownloader.svelte  # Componente principal
│       └── Spinner.svelte       # Componente de carga
└── routes/
    └── api/
        └── yt-download/
            ├── +server.js       # Endpoint para obtener info
            └── download/
                └── +server.js   # Endpoint para descargar
```

## 📡 API Endpoints

### 1. Obtener Información del Video

**POST** `/api/yt-download`

```javascript
// Request
{
  "urlVideo": "https://www.youtube.com/watch?v=VIDEO_ID"
}

// Response
{
  "success": true,
  "info": {
    "title": "Título del video",
    "formats": [...],
    "webpage_url": "...",
    "thumbnail": "...",
    "duration": 123,
    "uploader": "Canal"
  }
}
```

### 2. Descargar Video

**POST** `/api/yt-download/download`

```javascript
// Request
{
  "urlVideo": "https://www.youtube.com/watch?v=VIDEO_ID",
  "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best"
}

// Response
{
  "success": true,
  "message": "Video descargado exitosamente",
  "output": "..."
}
```

## 🎨 Opciones de Formato

### Video + Audio (mergevideo)

Combina el mejor video y audio disponible:

```javascript
format: 'bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best';
```

### Solo Video (videoonly)

```javascript
format: 'bestvideo[ext=mp4][height<=1080]';
```

### Solo Audio (audioonly)

```javascript
format: 'bestaudio[ext=mp3]';
```

### Video con Audio (audioandvideo)

```javascript
format: 'best[height<=1080]';
```

## 🚀 Uso

1. **Pegar URL**: Ingresa la URL del video de YouTube
2. **Buscar**: Haz clic en "Buscar" para obtener la información
3. **Configurar opciones**:
   - Selecciona el tipo de descarga
   - Elige la calidad deseada
   - Selecciona el formato
4. **Descargar**: Haz clic en "Descargar"

## 📁 Ubicación de Descargas

Los videos se guardan en la carpeta `downloads/` en la raíz del proyecto con el formato:

```
downloads/[Título del video].[extensión]
```

## 🔧 Configuración

La librería `ytdlp-nodejs` descarga automáticamente el binario de `yt-dlp` la primera vez que se usa. No requiere instalación manual.

## ⚠️ Notas Importantes

- Los videos se descargan en el servidor, no directamente en el navegador del usuario
- Asegúrate de tener suficiente espacio en disco
- La carpeta `downloads/` está en `.gitignore` para evitar subir videos al repositorio
- Respeta los derechos de autor al descargar contenido

## 🐛 Troubleshooting

### Error: "getInfoAsync is not a function"

- Verifica que estés usando `YtDlp` (no `YtdlpNodejs`)
- Asegúrate de tener instalado `ytdlp-nodejs@2.3.5` o superior

### Error: "Failed to download"

- Verifica que la URL sea válida
- Algunos videos pueden estar restringidos por región
- Verifica que tengas conexión a internet

### Video no se descarga

- Revisa los logs del servidor en la consola
- Verifica que la carpeta `downloads/` exista y tenga permisos de escritura

## 📚 Referencias

- [ytdlp-nodejs GitHub](https://github.com/iqbal-rashed/ytdlp-nodejs)
- [yt-dlp Documentation](https://github.com/yt-dlp/yt-dlp)
- [Format Selection](https://github.com/yt-dlp/yt-dlp#format-selection)
