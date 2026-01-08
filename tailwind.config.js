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
    },
  },
  plugins: [],
}
