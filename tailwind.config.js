/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        darkprimary: "#2563eb"
      },
      backgroundImage: {
        "pattern": `url("/assets/imgs/pattern.png")`
      }
    },
  },
  plugins: [],
}