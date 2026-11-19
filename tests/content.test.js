import test from 'node:test'
import assert from 'node:assert/strict'
import { backup, imageFor, valuesOf } from '../src/data.js'
import { parseSection, validateSection, priceCents, loadSection, resolveItems, orderMessage, whatsappLink } from '../src/content.js'

const csvFor = (section, rows = backup[section]) => [Object.keys(backup[section][0]), ...rows.map(row => Object.keys(backup[section][0]).map(key => row[key]))].map(row => row.map(value => '"' + String(value).replaceAll('"', '""') + '"').join(',')).join('\r\n')
const storage = () => { const map = new Map(); return { getItem: key => map.get(key) ?? null, setItem: (key,value) => map.set(key,value), map } }
test('WhatsApp prepara el destino peruano y codifica saltos, acentos y símbolos', () => {
  const message = '[PRUEBA · DEMO LIRIA]\nPara ti & para mí'
  const link = new URL(whatsappLink('51964527152', message))
  assert.equal(link.origin, 'https://wa.me')
  assert.equal(link.pathname, '/51964527152')
  assert.equal(link.searchParams.get('text'), message)
  for (const phone of ['', '+51 964527152', 'javascript:alert(1)', undefined]) assert.equal(whatsappLink(phone, message), null)
})
test('las seis plantillas cumplen sus esquemas y hacen ida y vuelta por CSV', () => {
  for (const section of Object.keys(backup)) assert.deepEqual(parseSection(section, csvFor(section)), validateSection(section, backup[section]))
})
test('admite nombres y categorías nuevas y protege precios, flags y duplicados', () => {
  const product = { ...backup.productos[0], id: 'nuevo-ramo', categoria: 'nueva', imagen: '' }
  assert.equal(validateSection('productos', [product])[0].id, 'nuevo-ramo')
  assert.equal(imageFor('constructor'), '/media/pendiente.svg')
  assert.equal(imageFor('https://example.com/track'), '/media/pendiente.svg')
  for (const value of ['', '-1', '1.999', '100000', '1,000.00']) assert.throws(() => priceCents(value))
  assert.equal(priceCents('S/ 129,50'), 12950)
  assert.throws(() => validateSection('productos', [product,product]))
  assert.throws(() => validateSection('productos', [{...product,disponible:'quizas'}]))
  assert.throws(() => validateSection('productos', [{...product,nombre:'x'.repeat(101)}]))
  assert.throws(() => parseSection('productos','id,nombre\n1,flor'))
})
test('configuración exige claves completas y enlaces y teléfonos válidos', () => {
  assert.throws(() => validateSection('negocio', backup.negocio.slice(1)))
  assert.throws(() => validateSection('negocio', backup.negocio.map(row => row.clave === 'instagram' ? {...row,valor:'javascript:alert(1)'} : row)))
  assert.throws(() => validateSection('negocio', backup.negocio.map(row => row.clave === 'whatsapp' ? {...row,valor:'+51 999'} : row)))
})
test('productos se pueden ocultar todos sin reutilizar una carta antigua', () => {
  assert.deepEqual(parseSection('productos', csvFor('productos', [])), [])
  assert.deepEqual(validateSection('categorias', []), [])
  assert.throws(() => validateSection('portada', []))
})
test('cada sección conserva caché válida si su respuesta es corrupta', async () => {
  const saved = storage(); let calls = 0; let time = 1000000
  const options = { url:'https://example.test/productos.csv', storage:() => saved, now:() => time, fetcher:async () => {calls++;return {ok:true,text:async()=>csvFor('productos')}} }
  const fresh = await loadSection('productos',options)
  assert.equal(fresh.source,'sheets')
  await loadSection('productos',options)
  assert.equal(calls,1)
  time += 600001
  const original = [...saved.map.values()][0]
  const offline = await loadSection('productos',{...options, fetcher:async()=>({ok:true,text:async()=>'<html>error</html>'})})
  assert.equal(offline.source,'cache'); assert.equal(offline.stale,true)
  assert.deepEqual(offline.rows,fresh.rows)
  assert.equal([...saved.map.values()][0],original)
  const other = await loadSection('portada',{url:'https://example.test/portada.csv',storage:()=>saved,fetcher:async()=>{throw Error('offline')}})
  assert.equal(other.source,'backup'); assert.deepEqual(other.rows,backup.portada)
})
test('la demo no solicita red y funciona con almacenamiento bloqueado', async () => {
  let calls = 0
  assert.equal((await loadSection('productos',{url:'',fetcher:()=>{calls++}})).source,'demo')
  assert.equal(calls,0)
  const result = await loadSection('productos',{url:'https://example.test/data.csv',storage:()=>{throw Error('blocked')},fetcher:async()=>({ok:true,text:async()=>csvFor('productos')})})
  assert.equal(result.source,'sheets')
})
test('pedido refleja cambios de precio y excluye productos retirados o agotados', () => {
  const before = new Map(backup.productos.map(row => [row.id,row]))
  const products = backup.productos.map(row => row.id === 'brisa' ? {...row,precio:150} : row).filter(row => row.id !== 'luz')
  const items = resolveItems({brisa:2,luz:1,calma:1},products,before)
  assert.equal(items[0].precio,150)
  assert.equal(items[1].nombre,'Un poquito de luz'); assert.equal(items[1].excluded,true)
  assert.equal(items[2].excluded,true)
  const message = orderMessage(valuesOf(backup.negocio),items,{modalidad:'Delivery',fecha:'2026-12-25',dedicatoria:'Para ti & para mí',notas:''})
  assert.match(message,/300/);assert.match(message,/Para ti & para mí/);assert.doesNotMatch(message,/Un poquito de luz|Poquito de calma/)
  const custom = orderMessage(valuesOf(backup.negocio),resolveItems({'a-tu-manera':1},products,before),{modalidad:'Recojo en tienda'})
  assert.match(custom,/por cotizar/); assert.doesNotMatch(custom,/Subtotal referencial/)
})
