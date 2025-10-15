import restart from 'vite-plugin-restart';
import mkcert from 'vite-plugin-mkcert';

export default {
  root: 'src/', // Sources files (typically where index.html is)
  publicDir: '../static/', // Path from "root" to static assets
  server: {
    host: true, // Open to local network and display URL
    https: true,
    port: 5173,
    open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env), // Open if it's not a CodeSandbox
  },
  build: {
    outDir: '../dist', // Output in the dist/ folder
    emptyOutDir: true, // Empty the folder first
    sourcemap: true, // Add sourcemap
  },
  plugins: [
    restart({ restart: ['../static/**'] }), // Restart server on static file change
    mkcert(), // mkcert plugin for trusted local HTTPS certs
  ],
};
