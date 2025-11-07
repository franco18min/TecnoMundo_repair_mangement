import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import dotenv from 'dotenv';

// Carga variables desde backend/.env
const backendEnvPath = path.resolve('..', 'backend', '.env');
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
}

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

function httpPostJson(urlStr: string, headers: Record<string, string>, body: any): Promise<any> {
  const data = JSON.stringify(body);
  const parsed = new URL(urlStr);
  const isHttps = parsed.protocol === 'https:';
  const options: any = {
    protocol: parsed.protocol,
    hostname: parsed.hostname,
    port: parsed.port || (isHttps ? 443 : 80),
    path: parsed.pathname + (parsed.search || ''),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data).toString(),
      ...headers,
    },
  };
  const client = isHttps ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.request(options, (res) => {
      let respData = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (respData += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(respData);
          resolve({ status: res.statusCode, json });
        } catch {
          resolve({ status: res.statusCode, text: respData });
        }
      });
    });
    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

async function uploadImage(name: string, filePath: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
    throw new Error(
      'Faltan variables SUPABASE_URL, SUPABASE_ANON_KEY o SUPABASE_SERVICE_KEY en backend/.env'
    );
  }
  if (!fs.existsSync(filePath)) {
    throw new Error(`No existe el archivo local: ${filePath}`);
  }
  const b64 = fs.readFileSync(filePath).toString('base64');
  const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/system.photos`;
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    Prefer: 'return=representation',
  };
  const body = { name, mime_type: 'image/png', data_base64: b64 };
  const resp = await httpPostJson(endpoint, headers, body);
  if ((resp.status || 0) >= 200 && (resp.status || 0) < 300) {
    console.log(`✔ Subido '${name}' correctamente. Respuesta:`, resp.json);
  } else {
    console.error(`✖ Error subiendo '${name}'. Status=${resp.status}`, resp.json || resp.text);
    process.exitCode = 1;
  }
}

async function main() {
  const root = path.resolve('..');
  const faviconPath = path.resolve(root, 'photo', 'FAVICON.png');
  const logoPath = path.resolve(root, 'photo', 'LOGO.png');
  await uploadImage('favicon', faviconPath);
  await uploadImage('logo', logoPath);
}

main().catch((e) => {
  console.error('✖ Fallo en subida a Supabase:', e);
  process.exit(1);
});