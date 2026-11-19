// Contenido ficticio de la demostración. Se conserva como respaldo por sección.
export const backup = {
  negocio: [
    { clave: 'nombre', valor: 'Liria', ayuda: 'Nombre comercial. Hasta 35 caracteres.' },
    { clave: 'descriptor', valor: 'Estudio floral', ayuda: 'Descripción breve bajo la marca.' },
    { clave: 'presentacion', valor: 'Flores elegidas con intención. Detalles para acompañar lo que sientes.', ayuda: 'Texto del pie de página.' },
    { clave: 'whatsapp', valor: '', ayuda: 'Número internacional solo con dígitos. Vacío en esta demo.' },
    { clave: 'mensaje_inicial', valor: 'Hola, me gustaría coordinar este pedido floral:', ayuda: 'Saludo del pedido.' },
    { clave: 'instagram', valor: '', ayuda: 'Enlace HTTPS del negocio. Opcional.' },
    { clave: 'direccion', valor: '', ayuda: 'Dirección real del negocio. Opcional.' },
    { clave: 'ciudad', valor: 'Arequipa, Perú', ayuda: 'Ciudad o área de atención.' },
  ],
  portada: [
    { clave: 'etiqueta', valor: 'DETALLES QUE FLORECEN', ayuda: 'Frase breve sobre el título.' },
    { clave: 'titulo', valor: 'Hay cosas que se dicen', ayuda: 'Primera parte del título. Hasta 55 caracteres.' },
    { clave: 'acento', valor: 'con flores.', ayuda: 'Cierre del título, en cursiva. Hasta 35 caracteres.' },
    { clave: 'descripcion', valor: 'Un cumpleaños, un gracias o simplemente porque sí. Encuentra ese detalle que habla por ti.', ayuda: 'Presentación de hasta 220 caracteres.' },
    { clave: 'boton', valor: 'Encuentra tu arreglo', ayuda: 'Texto del botón de catálogo.' },
    { clave: 'nota', valor: 'Un detalle. Toda una intención.', ayuda: 'Frase al pie de la fotografía.' },
    { clave: 'historia_titulo', valor: 'El detalle está en la intención.', ayuda: 'Título de la sección sobre el estudio.' },
    { clave: 'historia_texto', valor: 'Hay flores que recuerdan a alguien. Colores que dicen gracias. Y pequeños gestos que se quedan. Nuestra colección de ejemplo está pensada para celebrar esas historias, una flor a la vez.', ayuda: 'Texto de presentación del estudio. Hasta 500 caracteres.' },
  ],
  categorias: [
    { id: 'romance', nombre: 'Amor y complicidad', visible: 'SI', orden: 1 },
    { id: 'celebrar', nombre: 'Para celebrar', visible: 'SI', orden: 2 },
    { id: 'cotidiano', nombre: 'Porque sí', visible: 'SI', orden: 3 },
    { id: 'especial', nombre: 'A tu manera', visible: 'SI', orden: 4 },
  ],
  productos: [
    { id: 'brisa', nombre: 'Brisa de primavera', descripcion: 'Tonos suaves, rosas y follaje. Un gesto delicado que se queda.', precio: 129, categoria: 'romance', disponible: 'SI', visible: 'SI', destacado: 'SI', orden: 1, imagen: 'rosas', consultar_precio: 'NO' },
    { id: 'luz', nombre: 'Un poquito de luz', descripcion: 'Una composición alegre para celebrar sus mejores días.', precio: 95, categoria: 'celebrar', disponible: 'SI', visible: 'SI', destacado: 'SI', orden: 2, imagen: 'alegria', consultar_precio: 'NO' },
    { id: 'tulipanes', nombre: 'Domingo en flor', descripcion: 'Tulipanes rosados para hacer especial un día cualquiera.', precio: 110, categoria: 'cotidiano', disponible: 'SI', visible: 'SI', destacado: 'NO', orden: 3, imagen: 'portada', consultar_precio: 'NO' },
    { id: 'abrazo', nombre: 'Un abrazo en flores', descripcion: 'Un arreglo de tonos cálidos para decir: estoy contigo.', precio: 145, categoria: 'romance', disponible: 'SI', visible: 'SI', destacado: 'SI', orden: 4, imagen: 'romance', consultar_precio: 'NO' },
    { id: 'calma', nombre: 'Poquito de calma', descripcion: 'Flores claras y verdes naturales. Sencillo, sereno, especial.', precio: 89, categoria: 'cotidiano', disponible: 'NO', visible: 'SI', destacado: 'NO', orden: 5, imagen: 'blanco', consultar_precio: 'NO' },
    { id: 'a-tu-manera', nombre: 'Tu historia, en flores', descripcion: 'Cuéntanos la ocasión, tus colores y lo que quieres expresar.', precio: '', categoria: 'especial', disponible: 'SI', visible: 'SI', destacado: 'NO', orden: 6, imagen: 'taller', consultar_precio: 'SI' },
  ],
  informacion: [
    { clave: 'horario', valor: 'Lunes a sábado · 9:00 a. m. a 7:00 p. m.', ayuda: 'Horario de ejemplo. Sustituir al adaptar.' },
    { clave: 'reparto', valor: 'Coordinamos cada entrega contigo. Consulta las zonas disponibles y el costo de reparto al preparar tu pedido.', ayuda: 'Zonas y condiciones. Hasta 500 caracteres.' },
    { clave: 'anticipacion', valor: 'Elige tu fecha y confirmaremos la disponibilidad antes de cerrar tu pedido.', ayuda: 'Anticipación necesaria. Hasta 300 caracteres.' },
    { clave: 'personalizacion', valor: 'Puedes acompañar tu arreglo con una dedicatoria. Para una composición especial, cuéntanos tu idea.', ayuda: 'Opciones de personalización. Hasta 300 caracteres.' },
  ],
  preguntas: [
    { id: 'comprar', pregunta: '¿Cómo hago un pedido?', respuesta: 'Elige tus arreglos, revisa tu pedido y completa los detalles de entrega. En un negocio conectado, el mensaje se abre en WhatsApp para confirmar disponibilidad y pago. En esta demo puedes ver el mensaje sin enviarlo.', visible: 'SI', orden: 1 },
    { id: 'fecha', pregunta: '¿Puedo elegir el día de entrega?', respuesta: 'Sí, puedes indicar la fecha que prefieres. La florería debe confirmar la disponibilidad y el horario antes de aceptar el pedido.', visible: 'SI', orden: 2 },
    { id: 'foto', pregunta: '¿El arreglo será igual al de la foto?', respuesta: 'Las fotografías de esta demostración son referenciales. En un negocio real, las flores y tonalidades pueden variar según temporada, siempre con coordinación previa.', visible: 'SI', orden: 3 },
    { id: 'personalizar', pregunta: '¿Puedo pedir algo personalizado?', respuesta: 'Claro. Elige «Tu historia, en flores» y añade tus colores, ocasión y preferencias en las notas del pedido para solicitar una cotización.', visible: 'SI', orden: 4 },
  ],
}

// Fotografías administradas por el desarrollador; la hoja solo elige una clave.
export const images = Object.fromEntries(['rosas', 'portada', 'alegria', 'romance', 'blanco', 'taller'].map(key => [key, '/media/' + key + '.jpg']))
export const imageFor = key => Object.hasOwn(images, key) ? images[key] : '/media/pendiente.svg'
export const valuesOf = rows => Object.fromEntries(rows.map(row => [row.clave, row.valor]))
export const demoMode = true // Se cambia a false únicamente al entregar a un negocio real.
