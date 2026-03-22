/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#000000",
        panel: "#000000",
        inset: "#000000",
        bone: {
          DEFAULT: "#e2ddd4",
          50: "#f0ebe3",
          100: "#e2ddd4",
          200: "#c9c2b6",
        },
        muted: "#8f8a82",
        faint: "#524e48",
        line: "rgba(226, 221, 212, 0.16)",
        "line-strong": "rgba(226, 221, 212, 0.26)",
        blood: "#5a1a1a",
        ochre: "#7a6b48",
        mist: "#4c4258",
        charcoal: {
          950: "#000000",
          900: "#000000",
          800: "#0a0a0a",
          700: "#141414",
          600: "#1f1f1f",
        },
        smoke: {
          50: "#f4f2ed",
          100: "#d1ccc5",
          200: "#aaa49d",
          300: "#7e7973",
          400: "#595550",
        },
      },
      fontFamily: {
        /** Soft, variable-heritage serif — titles, card names */
        display: ["Fraunces", "Georgia", "serif"],
        /** Transcript / longform — newsprint séance */
        body: ["Newsreader", "Georgia", "serif"],
        /** Sigils, coordinates, UI chrome */
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        archive: "0.2em",
        label: "0.24em",
      },
      transitionDuration: {
        reveal: "600ms",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 640ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
      },
    },
  },
  plugins: [],
};
