/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#2b2320',
        sand: '#f1e8da',
        coral: '#f2725f',
        lime: '#d7f3c6',
      },
      boxShadow: {
        soft: '0 20px 60px rgba(43, 35, 32, 0.12)',
        heavy: '0 30px 90px rgba(43, 35, 32, 0.22)',
        inner: 'inset 0 0 0 1px rgba(43, 35, 32, 0.06)',
      },
    },
  },
  plugins: [],
}
