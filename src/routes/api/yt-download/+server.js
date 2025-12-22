import { YtDlp } from 'ytdlp-nodejs';
import { json } from '@sveltejs/kit';

const ytdlp = new YtDlp();

export const POST = async ({ request }) =>
{
    try {
        // Parsear el body del request
        const { urlVideo } = await request.json();

        console.log('URL recibida:', urlVideo);

        // Obtener información del video
        const info = await ytdlp.getInfoAsync(urlVideo);
        console.log({info})

        return json({ success: true, info });
    } catch (error) {
        console.error('Error en POST:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
};