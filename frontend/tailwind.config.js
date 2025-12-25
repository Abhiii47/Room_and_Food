/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{html,js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "brand-500": "rgb(37,112,255)",
        "brand-600": "rgb(11,59,184)",
        "premium": {
          "gold": "#d4af37",
          "gold-light": "#f4e4bc",
          "gold-dark": "#b8941f",
          "emerald": "#10b981",
          "emerald-light": "#6ee7b7",
          "emerald-dark": "#059669",
          "sapphire": "#3b82f6",
          "sapphire-light": "#93c5fd",
          "sapphire-dark": "#2563eb",
          "platinum": "#e5e7eb",
          "platinum-dark": "#374151"
        },
        "unicorn": {
          "pink": "#ff9ee0",
          "purple": "#c77dff",
          "blue": "#7dd3fc",
          "mint": "#7ae5f0",
          "lavender": "#b794f6",
          "peach": "#fda4af",
          "yellow": "#fde68a"
        }
      }
    }
  },
  plugins: []
}
