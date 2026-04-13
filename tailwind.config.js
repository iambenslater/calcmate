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
        navy: '#1a1a1a',
        gold: '#FFB800',
        'gold-light': '#FFF3D0',
        warm: {
          '50': '#fafaf8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
