import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const i18nDir = path.join(rootDir, 'resources', 'js', 'i18n');
const sourceDir = path.join(rootDir, 'resources', 'js');

const files = {
    en: path.join(i18nDir, 'en.js'),
    ar: path.join(i18nDir, 'ar.js'),
};

const flatten = (value, prefix = '') => Object.entries(value).flatMap(([key, child]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (child && typeof child === 'object' && !Array.isArray(child)) {
        return flatten(child, nextKey);
    }

    return [nextKey];
});

const resolveKey = (dictionary, key) => key
    .split('.')
    .reduce((value, segment) => value?.[segment], dictionary);

const listSourceFiles = (dir) => {
    const results = [];

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            results.push(...listSourceFiles(fullPath));
        } else if (/\.(js|jsx)$/.test(entry.name)) {
            results.push(fullPath);
        }
    }

    return results;
};

const detectDuplicateTopLevelKeys = (file) => {
    const source = fs.readFileSync(file, 'utf8');
    const counts = {};

    for (const match of source.matchAll(/^    "?([A-Za-z0-9_]+)"?:\s*\{/gm)) {
        counts[match[1]] = (counts[match[1]] || 0) + 1;
    }

    return Object.entries(counts)
        .filter(([, count]) => count > 1)
        .map(([key, count]) => ({ key, count }));
};

const findUsedTranslationKeys = () => {
    const usedKeys = new Map();
    const translationCall = /\bt\(\s*['"]([^'"`$]+)['"]/g;

    for (const file of listSourceFiles(sourceDir)) {
        const source = fs.readFileSync(file, 'utf8');
        let match;

        while ((match = translationCall.exec(source))) {
            const key = match[1];

            if (key.endsWith('.') || key.includes('${')) {
                continue;
            }

            const line = source.slice(0, match.index).split(/\r?\n/).length;
            const relativeFile = path.relative(rootDir, file).replaceAll(path.sep, '/');

            if (!usedKeys.has(key)) {
                usedKeys.set(key, []);
            }

            usedKeys.get(key).push(`${relativeFile}:${line}`);
        }
    }

    return usedKeys;
};

const detectArabicMojibake = (dictionary) => {
    const suspiciousCharacters = /[\u00a7\u0679\u067e\u0686\u0698\u06ba\u06af\u06a9\u06be\u0152\u2039\u203a\u201e]/;
    const entries = [];

    const walk = (value, prefix = '') => {
        for (const [key, child] of Object.entries(value)) {
            const nextKey = prefix ? `${prefix}.${key}` : key;

            if (child && typeof child === 'object' && !Array.isArray(child)) {
                walk(child, nextKey);
            } else if (typeof child === 'string' && suspiciousCharacters.test(child)) {
                entries.push({ key: nextKey, value: child });
            }
        }
    };

    walk(dictionary);
    return entries;
};

const loadDictionary = async (language) => {
    const module = await import(`${pathToFileURL(files[language]).href}?v=${Date.now()}`);
    return module[language];
};

const en = await loadDictionary('en');
const ar = await loadDictionary('ar');

const enKeys = new Set(flatten(en));
const arKeys = new Set(flatten(ar));
const missingInAr = [...enKeys].filter((key) => !arKeys.has(key)).sort();
const missingInEn = [...arKeys].filter((key) => !enKeys.has(key)).sort();
const duplicateKeys = {
    en: detectDuplicateTopLevelKeys(files.en),
    ar: detectDuplicateTopLevelKeys(files.ar),
};

const usedKeys = findUsedTranslationKeys();
const missingUsedKeys = [...usedKeys.keys()]
    .filter((key) => resolveKey(en, key) === undefined && resolveKey(ar, key) === undefined)
    .sort()
    .map((key) => ({ key, locations: usedKeys.get(key).slice(0, 5) }));

const mojibake = detectArabicMojibake(ar);
const failures = [
    missingInAr.length,
    missingInEn.length,
    duplicateKeys.en.length,
    duplicateKeys.ar.length,
    missingUsedKeys.length,
    mojibake.length,
].some(Boolean);

const report = {
    enKeys: enKeys.size,
    arKeys: arKeys.size,
    missingInAr,
    missingInEn,
    duplicateTopLevelKeys: duplicateKeys,
    missingUsedKeys,
    suspiciousArabicMojibake: mojibake,
};

console.log(JSON.stringify(report, null, 2));

if (failures) {
    process.exitCode = 1;
}
