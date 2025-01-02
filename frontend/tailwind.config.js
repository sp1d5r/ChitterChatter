/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(288 70% 90%)", // Soft lavender
          foreground: "hsl(288 30% 25%)",
          dark: "hsl(288 70% 30%)", // Dark lavender
          "dark-foreground": "hsl(288 95% 95%)"
        },
        secondary: {
          DEFAULT: "hsl(152 70% 90%)", // Mint green
          foreground: "hsl(152 30% 25%)",
          dark: "hsl(152 70% 30%)", // Dark mint
          "dark-foreground": "hsl(152 95% 95%)"
        },
        destructive: {
          DEFAULT: "hsl(350 70% 90%)", // Soft rose
          foreground: "hsl(350 30% 25%)",
          dark: "hsl(350 70% 30%)", // Dark rose
          "dark-foreground": "hsl(350 95% 95%)"
        },
        muted: {
          DEFAULT: "hsl(210 40% 96%)", // Soft blue-gray
          foreground: "hsl(215 25% 40%)",
          dark: "hsl(210 40% 20%)", // Dark blue-gray
          "dark-foreground": "hsl(215 25% 80%)"
        },
        accent: {
          DEFAULT: "hsl(20 70% 90%)", // Soft peach
          foreground: "hsl(20 30% 25%)",
          dark: "hsl(20 70% 30%)", // Dark peach
          "dark-foreground": "hsl(20 95% 95%)"
        },
        popover: {
          DEFAULT: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}