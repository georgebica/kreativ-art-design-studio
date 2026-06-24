/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './design-interior-timisoara/index.html'],
  theme: {
    extend: {
      colors: {
        ink: { 300: '#3a352d', 500: '#1c1a16', 700: '#0e0d0a' },
        olive: { 200: '#cdd5b3', 300: '#a8b87a', 500: '#7a8b4f', 700: '#525f33', 900: '#2f3819' },
        rose: { 100: '#f7e8e4', 300: '#e8c4be' },
        sand: '#faf8f3',
        line: '#e8e4d8'
      },
      fontFamily: {
        display: ['Vidaloka', 'serif'],
        sans: ['Hind', 'sans-serif']
      }
    }
  }
}
