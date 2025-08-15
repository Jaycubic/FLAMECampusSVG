/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1f6feb',
          50: '#e9f0ff',
          100: '#dbe7ff',
          200: '#b8cfff',
          300: '#8db0ff',
          400: '#5c8bff',
          500: '#1f6feb',
          600: '#1659c5',
          700: '#12469b',
          800: '#0f3a7f',
          900: '#0a2857',
        },
      },
      boxShadow: {
        'soft': '0 8px 20px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}