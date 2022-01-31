import adapter from '@sveltejs/adapter-node';

const config = {
	kit: {
		adapter: adapter({
			// default options are shown
			out: 'build',
			precompress: false,
			env: {
				host: 'HOST',
				port: 'PORT'
			}
		}),
		target: '#svelte',
		vite: {
			define: {
				'process.env': process.env
			}
		}
	}
};

export default config;