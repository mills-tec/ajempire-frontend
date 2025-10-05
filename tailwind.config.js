/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}", // App Router
    "./src/pages/**/*.{js,ts,jsx,tsx}", // Pages Router (if you use it)
    "./src/components/**/*.{js,ts,jsx,tsx}", // Components
  ],

  theme: {
    extend: {
      colors: {
        primaryhover: "#FF008C",
        brand_solid_gradient: "#D200C6CC",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        brand_gray: "#c1c1c1",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      backgroundImage: {
        brand_gradient:
          "linear-gradient(to right, rgba(255,0,140,0.6), rgba(166,0,255,0.6))",
        brand_gradient_light:
          "linear-gradient(to right, rgba(255,0,140,0.5), rgba(166,0,255,0.5))",
        brand_gradient_dark:
          "linear-gradient(to right, rgba(255,0,140,0.8), rgba(166,0,255,0.8))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "dropdown-in": "dropdown-open 200ms ease-out forwards",
        "dropdown-out": "dropdown-close 150ms ease-in forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
