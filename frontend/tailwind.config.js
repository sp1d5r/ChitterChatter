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
        coffee: {
          50: '#FAF6F1',  // Lightest coffee cream
          100: '#E8DED3',  // Light coffee cream
          200: '#D5C3B3',  // Coffee with lots of cream
          300: '#C2A893',  // Light coffee
          400: '#AF8D73',  // Medium coffee
          500: '#9C7253',  // Coffee
          600: '#895733',  // Dark coffee
          700: '#763C13',  // Darker coffee
          800: '#632100',  // Very dark coffee
          900: '#501800',  // Darkest coffee
        },
        primary: {
          DEFAULT: "hsl(288 70% 90%)", // Soft lavender
          foreground: "hsl(288 30% 25%)",
          dark: "hsl(288 40% 40%)", // Adjusted for dark mode
          "dark-foreground": "hsl(288 95% 95%)"
        },
        secondary: {
          DEFAULT: "hsl(152 70% 90%)", // Soft mint
          foreground: "hsl(152 30% 25%)",
          dark: "hsl(152 40% 40%)", // Adjusted for dark mode
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
          dark: "hsl(20 40% 40%)", // Adjusted for dark mode
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
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        count: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        slideIn: 'slideIn 0.5s ease-out forwards',
        count: 'count 0.5s ease-out forwards',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}