/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{html,js,tsx}"],
  theme: {
    extend: {
      animation: {
        'bounce-slow': 'bounce 2s linear infinite',
      }
    },
  },
  plugins: [],
}

