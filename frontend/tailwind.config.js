/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#173B64',
          dark: '#102D4F',
          light: '#E8EFF6',
        },
        secondary: '#D1A93F',
        accent: '#E8C45B',
        dark: '#13283F',
        light: '#F4F7FA',
        success: '#2ECC71',
        warning: '#F39C12',
        danger: '#E74C3C',
      },
      spacing: {
        '128': '32rem',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        'airbnb': '0 2px 16px rgba(0,0,0,0.12)',
        'airbnb-lg': '0 16px 48px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
