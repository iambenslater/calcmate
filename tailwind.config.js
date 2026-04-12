/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.ejs',
    './public/js/**/*.js',
  ],
  safelist: [
    'bg-blue-50',
    'font-semibold',
    'text-green-600',
    'text-red-600',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#00205B',
        gold: '#FFB800',
        'gold-light': '#FFF3D0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
