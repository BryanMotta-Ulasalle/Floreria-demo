import React, { useState } from 'react'
import { imageFor } from './data.js'

function ImageWithFallback({ src, ...props }) {
  const [failed, setFailed] = useState(false)
  return <img {...props} src={failed ? '/media/pendiente.svg' : src} onError={failed ? undefined : () => setFailed(true)}/>
}

export default function ProductImage({ image, ...props }) {
  const src = imageFor(image)
  // Un enlace nuevo reinicia el respaldo incluso si el anterior había fallado.
  return <ImageWithFallback key={src} src={src} {...props}/>
}
