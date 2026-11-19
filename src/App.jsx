import React, { useEffect, useMemo, useRef, useState } from 'react'
import { backup, demoMode, imageFor, valuesOf } from './data.js'
import { money, orderMessage, priceCents, resolveItems, whatsappLink } from './content.js'
import { testWhatsApp } from './config.js'
import { useContent } from './useContent.js'

function Icon({ name, size = 22, ...props }) {
  const paths = {
    bag: <><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
    plus: <path d="M12 5v14M5 12h14"/>, minus: <path d="M5 12h14"/>, close: <path d="m6 6 12 12M18 6 6 18"/>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
    heart: <path d="M12 20 3.8 12A5 5 0 0 1 12 5.4 5 5 0 0 1 20.2 12Z"/>,
    gift: <><path d="M4 10h16v11H4zM3 6h18v4H3zM12 6v15"/><path d="M12 6C3 7 5 0 9 3l3 3Zm0 0c9 1 7-6 3-3l-3 3Z"/></>,
    flower: <><path d="M12 14v8m0-4c-5 0-6-4-6-4 4 0 6 1 6 4Zm0 2c5 0 6-4 6-4-4 0-6 1-6 4Z"/><path d="M12 4c-5-7-10 1-5 4-6 4 1 10 5 5 4 5 11-1 5-5 5-3 0-11-5-4Z"/><circle cx="12" cy="8" r="2"/></>,
    chat: <><path d="M21 11a9 9 0 0 1-13 8l-5 2 1-5a9 9 0 1 1 17-5Z"/><path d="M8 9h8M8 13h5"/></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>, chevron: <path d="m7 10 5 5 5-5"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>
}
function FlowerMark({ className = '' }) {
  return <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">{[0,72,144,216,288].map(angle => <ellipse key={angle} cx="50" cy="32" rx="14" ry="25" transform={'rotate(' + angle + ' 50 50)'} />)}<circle cx="50" cy="50" r="6"/></svg>
}
function Brand({ business }) {
  return <a className="brand" href="#inicio" aria-label={business.nombre + ', inicio'}><FlowerMark/><span>{business.nombre}<small>{business.descriptor}</small></span></a>
}
const orderBy = (a, b) => Number(a.orden) - Number(b.orden)
const localToday = () => { const date = new Date(); return date.getFullYear() + '-' + String(date.getMonth()+1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0') }

export default function App() {
  const content = useContent()
  const business = valuesOf(content.negocio.rows)
  const hero = valuesOf(content.portada.rows)
  const info = valuesOf(content.informacion.rows)
  const categories = content.categorias.rows.filter(row => row.visible === 'SI').sort(orderBy)
  const products = content.productos.rows.filter(row => row.visible === 'SI' && categories.some(category => category.id === row.categoria))
  const questions = content.preguntas.rows.filter(row => row.visible === 'SI').sort(orderBy)
  const [category, setCategory] = useState('todos')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('seleccion')
  const [quantities, setQuantities] = useState({})
  const [mobileNav, setMobileNav] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [orderWarning, setOrderWarning] = useState('')
  const [preview, setPreview] = useState(false)
  const [details, setDetails] = useState({ modalidad: 'Delivery', fecha: '', dedicatoria: '', notas: '' })
  const dialog = useRef(null)
  const closeButton = useRef(null)
  const previous = useRef(new Map(backup.productos.map(product => [product.id, product])))
  const items = resolveItems(quantities, products, previous.current)
  const included = items.filter(item => !item.excluded)
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = included.reduce((sum, item) => sum + (item.consultar_precio === 'NO' ? priceCents(item.precio) * item.quantity : 0), 0)
  const hasCustom = included.some(item => item.consultar_precio === 'SI')
  const message = (demoMode ? '[PRUEBA · DEMO LIRIA]\n\n' : '') + orderMessage(business, items, details)
  const whatsappUrl = whatsappLink(demoMode ? testWhatsApp : business.whatsapp, message)
  const stale = Object.entries(content).filter(([, value]) => value.stale)
  const activeCategory = category === 'todos' || categories.some(item => item.id === category) ? category : 'todos'
  const filtered = useMemo(() => products.filter(product => (activeCategory === 'todos' || product.categoria === activeCategory) && (product.nombre + ' ' + product.descripcion).toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es').trim())).sort((a,b) => {
    if (sort === 'precio') return (a.consultar_precio === 'SI' ? Infinity : priceCents(a.precio)) - (b.consultar_precio === 'SI' ? Infinity : priceCents(b.precio)) || orderBy(a,b)
    return Number(b.destacado === 'SI') - Number(a.destacado === 'SI') || orderBy(a,b)
  }), [products, activeCategory, query, sort])

  useEffect(() => {
    const changed = items.some(item => {
      const before = previous.current.get(item.id)
      return before && (item.excluded || before.precio !== item.precio || before.consultar_precio !== item.consultar_precio)
    })
    if (changed) setOrderWarning('El catálogo cambió. Revisa los importes y los productos que ya no están disponibles.')
    for (const product of content.productos.rows) previous.current.set(product.id, product)
  }, [content.productos.rows, content.categorias.rows, quantities])

  function change(id, delta) {
    const product = products.find(product => product.id === id)
    if (delta > 0 && (!product || product.disponible !== 'SI')) return
    setQuantities(current => ({ ...current, [id]: Math.max(0, Math.min(99, (current[id] ?? 0) + delta)) }))
    setPreview(false)
    if (delta > 0) setAnnouncement(product.nombre + ' agregado a tu pedido.')
  }
  function openOrder() { setMobileNav(false); setPreview(false); dialog.current.showModal() }
  function selectCategory(id) { setCategory(id); setQuery('') }
  function updateDetail(key, value) { setDetails(current => ({ ...current, [key]: value })); setPreview(false) }

  return <>
    <a href="#contenido" className="skip-link">Saltar al contenido</a>
    <div className="announcement-bar"><span>Flores para celebrar lo cotidiano.</span><span className="demo-label">Una boutique de demostración</span></div>
    <header className="header" id="inicio"><div className="container header-inner">
      <Brand business={business}/>
      <nav aria-label="Navegación principal" className={mobileNav ? 'nav is-open' : 'nav'}>
        <a href="#coleccion" onClick={() => setMobileNav(false)}>La colección</a><a href="#esencia" onClick={() => setMobileNav(false)}>Nuestra esencia</a><a href="#preguntas" onClick={() => setMobileNav(false)}>Cómo pedir</a>
      </nav>
      <div className="header-actions"><button className="cart-button" onClick={openOrder} aria-label={'Abrir mi pedido, ' + count + ' productos'}><Icon name="bag" size={20}/><span>Mi pedido</span><b>{count}</b></button><button className="menu-toggle icon-button" aria-label={mobileNav ? 'Cerrar navegación' : 'Abrir navegación'} aria-expanded={mobileNav} onClick={() => setMobileNav(!mobileNav)}><Icon name={mobileNav ? 'close' : 'menu'}/></button></div>
    </div></header>
    <main id="contenido">
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy"><p className="eyebrow"><span className="short-rule"/>{hero.etiqueta}</p><h1 id="hero-title">{hero.titulo}<br/><em>{hero.acento}</em></h1><p className="hero-description">{hero.descripcion}</p><a className="button button-primary" href="#coleccion">{hero.boton}<Icon name="flower" size={20}/></a><p className="hero-caption">Para los grandes días.<br/>Y los pequeños también.</p></div>
        <div className="hero-art"><div className="image-arch"><img src="/media/rosas.jpg" alt="Ramo de flores rosadas, blancas y follaje, fotografía referencial de la colección" width="1000" height="1500" fetchPriority="high"/></div><div className="floral-seal"><FlowerMark/><span>hecho para sentir</span></div><div className="hero-image-note"><span>LIRIA · COLECCIÓN FLORAL</span><p>{hero.nota}</p></div></div>
      </section>
      <div className="gesture-strip"><div className="container gesture-inner"><span><Icon name="flower"/>Flores con intención</span><span><Icon name="gift"/>Un regalo muy tuyo</span><span><Icon name="chat"/>Pedidos por WhatsApp</span></div></div>

      <section className="collection container section" id="coleccion" aria-labelledby="collection-title">
        <div className="section-heading"><div><p className="eyebrow">LA COLECCIÓN</p><h2 id="collection-title">Un detalle para <em>cada historia.</em></h2></div><p>Encuentra tu forma de decirlo.<br/>Nosotros ponemos las flores.</p></div>
        <div className="catalog-tools"><div className="filters" role="group" aria-label="Filtrar arreglos"><button aria-pressed={activeCategory === 'todos'} onClick={() => selectCategory('todos')}>Todos los arreglos</button>{categories.map(item => <button key={item.id} aria-pressed={activeCategory === item.id} onClick={() => selectCategory(item.id)}>{item.nombre}</button>)}</div><label className="search"><Icon name="search" size={18}/><span className="sr-only">Buscar arreglos</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Busca un detalle" maxLength={80}/></label></div>
        <div className="catalog-meta"><p aria-live="polite">{filtered.length} {filtered.length === 1 ? 'arreglo para descubrir' : 'arreglos para descubrir'}</p><label className="sort">Ordenar: <select value={sort} onChange={event => setSort(event.target.value)}><option value="seleccion">Nuestra selección</option><option value="precio">Menor precio</option></select><Icon name="chevron" size={15}/></label></div>
        {stale.length > 0 && <p className="notice" role="status">Mostramos contenido guardado de {stale.map(([key]) => key).join(', ')}. Confirma precios y disponibilidad al coordinar tu pedido.</p>}
        <div className="product-grid">{filtered.map(product => <article className="product" key={product.id}>
          <div className="product-image"><img src={imageFor(product.imagen)} alt={product.nombre + ' · imagen referencial'} loading="lazy" width="600" height="720" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/media/pendiente.svg' }}/>{product.disponible === 'NO' ? <span className="product-tag muted">Por ahora, agotado</span> : product.destacado === 'SI' && <span className="product-tag">De nuestros favoritos</span>}<button className="product-add" aria-label={'Agregar ' + product.nombre + ' al pedido'} disabled={product.disponible !== 'SI' || quantities[product.id] >= 99} onClick={() => change(product.id, 1)}><Icon name="plus"/>{quantities[product.id] > 0 && <span>{quantities[product.id]}</span>}</button></div>
          <div className="product-heading"><h3>{product.nombre}</h3><span className="product-price">{product.consultar_precio === 'SI' ? 'Por cotizar' : money(priceCents(product.precio))}</span></div><p>{product.descripcion}</p>
        </article>)}</div>
        {!filtered.length && <div className="empty-state"><FlowerMark/><h3>No encontramos ese detalle.</h3><p>Prueba otra búsqueda o explora la colección completa.</p><button className="button button-secondary" onClick={() => selectCategory('todos')}>Ver todos los arreglos</button></div>}
        <p className="collection-note">Precios e imágenes de ejemplo. Cada arreglo puede adaptarse a la temporada.</p>
      </section>

      <section className="essence" id="esencia" aria-labelledby="essence-title"><div className="container essence-inner"><div className="essence-photo"><img src="/media/taller.jpg" alt="Detalle de flores de distintos colores, fotografía de inspiración" loading="lazy" width="1000" height="1600"/><span>La belleza de los pequeños gestos.</span></div><div className="essence-copy"><FlowerMark/><p className="eyebrow">LA ESENCIA DE LIRIA</p><h2 id="essence-title">{hero.historia_titulo}</h2><p>{hero.historia_texto}</p><a href="#coleccion" className="text-link">Encuentra tu próximo detalle</a></div></div></section>

      <section className="section container how-to" aria-labelledby="how-title"><div className="section-heading"><div><p className="eyebrow">DE TU IDEA A SU SONRISA</p><h2 id="how-title">Regalar, <em>así de sencillo.</em></h2></div><p>Elige con calma.<br/>Coordina los detalles en una conversación.</p></div><div className="steps"><article><Icon name="flower" size={30}/><h3>Encuentra ese arreglo</h3><p>Explora la colección y agrega a tu pedido las flores que más te gusten.</p></article><article><Icon name="heart" size={30}/><h3>Hazlo personal</h3><p>Elige la fecha y escribe la dedicatoria que acompañará tu detalle.</p></article><article><Icon name="chat" size={30}/><h3>Conversemos los detalles</h3><p>Revisa el mensaje. La florería confirma disponibilidad, importe y entrega por WhatsApp.</p></article></div></section>

      <section className="information-section" id="preguntas" aria-labelledby="questions-title"><div className="container information-grid"><div className="info-copy"><p className="eyebrow">ANTES DE ENVIAR FLORES</p><h2 id="questions-title">Los pequeños<br/><em>detalles importan.</em></h2><p>{info.reparto}</p><p className="hours"><strong>Horario de referencia</strong>{info.horario}</p><button className="text-link" onClick={openOrder}>Prepara tu pedido de ejemplo</button></div><div className="faq-list">{questions.map(item => <details key={item.id}><summary>{item.pregunta}<Icon name="plus" size={18}/></summary><p>{item.respuesta}</p></details>)}<details><summary>¿Con cuánto tiempo puedo pedir?<Icon name="plus" size={18}/></summary><p>{info.anticipacion}</p></details><details><summary>¿Puedo incluir una dedicatoria?<Icon name="plus" size={18}/></summary><p>{info.personalizacion}</p></details></div></div></section>
      <section className="closing"><FlowerMark/><p>Siempre hay una buena razón<br/>para <em>regalar flores.</em></p><a className="button button-primary" href="#coleccion">Descubre la colección</a></section>
    </main>
    <footer className="footer"><div className="container"><div className="footer-main"><div><Brand business={business}/><p>{business.presentacion}</p></div><div><h3>Exploremos</h3><a href="#coleccion">La colección</a><a href="#esencia">Nuestra esencia</a><a href="#preguntas">Preguntas frecuentes</a></div><div><h3>Un poco más cerca</h3><p>{business.ciudad}</p>{business.direccion && <p>{business.direccion}</p>}{business.instagram && <a href={business.instagram} target="_blank" rel="noreferrer">Instagram</a>}<button onClick={openOrder}>Mi pedido</button></div></div><div className="footer-bottom"><p>© {new Date().getFullYear()} {business.nombre}. Marca ficticia de demostración.</p><p>Una web que puede florecer con tu negocio.</p></div></div></footer>
    <div className="demo-ribbon"><span>DEMO</span><p>Este diseño se adapta a tu florería. Los pedidos son de ejemplo.</p></div>
    {count > 0 && <button className="floating-cart" onClick={openOrder}><Icon name="bag" size={19}/>Ver mi pedido <b>{count}</b></button>}
    <span className="sr-only" role="status">{announcement}</span>

    <dialog className="order-dialog" ref={dialog} aria-labelledby="order-title" onClose={() => setPreview(false)}>
      <div className="dialog-heading"><div><p className="eyebrow">UN DETALLE MUY TUYO</p><h2 id="order-title">Tu pedido floral.</h2></div><button ref={closeButton} className="icon-button" onClick={() => dialog.current.close()} aria-label="Cerrar pedido" autoFocus><Icon name="close"/></button></div>
      {orderWarning && <p className="notice" role="status">{orderWarning}</p>}
      {!items.length ? <div className="empty-order"><Icon name="flower" size={45}/><h3>Tu próximo detalle empieza aquí.</h3><p>Agrega un arreglo de la colección para preparar tu pedido.</p><button className="button button-primary" onClick={() => { dialog.current.close(); document.getElementById('coleccion').scrollIntoView() }}>Explorar arreglos</button></div> : <>
        <ul className="order-items">{items.map(item => <li key={item.id}><img src={imageFor(item.imagen)} alt="" width="66" height="80"/><div><strong>{item.nombre}</strong><small>{item.excluded ? 'No disponible · excluido del pedido' : item.consultar_precio === 'SI' ? 'Precio por cotizar' : money(priceCents(item.precio)) + ' por unidad'}</small><div className="quantity"><button aria-label={'Quitar una unidad de ' + item.nombre} onClick={() => { if (item.quantity === 1) closeButton.current.focus(); change(item.id, -1) }}><Icon name="minus" size={14}/></button><span>{item.quantity}</span><button disabled={item.excluded || item.quantity >= 99} aria-label={'Agregar una unidad de ' + item.nombre} onClick={() => change(item.id, 1)}><Icon name="plus" size={14}/></button></div></div></li>)}</ul>
        <div className="subtotal"><span>Subtotal referencial</span><strong>{included.length ? (hasCustom ? (subtotal ? money(subtotal) + ' + cotización' : 'Por cotizar') : money(subtotal)) : 'Sin productos disponibles'}</strong><p>La florería confirma el importe final y el costo de delivery.</p></div>
        <form onSubmit={event => { event.preventDefault(); setPreview(true) }}>
          <h3 className="form-title">Los detalles de tu regalo</h3><div className="form-row"><label>¿Cómo lo recibirás?<select value={details.modalidad} onChange={event => updateDetail('modalidad', event.target.value)}><option>Delivery</option><option>Recojo en tienda</option></select></label><label>Fecha deseada <span>(opcional)</span><input type="date" value={details.fecha} min={localToday()} onChange={event => updateDetail('fecha', event.target.value)}/></label></div>
          <label>Dedicatoria <span>(opcional)</span><textarea rows="2" placeholder="Lo que te gustaría decirle…" maxLength={240} value={details.dedicatoria} onChange={event => updateDetail('dedicatoria', event.target.value)}/></label>
          <label>¿Algo más que debamos saber? <span>(opcional)</span><textarea rows="2" placeholder="Ocasión, colores o preferencias" maxLength={300} value={details.notas} onChange={event => updateDetail('notas', event.target.value)}/></label>
          <button className="button button-primary full-width" disabled={!included.length} type="submit"><Icon name="chat" size={19}/>Vista previa del mensaje</button>
        </form>
        {preview && <div className="message-preview" role="region" aria-label="Vista previa del mensaje"><h3>Así se verá tu mensaje</h3><textarea aria-label="Mensaje preparado" rows="9" readOnly value={message}/>{whatsappUrl ? <><a className="button button-primary full-width" href={whatsappUrl} target="_blank" rel="noreferrer">{demoMode ? 'Abrir WhatsApp de prueba' : 'Abrir WhatsApp'}</a>{demoMode && <p>El mensaje se dirige al número de prueba de Bryan. Revísalo y envíalo desde WhatsApp si deseas probarlo. No es un pedido a una florería.</p>}</> : <p>El WhatsApp del negocio todavía no está configurado.</p>}</div>}
      </>}
    </dialog>
  </>
}
