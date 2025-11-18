// frontend/src/utils/branding.js
export async function setFaviconFromSupabase() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  try {
    if (!url || !key) return;
    const endpoint = `${url.replace(/\/$/, '')}/rest/v1/system.photo?select=data_base64&name=eq.favicon`;
    const resp = await fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    if (!resp.ok) return;
    const json = await resp.json();
    const rec = Array.isArray(json) ? json[0] : null;
    if (rec && rec.data_base64) {
      let link = document.getElementById('app-favicon');
      if (!link) {
        link = document.createElement('link');
        link.id = 'app-favicon';
        link.rel = 'icon';
        link.type = 'image/png';
        document.head.appendChild(link);
      }
      link.href = `data:image/png;base64,${rec.data_base64}`;
    }
  } catch (e) {
    console.warn('No se pudo cargar favicon desde Supabase', e);
  }
}

// Base de branding: sirve archivos desde /public en dev y prod
export function getBrandingBaseUrl() {
  const base = (typeof window !== 'undefined' && window.location) ? window.location.origin : '';
  return `${base}/`;
}

// Verifica si existe el asset en el servidor (public)
export async function checkBrandingAsset(file) {
  const base = getBrandingBaseUrl();
  try {
    const resp = await fetch(base + file, { method: 'HEAD' });
    return resp.ok;
  } catch {
    return false;
  }
}