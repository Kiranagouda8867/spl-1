/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e8edf5',
          100: '#c5d0e3',
          200: '#9fb0cf',
          300: '#7890bb',
          400: '#5a77ac',
          500: '#3c5e9d',
          600: '#2d4b8a',
          700: '#1e3570',
          800: '#152459',
          900: '#101828',
          950: '#0a1020',
        },
        teal: {
          50: '#e0faf8',
          100: '#b3f3ee',
          200: '#80ebe3',
          300: '#4de3d8',
          400: '#26dbcf',
          500: '#14B8A6',
          600: '#0ea594',
          700: '#0c8e7f',
          800: '#0a776b',
          900: '#075f55',
        },
        violet: {
          50: '#f3f0ff',
          100: '#e4defe',
          200: '#cbbffd',
          300: '#b39efb',
          400: '#9d82f9',
          500: '#A78BFA',
          600: '#8b6cf8',
          700: '#7c5af6',
          800: '#6d48f4',
          900: '#5b35f2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
