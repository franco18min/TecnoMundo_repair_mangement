import { API_CONFIG } from '../config/api'

export function getOrderUrl(orderId) {
  const base = (typeof window !== 'undefined' && window.location) ? window.location.origin : ''
  return `${base}/client/order/${orderId}`
}

export function getQrImageUrl(text, sizePx = 120) {
  const base = API_CONFIG.BASE_URL || ((typeof window !== 'undefined' && window.location) ? window.location.origin : '')
  return `${base}/api/v1/qr?data=${encodeURIComponent(text)}&size=${sizePx}`
}
