# Imágenes de productos desde Cloudinary

En Liria, la columna `imagen` admite una clave local (`rosas`, `portada`, `alegria`, `romance`, `blanco`, `taller`) o una URL pública HTTPS de Cloudinary.

1. Subir la fotografía a la biblioteca multimedia de la cuenta Cloudinary del negocio.
2. Copiar la URL de entrega de la imagen. No copiar la dirección de la consola ni un enlace de Google Drive. La imagen debe ser pública.
3. Pegar la URL completa en `imagen`, dentro de la fila del producto en Google Sheets.
4. Mantener la pestaña publicada como CSV. La web la consulta con su intervalo habitual (10 minutos con la página visible, más la demora que pueda añadir Google).

Formato admitido: `https://res.cloudinary.com/tu-cuenta/image/upload/.../foto.jpg`. También admite las transformaciones de imagen incluidas en esa URL, como `f_auto,q_auto,w_900`. Las comas se conservan al leer el CSV.

Para una prueba rápida, se puede usar la imagen pública de muestra de Cloudinary: `https://res.cloudinary.com/demo/image/upload/sample.jpg`. Es una fotografía de demostración de Cloudinary, no un producto de la florería. Reemplazarla por la foto propia al terminar la prueba.

El enlace se usa tanto en la tarjeta del catálogo como en la miniatura del pedido. Si la fotografía se elimina, deja de ser pública o no carga, se muestra la ilustración de respaldo. Si se pega una URL no admitida o una fila inválida, se conserva el catálogo válido anterior y aparece el aviso de respaldo.

No se necesitan claves API para mostrar imágenes públicas. No pegar API Secret, contraseñas ni enlaces privados en la hoja. Esta adaptación no crea una cuenta, no sube fotos automáticamente y no añade un formulario de subida a la web. No modifica el modo de prueba de WhatsApp ni el proyecto de Ángeles.

No hay que volver a desplegar Liria al cambiar una URL en la hoja. Los archivos siguen sujetos a los límites y condiciones de la cuenta Cloudinary que los aloja.

Si la columna imagen tiene un desplegable que rechaza valores distintos de las claves locales, quitar únicamente esa validación en Google Sheets (Datos > Validación de datos), o configurarla para advertir sin rechazar. Conservar las validaciones de las demás columnas.

Verificado el 20/11/2026: once pruebas automatizadas y compilación aprobadas. En navegador se comprobó una URL pública de Cloudinary con transformaciones, una imagen local, el respaldo ante un 404 y la recuperación al sustituirlo por una URL válida. La vista temporal usada para esta comprobación no se incluye en la publicación. No se modificó la hoja compartida ni se creó una cuenta Cloudinary.
