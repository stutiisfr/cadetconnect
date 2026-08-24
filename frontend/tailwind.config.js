/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#090D16',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B'
        },
        olive: {
          900: '#1A2E05',
          800: '#2D4B08',
          700: '#3F6212',
          600: '#4D7C0F',
          500: '#65A30D'
        },
        brass: {
          700: '#92400E',
          600: '#B45309',
          500: '#D97706',
          400: '#F59E0B'
        },
        sand: {
          50: '#FDFBF7',
          100: '#F8FAFC',
          200: '#F1F5F9',
          300: '#E2E8F0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Public Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Cinzel', 'Trajan Pro', 'Inter', 'serif']
      }
    },
  },
  plugins: [],
}
