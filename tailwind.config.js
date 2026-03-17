/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        green: {
          50:  '#f3faf0',
          100: '#eaf3de',
          200: '#c0dd97',
          300: '#97c459',
          600: '#2d8a52',
          700: '#1f7044',
          800: '#1a5c38',
          900: '#0a2918',
        },
        gold: {
          300: '#fde68a',
          400: '#f4c842',
          500: '#e8b420',
          700: '#9a7410',
        },
        mint: '#4ade80',
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
        card: '0 2px 12px rgba(26,92,56,0.09)',
        'card-lg': '0 4px 20px rgba(26,92,56,0.13)',
      },
    },
  },
  plugins: [],
}
