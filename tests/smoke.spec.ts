import { test, expect } from '@playwright/test';

// '' (no '/') para la home: con un baseURL que acaba en `/ikaika-salud/`, un path que empiece
// por '/' resuelve contra el origen y se sale del base path.

test('la home carga sin errores, con un único h1 y sin overflow horizontal', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(String(err)));

  const response = await page.goto('');
  expect(response?.ok()).toBeTruthy();

  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main#main')).toHaveCount(1);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);

  expect(errors).toEqual([]);
});

test('la 404 lleva noindex y enlaza a la home', async ({ page }) => {
  const response = await page.goto('no-existe/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await page.getByRole('link', { name: 'Volver al inicio' }).click();
  await expect(page.locator('h1')).toHaveCount(1);
  expect(new URL(page.url()).pathname).toBe(process.env.BASE_PATH ?? '/ikaika-salud/');
});

test('el recorrido avanza con el scroll, se para en cada parada y vuelve atrás al subir', async ({
  page,
}) => {
  await page.goto('');
  const recorrido = page.locator('[data-recorrido]');
  // La secuencia (vídeo en móvil, canvas en escritorio) sustituye a la foto al pintar su primer
  // fotograma; el contenedor lo marca con `data-listo` y lleva el fotograma actual.
  await expect(recorrido).toHaveAttribute('data-listo', '', { timeout: 15_000 });
  const fotograma = () => recorrido.evaluate((r) => Number(r.dataset.fotograma ?? -1));

  // Al bajar a mitad de la sección, la cámara ha avanzado y hay otro panel activo.
  const mitad = await page.evaluate(() => {
    const r = document.querySelector<HTMLElement>('[data-recorrido]')!;
    return Math.round(r.offsetTop + r.offsetHeight / 2 - innerHeight);
  });
  await page.evaluate((y) => window.scrollTo(0, y), mitad);
  await expect.poll(fotograma, { timeout: 5_000 }).toBeGreaterThan(100);
  const enMedio = await fotograma();
  await expect(page.locator('[data-panel]').first()).not.toHaveAttribute('data-activo');

  // En una parada se ve su foto real, nítida, encima de la secuencia. Se baja como el enlace
  // del menú (ancla arriba) y sin `smooth`: `scrollIntoViewIfNeeded()` centra el ancla, lo que
  // deja el scroll en el trayecto anterior, y con el scroll suave depende de lo rápida que vaya
  // la máquina (en CI fallaba).
  await page.evaluate(() =>
    document
      .getElementById('parada-fisioterapia')!
      .scrollIntoView({ block: 'start', behavior: 'instant' }),
  );
  await expect(page.locator('[data-foto]').nth(2)).toHaveAttribute('data-visible');

  // Al volver arriba, la cámara retrocede y se ve otra vez el titular.
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(fotograma, { timeout: 5_000 }).toBeLessThan(enMedio);
  await expect(page.locator('h1')).toBeVisible();
});

test('con movimiento reducido no descarga la secuencia y enseña la foto de cada parada', async ({
  browser,
}) => {
  const contexto = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await contexto.newPage();
  const secuencia: string[] = [];
  page.on('request', (r) => {
    if (/\/recorrido\/[md]\//.test(r.url())) secuencia.push(r.url());
  });

  await page.goto('');
  // Como el enlace del menú (ancla arriba): ver el comentario del test anterior.
  await page.evaluate(() =>
    document
      .getElementById('parada-fisioterapia')!
      .scrollIntoView({ block: 'start', behavior: 'instant' }),
  );
  await expect(page.locator('[data-foto]').nth(2)).toHaveAttribute('data-visible');
  await expect(page.locator('[data-panel]').nth(2)).toHaveAttribute('data-activo');
  expect(secuencia).toEqual([]);
  await contexto.close();
});
