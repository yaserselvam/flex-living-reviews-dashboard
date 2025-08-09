/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        md: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px", // matches your max-w-6xl container feel
      },
    },
    extend: {
      colors: {
        flex: {
          green: "var(--flex-green)",
          cream: "var(--flex-cream)",
          berry: "var(--flex-berry)",
        },
        ink: "var(--text-ink)",
        "ink-weak": "var(--text-ink-weak)",
        offwhite: "var(--offwhite)",
        line: "var(--line)",
      },
      fontFamily: {
        serif: ["var(--logo-serif)", "ui-serif", "Georgia", "Cambria", "Times New Roman", "Times", "serif"],
      },
      borderColor: {
        DEFAULT: "var(--line)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 4px 10px rgba(0,0,0,0.03)",
      },
      maxWidth: {
        "container": "72rem", // 1152px (roughly your max-w-6xl vibe)
      },
    },
  },
  plugins: [],
};