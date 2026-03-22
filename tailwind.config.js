/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "#07090c",
          900: "#0d1015",
          800: "#141821",
          700: "#1e2530",
          600: "#2d3643",
        },
        smoke: {
          50: "#f6efe5",
          100: "#e3d7c5",
          200: "#c3b49c",
          300: "#9c8c76",
          400: "#756a5b",
        },
        bone: {
          50: "#fcf8f0",
          100: "#f3ead9",
          200: "#e4d2b7",
        },
        gold: {
          50: "#f7f0e1",
          100: "#ead8b0",
          200: "#d6bb80",
          300: "#c19b55",
          400: "#a97d3a",
          500: "#8f6530",
        },
      },
      boxShadow: {
        panel: "0 30px 90px rgba(0, 0, 0, 0.42)",
        card: "0 18px 45px rgba(0, 0, 0, 0.28)",
        glow: "0 0 0 1px rgba(209, 174, 108, 0.18), 0 18px 40px rgba(0, 0, 0, 0.28)",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.22em",
      },
    },
  },
  plugins: [],
};
