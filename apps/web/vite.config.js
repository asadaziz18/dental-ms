var _a;
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@dental-ms/shared-types': path.resolve(__dirname, '../../packages/shared-types/src/index.ts'),
        },
    },
    optimizeDeps: {
        exclude: ['@dental-ms/shared-types'],
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: (_a = process.env.VITE_API_BASE_URL) !== null && _a !== void 0 ? _a : 'http://localhost:3000',
                changeOrigin: true,
                rewrite: function (p) { return p.replace(/^\/api/, ''); },
            },
        },
    },
});
