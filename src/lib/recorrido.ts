/**
 * Contenido de la landing. Los textos son literales de https://ikaikasalud.es/ (noviembre de
 * 2026), salvo las fichas del equipo, resumidas de su página /nosotras.
 */

/**
 * Paradas del recorrido por la clínica.
 *
 * `foto` es la foto real del sitio (1080×1920, de las originales de la clínica): mientras se
 * lee la parada se ve esa foto, nítida, encima de la secuencia; también es la vista con
 * movimiento reducido o sin JS.
 *
 * `tiempo` es el fotograma de la secuencia (24 fps) más parecido a esa foto, medido con SSIM,
 * escrito como `fotograma / 24`. Que sea un fotograma entero evita que el canvas mezcle dos
 * en la parada, y que sea el más parecido hace invisible el paso entre foto y secuencia. Si
 * cambia el montaje, hay que volver a medirlo.
 */
export interface Parada {
  id: string;
  lugar: string;
  tiempo: number;
  foto: string;
  titulo: string;
  textos: string[];
  /** Enlaces a las tarjetas de servicios relacionadas. */
  enlaces: { texto: string; href: string }[];
}

export const duracionRecorrido = 26.46;

/**
 * Secuencia de fotogramas (WebP, 24 fps) en public/recorrido/m (540×960, móvil) y
 * public/recorrido/d (720×1280, escritorio), numerados 0001.webp…
 */
export const fotogramas = { total: 635, fps: 24 } as const;

/**
 * Ritmo del scroll, en alturas de pantalla (vh) por parada: `lectura` con el texto visible y
 * la cámara en la parada, y `trayecto` con la cámara avanzando hasta la siguiente. En móvil
 * es más corto: el dedo recorre menos pantalla por gesto y un tramo largo sin cambios parece
 * que no responde.
 */
export const ritmo = {
  movil: { lectura: 45, trayecto: 85 },
  escritorio: { lectura: 80, trayecto: 120 },
} as const;

export const hero = {
  titulo: 'Clínica de fisioterapia en Albacete — Ikaika Salud',
  textos: [
    'En Ikaika Salud, tu clínica de fisioterapia en Albacete, te ayudamos a prevenir y tratar lesiones musculoesqueléticas.',
    'Somos especialistas en suelo pélvico, embarazo, postparto y ejercicio terapéutico, combinando pilates terapéutico y entrenamiento funcional para que recuperes tu bienestar.',
  ],
};

export const paradas: Parada[] = [
  {
    id: 'parada-instalaciones',
    lugar: 'Instalaciones',
    tiempo: 78 / 24,
    foto: '/recorrido/parada-2.webp',
    titulo: 'Instalaciones',
    textos: [
      'En Ikaika Salud, en Calle Alcalde Conangla, 24 (Albacete), hemos creado un espacio pensado para tu comodidad, confianza y tranquilidad.',
      'Cada rincón está diseñado para que te sientas en un entorno profesional, cercano y acogedor, donde puedas cuidar tu salud con tranquilidad.',
    ],
    enlaces: [],
  },
  {
    id: 'parada-fisioterapia',
    lugar: 'Sala de tratamiento',
    tiempo: 269 / 24,
    foto: '/recorrido/parada-3.webp',
    titulo: 'Fisioterapia',
    textos: [
      'Prevención, tratamiento y recuperación de lesiones o disfunciones del cuerpo, con el objetivo de mejorar la calidad de vida y la movilidad de cada persona, así como permitir la vuelta a sus actividades diarias y/o deportivas en las mejores condiciones.',
    ],
    enlaces: [{ texto: 'Ver tratamientos de fisioterapia', href: '#fisioterapia' }],
  },
  {
    id: 'parada-suelo-pelvico',
    lugar: 'Sala de tratamiento',
    tiempo: 447 / 24,
    foto: '/recorrido/parada-4.webp',
    titulo: 'Fisioterapia de suelo pélvico',
    textos: [
      'Valoración y tratamiento de las disfunciones del suelo pélvico (incontinencia urinaria, prolapsos, diástasis abdominal, dolor pélvico, disfunciones sexuales y/o rehabilitación tras cirugías ginecológicas).',
    ],
    enlaces: [
      { texto: 'Más sobre suelo pélvico', href: '#suelo-pelvico' },
      { texto: 'Explorar fisioterapia en el embarazo', href: '#embarazo' },
      { texto: 'Infórmate sobre fisioterapia en postparto', href: '#postparto' },
    ],
  },
  {
    id: 'parada-ejercicio',
    lugar: 'Sala de ejercicio',
    tiempo: 533 / 24,
    foto: '/recorrido/parada-5.webp',
    titulo: 'Entrenamiento funcional',
    textos: [
      'Sesiones de entrenamiento personal funcional guiadas por una fisioterapeuta experta en ejercicio terapéutico que adapta las sesiones no solo a tus objetivos de salud y rendimiento, sino también a la presencia de patologías o limitaciones físicas, garantizando un trabajo seguro y progresivo.',
    ],
    enlaces: [
      { texto: 'Descubrir entrenamiento funcional', href: '#entrenamiento-funcional' },
      { texto: 'Conocer clases de ejercicio funcional', href: '#ejercicio-funcional-grupo' },
      { texto: 'Aprende sobre pilates terapéutico', href: '#pilates' },
    ],
  },
];

export const serviciosIntro =
  'Fisioterapia en Albacete | Clínica Ikaika Salud te ofrece atención integral en salud, suelo pélvico, embarazo, postparto, pilates terapéutico, ejercicio funcional y recuperación de lesiones deportivas, para mejorar tu salud física y calidad de vida.';

export const servicios = [
  {
    id: 'fisioterapia',
    menu: 'Fisioterapia',
    titulo: 'Fisioterapia',
    imagen: '/original/servicio-fisioterapia.webp',
    alt: 'Fisioterapeuta en Albacete realizando masaje en Clínica Ikaika Salud',
    textos: [
      'Prevención, tratamiento y recuperación de lesiones o disfunciones del cuerpo, con el objetivo de mejorar la calidad de vida y la movilidad de cada persona, así como permitir la vuelta a sus actividades diarias y/o deportivas en las mejores condiciones.',
    ],
  },
  {
    id: 'suelo-pelvico',
    menu: 'Fisioterapia de suelo pélvico',
    titulo: 'Fisioterapia de suelo pélvico',
    imagen: '/original/servicio-suelo-pelvico.webp',
    alt: 'Fisioterapeuta en Albacete explicando el suelo pélvico en Clínica Ikaika Salud',
    textos: [
      'Valoración y tratamiento de las disfunciones del suelo pélvico (incontinencia urinaria, prolapsos, diástasis abdominal, dolor pélvico, disfunciones sexuales y/o rehabilitación tras cirugías ginecológicas).',
    ],
  },
  {
    id: 'entrenamiento-funcional',
    menu: 'Entrenamiento funcional',
    titulo: 'Entrenamiento funcional',
    imagen: '/original/servicio-entrenamiento-funcional.webp',
    alt: 'Fisioterapeuta en Albacete guiando entrenamiento funcional en Clínica Ikaika Salud',
    textos: [
      'Sesiones de entrenamiento personal funcional guiadas por una fisioterapeuta experta en ejercicio terapéutico que adapta las sesiones no solo a tus objetivos de salud y rendimiento, sino también a la presencia de patologías o limitaciones físicas, garantizando un trabajo seguro y progresivo.',
    ],
  },
  {
    id: 'ejercicio-funcional-grupo',
    menu: 'Ejercicio funcional en grupo',
    titulo: 'Clases grupales de ejercicio funcional terapéutico',
    imagen: '/original/servicio-ejercicio-grupo.webp',
    alt: 'Grupo realizando ejercicio funcional terapéutico en Clínica Ikaika Salud Albacete',
    textos: [
      'Clases de entrenamiento funcional en grupos reducidos, supervisadas por fisioterapeuta para una ejecución segura y personalizada. Fortalece tu cuerpo, previene lesiones y complementa con Pilates terapéutico.',
    ],
  },
  {
    id: 'pilates',
    menu: 'Pilates en grupo',
    titulo: 'Clases grupales de pilates terapéutico',
    imagen: '/original/servicio-pilates.webp',
    alt: 'Grupo practicando pilates terapéutico en Clínica Ikaika Salud Albacete',
    textos: [
      'Clases de Pilates en grupos reducidos, guiadas por fisioterapeuta para asegurar técnica correcta y ejercicios adaptados. Mejora tu postura, fuerza y equilibrio corporal, complementado con entrenamiento funcional.',
    ],
  },
  {
    id: 'embarazo',
    menu: 'Fisioterapia en el embarazo',
    titulo: 'Fisioterapia en el embarazo',
    imagen: '/original/servicio-embarazo.webp',
    alt: 'Fisioterapeuta en Albacete atendiendo a embarazada en Clínica Ikaika Salud',
    textos: [
      'Acompañamiento de la mujer embarazada para un parto más seguro y saludable. Incluye valoración del suelo pélvico y entrenamiento específico que favorece la salud de la madre, el desarrollo del bebé y previene disfunciones pélvicas.',
    ],
  },
  {
    id: 'postparto',
    menu: 'Fisioterapia en el Postparto',
    titulo: 'Fisioterapia en el post parto',
    imagen: '/original/servicio-postparto.webp',
    alt: 'Fisioterapeuta en Albacete atendiendo a mujer en recuperación postparto en Clínica Ikaika Salud',
    textos: [
      'Ayudamos a la mujer en el postparto a recuperar los tejidos y la funcionalidad de su cuerpo para restaurar o mejorar su estado previo al embarazo, logrando conexión, confianza y seguridad.',
      'Debilidad abdominal, diástasis, cicatrices, episiotomías, incontinencia o dolor lumbar.',
    ],
  },
];

/** Orden del submenú «Servicios» de la web original. */
export const menuServicios = [
  'fisioterapia',
  'suelo-pelvico',
  'embarazo',
  'postparto',
  'entrenamiento-funcional',
  'ejercicio-funcional-grupo',
  'pilates',
]
  .map((id) => servicios.find((s) => s.id === id)!)
  .map((s) => ({ texto: s.menu, href: `#${s.id}` }));

export const nosotras = [
  {
    titulo: '¿Quiénes somos?',
    texto:
      'Somos Sandra y Nadia, fisioterapeutas graduadas con formación avanzada en ejercicio terapéutico, recuperación funcional y salud pélvica. Nuestra misión es acompañar a cada persona en su proceso de cuidado y salud integral con un enfoque cercano, profesional y basado en la evidencia científica.',
  },
  {
    titulo: 'Nuestra especialidad',
    texto:
      'Trabajamos en el tratamiento y prevención de lesiones musculoesqueléticas y deportivas, en programas de ejercicio terapéutico adaptado, así como en áreas específicas como el suelo pélvico, el embarazo, el postparto y la menopausia.',
  },
  {
    titulo: 'Nuestro enfoque',
    texto:
      'Integramos técnicas avanzadas como el pilates terapéutico y el entrenamiento funcional adaptado, creando programas personalizados que buscan no solo la recuperación, sino también la prevención y la mejora de la calidad de vida.',
  },
  {
    titulo: 'Nuestro compromiso',
    texto:
      'Creemos en un trato cálido y de confianza, donde cada paciente se sienta escuchado y acompañado. En Ikaika Salud, creemos que la fisioterapia en Albacete debe ir más allá del tratamiento: buscamos mejorar la vida de cada persona desde la cercanía y la profesionalidad.',
  },
] as const;

export const equipo = [
  {
    nombre: 'Sandra Enero Moro',
    papel: 'Salud de la mujer y suelo pélvico',
    formacion:
      'Graduada en Fisioterapia por la Universidad Católica de Murcia, con máster en Fisioterapia en los Procesos de la Salud de la Mujer y en Salud Pélvica.',
  },
  {
    nombre: 'Nadia Aguilar Sotos',
    papel: 'Lesiones musculoesqueléticas y deportivas',
    formacion:
      'Graduada en Fisioterapia por la Universitat de València, con máster en terapia manual y ejercicio terapéutico.',
  },
] as const;

export const porQue = {
  intro: [
    'En Ikaika Salud, creemos que la fisioterapia en Albacete debe ser mucho más que aliviar el dolor: debe ayudarte a recuperar tu bienestar y prevenir futuras lesiones.',
    'Estas son algunas razones por las que nuestros pacientes nos eligen cada día:',
  ],
  motivos: [
    'Fisioterapeutas colegiadas y en continua formación, con experiencia en ejercicio terapéutico, embarazo, postparto y suelo pélvico.',
    'Clínica moderna y acogedora, equipada con todo lo necesario para tratamientos y clases en grupos reducidos.',
    'Enfoque basado en evidencia científica, con programas personalizados según tus objetivos y necesidades.',
    'Ubicación céntrica, junto al Parque Lineal de Albacete, con fácil acceso y aparcamiento cercano.',
    'Trato cercano y humano, donde cada sesión se adapta a ti y a tu proceso de recuperación.',
  ],
  cierre: [
    'Recupera tu bienestar con nosotras.',
    'Pide tu cita o consulta por WhatsApp y empieza a sentirte mejor desde la primera sesión.',
  ],
};

/** `respuesta`: párrafos; `lista`: viñetas que siguen a los párrafos. */
export const preguntas: { pregunta: string; respuesta: string[]; lista?: string[] }[] = [
  {
    pregunta: '¿Qué debo llevar a mi primera sesión de fisioterapia?',
    respuesta: [
      'Te recomendamos acudir con ropa cómoda.',
      'Si dispones de informes médicos, pruebas de imagen o resultados anteriores, tráelos para que podamos realizar una valoración más completa.',
    ],
  },
  {
    pregunta: '¿En qué consiste la valoración inicial?',
    respuesta: [
      'La primera sesión incluye una entrevista y una exploración física. Con esta información elaboramos tu historial clínico, establecemos un diagnóstico fisioterapéutico y diseñamos un plan de tratamiento individualizado.',
    ],
  },
  {
    pregunta: '¿Cuánto dura una sesión?',
    respuesta: [
      'La duración habitual es de entre 45 y 60 minutos, dependiendo del tipo de tratamiento o servicio.',
    ],
  },
  {
    pregunta: '¿Con qué patologías trabajáis?',
    respuesta: [
      'En Ikaika Salud abordamos una amplia variedad de patologías gracias a nuestra formación y experiencia:',
    ],
    lista: [
      'Musculoesqueléticas: lumbalgias, escoliosis, hernias, ciáticas, esguinces, fracturas, tendinopatías, entre otras.',
      'Deportivas: prevención y recuperación de lesiones específicas.',
      'Infantiles: enfermedades congénitas, parálisis cerebral infantil, parálisis braquial obstétrica.',
      'En personas mayores: programas para mantener la funcionalidad y la autonomía en la vida diaria.',
      'Suelo pélvico: incontinencias, diástasis abdominal, prolapsos, dolor pélvico, debilidad muscular, cicatrices y disfunciones sexuales.',
    ],
  },
  {
    pregunta: '¿Disponéis de vestuarios y duchas?',
    respuesta: [
      'Sí. Contamos con dos vestuarios completamente equipados para tu comodidad antes y después de las sesiones.',
    ],
  },
  {
    pregunta: '¿Puedo entrenar durante el embarazo o en el postparto?',
    respuesta: [
      'Sí. Ofrecemos programas específicos y adaptados a cada etapa, diseñados y supervisados por fisioterapeutas especializados en embarazo y recuperación postparto.',
    ],
  },
  {
    pregunta: '¿Los tratamientos son personalizados?',
    respuesta: [
      'Siempre. Adaptamos cada plan a tu situación, objetivos y necesidades, ya sea en fisioterapia individual, ejercicio terapéutico o clases grupales.',
    ],
  },
  {
    pregunta: '¿Se puede combinar la fisioterapia con ejercicio terapéutico?',
    respuesta: [
      'Sí, y de hecho es lo más recomendable. La combinación de terapia manual y ejercicio terapéutico es la estrategia más respaldada por la evidencia científica para una recuperación eficaz.',
    ],
  },
  {
    pregunta: '¿Es necesario tener una lesión para asistir a las clases grupales?',
    respuesta: [
      'No. Nuestras clases de pilates terapéutico y ejercicio funcional terapéutico están dirigidas tanto a personas con patologías que necesitan entrenar de forma segura, como a quienes desean prevenir lesiones y mejorar su condición física.',
    ],
  },
  {
    pregunta: '¿Dónde estáis y cómo puedo pedir cita?',
    respuesta: [
      'Nuestra clínica se encuentra en: C/ Alcalde Conangla, 24, 02001, Albacete.',
      'Puedes reservar cita a través de:',
    ],
    lista: ['614 02 46 09', 'Directamente en la recepción del centro'],
  },
];

export const encuentranos = [
  'Nos encontrarás en el Parque Lineal, bajando desde la Residencia San Vicente de Paúl. Pasa el supermercado Consum y, un poco más adelante, verás nuestra clínica.',
  'Estamos ubicados justo a la izquierda de la Farmacia del Parque Lineal y junto al Restaurante Posada Real, lo que hace muy sencillo encontrarnos al llegar a la zona.',
];

export const aparcamientos = [
  {
    nombre: 'Parking APK2 Plaza del Sembrador',
    detalle: 'C/ Alcalde Conangla, Fuente de las ranas',
    imagen: '/original/parking-sembrador.webp',
    alt: 'Entrada del parking APK2 Plaza del Sembrador en Albacete.',
  },
  {
    nombre: 'Zona azul del Parque Lineal',
    detalle: 'Frente a nuestra clínica Ikaika Salud',
    imagen: '/original/parking-parque-lineal.webp',
    alt: 'Zona azul del Parque Lineal frente a Ikaika Salud en Albacete.',
  },
  {
    nombre: 'Parking del Centro Comercial Albacenter',
    detalle: 'Aparcamiento cercano',
    imagen: '/original/parking-albacenter.webp',
    alt: 'Parking del centro comercial Albacenter cerca de Ikaika Salud.',
  },
] as const;

export const solicitaInformacion =
  'En Clínica Ikaika Salud, especialistas en fisioterapia en Albacete, estamos aquí para ayudarte a recuperar tu bienestar. No dudes en ponerte en contacto con nosotros para más información.';
