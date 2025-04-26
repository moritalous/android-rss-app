import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// リポジトリ名を指定
const base = '/android-rss-app/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: base,
})
