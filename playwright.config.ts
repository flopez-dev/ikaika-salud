import { defineConfig, devices } from '@playwright/test';

// Tiene que coincidir con el BASE_PATH con el que se construye el sitio (el default de
// astro.config.mjs es /ikaika-salud/).
const BASE_PATH = process.env.BASE_PATH ?? '/ikaika-salud/';
// 4323 y no el 4321 de Astro, para no chocar con el `astro dev` de otro proyecto abierto.
const PORT = 4323;

// Sin `webServer`: `astro preview` se demoniza siempre (se separa a segundo plano incluso
// sin --background), y Playwright trata la salida inmediata del proceso padre como un fallo
// ("exited early") aunque el servidor siga sirviendo. `npm run test:e2e` orquesta
// build → preview --background → tests → preview stop; no ejecutar `playwright test` suelto
// sin haber levantado el preview antes.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}${BASE_PATH}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
});
