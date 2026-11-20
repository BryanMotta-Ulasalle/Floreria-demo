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

// Aplica la reducción después de los encuadres existentes, sin alterar el original.
export function optimizedCloudinaryImage(value, maxWidth = 900) {
  const source = cloudinaryImageUrl(value)
  if (!source) return ''
  const url = new URL(source)
  const marker = '/image/upload/'
  const [prefix, tail] = url.pathname.split(marker)
  const parts = tail.split('/')
  // Las firmas pertenecen a una URL concreta y no se pueden regenerar en el cliente.
  if (/^s--[^/]+--$/.test(parts[0])) return source
  const versionIndex = parts.findIndex(part => /^v\d+$/.test(part))
  let insertAt = versionIndex >= 0 ? versionIndex : 0
  if (versionIndex < 0) {
    const transform = /^(?:(?:a|ar|b|bo|c|co|d|dl|dn|dpr|e|f|fl|g|h|l|o|p|pg|q|r|t|u|w|x|y|z)_[^/]+|\$[^/]+)$/
    while (insertAt < parts.length - 1 && transform.test(parts[insertAt])) insertAt++
  }
  const width = maxWidth === 180 ? 180 : 900
  parts.splice(insertAt, 0, 'c_limit,w_' + width, 'q_auto', 'f_auto')
  url.pathname = prefix + marker + parts.join('/')
  return url.href
}
