import React, { useEffect, useState } from 'react'
import { getBrandingBaseUrl, checkBrandingAsset } from '../../utils/branding'

export default function BrandLogo({ className = 'h-6 w-auto', alt = 'TecnoMundo' }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    ;(async () => {
      const base = getBrandingBaseUrl()
      const candidates = ['logo.png', 'logo.svg', 'logo.jpg', 'logo.jpeg']
      for (const file of candidates) {
        const ok = await checkBrandingAsset(file)
        if (ok) {
          const processed = await trimTransparent(base + file)
          setSrc(processed || base + file)
          return
        }
      }
      setSrc('')
    })()
  }, [])

  if (!src) {
    return <span className={`font-bold text-indigo-600 ${className.replace('h-6', '')}`}>TecnoMundo</span>
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-contain ${className}`}
      onError={() => setSrc('')}
    />
  )
}

async function trimTransparent(url) {
  try {
    const cached = localStorage.getItem('brand_logo_trimmed_v1')
    if (cached) return cached
    const img = await loadImage(url)
    const w = img.naturalWidth || img.width
    const h = img.naturalHeight || img.height
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const { data } = ctx.getImageData(0, 0, w, h)
    let top = h, left = w, right = 0, bottom = 0
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4 + 3
        if (data[i] > 0) {
          if (x < left) left = x
          if (x > right) right = x
          if (y < top) top = y
          if (y > bottom) bottom = y
        }
      }
    }
    if (right <= left || bottom <= top) return url
    const cw = right - left + 1
    const ch = bottom - top + 1
    const out = document.createElement('canvas')
    out.width = cw
    out.height = ch
    const octx = out.getContext('2d')
    octx.drawImage(img, left, top, cw, ch, 0, 0, cw, ch)
    const result = out.toDataURL('image/png')
    localStorage.setItem('brand_logo_trimmed_v1', result)
    return result
  } catch {
    return null
  }
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}
