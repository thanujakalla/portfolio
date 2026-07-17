import { defineConfig } from 'vite';

// GitHub Pages serves this project at /portfolio/ (repo: thanujakalla/portfolio).
// Only the production build needs that base — dev server stays at '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/portfolio/' : '/',
}));
