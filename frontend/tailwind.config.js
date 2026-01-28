/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'alibaba-orange': '#FF6A00',
        'alibaba-gray': '#F2F3F7',
      }
    },
  },
  plugins: [],
}