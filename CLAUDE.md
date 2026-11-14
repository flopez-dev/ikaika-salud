# Ikaika Salud

Landing de Ikaika Salud, cliente de Sayora. Astro 7 + Tailwind CSS v4 + daisyUI 5 (el stack
común de las landings de clientes de Sayora), TypeScript strict. Copy del sitio en español
(`lang="es"`); código, comentarios y mensajes de commit, también en español.

La home es una landing de una página que empieza con un **recorrido por la clínica controlado
por el scroll** (vídeo vertical generado con Higgsfield a partir de fotos reales) y sigue con
por qué elegirnos, el equipo, preguntas frecuentes y contacto. Los textos y datos salen de la
web actual, https://ikaikasalud.es/ (sin precios, testimonios ni cifras: no los tiene, y no se
inventan). Falta la marca (paleta y logo): el tema es provisional. Lo que no se sepa se queda
como `{{marcador}}`.

## Comandos

| Comando                | Acción                                                             |
| :--------------------- | :----------------------------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo en `localhost:4321/ikaika-salud/` (en background) |
| `npm run build`        | Build en `./dist/`                                                 |
| `npm run preview`      | Sirve localmente el build                                          |
| `npm run check`        | Comprueba tipos con `astro check`                                  |
| `npm run format`       | Formatea con Prettier (`--write`)                                  |
| `npm run format:check` | Comprueba formato sin escribir (es lo que corre en CI)             |
| `npm run lint`         | ESLint sobre `.astro`/`.ts`                                        |
| `npm run test:e2e`     | Build + preview en el puerto 4323 + smoke tests de Playwright      |

## Estructura

- `src/pages/` — `index.astro`, `404.astro` y `robots.txt.ts` (dinámico: la URL del sitemap
  depende de `SITE_URL`/`BASE_PATH`, y con `NOINDEX_SITE=true` cierra todo).
- `src/layouts/Base.astro` — layout único: `<head>` (canonical, Open Graph, favicon, `noindex`) y
  el enlace «Ir al contenido». Toda página lleva `<main id="main">`.
- `src/components/` — una sección por componente. `Recorrido.astro` es la escena fija (imagen
  + texto de la parada) dentro de una sección alta; `Icono.astro`, los iconos de Phosphor en
  línea.
- `src/scripts/recorrido.ts` — scroll → parada y fotograma. Cada parada es un tramo de
  `lectura` (texto visible, cámara en la parada) + `trayecto` (la cámara avanza), más corto en
  móvil que en escritorio. Todo lo que se mueve (texto que entra escalonado y sale, fundido
  foto ↔ secuencia, acercamiento) se calcula de la posición del scroll en cada fotograma, sin
  transiciones CSS por tiempo; en táctil la imagen va pegada al dedo (sin suavizado). En móvil
  el texto va sobre la imagen con un velo `neutral`, sin tarjeta. La imagen es una
  secuencia WebP pintada en `<canvas>`, mezclando fotogramas vecinos; no es un `<video>`
  porque buscar en un vídeo con `currentTime` va a tirones. Con movimiento reducido no
  descarga la secuencia y enseña la foto de la parada.
- `src/lib/` — datos fuera del marcado: `sitio.ts`, `contacto.ts` (teléfono, WhatsApp,
  horario, legales), `recorrido.ts` (paradas con su segundo del recorrido, `ritmo` del
  scroll por dispositivo, `fotogramas`, motivos, equipo, FAQ) y `withBase.ts`.
- `public/recorrido/` — `m/` (540×960, móvil) y `d/` (720×1280, escritorio): 635 fotogramas
  a 24 fps, `0001.webp`…, y `parada-N.webp`: la foto original de cada parada (1080×1920),
  que se ve nítida encima de la secuencia mientras se lee la parada. Si cambia el montaje,
  hay que regenerar las dos secuencias y volver a medir los `tiempo` de `src/lib/recorrido.ts`
  (fotograma más parecido a cada foto, con SSIM). El
  montaje sale de `~/Documents/recorrido-ikaika/`
  (`montar_scroll_v4.sh`, variante `salida_fluida_t7`); los clips crudos están en
  `src/photos/`, que no se sube al repo.
- `src/styles/global.css` — Tailwind, daisyUI, el tema `ikaika`, Manrope y los estilos de
  texto con nombre (`heading-1`, `body-3`, `caption-3`…). Único `.css`.

## Reglas no obvias

- **daisyUI antes que componentes a mano.** Botones, tarjetas, navbar, footer, acordeones… con
  sus clases (`btn`, `card`, `navbar`, `collapse`…), y Tailwind para el layout y los ajustes.
- **Colores solo desde el tema daisyUI** (`primary`, `secondary`, `base-100`, `base-content`…),
  nunca escalas de Tailwind (`emerald-600`) ni hex sueltos en el marcado. El tema `ikaika` de
  `global.css` es **provisional**: al llegar la marca se cambian sus valores, no los nombres.
  Comprobar el contraste (4,5:1 en texto) al cambiarlos.
- Tailwind v4 **sin** `tailwind.config.js`: todo vive en `global.css` (`@plugin`, `@theme`).
- **`withBase()` en todo `href`/`src` interno escrito a mano** (`src/lib/withBase.ts`). Astro
  solo antepone `base` a los assets que empaqueta. Por defecto el sitio se construye bajo
  `/ikaika-salud/`, así que un enlace sin `withBase()` se rompe en local y en los tests.
- Tipografías autoalojadas (en `src/fonts/` o `@fontsource`), nunca `<link>` a Google Fonts.
- Prettier ordena las clases de Tailwind (`prettier-plugin-tailwindcss`): no reordenarlas a mano.
- El e2e usa el puerto 4323, no el 4321, para no chocar con el `astro dev` de otro proyecto.
- `typescript` se queda en la 6: `@astrojs/check` aún no admite la 7 (Dependabot la ignora).
- `trailingSlash: 'always'` + `build.format: 'directory'`.

## Ramas y despliegue

**De momento el sitio vive solo en `develop`** (decidido el 2026-11-13): la copia de GitHub
Pages es la web, no hay producción ni dominio propio. `develop` es la **rama por defecto** del
repo; `main` existe pero no se usa: no se integra nada en ella ni se despliega.

| Rama / evento | Destino                                                                   |
| :------------ | :------------------------------------------------------------------------ |
| cualquiera/PR | CI (`ci.yml`): formato, lint, tipos, build con base path y e2e            |
| `develop`     | Tras un CI en verde, GitHub Pages sin indexar (`deploy-pages.yml`): https://flopez-dev.github.io/ikaika-salud/ |

Se trabaja en ramas que salen de `develop` y se integran en `develop`. El repo es público, por
eso Pages sirve en el plan Free. `.github/dependabot.yml` abre cada semana PR de dependencias y
acciones **contra `develop`**.

`deploy-pages.yml` se dispara con `workflow_run`, que lee el workflow de la rama por defecto y
corre en su contexto. Por eso `develop` es la rama por defecto y el entorno `github-pages` solo
admite `develop`; si se vuelve a poner `main` por defecto, hay que admitir `main` en el entorno
(si no, el deploy falla con «Branch "main" is not allowed to deploy»).

Si algún día hay dominio y producción: añadir el despliegue de `main` (Cloudflare Workers con
Static Assets, como `chantal_verdugo_house`), construido con `SITE_URL=<dominio> BASE_PATH=/`, y
replantear qué rama es la de por defecto.
