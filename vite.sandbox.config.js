import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  // Путь относительно каталога с этим конфигом (корень репозитория).
  root: 'example',
  resolve: {
    alias: {
      // Шаблон в index.html внутри #app компилируется только в сборке с компилятором.
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  },
  server: {
    open: true
  }
});
