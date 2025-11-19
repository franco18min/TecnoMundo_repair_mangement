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

// Obtiene el logo como data URL, cacheado por altura para impresión fiable
export async function getLogoDataUrlCached(heightPx = 32) {
  const cacheKey = `ticket_logo_data_url_v1_${heightPx}`;
  const cached = typeof localStorage !== 'undefined' ? localStorage.getItem(cacheKey) : null;
  if (cached) return cached;
  try {
    const base = getBrandingBaseUrl();
    const resp = await fetch(base + 'logo.png');
    if (!resp.ok) return base + 'logo.png';
    const blob = await resp.blob();
    const img = await blobToImage(blob);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = w;
    srcCanvas.height = h;
    const sctx = srcCanvas.getContext('2d');
    sctx.drawImage(img, 0, 0);
    const { data } = sctx.getImageData(0, 0, w, h);
    let top = h, left = w, right = 0, bottom = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4 + 3;
        if (data[i] > 0) {
          if (x < left) left = x;
          if (x > right) right = x;
          if (y < top) top = y;
          if (y > bottom) bottom = y;
        }
      }
    }
    if (right <= left || bottom <= top) {
      const scale = heightPx / h;
      const cw = Math.max(1, Math.round(w * scale));
      const ch = Math.max(1, Math.round(heightPx));
      const canvas = document.createElement('canvas');
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, cw, ch);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, cw, ch);
      const url = canvas.toDataURL('image/png');
      localStorage?.setItem(cacheKey, url);
      return url;
    }
    const cw0 = right - left + 1;
    const ch0 = bottom - top + 1;
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cw0;
    cropCanvas.height = ch0;
    const cctx = cropCanvas.getContext('2d');
    cctx.drawImage(img, left, top, cw0, ch0, 0, 0, cw0, ch0);
    const scale = heightPx / ch0;
    const cw = Math.max(1, Math.round(cw0 * scale));
    const ch = Math.max(1, Math.round(heightPx));
    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, cw, ch);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(cropCanvas, 0, 0, cw0, ch0, 0, 0, cw, ch);
    const url = canvas.toDataURL('image/png');
    localStorage?.setItem(cacheKey, url);
    return url;
  } catch {
    const base = getBrandingBaseUrl();
    return base + 'logo.png';
  }
}

function blobToImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}