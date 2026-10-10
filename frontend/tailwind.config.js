/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        panel: '#090d1a',
        accent: '#34d399',
      },
    },
  },
  plugins: [],
};
