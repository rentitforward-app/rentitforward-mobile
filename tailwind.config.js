/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#44D62C',
          '500': '#44D62C',
          '600': '#3AC625',
          green: '#44D62C',
        }
      }
    },
  },
  plugins: [],
}; 