/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-bg': '#F9F8F4',
        'primary': '#2E3F5C',
        'accent': '#E8A87C',
        'activity-green': '#6DB8A8',
        'transport-purple': '#C4B5D0',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
