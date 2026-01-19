
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
	input: 'jquery.ts',
	output: {
		file: 'jquery.js',
		format: 'cjs',
		compact: true,
		sourcemap: false,
	},
	plugins: [
		resolve({
			browser: true,
		}),
		terser(),
	],
	// indicate which modules should be treated as external
	// external: ['lodash']
};