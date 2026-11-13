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
