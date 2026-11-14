/**
 * Recorrido controlado por el scroll.
 *
 * Ritmo: la sección se divide en un tramo por parada. Cada tramo tiene una `lectura` (el
 * texto de la parada visible y la imagen quieta en su fotograma) y un `trayecto` (el texto
 * se va y la cámara avanza, con aceleración y frenada suaves, hasta la parada siguiente).
 *
 * Imagen: secuencia de fotogramas WebP pintada en un <canvas>. Entre el fotograma n y el n+1
 * se pinta n y encima n+1 con opacidad proporcional, así que con scroll lento no se nota el
 * paso de uno a otro. Se cargan primero 1 de cada 8 fotogramas (el recorrido funciona casi en
 * seguida) y luego el resto, empezando por los más cercanos a donde está el visitante; si
 * falta el fotograma exacto se pinta el cargado más próximo. Mientras no hay ninguno, se ve
 * la foto de la parada.
 *
 * Nitidez: la secuencia es más blanda que las fotos reales, así que mientras se lee una
 * parada se ve su foto original encima del canvas, con un fundido corto al llegar y al irse.
 *
 * Con movimiento reducido no se descarga la secuencia: cada parada enseña su foto.
 */

const CONSULTA_MOVIL = '(max-width: 1023px)';
/** Suavizado por fotograma hacia la posición objetivo (0..1; más alto, más directo). */
const SUAVIZADO = 0.12;
/** Peticiones de fotogramas simultáneas. */
const PARALELO = 6;
/** Primera pasada de carga: 1 de cada N fotogramas. */
const SALTO_INICIAL = 8;
/**
 * Fracción del trayecto, al salir de una parada y al llegar a la siguiente, en la que aún se
 * ve la foto nítida de la parada (la secuencia es más blanda: mejor solo en movimiento).
 */
const MARGEN_FOTO = 0.06;

const suave = (x: number) => 0.5 - Math.cos(Math.PI * x) / 2;

export function iniciarRecorrido(raiz: HTMLElement): void {
  const escena = raiz.querySelector<HTMLElement>('.escena');
  const marco = raiz.querySelector<HTMLElement>('[data-marco]');
  const lienzo = raiz.querySelector<HTMLCanvasElement>('[data-lienzo]');
  const paneles = [...raiz.querySelectorAll<HTMLElement>('[data-panel]')];
  const fotos = [...raiz.querySelectorAll<HTMLImageElement>('[data-foto]')];
  const ctx = lienzo?.getContext('2d');
  if (!escena || !marco || !lienzo || !ctx || paneles.length === 0) return;

  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lectura = Number(raiz.dataset.lectura);
  const trayecto = Number(raiz.dataset.trayecto);
  const duracion = Number(raiz.dataset.duracion);
  const tiempos: number[] = JSON.parse(raiz.dataset.tiempos ?? '[]');
  const total = Number(raiz.dataset.total);
  const fps = Number(raiz.dataset.fps);
  const tramo = lectura + trayecto;
  const unidades = paneles.length * tramo;

  // ---------- geometría (se recalcula al cambiar el tamaño) ----------
  let arriba = 0;
  let pxPorUnidad = 1;
  const medir = () => {
    arriba = raiz.getBoundingClientRect().top + window.scrollY;
    pxPorUnidad = Math.max(raiz.offsetHeight - escena.offsetHeight, 1) / unidades;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ancho = Math.round(marco.clientWidth * dpr);
    const alto = Math.round(marco.clientHeight * dpr);
    if (lienzo.width !== ancho || lienzo.height !== alto) {
      lienzo.width = ancho;
      lienzo.height = alto;
      ultimo = '';
    }
  };

  /** Posición del scroll → segundo del recorrido y panel visible (-1: ninguno, en trayecto). */
  const estadoPara = (scrollY: number) => {
    const s = Math.min(Math.max((scrollY - arriba) / pxPorUnidad, 0), unidades);
    const i = Math.min(Math.floor(s / tramo), paneles.length - 1);
    const local = s - i * tramo;
    const desde = tiempos[i] ?? 0;
    const hasta = i < paneles.length - 1 ? (tiempos[i + 1] ?? duracion) : duracion;
    let t = desde;
    let activo = i;
    // Parada cuya foto nítida se ve encima de la secuencia (-1: en movimiento, sin foto).
    let enParada = i;
    if (local > lectura) {
      const avance = Math.min((local - lectura) / trayecto, 1);
      t = desde + suave(avance) * (hasta - desde);
      enParada = avance < MARGEN_FOTO ? i : -1;
      if (i < paneles.length - 1) {
        if (avance > 1 - MARGEN_FOTO) enParada = i + 1;
        if (avance > 0.75) activo = i + 1;
        else if (avance > 0.25) activo = -1;
      }
    }
    return { t, activo, parada: i, enParada };
  };

  // ---------- paneles y fotos ----------
  let activoPrevio = -2;
  let fotoPrevia = -1;
  const mostrarPanel = (activo: number) => {
    if (activo === activoPrevio) return;
    activoPrevio = activo;
    paneles.forEach((p, i) => p.toggleAttribute('data-activo', i === activo));
  };
  const mostrarFoto = (indice: number) => {
    if (indice === fotoPrevia) return;
    fotoPrevia = indice;
    fotos.forEach((f, i) => {
      f.classList.toggle('opacity-100', i === indice);
      f.classList.toggle('opacity-0', i !== indice);
    });
  };

  // ---------- secuencia de fotogramas ----------
  const base = window.matchMedia(CONSULTA_MOVIL).matches
    ? raiz.dataset.movil
    : raiz.dataset.escritorio;
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
    const n = Math.floor(f);
    const mezcla = f - n;
    const a = cercano(n);
    if (a < 0) return;
    const b = a === n && mezcla > 0.02 && n + 1 < total && estado[n + 1] === 2 ? n + 1 : -1;
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
  const paso = () => {
    pendiente = 0;
    if (!visible) return;
    const { t, activo, parada, enParada } = estadoPara(window.scrollY);
    mostrarPanel(activo);
    // Sin secuencia, siempre hay una foto; con ella, la foto solo cubre las paradas.
    mostrarFoto(reducido || !listo ? (activo >= 0 ? activo : parada) : enParada);
    if (reducido) return;
    actual += (t - actual) * SUAVIZADO;
    if (Math.abs(t - actual) < 0.001) actual = t;
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
    if (window.innerWidth === anchoPrevio && window.matchMedia('(pointer: coarse)').matches) return;
    anchoPrevio = window.innerWidth;
    medir();
    despertar();
  });
  new ResizeObserver(() => {
    medir();
    despertar();
  }).observe(raiz);

  medir();
  actual = estadoPara(window.scrollY).t;
  despertar();
  if (!reducido && base) bombear();
}
