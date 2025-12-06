import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // Render 靜態站直接掛根目錄，改為 "/" 避免靜態資源 404
      base: "/",
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // 如無使用外部金鑰，可移除以下 define 設定；保留時請改用 VITE_ 前綴並透過 import.meta.env 使用。
      // define: {
      //   'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      //   'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      // },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
