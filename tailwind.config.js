/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
        },

        success: {
          500: "#10b981",
        },

        danger: {
          500: "#ef4444",
        },

        surface: "#ffffff",

        bg: "#f8fafc",

        text: {
          main: "#0f172a",
          sub: "#475569",
          muted: "#94a3b8",
        },
      },
    },
  },

  plugins: [],
};