import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = (file) => readFile(path.join(root, file), 'utf8');
const inline = async (file, mime) => `data:${mime};base64,${(await readFile(path.join(root, file))).toString('base64')}`;
const [template, styles, script, font, living, cabin, sofa, license] = await Promise.all([
  read('index.template.html'), read('styles.css'), read('demo.js'),
  inline('assets/inter-latin.woff2', 'font/woff2'),
  inline('assets/living-room.jpg', 'image/jpeg'),
  inline('assets/cabin.jpg', 'image/jpeg'),
  inline('assets/sofa.jpg', 'image/jpeg'),
  read('assets/inter-LICENSE.txt'),
]);
const html = template.replace('{{STYLE}}', styles.replace('{{FONT}}', font))
  .replace('{{SCRIPT}}', script)
  .replace('{{FONT_LICENSE}}', license)
  .replaceAll('{{LIVING}}', living).replaceAll('{{CABIN}}', cabin).replaceAll('{{SOFA}}', sofa);
if (/\{\{[A-Z_]+\}\}/.test(html)) throw new Error('Unresolved page asset');
await writeFile(path.join(root, 'index.html'), html);
process.stdout.write(`Built a standalone page (${Buffer.byteLength(html)} bytes).\n`);
