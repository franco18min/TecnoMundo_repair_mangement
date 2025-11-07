import * as fs from 'fs';
import * as path from 'path';

async function upload(name: 'favicon' | 'logo', filePath: string) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
    console.error('Faltan variables de entorno: SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_KEY');
    process.exit(2);
  }
  const buf = fs.readFileSync(filePath);
  const b64 = Buffer.from(buf).toString('base64');
  const body = { name, mime_type: 'image/png', data_base64: b64 };
  const endpoint = `${SUPABASE_URL.replace(/\/$/,'')}/rest/v1/system.photo`;
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Error subiendo ${name}: ${resp.status} ${text}`);
  }
  const json = await resp.json();
  console.log(`Subido ${name}:`, json);
}

async function main() {
  const root = path.resolve('.');
  const photoDir = path.resolve(root, 'photo');
  const faviconPath = path.resolve(photoDir, 'FAVICON.png');
  const logoPath = path.resolve(photoDir, 'LOGO.png');
  if (!fs.existsSync(faviconPath) || !fs.existsSync(logoPath)) {
    console.error('No se encontraron FAVICON.png y LOGO.png en la carpeta photo');
    process.exit(2);
  }
  await upload('favicon', faviconPath);
  await upload('logo', logoPath);
  console.log('Listo. Verifica el frontend y correos.');
}

main().catch(err => { console.error(err); process.exit(1); });