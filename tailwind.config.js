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
        navy: '#393F23',
        gold: '#BFA956',
        'gold-light': '#F5F2E8',
        warm: {
          '50': '#fafaf8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
