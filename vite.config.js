import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    base: './', // Ensures assets are linked relatively, helping avoid 404s on some hosting providers
    server: {
        host: true
    }
});
