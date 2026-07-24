import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import { WebSocketServer } from 'ws';

function mockSocketPlugin() {
  return {
    name: 'mock-socket-plugin',
    configureServer(server: any) {
      if (!server.httpServer) return;
      const wss = new WebSocketServer({ noServer: true });
      server.httpServer.on('upgrade', (request: any, socket: any, head: any) => {
        if (request.url === '/mock-chat') {
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
          });
        }
      });
      wss.on('connection', (ws) => {
        ws.on('message', (message) => {
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) {
              client.send(message, { binary: false });
            }
          });
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    mockSocketPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Portal ITSM',
        short_name: 'Portal',
        description: 'Portal ITSM - Service Desk',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['lucide-react'],
    exclude: ['@portal/shared'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173,
    },
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    },
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: process.env.API_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', 'lucide-react'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
});
