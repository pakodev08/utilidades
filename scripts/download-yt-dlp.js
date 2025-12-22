import fs from 'fs';
import path from 'path';

const BIN_DIR = path.join(process.cwd(), 'node_modules', 'ytdlp-nodejs', 'bin');
const BIN_PATH = path.join(BIN_DIR, 'yt-dlp');

// Ensure bin directory exists
if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true });
}

const main = async () =>
{
    // Only run on Linux (Vercel environment)
    if (process.platform !== 'linux') {
        console.log('Not running on Linux, skipping standalone binary download.');
        return;
    }

    console.log('Downloading standalone yt-dlp binary for Linux...');
    const url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux';

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            throw new Error('Download URL returned HTML instead of binary. Check URL.');
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        fs.writeFileSync(BIN_PATH, buffer);
        console.log('Download complete.');

        // Make executable
        fs.chmodSync(BIN_PATH, '755');
        console.log('Made binary executable.');

    } catch (error) {
        console.error('Failed to download binary:', error);
        process.exit(1);
    }
};

main();
