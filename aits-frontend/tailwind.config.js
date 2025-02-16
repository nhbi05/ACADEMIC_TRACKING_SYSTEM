/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], // Scans your project files for Tailwind classes
  theme: {
    extend: {
      colors: {
        primary: "#1DA1F2", // Example custom color
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"], // Custom font
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"), // Optional plugin for styling forms
    require("@tailwindcss/typography"), // Optional for rich text styling
  ],
};
