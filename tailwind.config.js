/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        'warm-bg':           '#F9F8F4',
        'primary':           '#2E3F5C',
        'accent':            '#E8A87C',
        'activity-green':    '#6DB8A8',
        'transport-purple':  '#C4B5D0',
        // Dark mode colors
        'dark-bg':           '#1a1a1a',
        'dark-card':         '#2d2d2d',
        'dark-primary':      '#4a5f7f',
        'dark-text':         '#e5e5e5',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-4px)' },
          '40%':      { transform: 'translateX(4px)' },
          '60%':      { transform: 'translateX(-4px)' },
          '80%':      { transform: 'translateX(4px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '.5' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out both',
        shake:  'shake 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
};
