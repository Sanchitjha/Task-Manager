/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#f2f7ff", 600: "#1F5EFF", 800: "#0f2f7a" }
      }
    }
  },
  plugins: []
}