/** @type {import('tailwindcss').Config} */
export default {
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
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#FFE66D',
        dark: '#2C3E50',
        light: '#F7F7F7',
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
