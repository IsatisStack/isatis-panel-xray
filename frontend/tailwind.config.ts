// 2022+ Tailwind v3/v4 config with CSS-first approach
// Uses dark mode class strategy
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{tsx,ts,jsx,js}', './index.html'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', // blue-500
        secondary: '#1e40af', // blue-600
        glass: '#ffffff',
        glassbg: '#f8f9fa',
        glassborder: '#e5e7eb',
        accent: '#10b981', // emerald-500
        danger: '#ef4444', // red-500
        'accent-dark': '#1e3a8a', // indigo-700
      },
      borderRadius: {
        lg: '1rem',
      },
      spacing: {
        '8': '2rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-up': 'slide-up 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};