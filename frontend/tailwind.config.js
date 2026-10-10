// Paleta migrada del CDN de Tailwind (index.html) a compilado (C7).
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        uniminuto: {
          50: '#eef2fc',
          100: '#dce6fa',
          200: '#c0d2f6',
          300: '#94b4f0',
          400: '#6387e5',
          500: '#3f64d2',
          600: '#26327e',
          700: '#1e2768',
          800: '#1c2456',
          900: '#1a2148',
          950: '#11173a',
        },
        leaf: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        heading: ['"Segoe UI"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
