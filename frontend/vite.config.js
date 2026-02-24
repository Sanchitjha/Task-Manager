import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      manifest: {
        name: 'The Manager - Professional Management Platform',
        short_name: 'The Manager',
        description: 'Complete business management platform for streamlined operations and growth',
        theme_color: '#1f2937',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        categories: ['productivity', 'business', 'utilities'],
        lang: 'en',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Earn Coins',
            short_name: 'Earn',
            description: 'Watch videos and earn coins',
            url: '/earn',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Shop',
            short_name: 'Shop',
            description: 'Browse and purchase products',
            url: '/shop',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Wallet',
            short_name: 'Wallet',
            description: 'Check your balance and transactions',
            url: '/wallet',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      devOptions: {
        enabled: false, // Disable PWA in development to prevent constant update prompts
        type: 'module',
        navigateFallback: 'index.html',
      },
    })
  ],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for core libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // Group other node_modules into vendor chunk
            return 'vendor';
          }
          // Admin pages chunk
          if (id.includes('src/pages/Admin')) {
            return 'admin';
          }
          // Seller/Partner pages chunk
          if (id.includes('src/pages/Seller') || id.includes('src/pages/Partner') || id.includes('src/pages/Vendor')) {
            return 'seller';
          }
          // Shop/Product pages chunk
          if (id.includes('src/pages/Product') || id.includes('src/pages/Shop') || id.includes('src/pages/Cart') || id.includes('src/pages/Checkout') || id.includes('src/pages/Orders')) {
            return 'shop';
          }
        }
      }
    }
  }
})
