import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: false,
    target: 'esnext',
    lib: {
      entry: ['admin/src/index.ts'],
      name: 'ml-browser',
      formats: ['cjs', 'es'],
      fileName(format) {
        return `[name].${format === 'es' ? 'js' : format}`;
      },
    },
    outDir: 'dist/admin',
    rollupOptions: {
      external: (id) => !id.startsWith('.') && !id.startsWith('/'),
    },
  },
  plugins: [react()],
});
