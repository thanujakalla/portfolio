import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

function shortSha() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'dev';
  }
}

// GitHub Pages serves this project at /portfolio/ (repo: thanujakalla/portfolio).
// Only the production build needs that base — dev server stays at '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/portfolio/' : '/',
  define: {
    // Lets the deployed page prove which commit it's running — GitHub
    // Pages caches index.html for 10 minutes and there's no way to
    // override that, so this is how you verify a deploy actually landed
    // instead of guessing from a reload. See README "Verifying a deploy".
    __BUILD_SHA__: JSON.stringify(shortSha()),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
}));
