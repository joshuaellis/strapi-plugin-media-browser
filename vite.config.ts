import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: false,
    target: 'esnext',
    lib: {
      entry: ['admin/index.ts'],
      name: 'ml-browser',
      formats: ['cjs', 'es'],
    },
    outDir: 'dist/admin',
    rollupOptions: {
      external: (id) => !id.startsWith('.') && !id.startsWith('/'),
    },
  },
  plugins: [react()],
});
