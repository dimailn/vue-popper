import vue from 'rollup-plugin-vue';
import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss'

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.js',
  output: {
    file: isProduction ? 'dist/vue-popper.min.js' : 'dist/vue-popper.js',
    format: 'umd',
    name: 'VuePopper',
  },
  plugins: [
    nodeResolve(),
    vue({
      template: {},
      css: false,
    }),
    postcss({
      extract: true,
    }),
    babel({
      runtimeHelpers: true,
      externalHelpers: false,
    }),
    (isProduction && terser())
  ],
};
