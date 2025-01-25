import { defineConfig } from 'vite';
import { sharedConfig } from '@extension/vite-config';
import { resolve } from 'path';
import { outputFolderName } from '@extension/vite-config/src/constants';

export default defineConfig({
  ...sharedConfig,
  build: {
    outDir: resolve(__dirname, '../../', outputFolderName),
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'content',
      formats: ['iife'],
      fileName: () => 'contentScript.js',
    },
    rollupOptions: {
      output: {
        extend: true,
      },
    },
  },
});
