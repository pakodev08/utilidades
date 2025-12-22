import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';

const BIN_DIR = path.join(process.cwd(), 'node_modules', 'ytdlp-nodejs', 'bin');
const BIN_PATH = path.join(BIN_DIR, 'yt-dlp');

// Ensure bin directory exists
if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true });
}

const downloadFile = (url, dest) =>
{
    return new Promise((resolve, reject) =>
    {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) =>
        {
            if (response.statusCode === 302 || response.statusCode === 301) {
                downloadFile(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            response.pipe(file);
            file.on('finish', () =>
            {
                file.close(resolve);
            });
        }).on('error', (err) =>
        {
            fs.unlink(dest, () => reject(err));
        });
    });
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
        await downloadFile(url, BIN_PATH);
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
