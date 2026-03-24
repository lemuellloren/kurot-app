/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Kurot brand palette
        brand: {
          50: '#F1F3F3',
          100: '#C0FFF5',
          200: '#40FFE1',
          300: '#259583',
          400: '#1d7a6a',
          500: '#259583',
          600: '#0f4840',
          700: '#415353',
          800: '#011412',
          900: '#010e0c',
        },
        // Keep green alias pointing to brand for Tailwind class compat
        green: {
          50: '#F1F3F3',
          100: '#C0FFF5',
          200: '#40FFE1',
          300: '#40FFE1',
          400: '#40FFE1',
          500: '#259583',
          600: '#259583',
          700: '#259583',
          800: '#259583',
          900: '#011412',
          950: '#010e0c',
        },
        teal: {
          DEFAULT: '#259583',
          light: '#40FFE1',
          lighter: '#C0FFF5',
          dark: '#011412',
          muted: '#415353',
          gray: '#8EA2A2',
          offwhite: '#F1F3F3',
        },
        gold: {
          300: '#fde68a',
          400: '#f4c842',
          500: '#e8b420',
          700: '#9a7410',
        },
      },
      fontFamily: {
        serif: ['Poppins', 'system-ui', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 2px 12px rgba(37,149,131,0.10)',
        'card-lg': '0 4px 20px rgba(37,149,131,0.15)',
      },
    },
  },
  plugins: [],
};
