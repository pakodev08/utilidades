import { error } from '@sveltejs/kit';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export const POST = async ({ request }) =>
{
    const formData = await request.formData();
    const url = formData.get('url'); // This should be the original YouTube URL
    const filename = formData.get('filename');
    const formatId = formData.get('formatId');

    if (!url || !filename) {
        throw error(400, 'Missing url or filename');
    }

    // Resolve yt-dlp binary path
    const ytDlpPath = path.join(process.cwd(), 'node_modules', 'ytdlp-nodejs', 'bin', 'yt-dlp.exe');

    if (!fs.existsSync(ytDlpPath)) {
        console.error('yt-dlp binary not found at:', ytDlpPath);
        throw error(500, 'Internal Server Error: yt-dlp binary not found');
    }

    const args = [
        '-f', formatId || 'best[vcodec!=none][acodec!=none]', // Ensure we don't try to merge formats
        '-o', '-', // Output to stdout
        url
    ];

    console.log('Spawning yt-dlp with args:', args);

    const ytDlpProcess = spawn(ytDlpPath, args);

    const stream = new ReadableStream({
        start(controller)
        {
            ytDlpProcess.stdout.on('data', (chunk) =>
            {
                controller.enqueue(chunk);
            });

            ytDlpProcess.stdout.on('end', () =>
            {
                controller.close();
            });

            ytDlpProcess.stderr.on('data', (data) =>
            {
                // Log stderr but don't fail immediately unless it's a fatal error
                // yt-dlp prints progress to stderr
                // console.log(`yt-dlp stderr: ${data}`);
            });

            ytDlpProcess.on('error', (err) =>
            {
                console.error('yt-dlp process error:', err);
                controller.error(err);
            });

            ytDlpProcess.on('close', (code) =>
            {
                if (code !== 0) {
                    console.error(`yt-dlp process exited with code ${code}`);
                    // If we haven't closed the controller yet, we might want to error
                    // but if we already sent data, it's too late to change status.
                }
            });
        },
        cancel()
        {
            ytDlpProcess.kill();
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${filename}"`,
        }
    });
};
