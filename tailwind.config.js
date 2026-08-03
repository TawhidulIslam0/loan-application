/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lendswift: {
          primary: '#1F4E79',
          accent: '#27AE60',
          error: '#E74C3C',
          warning: '#F39C12',
        },
      },
    },
  },
  plugins: [],
}