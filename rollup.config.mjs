import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';

export default {
	input: 'ts/index.ts',
	output: {
		file: 'js/index.js',
		format: 'es',
		sourcemap: true
	},
	plugins: [
		resolve(),
		typescript({
			tsconfig: './tsconfig.json',
			compilerOptions: {
				module: 'ES2015',
				declaration: false,
				sourceMap: true
			}
		})
	]
};
