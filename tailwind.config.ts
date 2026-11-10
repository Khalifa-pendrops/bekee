import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ARUBEKEE Luxury Fashion Editorial Palette
        ivory: {
          DEFAULT: "#FAF6F0",   // Warm Champagne Cashmere
          light: "#FFFFFF",
          muted: "#F5EFE6",
          dark: "#EADDCF",
          warm: "#FDFBF7",
          cream: "#F7F2EA",
        },
        obsidian: {
          DEFAULT: "#181514",   // Soft Velvet Charcoal
          soft: "#2A2523",
          muted: "#635B57",
          subtle: "#918882",
          border: "#D8CFC5",
        },
        oxblood: {
          DEFAULT: "#6B1724",   // Rich Parisian/Bespoke Wine
          50: "#FDF2F4",
          100: "#FBE6EA",
          200: "#F5C2CB",
          300: "#EE98A7",
          400: "#E36279",
          500: "#C02E48",
          600: "#8F1D30",
          700: "#6B1724",
          800: "#54101A",
          900: "#3D0B12",
          hover: "#54101A",
          active: "#3D0B12",
          light: "#FDF2F4",
          border: "#9A2E40",
          tint: "rgba(107, 23, 36, 0.08)",
        },
        sand: {
          50: "#FAF8F5",
          100: "#F5F0E8",
          200: "#EADDCF",
          300: "#DFCCB7",
          400: "#CBB397",
          500: "#BFA586",
          600: "#A88D6C",
          700: "#8C7153",
          800: "#6E573F",
          900: "#4F3E2D",
        },
        terracotta: {
          DEFAULT: "#B4533C",   // Warm African Clay & Sunbaked Earth
          light: "#FBF1EE",
          dark: "#8F3D29",
        },
        champagne: {
          DEFAULT: "#E5D4BE",
          light: "#F5EDE3",
          dark: "#BFA586",
        },
        stone: {
          line: "#E8DFD3",
          subtle: "#F6F1EA",
          card: "#FAF6F0",
        },
        gold: {
          DEFAULT: "#C59B46",   // Warm Brushed Fashion Gold
          light: "#E3C279",
          dark: "#967226",
          tint: "rgba(197, 155, 70, 0.12)",
        },
        status: {
          success: "#1A5C38",
          successBg: "#EDF7F1",
          warning: "#9C610A",
          warningBg: "#FEF7EC",
          danger: "#8C1823",
          dangerBg: "#FDF2F3",
          info: "#1E4B7A",
          infoBg: "#EEF4FA",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(20, 19, 18, 0.04), 0 1px 2px -1px rgba(20, 19, 18, 0.04)",
        card: "0 4px 12px -2px rgba(20, 19, 18, 0.05)",
        floating: "0 12px 32px -4px rgba(20, 19, 18, 0.12)",
        drawer: "0 -8px 24px -4px rgba(20, 19, 18, 0.1)",
      },
      letterSpacing: {
        widest: ".18em",
        tightest: "-.03em",
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-in-out forwards",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-down": "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "float": "float 4s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2.5s infinite linear",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.04)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

