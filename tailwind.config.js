/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mauve: {
          50:  '#fff8f3',
          100: '#f8eadf',
          200: '#edcbbb',
          300: '#dca391',
          400: '#bc6a65',
          500: '#98464f',
          600: '#7b2e40',
          700: '#642335',
          800: '#511c2c',
          900: '#3b1422',
          950: '#240912',
        },
        blush: {
          50:  '#fff4ed',
          100: '#ffe4d4',
          200: '#ffc5a8',
          300: '#ff9a72',
          400: '#f2664b',
          500: '#dc3f32',
          600: '#ba2b2b',
          700: '#962229',
          800: '#7a2028',
          900: '#641e25',
        },
        sage: {
          50:  '#f6f8ef',
          100: '#e8edd7',
          200: '#d2dcb0',
          300: '#afc37e',
          400: '#87a451',
          500: '#67883b',
          600: '#4f6b2f',
          700: '#405629',
          800: '#354625',
          900: '#2d3c22',
        },
      },
      fontFamily: {
        serif:  ['"Cormorant Garamond"', '"EB Garamond"', 'Georgia', 'serif'],
        sans:   ['"Lato"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        allura: ['"Allura"', 'cursive'],
      },
      letterSpacing: {
        widest2: '0.3em',
        widest3: '0.4em',
      },
    },
  },
  plugins: [],
}
