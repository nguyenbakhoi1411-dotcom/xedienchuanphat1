import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/constants/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F97316",
        background: "#F8FAFC",
        text: "#1E293B",
        border: "#E2E8F0"
      },
      boxShadow: {
        soft: "0 1px 3px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
