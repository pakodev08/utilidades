// @ts-nocheck
import { YtDlp } from 'ytdlp-nodejs';
import { json } from '@sveltejs/kit';

const ytdlp = new YtDlp();

export const POST = async ({ request }) =>
{
    try {
        const { urlVideo, format, audioFormat } = await request.json();

        console.log('Obteniendo URL de descarga para:', urlVideo);
        console.log('Formato solicitado:', format);
        console.log('Audio Format:', audioFormat);

        const info = await ytdlp.getInfoAsync(urlVideo);

        console.log('Título del video:', info.title);
        console.log('Formatos disponibles:', info.formats?.length || 0);

        let selectedFormat;
        let filename;

        if (format.includes('bestaudio')) {
            const audioFormats = (info.formats || []).filter(
                (f) => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none')
            );

            selectedFormat = audioFormats.sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

            const ext = audioFormat || selectedFormat?.ext || 'mp3';
            filename = `${info.title}.${ext}`;
        } else if (format.includes('+') || !format.includes('videoonly')) {
            const muxedFormats = (info.formats || []).filter(
                (f) => f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none'
            );

            if (muxedFormats.length > 0) {
                selectedFormat = muxedFormats.sort(
                    (a, b) => (b.height || 0) - (a.height || 0) || (b.tbr || 0) - (a.tbr || 0)
                )[0];
            } else {
                selectedFormat =
                    (info.formats || []).find((f) => f.format_id === '18') ||
                    (info.formats || []).find((f) => f.format_id === '22') ||
                    (info.formats || []).sort((a, b) => (b.filesize || 0) - (a.filesize || 0))[0];
            }

            filename = `${info.title}.${selectedFormat?.ext || 'mp4'}`;
        } else {
            const videoFormats = (info.formats || []).filter(
                (f) => f.vcodec && f.vcodec !== 'none' && (!f.acodec || f.acodec === 'none')
            );

            selectedFormat = videoFormats.sort((a, b) => (b.height || 0) - (a.height || 0))[0];

            filename = `${info.title}.${selectedFormat?.ext || 'mp4'}`;
        }

        if (!selectedFormat) {
            selectedFormat = (info.formats || []).sort(
                (a, b) => (b.filesize || b.filesize_approx || 0) - (a.filesize || a.filesize_approx || 0)
            )[0];
            filename = `${info.title}.${selectedFormat.ext}`;
        }



        return json({
            success: true,
            downloadUrl: selectedFormat.url,
            filename: filename,
            filesize: selectedFormat.filesize || selectedFormat.filesize_approx,
            format: selectedFormat.format_note || selectedFormat.format_id,
            format_id: selectedFormat.format_id,
            ext: selectedFormat.ext
        });
    } catch (error) {
        console.error('Error al obtener URL de descarga:', error);
        return json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        );
    }
};
