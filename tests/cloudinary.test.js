import test from 'node:test'
import assert from 'node:assert/strict'
import { backup, imageFor } from '../src/data.js'
import { validateSection, parseSection, loadSection } from '../src/content.js'
import { cloudinaryImageUrl, optimizedCloudinaryImage } from '../src/imageSource.js'

const url = 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_900/sample.jpg'
test('optimiza originales versionados, carpetas y miniaturas sin cambiar el enlace guardado', () => {
  const original = 'https://res.cloudinary.com/mi-cuenta/image/upload/v123/catalogo/rosas.jpg'
  assert.equal(optimizedCloudinaryImage(original), 'https://res.cloudinary.com/mi-cuenta/image/upload/c_limit,w_900/q_auto/f_auto/v123/catalogo/rosas.jpg')
  assert.ok(optimizedCloudinaryImage(original, 180).includes('/c_limit,w_180/'))
  assert.equal(cloudinaryImageUrl(original), original)
  assert.equal(optimizedCloudinaryImage('rosas'), '')
  assert.equal(optimizedCloudinaryImage('https://example.com/foto.jpg'), '')
})
test('la reducción final respeta transformaciones previas y no rompe URLs firmadas', () => {
  assert.equal(optimizedCloudinaryImage('https://res.cloudinary.com/demo/image/upload/c_fill,w_2000,h_2000/sample.jpg'), 'https://res.cloudinary.com/demo/image/upload/c_fill,w_2000,h_2000/c_limit,w_900/q_auto/f_auto/sample.jpg')
  const signed = 'https://res.cloudinary.com/demo/image/upload/s--firma--/v123/sample.jpg'
  assert.equal(optimizedCloudinaryImage(signed), signed)
})
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
