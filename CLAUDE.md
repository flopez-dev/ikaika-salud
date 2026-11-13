# Ikaika Salud

Landing de Ikaika Salud, cliente de Sayora. Astro 7 + Tailwind CSS v4 + daisyUI 5 (el stack
común de las landings de clientes de Sayora), TypeScript strict. Copy del sitio en español
(`lang="es"`); código, comentarios y mensajes de commit, también en español.

Ahora mismo es solo el esqueleto: una home «Web en construcción» y una 404. Faltan la marca
(paleta, tipografías, logo) y el contenido; lo que no se sepa se queda como `{{marcador}}`
(p. ej. `descripcionSitio` en `src/lib/sitio.ts`).

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
- `src/components/` — una sección por componente cuando se maquete la landing.
- `src/lib/` — datos fuera del marcado: `sitio.ts` (nombre y descripción) y `withBase.ts`.
- `src/styles/global.css` — Tailwind, el plugin de daisyUI y el tema `ikaika`. Único `.css`.

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
