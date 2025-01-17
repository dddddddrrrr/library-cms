import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
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
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        customLight: {
          DEFAULT: "#f9f9fa",
        },
        customDark: {
          DEFAULT: "#18181a",
        },
        pro: {
          DEFAULT: "#FCD798",
        },
        common: {
          DEFAULT: "#828282",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      borderColor: {
        "light-internet": "#c7c7c7",
        "dark-internet": "#404040",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bounce-dot-1": "bounce-dot-1 1.4s infinite",
        "bounce-dot-2": "bounce-dot-2 1.4s infinite",
        "bounce-dot-3": "bounce-dot-3 1.4s infinite",
      },
      backgroundImage: {
        "custom-gradient":
          "linear-gradient(134.09deg, #5d5d5d 3.99%, #9e9e9e 89.15%)",
        "pro-gradient":
          "linear-gradient(to right, #312F30 0%, #292829 27%, #212121 54%, #1A1A1A 100%)",
        "common-gradient":
          "linear-gradient(135deg, #d3d3d3 0%, #E9E6E6 45%, #a9a9a9 100%)",
        "light-internet-gradient":
          "linear-gradient(to right, #FFFFFF, #F1F1F1, #FFFFFF)",
        "dark-internet-gradient":
          "linear-gradient(to right, #000000, #252525, #000000)",
      },
      opacity: {
        7: "0.07",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar"),
  ],
} satisfies Config;

export default config;
