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
      fontFamily: {
        chivo: ['Chivo', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#AC3B61", // The pink/rose color
          foreground: "#FFFFFF",
          dark: "#AC3B61",
          "dark-foreground": "#FFFFFF"
        },
        secondary: {
          DEFAULT: "#123C69", // The navy blue
          foreground: "#FFFFFF",
          dark: "#123C69",
          "dark-foreground": "#FFFFFF"
        },
        muted: {
          DEFAULT: "#BAB2B5", // The gray color
          foreground: "#123C69",
          dark: "#BAB2B5",
          "dark-foreground": "#123C69"
        },
        accent: {
          DEFAULT: "#EDC7B7", // The light pink/beige
          foreground: "#123C69",
          dark: "#EDC7B7",
          "dark-foreground": "#123C69"
        },
        destructive: {
          DEFAULT: "hsl(350 70% 90%)", // Soft rose
          foreground: "hsl(350 30% 25%)",
          dark: "hsl(350 70% 30%)", // Dark rose
          "dark-foreground": "hsl(350 95% 95%)"
        },
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