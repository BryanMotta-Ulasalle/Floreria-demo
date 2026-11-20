import test from 'node:test'
import assert from 'node:assert/strict'
import { backup, imageFor } from '../src/data.js'
import { validateSection, parseSection, loadSection } from '../src/content.js'
import { cloudinaryImageUrl } from '../src/imageSource.js'

const url = 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_900/sample.jpg'
test('una URL pública de Cloudinary pasa del CSV al catálogo y a la caché', async () => {
  const product = { ...backup.productos[0], imagen: url }
  const headers = Object.keys(product)
  const quote = value => '"' + String(value).replaceAll('"', '""') + '"'
  const csv = [headers.join(','), headers.map(key => quote(product[key])).join(',')].join('\n')
  assert.equal(parseSection('productos', csv)[0].imagen, url)
  let saved
  const result = await loadSection('productos', { storage: () => ({ getItem: () => null, setItem: (_, value) => { saved = JSON.parse(value) } }), fetcher: async () => ({ ok: true, text: async () => csv }) })
  assert.equal(result.source, 'sheets')
  assert.equal(imageFor(result.rows[0].imagen), url)
  assert.equal(saved.rows[0].imagen, url)
})
test('siguen funcionando las claves locales y la imagen de respaldo', () => {
  assert.equal(imageFor('rosas'), '/media/rosas.jpg')
  assert.equal(imageFor(''), '/media/pendiente.svg')
  assert.equal(imageFor('clave-nueva'), '/media/pendiente.svg')
  assert.equal(cloudinaryImageUrl('  ' + url + '  '), url)
})
test('rechaza enlaces de consola, otros servidores, credenciales y protocolos inseguros', () => {
  for (const invalid of ['http://res.cloudinary.com/demo/image/upload/sample.jpg','https://res.cloudinary.com.evil.test/demo/image/upload/sample.jpg','https://res.cloudinary.com@evil.test/demo/image/upload/sample.jpg','https://user:secret@res.cloudinary.com/demo/image/upload/sample.jpg','https://res.cloudinary.com:8443/demo/image/upload/sample.jpg','https://console.cloudinary.com/console/media_library','https://res.cloudinary.com/demo/video/upload/sample.mp4','https://res.cloudinary.com/demo/image/upload/','javascript:alert(1)','https://example.com/image.jpg']) {
    assert.equal(cloudinaryImageUrl(invalid), '')
    assert.equal(imageFor(invalid), '/media/pendiente.svg')
    assert.throws(() => validateSection('productos', [{ ...backup.productos[0], imagen: invalid }]))
  }
})
