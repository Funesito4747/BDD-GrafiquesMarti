import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: { 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 800: '#1e40af' },
        surface: { 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' },
        success: '#22c55e',
        warning: '#eab308',
        danger: '#ef4444',
        cyan: { 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4' }
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
export default config