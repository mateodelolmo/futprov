import { chromium } from 'playwright';
import path from 'node:path';

const html = path.resolve('tools/pdf-out/proveedor-vapes.html');
const out = path.resolve('tools/pdf-out/proveedor-vapes.pdf');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file:///' + html.replace(/\\/g, '/'));
await page.pdf({ path: out, width: '900px', height: '1080px', printBackground: true });
await browser.close();
console.log('PDF generado:', out);
