/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: '#40FFE1',
        green: {
          50:  '#f0f2f5',
          100: 'rgba(64,255,225,0.12)',
          200: 'rgba(64,255,225,0.25)',
          300: '#40FFE1',
          400: '#40FFE1',
          500: '#40FFE1',
          600: '#259583',
          700: '#259583',
          800: '#000d0b',
          900: '#0a0a0a',
          950: '#000000',
        },
      },
      fontFamily: {
        serif: ['Poppins', 'system-ui', 'sans-serif'],
        sans:  ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl:    '0.75rem',
        '2xl': '1rem',
        '3xl': '1rem',
        '4xl': '1rem',
      },
      boxShadow: {
        card:     '0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        'card-lg':'0 8px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}