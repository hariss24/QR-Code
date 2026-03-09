import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1A3C6E",
        "primary-light": "#4A90D9",
        accent: "#00B4D8",
        border: "#E2E8F0",
        muted: "#64748B",
        background: "#F8FAFC"
      }
    }
  },
  plugins: []
} satisfies Config;
