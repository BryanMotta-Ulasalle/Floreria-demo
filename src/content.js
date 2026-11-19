import { backup } from './data.js'
import { sources, refreshMs, timeoutMs } from './config.js'

export const money = cents => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(cents / 100)
export function whatsappLink(phone, message) {
  return /^[1-9]\d{7,14}$/.test(phone ?? '') ? 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message) : null
}
export function parseCsv(text) {
  if (typeof text !== 'string' || text.length > 1000000) throw Error('Respuesta inválida')
  const rows = []; let row = [], value = '', quoted = false, closed = false
  for (const c of text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')) {
    if (quoted) { if (c === '"') { quoted = false; closed = true } else value += c }
    else if (c === '"' && closed) { value += '"'; quoted = true; closed = false }
    else if (c === ',' || c === '\n') { row.push(value); value = ''; closed = false; if (c === '\n') { rows.push(row); row = [] } }
    else if (c === '"' && !value && !closed) quoted = true
    else { if (closed || c === '"') throw Error('Comillas inválidas'); value += c }
  }
  if (quoted) throw Error('CSV incompleto')
  row.push(value); rows.push(row)
  return rows.filter(cells => cells.some(cell => cell.trim()))
}
export function priceCents(value) {
  const text = String(value).trim().replace(/^S\/\s*/i, '')
  if (!/^\d{1,5}([.,]\d{1,2})?$/.test(text)) throw Error('Precio inválido')
  const [whole, decimal = ''] = text.split(/[.,]/)
  return Number(whole) * 100 + Number(decimal.padEnd(2, '0'))
}
const yesNo = value => ['SI', 'NO'].includes(value)
const idValid = value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 64
export function validLink(value, host) {
  if (!value) return true
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && (!host || url.hostname === host || url.hostname === 'www.' + host) } catch { return false }
}
export function validateSection(section, rows) {
  if (!Object.hasOwn(backup, section) || !Array.isArray(rows) || rows.length > 500 || (!rows.length && ['negocio', 'portada', 'informacion'].includes(section))) throw Error('Sección inválida')
  const headers = Object.keys(backup[section][0])
  const ids = new Set()
  const cleaned = rows.map(raw => {
    const row = Object.fromEntries(headers.map(header => [header, String(raw[header] ?? '').trim()]))
    const key = row.id ?? row.clave
    if (!(row.id !== undefined ? idValid(key) : /^[a-z]+(?:_[a-z]+)*$/.test(key)) || ids.has(key)) throw Error('Identificador inválido o duplicado')
    ids.add(key)
    for (const [field, value] of Object.entries(row)) {
      const limit = field === 'nombre' ? 100 : field === 'pregunta' ? 140 : ['descripcion', 'ayuda'].includes(field) ? 300 : 650
      if (value.length > limit) throw Error('Texto demasiado largo')
      if (['visible', 'disponible', 'destacado', 'consultar_precio'].includes(field) && !yesNo(value)) throw Error('Usa SI o NO')
    }
    if ('orden' in row && !/^\d{1,4}$/.test(row.orden)) throw Error('Orden inválido')
    if ('nombre' in row && !row.nombre) throw Error('Falta nombre')
    if (section === 'productos') {
      if (!idValid(row.categoria)) throw Error('Categoría inválida')
      if (row.consultar_precio === 'NO') priceCents(row.precio)
      else if (row.precio) priceCents(row.precio)
      if (row.imagen && !idValid(row.imagen)) throw Error('Clave de imagen inválida')
    }
    if (section === 'preguntas' && (!row.pregunta || !row.respuesta)) throw Error('Pregunta vacía')
    return row
  })
  if (['negocio', 'portada', 'informacion'].includes(section)) {
    const required = backup[section].map(row => row.clave)
    if (required.some(key => !ids.has(key)) || cleaned.length !== required.length) throw Error('Faltan campos de configuración')
    for (const row of cleaned) {
      const optional = ['whatsapp', 'instagram', 'direccion']
      if (!optional.includes(row.clave) && !row.valor) throw Error('Campo obligatorio vacío')
      if (row.clave === 'whatsapp' && row.valor && !/^[1-9]\d{7,14}$/.test(row.valor)) throw Error('WhatsApp inválido')
      if (row.clave === 'instagram' && !validLink(row.valor, 'instagram.com')) throw Error('Enlace inválido')
      const max = { nombre: 35, descriptor: 50, titulo: 55, acento: 35, boton: 35, etiqueta: 50, descripcion: 220, historia_titulo: 90, historia_texto: 500 }[row.clave] ?? 500
      if (row.valor.length > max) throw Error('Texto demasiado largo')
    }
  }
  return cleaned
}
export function parseSection(section, text) {
  const [headers, ...records] = parseCsv(text)
  const expected = Object.keys(backup[section][0])
  if (!headers || headers.length !== expected.length || headers.some((header, index) => header.trim() !== expected[index])) throw Error('Cabeceras incorrectas')
  return validateSection(section, records.map(cells => {
    if (cells.length !== headers.length) throw Error('Fila incompleta')
    return Object.fromEntries(expected.map((header, index) => [header, cells[index]]))
  }))
}

// Cache y validación independientes: una sección errónea no reemplaza las demás.
export async function loadSection(section, { url = sources[section], storage = () => localStorage, fetcher = fetch, now = Date.now } = {}) {
  let current = { rows: backup[section], source: 'demo', updatedAt: null, stale: false }
  if (!url) return current
  if (!validLink(url)) return { ...current, source: 'backup', stale: true }
  const cacheKey = 'liria:v1:' + section + ':' + url
  try {
    const cache = JSON.parse(storage().getItem(cacheKey))
    if (cache?.version === 1 && Number.isFinite(cache.updatedAt) && cache.updatedAt > 0 && cache.updatedAt <= now()) {
      current = { rows: validateSection(section, cache.rows), source: 'cache', updatedAt: cache.updatedAt, stale: now() - cache.updatedAt >= refreshMs }
    }
  } catch { /* El almacenamiento puede estar bloqueado o dañado. */ }
  if (current.updatedAt && !current.stale) return current
  const controller = new AbortController()
  let timer
  try {
    const rows = await Promise.race([
      (async () => {
        const response = await fetcher(url, { signal: controller.signal, cache: 'no-cache', credentials: 'omit' })
        if (!response.ok) throw Error('No disponible')
        return parseSection(section, await response.text())
      })(),
      new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(Error('Tiempo agotado')) }, timeoutMs) }),
    ])
    const updatedAt = now()
    try { storage().setItem(cacheKey, JSON.stringify({ version: 1, rows, updatedAt })) } catch { /* Sigue disponible en memoria. */ }
    return { rows, source: 'sheets', updatedAt, stale: false }
  } catch { return { ...current, source: current.source === 'demo' ? 'backup' : current.source, stale: true } }
  finally { clearTimeout(timer) }
}

export function resolveItems(quantities, products, previous = new Map()) {
  return Object.entries(quantities).filter(([, quantity]) => quantity > 0).map(([id, quantity]) => {
    const current = products.find(product => product.id === id && product.visible === 'SI')
    return { ...(current ?? previous.get(id) ?? { id, nombre: 'Producto retirado' }), quantity, excluded: !current || current.disponible !== 'SI' }
  })
}
export function orderMessage(business, items, details) {
  const included = items.filter(item => !item.excluded)
  const allPriced = included.length && included.every(item => item.consultar_precio === 'NO')
  const lines = included.map(item => item.quantity + ' × ' + item.nombre + (item.consultar_precio === 'SI' ? ' · por cotizar' : ' · ' + money(priceCents(item.precio)) + ' c/u'))
  return [business.mensaje_inicial, ...lines, allPriced ? 'Subtotal referencial: ' + money(included.reduce((sum, item) => sum + priceCents(item.precio) * item.quantity, 0)) + ' (sin delivery).' : 'Importe por confirmar; puede incluir productos por cotizar.',
    'Modalidad: ' + details.modalidad, details.fecha && 'Fecha deseada: ' + details.fecha, details.dedicatoria && 'Dedicatoria: ' + details.dedicatoria, details.notas && 'Notas: ' + details.notas, '¿Me confirman disponibilidad, fecha, total y condiciones de entrega?'].filter(Boolean).join('\n')
}
