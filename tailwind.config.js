/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7657E8',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#7657E8',
          600: '#6441D6',
          700: '#522EC2',
          800: '#4323A5',
          900: '#341B85',
        },
        secondary: {
          DEFAULT: '#242B45',
          light: '#2E3757',
          dark: '#1A1F33'
        },
        finBg: {
          light: '#F6F7FB',
          dark: '#0F172A'
        },
        income: {
          DEFAULT: '#16A36A',
          light: '#E8F8F0',
          dark: '#0E7A4E'
        },
        expense: {
          DEFAULT: '#E45465',
          light: '#FDF0F1',
          dark: '#B82E3E'
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#D97706'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'fintech': '0 4px 20px -2px rgba(118, 87, 232, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'fintech-lg': '0 10px 30px -4px rgba(118, 87, 232, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
