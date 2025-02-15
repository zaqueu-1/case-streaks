/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFCF00",
        secondary: "#222222",
        background: "#F9FAFB",
      },
      fontFamily: {
        montserrat: ["var(--font-montserrat)"],
        poppins: ["var(--font-poppins)"],
        verdana: ["Verdana", "sans-serif"],
      },
    },
  },
  plugins: [],
}

export default config
