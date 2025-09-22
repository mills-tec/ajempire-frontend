/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}", // App Router
    "./src/pages/**/*.{js,ts,jsx,tsx}", // Pages Router (if you use it)
    "./src/components/**/*.{js,ts,jsx,tsx}", // Components
  ],

  theme: {
    extend: {
      colors: {
        background: "#ffffff", // white
        foreground: "#171717", // dark gray text
      },
    },
  },
  plugins: [],
};
