import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import replace from '@rollup/plugin-replace';
import { resolvePkgPath } from '../rollup/utils';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		replace({
			__DEV__: true,
			preventAssignment: true
		})
	],
	resolve: {
		alias: [
			{
				find: 'react',
				replacement: resolvePkgPath('react')
			},
			{
				find: 'dom',
				replacement: resolvePkgPath('dom')
			},
			{
				find: 'hostConfig',
				replacement: path.resolve(resolvePkgPath('dom'), './src/hostConfig.ts')
			}
		]
	}
});
