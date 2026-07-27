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
          50:  '#fffdf4',
          100: '#fff8e7',
          200: '#fef0d0',
          300: '#f8e2ad',
          400: '#e8c982',
          500: '#cfa95b',
          600: '#a70f2f',
          700: '#8f0b2a',
          800: '#6c061e',
          900: '#5d061d',
          950: '#3f0312',
        },
        blush: {
          50:  '#fff2f4',
          100: '#ffdbe2',
          200: '#ffbecb',
          300: '#f992a7',
          400: '#ea657f',
          500: '#d84e67',
          600: '#b82d4a',
          700: '#96203a',
          800: '#7a1a31',
          900: '#66162a',
        },
        sage: {
          50:  '#f3f6ec',
          100: '#e2ead5',
          200: '#c8d8b0',
          300: '#a7bf82',
          400: '#89a15e',
          500: '#6d8345',
          600: '#4c6031',
          700: '#3d5028',
          800: '#2d4a1e',
          900: '#253d1a',
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
