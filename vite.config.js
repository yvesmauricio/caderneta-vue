import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// 1. Defina o nome do seu repositório aqui (exatamente como está no GitHub)
const repoName = '/caderneta-vue/' 

export default defineConfig({
  // 2. Adicione a base para o Vite saber onde encontrar os arquivos no GitHub
  base: repoName, 
  
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Caderneta da Bete',
        short_name: 'Caderneta',
        description: 'Gestão de fiados',
        // 3. Ajuste o start_url para usar a base do repositório
        start_url: repoName, 
        display: 'standalone',
        background_color: '#3d2008',
        theme_color: '#3d1f08',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        // Isso garante que tudo que o Vite gera seja cacheado para uso offline
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { 
              cacheName: 'google-fonts-cache', 
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } 
            }
          }
        ]
      }
    })
  ]
})