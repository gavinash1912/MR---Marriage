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
          50:  '#f9f5f9',
          100: '#f2e8f2',
          200: '#e4d0e4',
          300: '#cfaecf',
          400: '#b484b4',
          500: '#9b6a9b',
          600: '#7d5280',
          700: '#664068',
          800: '#553657',
          900: '#492f4b',
          950: '#2d1830',
        },
        blush: {
          50:  '#fdf5f5',
          100: '#fce8e8',
          200: '#f9d5d5',
          300: '#f4b3b3',
          400: '#ed8585',
          500: '#e05d5d',
          600: '#cc3d3d',
          700: '#ab2e2e',
          800: '#8e2929',
          900: '#762828',
        },
        sage: {
          50:  '#f4f7f4',
          100: '#e5ede5',
          200: '#cbdacb',
          300: '#a3bfa3',
          400: '#749e74',
          500: '#537f53',
          600: '#406440',
          700: '#344f34',
          800: '#2b402b',
          900: '#233523',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"EB Garamond"', 'Georgia', 'serif'],
        sans:  ['"Lato"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.3em',
        widest3: '0.4em',
      },
    },
  },
  plugins: [],
}
