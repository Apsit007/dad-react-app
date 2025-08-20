/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1A486C",
        "primary-light": "#2E6E9E",
        "primary-dark": "#0f2a40",
      },
      backgroundImage: {
        "sidebar-gradient":
          'linear-gradient(to bottom, theme("colors.primary"), theme("colors.primary-light"))',
      },
    },
  },
  plugins: [],
};
