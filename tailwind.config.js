module.exports = {
  content: ['./src/renderer/**/*.{js,jsx,ts,tsx}'],
  daisyui: {
    themes: ['light'],
  },
  theme: {
    extend: {
      colors: {
        primaryColor: '#184043',
        secondaryColor: '#29686E',
        shadowColor: '#c8c8c8',
      },
    },
  },
  plugins: [require('daisyui')],
  important: true,
};
