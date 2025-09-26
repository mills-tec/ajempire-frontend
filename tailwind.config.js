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
        highlight: "#ff008c", // bright pink
        gradient: {
          "background-to-t": "linear-gradient(90deg, #FF008C 0%, #A600FF 100%)",
        }
      },
    },
  },
  plugins: [],
};
