/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Glacial Indifference', 'sans-serif'],
        'script': ['Halimum', 'cursive'],
      },
      colors: {
        'brand': '#1e4395',
      }
    },
  },
  plugins: [],
}
