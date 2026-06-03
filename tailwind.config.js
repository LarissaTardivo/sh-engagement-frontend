/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        indigo: {
          50:  '#eef0f8',
          100: '#d5d9ef',
          200: '#b2b9df',
          300: '#8f9acf',
          400: '#6c7bbf',
          500: '#495baf',
          600: '#1F2D68',
          700: '#192455',
          800: '#131b42',
          900: '#0e122f',
          950: '#080c1e',
        },
      },
    },
  },
  plugins: [],
}
