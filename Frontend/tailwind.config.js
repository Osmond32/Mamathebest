/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf4f5',
          100: '#fbe8eb',
          200: '#f7d5d9',
          300: '#f1b7be',
          400: '#e78e99',
          500: '#d75d6d',
          600: '#c23d4e',
          700: '#a32d3c',
          800: '#872834',
          900: '#71252f',
          950: '#3f1015',
        },
      }
    },
  },
  plugins: [],
}
