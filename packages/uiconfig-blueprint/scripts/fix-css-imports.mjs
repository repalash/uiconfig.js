import fs from 'fs/promises';
import path from 'path';

const distDir = 'lib/esm/';

async function processFile(jsFile) {
    let content = await fs.readFile(jsFile, 'utf-8');
    const updated = content.replace(/(import\s+[^'"]+['"])(\.\/[^'"]+)\.scss\?inline(['"])/g, '$1$2.css.js$3');

    if (updated !== content) {
        await fs.writeFile(jsFile, updated);
        console.log(`✅ Updated imports in ${jsFile}`);
    }
}

async function createCSSJS(cssFile) {
    const cssContent = await fs.readFile(cssFile, 'utf-8');
    const jsModule = `export default ${JSON.stringify(cssContent)};\n`;

    const cssJsFile = cssFile.replace('lib/css/', 'lib/esm/') + '.js';
    await fs.writeFile(cssJsFile, jsModule);
    console.log(`🧩 Created ${cssJsFile}`);
}

async function main() {
    // 1. Update JS files
    const jsFiles = (await fs.readdir(`./lib/esm/`))
        .filter(file => file.endsWith('.js'))
        .map(file => path.join('./lib/esm/', file));

    await Promise.all(jsFiles.map(processFile));
    //
    // 2. Create corresponding .css.js modules
    const cssFiles = (await fs.readdir(`./lib/css/`))
        .filter(file => file.endsWith('.css'))
        .map(file => path.join('./lib/css/', file));

    await Promise.all(cssFiles.map(createCSSJS));
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
