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
        primary_muted: "#FFDF53",
        secondary: "#222222",
        secondary_muted: "#666666",
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