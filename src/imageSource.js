// Solo enlaces públicos de entrega de imágenes. Nunca claves API ni URLs de consola.
export function cloudinaryImageUrl(value) {
  if (typeof value !== 'string') return ''
  const text = value.trim()
  if (text.length > 2048 || /[\s\\]/.test(text)) return ''
  try {
    const url = new URL(text)
    if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com' || url.port || url.username || url.password || url.hash) return ''
    if (!/^\/[a-zA-Z0-9_-]+\/image\/upload\/.+/.test(url.pathname)) return ''
    return url.href
  } catch { return '' }
}
