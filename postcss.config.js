module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
// postcss.config.js
// CommonJS format so it works regardless of ESM settings
module.exports = {
  plugins: {
    // Optional but handy if you ever @import css files
    "postcss-import": {},
    // Enable CSS nesting (works nicely with Tailwind)
    "tailwindcss/nesting": {},
    // Tailwind + vendor prefixes
    tailwindcss: {},
    autoprefixer: {},
  },
};