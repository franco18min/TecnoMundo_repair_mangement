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
          setSrc(base + file)
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
