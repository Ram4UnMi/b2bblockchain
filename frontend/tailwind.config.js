/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'alibaba-orange': '#FF6A00',
        'alibaba-gray': '#F2F3F7',
        'dark-bg': '#1a1a1a',
        'dark-card': '#242424',
        'dark-text': '#e0e0e0',
      }
    },
  },
  plugins: [],
}