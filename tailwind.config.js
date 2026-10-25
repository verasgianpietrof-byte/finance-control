/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // tema controlado pela classe "dark" no <html>
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: { fadeIn: 'fadeIn .35s ease-out' },
    },
  },
  plugins: [],
};