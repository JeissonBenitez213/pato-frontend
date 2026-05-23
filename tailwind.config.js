/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-2": "var(--bg-2)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-grad-a": "var(--surface-grad-a)",
        "surface-grad-b": "var(--surface-grad-b)",
        accent: "var(--accent)",
        "accent-2": "var(--accent-2)",
        "accent-glow": "var(--accent-glow)",
        "magenta-glow": "var(--magenta-glow)",
        text: "var(--text)",
        "text-dim": "var(--text-dim)",
        "text-faint": "var(--text-faint)",
        pill: "var(--pill)",
        "pill-dim": "var(--pill-dim)",
      },
      borderRadius: {
        custom: "var(--radius)",
        sm: "var(--radius-sm)",
        pill: "var(--radius-pill)",
      },
      fontFamily: {
        display: "var(--font-display)",
        mono: "var(--font-mono)",
      },
      animation: {
        popIn: "popIn 0.3s ease both",
      },
      keyframes: {
        popIn: {
          "0%": {
            opacity: "0",
            transform: "scale(0.95)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
};
