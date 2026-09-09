import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/constants/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#F97316",
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        sidebar: {
          DEFAULT: "#0F172A",
          hover: "#1E293B",
          active: "#1E293B",
          border: "#1E293B",
          text: "#94A3B8",
          "text-active": "#F8FAFC",
          "text-muted": "#475569",
        },
        background: "#F8FAFC",
        surface: "#FFFFFF",
        text: "#1E293B",
        muted: "#64748B",
        border: "#E2E8F0",
        "border-strong": "#CBD5E1",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
        card: "0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)",
        modal: "0 20px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)",
        "glow-orange": "0 0 20px rgba(249, 115, 22, 0.25)",
        "glow-sm": "0 0 8px rgba(249, 115, 22, 0.15)",
        "inner-sm": "inset 0 1px 2px rgba(15, 23, 42, 0.06)",
        header: "0 1px 0 rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.04)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        "gradient-orange-glow": "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
        "gradient-dark": "linear-gradient(180deg, #0F172A 0%, #0F172A 100%)",
        "gradient-sidebar-active": "linear-gradient(90deg, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0.05) 100%)",
        "gradient-card-hover": "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)",
        "gradient-hero": "linear-gradient(135deg, #f97316 0%, #c2410c 60%, #7c2d12 100%)",
        "gradient-glass": "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "fade-up": "fadeUp 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        shimmer: "shimmer 2s infinite linear",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "bounce-gentle": "bounceGentle 1s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "count-up": "countUp 0.6s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        countUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
