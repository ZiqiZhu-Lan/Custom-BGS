/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cbs-primary': '#4F46E5',
        'cbs-secondary': '#10B981',
        'cbs-dark': '#1F2937',
        'cbs-light': '#F9FAFB',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}