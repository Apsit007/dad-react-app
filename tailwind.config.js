/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Sarabun", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "Noto Sans", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
      },
      colors: {
        primary: "#36746F",
        "primary-light": "#60b5ae",
        "primary-dark": "#2E514E",
        gold: "#F3B741",
        "gold-light": "#ffcd6b",
        "gold-dark": "#cc9427",
      },
      backgroundImage: {
        "sidebar-gradient":
          'linear-gradient(to bottom, theme("colors.primary"), theme("colors.primary-dark"))',
      },
    },
  },
  plugins: [],
};
