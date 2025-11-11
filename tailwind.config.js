/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        tgBg: "#0f1115",
        card: "#141820",
        card2: "#0f141c",
        accent: "#2ea6ff",
        accent2: "#10b981",
      },
    },
  },
  plugins: [],
}
