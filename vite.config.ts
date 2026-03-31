import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  worker: {
    format: 'es',
  },
  resolve: {
    conditions: ['onnxruntime-web-use-extern-wasm'],
  },
  assetsInclude: ['**/*.onnx'],
})
