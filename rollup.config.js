import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import * as dotenv from 'dotenv'

// Create a .env file to specify NOTES_PLUGIN_LOCATION 
dotenv.config()

const {NOTES_PLUGIN_LOCATION, BUILD} = process.env;
const isProd = BUILD === 'production';

// TODO: load this from a config
const BUILD_DIR = isProd
  ? `${NOTES_PLUGIN_LOCATION}/obsidian-link-exploder`
  : `${NOTES_PLUGIN_LOCATION}/obsidian-link-exploder-canary`;
const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ROLLUP
if you want to view the source visit the plugins github repository
*/
`;

export default {
  input: 'main.ts',
  output: {
    dir: BUILD_DIR,
    sourcemap: 'inline',
    sourcemapExcludeSources: isProd,
    format: 'cjs',
    exports: 'default',
    banner,
  },
  external: ['obsidian'],
  plugins: [
    typescript(),
    nodeResolve({ browser: true }),
    commonjs(),
    copy({
      targets: [
        {
          src: isProd ? 'manifest.json' : 'manifest-dev.json',
          dest: BUILD_DIR,
          rename: 'manifest.json',
        },
      ],
    }),
  ],
};