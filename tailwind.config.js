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
        gradientmix: " #D300C6",
      },
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
      },
      backgroundImage: {
        brand_gradient: "linear-gradient(to right, #A600FF, #FF008C)",
        brand_gradient_light: "linear-gradient(to right, #A600FFCC, #FF008CCC)", // lighter (80% opacity)
        brand_gradient_dark: "linear-gradient(to right, #A600FF, #FF008C)", // solid
      },
    },
  },
  plugins: [],
};
