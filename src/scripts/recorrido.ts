/**
 * Recorrido controlado por el scroll.
 *
 * Ritmo: la sección se divide en un tramo por parada. Cada tramo tiene una `lectura` (el
 * texto de la parada visible y la cámara en su fotograma) y un `trayecto` (la cámara avanza
 * hasta la parada siguiente a velocidad constante, frenando solo al principio y al final).
 * El ritmo es distinto en móvil y en escritorio (src/lib/recorrido.ts).
 *
 * Todo lo que se mueve depende de la posición del scroll, no del tiempo: los textos entran
 * (escalonados) y salen, la foto nítida se funde con la secuencia y la imagen se acerca un
 * poco durante la lectura. Así todo sigue al dedo, se puede invertir a mitad y nada se queda
 * a medias. En táctil la imagen va pegada al scroll; con rueda, un suavizado corto por tiempo
 * reparte cada golpe de rueda.
 *
 * Imagen: secuencia de fotogramas WebP pintada en un <canvas>. Entre el fotograma n y el n+1
 * se pinta n y encima n+1 con opacidad proporcional, así que con scroll lento no se nota el
 * paso de uno a otro. Se cargan primero 1 de cada 8 fotogramas (el recorrido funciona casi en
 * seguida) y luego el resto, empezando por los más cercanos a donde está el visitante; si
 * falta el fotograma exacto se pinta el cargado más próximo. Mientras no hay ninguno, se ve
 * la foto de la parada.
 *
 * Nitidez: la secuencia es más blanda que las fotos reales, así que mientras se lee una
 * parada se ve su foto original encima del canvas; al fundirse se desenfoca un poco, para
 * que no se vean dos imágenes de nitidez distinta superpuestas.
 *
 * Con movimiento reducido no se descarga la secuencia: cada parada enseña su foto, y solo
 * hay fundidos (sin desplazamientos, zoom ni desenfoque).
 */

const CONSULTA_MOVIL = '(max-width: 1023px)';
/** Constante de tiempo del suavizado con rueda (ms): ~3τ para alcanzar el objetivo. */
const TAU_RUEDA = 70;
/** Peticiones de fotogramas simultáneas. */
const PARALELO = 6;
/** Primera pasada de carga: 1 de cada N fotogramas. */
const SALTO_INICIAL = 8;
/** Fracción del trayecto en la que la cámara acelera (al salir) y frena (al llegar). */
const FRENADA = 0.15;
/** Fracción del trayecto (al final del anterior) en la que entra el texto de una parada. */
const ENTRADA_TEXTO = 0.25;
/** Fracción del trayecto en la que se va el texto: más rápido que la entrada. */
const SALIDA_TEXTO = 0.12;
/** Desfase entre los elementos de un panel al entrar, en fracción de la entrada. */
const ESCALONADO = 0.18;
/** Fracción del trayecto, al salir y al llegar, en la que se funde la foto nítida. */
const MARGEN_FOTO = 0.08;
/** Acercamiento máximo de la imagen a mitad de cada tramo. */
const ZOOM = 0.03;
/** Desenfoque máximo de la foto nítida mientras se funde (px). */
const DESENFOQUE = 2;

const limitar = (x: number) => Math.min(Math.max(x, 0), 1);
const salida = (x: number) => 1 - (1 - x) ** 3;

/** Avance de la cámara en un trayecto: lineal, con aceleración y frenada suaves en los bordes. */
const avanceCamara = (x: number) => {
  const v = 1 / (1 - FRENADA);
  if (x < FRENADA) return (v * x * x) / (2 * FRENADA);
  if (x > 1 - FRENADA) return 1 - (v * (1 - x) ** 2) / (2 * FRENADA);
  return v * (x - FRENADA / 2);
};

interface Ritmo {
  lectura: number;
  trayecto: number;
}

export function iniciarRecorrido(raiz: HTMLElement): void {
  const escena = raiz.querySelector<HTMLElement>('.escena');
  const marco = raiz.querySelector<HTMLElement>('[data-marco]');
  const zoom = raiz.querySelector<HTMLElement>('[data-zoom]');
  const lienzo = raiz.querySelector<HTMLCanvasElement>('[data-lienzo]');
  const pista = raiz.querySelector<HTMLElement>('[data-pista]');
  const paneles = [...raiz.querySelectorAll<HTMLElement>('[data-panel]')];
  const fotos = [...raiz.querySelectorAll<HTMLImageElement>('[data-foto]')];
  const ctx = lienzo?.getContext('2d');
  if (!escena || !marco || !zoom || !lienzo || !ctx || paneles.length === 0) return;

  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const movil = window.matchMedia(CONSULTA_MOVIL);
  const tactil = window.matchMedia('(pointer: coarse)');
  const ritmos: { movil: Ritmo; escritorio: Ritmo } = JSON.parse(raiz.dataset.ritmo ?? '{}');
  const duracion = Number(raiz.dataset.duracion);
  const tiempos: number[] = JSON.parse(raiz.dataset.tiempos ?? '[]');
  const total = Number(raiz.dataset.total);
  const fps = Number(raiz.dataset.fps);
  const n = paneles.length;
  const piezas = paneles.map((p) => [...p.querySelectorAll<HTMLElement>('.card-body > *')]);

  // ---------- geometría (se recalcula al cambiar el tamaño) ----------
  let { lectura, trayecto } = ritmos.escritorio;
  let tramo = lectura + trayecto;
  let arriba = 0;
  let pxPorUnidad = 1;
  const medir = () => {
    ({ lectura, trayecto } = movil.matches ? ritmos.movil : ritmos.escritorio);
    tramo = lectura + trayecto;
    arriba = raiz.getBoundingClientRect().top + window.scrollY;
    pxPorUnidad = Math.max(raiz.offsetHeight - escena.offsetHeight, 1) / (n * tramo);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ancho = Math.round(marco.clientWidth * dpr);
    const alto = Math.round(marco.clientHeight * dpr);
    if (lienzo.width !== ancho || lienzo.height !== alto) {
      lienzo.width = ancho;
      lienzo.height = alto;
      ultimo = '';
    }
    previo.clear();
  };

  /** Posición del scroll, en unidades de ritmo (vh) desde el principio de la sección. */
  const posicion = (scrollY: number) =>
    Math.min(Math.max((scrollY - arriba) / pxPorUnidad, 0), n * tramo);

  /** Segundo del recorrido para una posición. */
  const tiempoPara = (s: number) => {
    const i = Math.min(Math.floor(s / tramo), n - 1);
    const local = s - i * tramo;
    const desde = tiempos[i] ?? 0;
    const hasta = i < n - 1 ? (tiempos[i + 1] ?? duracion) : duracion;
    if (local <= lectura) return desde;
    return desde + avanceCamara(Math.min((local - lectura) / trayecto, 1)) * (hasta - desde);
  };

  /** Cuánto ha entrado (0..1) y cuánto queda (0..1) del panel j. */
  const visibilidad = (s: number, j: number) => {
    const inicio = j * tramo;
    const fin = inicio + lectura;
    const e = ENTRADA_TEXTO * trayecto;
    const x = SALIDA_TEXTO * trayecto;
    const entra = j === 0 ? 1 : limitar((s - (inicio - e)) / e);
    const queda = j === n - 1 ? 1 : 1 - limitar((s - fin) / x);
    return { entra, queda };
  };

  /** Opacidad (0..1) de la foto nítida de la parada k. */
  const opacidadFoto = (s: number, k: number, conSecuencia: boolean) => {
    const inicio = k * tramo;
    const fin = inicio + lectura;
    if (conSecuencia) {
      const m = MARGEN_FOTO * trayecto;
      const llega = k === 0 ? 1 : limitar((s - (inicio - m)) / m);
      const sale = 1 - limitar((s - fin) / m);
      return Math.min(llega, sale);
    }
    // Sin secuencia, las fotos se relevan a mitad de cada trayecto.
    const medio = 0.2 * trayecto;
    const llega = k === 0 ? 1 : limitar((s - (inicio - trayecto / 2 - medio / 2)) / medio);
    const sale = k === n - 1 ? 1 : 1 - limitar((s - (fin + trayecto / 2 - medio / 2)) / medio);
    return Math.min(llega, sale);
  };

  // ---------- escritura de estilos (solo si cambian) ----------
  const previo = new Map<HTMLElement, string>();
  const estilo = (el: HTMLElement, clave: string, aplicar: () => void) => {
    if (previo.get(el) === clave) return;
    previo.set(el, clave);
    aplicar();
  };
  const r3 = (x: number) => Math.round(x * 1000) / 1000;

  const pintarPaneles = (s: number) => {
    paneles.forEach((panel, j) => {
      const { entra, queda } = visibilidad(s, j);
      const visible = entra > 0 && queda > 0;
      const activo = entra * queda > 0.5;
      estilo(panel, `${r3(queda)}|${visible}|${activo}`, () => {
        panel.style.opacity = String(r3(queda));
        panel.style.transform =
          reducido || queda === 1 ? '' : `translateY(${r3((queda - 1) * 12)}px)`;
        panel.style.visibility = visible ? 'visible' : 'hidden';
        panel.inert = !visible;
        panel.toggleAttribute('data-activo', activo);
      });
      // Entrada escalonada: cada pieza empieza un poco después que la anterior.
      const m = piezas[j].length;
      piezas[j].forEach((pieza, k) => {
        const p = limitar(entra * (1 + (m - 1) * ESCALONADO) - k * ESCALONADO);
        estilo(pieza, String(r3(p)), () => {
          pieza.style.opacity = p === 1 ? '' : String(r3(p));
          pieza.style.transform =
            reducido || p === 1 ? '' : `translateY(${r3((1 - salida(p)) * 10)}px)`;
        });
      });
    });
    if (pista) {
      const p = 1 - limitar(s / (0.3 * lectura));
      estilo(pista, String(r3(p)), () => {
        pista.style.opacity = String(r3(p));
      });
    }
  };

  const pintarFotos = (s: number, conSecuencia: boolean) => {
    fotos.forEach((foto, k) => {
      const o = opacidadFoto(s, k, conSecuencia);
      estilo(foto, `${r3(o)}|${conSecuencia}`, () => {
        foto.style.opacity = String(r3(o));
        foto.style.filter =
          !conSecuencia || reducido || o === 0 || o === 1
            ? ''
            : `blur(${r3((1 - o) * DESENFOQUE)}px)`;
        foto.toggleAttribute('data-visible', o > 0.5);
      });
    });
  };

  const pintarZoom = (s: number) => {
    if (reducido) return;
    const i = Math.min(Math.floor(s / tramo), n - 1);
    const u = limitar((s - i * tramo) / tramo);
    const z = 1 + ZOOM * Math.sin(Math.PI * u);
    estilo(zoom, String(r3(z)), () => {
      zoom.style.transform = z === 1 ? '' : `scale(${r3(z)})`;
    });
  };

  // ---------- secuencia de fotogramas ----------
  const base = movil.matches ? raiz.dataset.movil : raiz.dataset.escritorio;
  const imagenes: (HTMLImageElement | undefined)[] = new Array(total);
  /** 0: sin pedir, 1: cargando, 2: lista, 3: falló. */
  const estado = new Uint8Array(total);
  const primeraPasada: number[] = [];
  for (let k = 0; k < total; k += SALTO_INICIAL) primeraPasada.push(k);
  primeraPasada.push(total - 1);
  let enCurso = 0;
  let listo = false;
  let actual = 0;
  let ultimo = '';

  const fotogramaActual = () => Math.min(Math.max(actual * fps, 0), total - 1);

  const siguiente = (): number => {
    while (primeraPasada.length) {
      const k = primeraPasada.shift()!;
      if (estado[k] === 0) return k;
    }
    const centro = Math.round(fotogramaActual());
    for (let d = 0; d < total; d++) {
      if (centro + d < total && estado[centro + d] === 0) return centro + d;
      if (centro - d >= 0 && estado[centro - d] === 0) return centro - d;
    }
    return -1;
  };

  const bombear = () => {
    while (enCurso < PARALELO) {
      const k = siguiente();
      if (k < 0) return;
      estado[k] = 1;
      enCurso++;
      const img = new Image();
      img.decoding = 'async';
      img.src = `${base}${String(k + 1).padStart(4, '0')}.webp`;
      img
        .decode()
        .then(() => {
          imagenes[k] = img;
          estado[k] = 2;
          ultimo = '';
          despertar();
        })
        .catch(() => {
          estado[k] = 3;
        })
        .finally(() => {
          enCurso--;
          bombear();
        });
    }
  };

  const cercano = (k: number): number => {
    for (let d = 0; d < total; d++) {
      if (k - d >= 0 && estado[k - d] === 2) return k - d;
      if (k + d < total && estado[k + d] === 2) return k + d;
    }
    return -1;
  };

  const pintar = (img: HTMLImageElement, alfa: number) => {
    const escala = Math.max(lienzo.width / img.naturalWidth, lienzo.height / img.naturalHeight);
    const w = img.naturalWidth * escala;
    const h = img.naturalHeight * escala;
    ctx.globalAlpha = alfa;
    ctx.drawImage(img, (lienzo.width - w) / 2, (lienzo.height - h) / 2, w, h);
  };

  const dibujar = () => {
    const f = fotogramaActual();
    const k = Math.floor(f);
    const mezcla = f - k;
    const a = cercano(k);
    if (a < 0) return;
    const b = a === k && mezcla > 0.02 && k + 1 < total && estado[k + 1] === 2 ? k + 1 : -1;
    const clave = `${a}|${b}|${b < 0 ? 0 : Math.round(mezcla * 24)}`;
    if (clave === ultimo) return;
    ultimo = clave;
    pintar(imagenes[a]!, 1);
    if (b >= 0) pintar(imagenes[b]!, mezcla);
    lienzo.dataset.fotograma = String(a);
    if (!listo) {
      listo = true;
      lienzo.classList.replace('opacity-0', 'opacity-100');
    }
  };

  // ---------- bucle: solo corre con la sección en pantalla ----------
  let visible = false;
  let pendiente = 0;
  let antes = 0;
  const paso = (ahora: number) => {
    pendiente = 0;
    if (!visible) return;
    const s = posicion(window.scrollY);
    pintarPaneles(s);
    pintarFotos(s, !reducido && listo);
    pintarZoom(s);
    if (reducido) return;
    const t = tiempoPara(s);
    if (tactil.matches) {
      actual = t;
    } else {
      // Suavizado por tiempo: igual a 60 que a 120 Hz.
      const dt = antes ? Math.min(ahora - antes, 100) : 16;
      actual += (t - actual) * (1 - Math.exp(-dt / TAU_RUEDA));
      if (Math.abs(t - actual) < 0.001) actual = t;
    }
    antes = actual === t ? 0 : ahora;
    dibujar();
    if (actual !== t) pendiente = requestAnimationFrame(paso);
  };
  function despertar() {
    if (!pendiente) pendiente = requestAnimationFrame(paso);
  }

  new IntersectionObserver((entradas) => {
    visible = entradas.some((e) => e.isIntersecting);
    if (visible) despertar();
  }).observe(raiz);
  window.addEventListener('scroll', despertar, { passive: true });

  let anchoPrevio = window.innerWidth;
  window.addEventListener('resize', () => {
    // En móvil la barra de direcciones cambia el alto al hacer scroll: solo cuenta el ancho.
    if (window.innerWidth === anchoPrevio && tactil.matches) return;
    anchoPrevio = window.innerWidth;
    medir();
    despertar();
  });
  new ResizeObserver(() => {
    medir();
    despertar();
  }).observe(raiz);

  medir();
  actual = tiempoPara(posicion(window.scrollY));
  despertar();
  if (!reducido && base) bombear();
}
