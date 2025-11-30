/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'input-blue': '#1976d2',
        'input-border': '#e0e0e0',
        'label-gray': '#424242',
        'asterisk-blue': '#42a5f5',
        'asterisk-bg': '#e0e0e0',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disable Tailwind's base styles to avoid conflicts with Angular Material
  }
}

