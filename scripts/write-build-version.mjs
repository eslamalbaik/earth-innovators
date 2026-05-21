import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
const manifestPath = path.join(publicDir, 'build', 'manifest.json');
const outPath = path.join(publicDir, 'build-version.json');

let buildId = String(Date.now());

try {
    const manifest = readFileSync(manifestPath, 'utf8');
    buildId = createHash('sha256').update(manifest).digest('hex').slice(0, 16);
} catch {
    buildId = createHash('sha256').update(String(Date.now())).digest('hex').slice(0, 16);
}

writeFileSync(
    outPath,
    JSON.stringify(
        {
            buildId,
            builtAt: new Date().toISOString(),
        },
        null,
        2,
    ),
);

console.log(`Wrote ${outPath} (buildId: ${buildId})`);
