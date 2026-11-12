import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// base './' damit es unter https://<name>.github.io/<repo>/ läuft.
// viteSingleFile packt JS + CSS in eine einzige index.html (läuft auch offline in Safari).
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  build: { target: 'es2019', chunkSizeWarningLimit: 2000 },
  test: { environment: 'node' },
});
