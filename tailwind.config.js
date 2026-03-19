/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Apple green palette — replaces the old green ramp
        green: {
          50: '#f1fcf2',
          100: '#ddfbe1',
          200: '#bef4c6',
          300: '#8bea9a',
          400: '#51d768',
          500: '#29bb42',
          600: '#1d9c33',
          700: '#1a7b2b',
          800: '#1a6127',
          900: '#175023',
          950: '#072c0f',
        },
        gold: {
          300: '#fde68a',
          400: '#f4c842',
          500: '#e8b420',
          700: '#9a7410',
        },
        mint: '#51d768',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 2px 12px rgba(26,97,39,0.09)',
        'card-lg': '0 4px 20px rgba(26,97,39,0.13)',
      },
    },
  },
  plugins: [],
};
