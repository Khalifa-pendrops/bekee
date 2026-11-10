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
        // ARUBEKEE Editorial Brand Colors
        ivory: {
          DEFAULT: "#FAF8F5",
          light: "#FFFFFF",
          muted: "#F4EFEA",
          dark: "#E8E1D7",
          warm: "#FCFBF9",
        },
        obsidian: {
          DEFAULT: "#141312",
          soft: "#22201E",
          muted: "#57534E",
          subtle: "#857F78",
          border: "#D1C9BE",
        },
        oxblood: {
          DEFAULT: "#54121B",
          hover: "#420C14",
          active: "#32070D",
          light: "#FBF0F2",
          border: "#852635",
          tint: "rgba(84, 18, 27, 0.08)",
        },
        stone: {
          line: "#E6DFD5",
          subtle: "#F5F1EB",
          card: "#FAF7F2",
        },
        gold: {
          DEFAULT: "#B8860B",
          light: "#DFB347",
          dark: "#876208",
          tint: "rgba(184, 134, 11, 0.12)",
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
      },
    },
  },
  plugins: [],
};

export default config;

