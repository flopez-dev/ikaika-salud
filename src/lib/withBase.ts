const BASE = import.meta.env.BASE_URL;

/**
 * Todo enlace interno pasa por aquí. Astro antepone `base` a los assets que
 * empaqueta pero no a los `href`/`src` escritos a mano, y el sitio se construye
 * bajo /ikaika-salud/ en local, en CI y en GitHub Pages (y bajo / en el dominio real): un
 * "/privacidad/" a pelo se rompería en uno de los dos.
 */
export function withBase(pathname = ''): string {
  return `${BASE.replace(/\/$/, '')}/${String(pathname).replace(/^\//, '')}`;
}
