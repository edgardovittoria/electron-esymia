module.exports = {
  content: ['./src/renderer/**/*.{js,jsx,ts,tsx}'],
  daisyui: {
    themes: ['light'],
  },
  theme: {
    extend: {
      colors: {
        primaryColor: '#184043',
        secondaryColor: '#2c2c2c',
        shadowColor: '#c8c8c8',
        bgColor: '#ececec',
        textColor: 'black',
        primaryColorDark: '#184043',
        secondaryColorDark: '#77FF94',
        bgColorDark: '#2c2c2c',
        textColorDark: '#EEE5E9',
        bgColorDark2: '#52525b'
      },
    },
  },
  plugins: [require('daisyui')],
  important: true,
};
