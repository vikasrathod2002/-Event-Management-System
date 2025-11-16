import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  const isProduction = mode === 'production'
  const apiUrl = env.VITE_API_URL || 'https://event-management-system-backend-dpmx.onrender.com'
  
  console.log(`🔧 Environment: ${mode}`)
  console.log(`🔧 API URL: ${apiUrl}`)

  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true,
      // Remove proxy in production - use direct API calls
      proxy: isProduction ? undefined : {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: true
        }
      }
    },
    preview: {
      port: 3000,
      host: true
    }
  }
})
