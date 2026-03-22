/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "#000000",
          900: "#050505",
          800: "#101010",
          700: "#1b1b1b",
          600: "#272727",
        },
        smoke: {
          50: "#f4f2ed",
          100: "#d1ccc5",
          200: "#aaa49d",
          300: "#7e7973",
          400: "#595550",
        },
        bone: {
          50: "#faf7f2",
          100: "#eee8dd",
          200: "#d7d0c4",
        },
        gold: {
          50: "#f2f1ed",
          100: "#d7d4ce",
          200: "#b7b2ab",
          300: "#96908a",
          400: "#76706b",
          500: "#5a5652",
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
