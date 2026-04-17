/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#1a0a0a",
        ink: "#2a1818",
        accent: "#c41e3a",
        accentHi: "#e53e56",
        cream: "#fef3e8",
        page: "#faf5f0",
        sand: "#fde8cd",
      },
      fontFamily: {
        serif: ["'Crimson Pro'", "Georgia", "serif"],
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(42,24,24,0.08)",
        glow: "0 8px 32px rgba(196,30,58,0.15)",
      },
    },
  },
  plugins: [],
};
