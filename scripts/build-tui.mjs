#!/usr/bin/env node
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Read package.json to get version
const packageJson = JSON.parse(
	readFileSync(join(rootDir, 'package.json'), 'utf-8')
);

try {
	await build({
		entryPoints: [join(rootDir, 'src/tui/index.tsx')],
		bundle: true,
		platform: 'node',
		target: 'node20',
		outfile: join(rootDir, 'dist-tui/index.js'),
		format: 'esm',
		banner: {
			js: '#!/usr/bin/env node\n',
		},
		external: ['ink', 'react', 'chalk'],
		define: {
			__APP_VERSION__: JSON.stringify(packageJson.version),
			'import.meta.env.VITE_REFERENCE_DATE': 'undefined',
			'import.meta.env.VITE_REFERENCE_TEAM': 'undefined',
		},
		sourcemap: false,
		minify: false, // Disable minification to preserve readability
		logLevel: 'info',
	});

	console.log('✅ TUI build completed successfully!');
} catch (error) {
	console.error('❌ TUI build failed:', error);
	process.exit(1);
}
