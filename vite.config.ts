import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  // 部署到 GitHub Pages 时，站点路径为 https://shakugannosaints.github.io/AgencyOS/
  // 因此需要设置 base 为仓库名路径
  base: '/AgencyOS/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
