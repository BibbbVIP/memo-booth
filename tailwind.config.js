/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spider: {
          white: '#f5f4f0',
          red: '#ef4444',      // Queens Crimson
          blue: '#3371bb',     // Responsibility Blue
          brick: '#b5403c',    // Alley Brick
          grey: '#2c2c32',     // Grey of the Multiverse
          dark: '#141316',     // Venom Trace
        }
      }
    },
  },
  plugins: [],
}