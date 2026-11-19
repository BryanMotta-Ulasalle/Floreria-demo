# Liria · Demo comercial de florería

React + Vite. Proyecto independiente de King Bras, preparado para alojamiento estático en Netlify y para personalizar por cliente. Marca, precios, horarios y productos ficticios. No envía pedidos reales: el usuario puede preparar y revisar el mensaje.

## Trabajar localmente

Con Node 22: `npm ci`, `npm run dev`. Verificar con `npm test` y `npm run build`. El resultado está en `dist`. No hace falta un servidor de aplicación ni credenciales privadas.

## Administrar el contenido

El libro editable contiene una guía y seis pestañas de datos. También hay CSV iniciales en `public/plantillas/`. Importa el libro en Google Sheets y conserva los encabezados en la primera fila de cada pestaña de datos. No publiques la guía.

1. Publica **Productos**, **Categorias**, **Negocio**, **Portada**, **Informacion** y **Preguntas** por separado como CSV en Archivo > Compartir > Publicar en la Web. Activa la republicación automática.
2. Copia cada enlace en su entrada correspondiente de `src/config.js`. Publicar las seis pestañas implica configurar seis enlaces; es una operación inicial por cliente.
3. Despliega. Las siguientes ediciones en la hoja no requieren desplegar otra vez. Mantén la misma hoja y pestañas; sustituir sus enlaces sí requiere cambiar la configuración.
4. Comprueba los datos desde la web con la hoja publicada. No se ha creado una hoja de Google ni conectado una cuenta en esta entrega; la demo utiliza el contenido incluido.

### Productos y categorías

Añadir un producto es agregar una fila completa con un id único y estable. Usa minúsculas, números y guiones; no cambies ids existentes. La categoría debe coincidir con el id de una categoría visible. Crea primero la categoría si es nueva; un producto de categoría inexistente u oculta no se muestra. El filtro «Todos los arreglos» no es una categoría asignable.

- `precio`: número en soles de 0 a 99999.99, hasta dos decimales. Se acepta coma, punto y el prefijo de formato S/. No admite separadores de miles ni importes negativos.
- `consultar_precio`: SI para cotizar; permite precio vacío. NO exige precio válido. Los productos por cotizar no se suman como cero al importe final.
- `disponible`: NO conserva la tarjeta como agotada e impide añadirla.
- `visible`: NO oculta el producto. Una categoría oculta oculta sus productos.
- `destacado`: SI lo adelanta en «Nuestra selección». Después se respeta `orden`. El visitante también puede ordenar por menor precio.
- `imagen`: clave de una fotografía cargada por el desarrollador. Las claves iniciales son rosas, portada, alegria, romance, blanco y taller. Una clave nueva o vacía usa la ilustración. No acepta URLs ni subidas.

El libro ofrece listas SI/NO, categorías e imágenes y reserva validaciones para las primeras 500 filas de datos. La web admite hasta 500 registros por sección, ids de hasta 64 caracteres, nombres de 100 y descripciones de 300. Si se exceden las filas con validaciones, revisa manualmente o extiende las reglas en Sheets.

En Negocio, Portada e Informacion se edita la columna `valor`; conserva `clave` y las cabeceras. Los límites se indican en ayuda y en la validación de `src/content.js`. Para texto literal no uses fórmulas ni contenido privado. Preguntas admite filas nuevas con ids únicos, pregunta, respuesta, visible y orden.

### Actualización y respaldo

Se revisan las fuentes al abrir la página y cada minuto cuando está visible; las consultas se limitan a una tanda aproximadamente cada 10 minutos. Cada sección tiene su caché y fecha, con un máximo de espera de 8 segundos por descarga. Google puede añadir demora de publicación. Recargar no evita la caché reciente.

Solo se guarda una sección validada completa. Ante errores se usa su último contenido válido, después su copia incluida. Si el navegador impide guardar datos se conserva el contenido en memoria durante esa visita. Se muestra un aviso al usar respaldo. Una sección vacía de productos, categorías o preguntas es válida para permitir retirarlos todos. Una configuración sin sus claves requeridas es inválida. Las seis publicaciones no son una transacción: al mover productos a una categoría nueva, publica primero la categoría y deja tiempo para su actualización.

El carrito se recalcula con precios actuales. Los productos ocultos, retirados o agotados se señalan y se excluyen del mensaje. La fecha, dedicatoria y notas permanecen únicamente en memoria: no se guardan en el CSV ni en la caché. Cerrar la pestaña elimina el pedido.

## Adaptar a un cliente real

Configura un WhatsApp autorizado en Negocio: número internacional, solo dígitos. Cambia `demoMode` en `src/data.js` a false para habilitar la apertura de WhatsApp. Revisa nombre, logo, textos, fotos, contenido ficticio y todos los avisos de demostración de App.jsx. Confirma horarios, entrega y condiciones con el negocio. No inventes reseñas o garantías.

Las fotografías actuales son referenciales, descargadas de Unsplash y Pexels; véase `docs/fotografias.md`. Sustituye por fotografías del cliente al entregar. Las fotos, diseño y estructura siguen bajo mantenimiento del desarrollador. La personalización de portada y descripciones se realiza por Sheets, pero los metadatos SEO iniciales y la identidad visual se configuran al entregar.

## Netlify

Sube esta carpeta como un repositorio independiente. En Netlify: comando `npm run build`, directorio `dist`, Node 22. No publiques la carpeta outputs del espacio de trabajo ni el Excel como información privada.

La demo incluye `noindex,nofollow`, robots y cabecera X-Robots-Tag para no competir con negocios reales. Para un cliente real, sustituye title y description, elimina estas tres restricciones, configura canonical y sitemap con su URL definitiva y revisa el SEO. No se ha conectado esta demo a GitHub ni a Netlify en esta entrega.

## Validación

`npm test` cubre los CSV, precios, secciones, claves, caché, datos inválidos, productos nuevos y cambios del pedido. La prueba de conexión real a Google se realiza después de recibir las seis URLs. El comportamiento visual y el recorrido deben revisarse en escritorio y móvil antes de entregar a un negocio.
