import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  },
  assetsInclude: ['**/*.otf', '**/*.ttf'],
})