import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        id: '/',
        name: 'ShieldBlock Extension Dashboard',
        short_name: 'ShieldBlock',
        description: 'High-performance ad blocker, tracker shield, popup defender, and cosmetic element hider extension dashboard and testing simulator.',
        theme_color: '#4f46e5',
        background_color: '#f8fafc',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-128.png',
            sizes: '128x128',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});

