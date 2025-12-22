import fs from 'fs';
import path from 'path';

const BIN_DIR = path.join(process.cwd(), 'node_modules', 'ytdlp-nodejs', 'bin');
const BIN_PATH = path.join(BIN_DIR, 'yt-dlp');

if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true });
}

const downloadWithRetry = async (url, retries = 3, delay = 2000) =>
{
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempt ${i + 1}/${retries}...`);
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; VercelBuild/1.0; +https://vercel.com)'
                }
            });

            if (response.status === 503 || response.status === 429) {
                console.log(`Server returned ${response.status}, retrying in ${delay}ms...`);
                await new Promise(res => setTimeout(res, delay));
                delay *= 2; // Exponential backoff
                continue;
            }

            if (!response.ok) {
                throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error('Download URL returned HTML instead of binary. Check URL.');
            }

            return response;
        } catch (err) {
            console.error(`Attempt ${i + 1} failed:`, err.message);
            if (i === retries - 1) throw err;
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

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
        const response = await downloadWithRetry(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        fs.writeFileSync(BIN_PATH, buffer);
        console.log('Download complete.');

        // Make executable
        fs.chmodSync(BIN_PATH, '755');
        console.log('Made binary executable.');

    } catch (error) {
        console.error('Failed to download binary after retries:', error);
        process.exit(1);
    }
};

main();
