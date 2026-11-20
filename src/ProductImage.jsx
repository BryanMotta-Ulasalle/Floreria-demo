import React, { useState } from 'react'
import { imageFor } from './data.js'
import { optimizedCloudinaryImage } from './imageSource.js'

function ImageWithFallback({ src, ...props }) {
  const [failed, setFailed] = useState(false)
  return <img {...props} src={failed ? '/media/pendiente.svg' : src} onError={failed ? undefined : () => setFailed(true)}/>
}

export default function ProductImage({ image, maxWidth = 900, ...props }) {
  const src = optimizedCloudinaryImage(image, maxWidth) || imageFor(image)
  // Un enlace nuevo reinicia el respaldo incluso si el anterior había fallado.
  return <ImageWithFallback key={src} src={src} {...props}/>
}
