import { createApp } from 'vue';
import VuePopper from '../src/index.js';

createApp({
  components: {
    popper: VuePopper
  }
}).mount('#app');
