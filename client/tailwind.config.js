/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        heading: ['"Outfit"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#1E1B2E',
        mist: '#F7F6F3',
        brand: {
          50: '#efeafe',
          100: '#ddd6fe',
          500: '#5B4CDB',
          600: '#7B6EF6',
        },
        tealGlow: '#0EA5A0',
        sunset: '#F97066',
        surface: '#F7F6F3',
      },
      boxShadow: {
        luxe: '0 20px 60px rgba(91, 76, 219, 0.14)',
        glass: '0 10px 40px rgba(91, 76, 219, 0.12)',
      },
      backgroundImage: {
        'hero-radial':
          'linear-gradient(160deg, #F7F6F3 0%, #EDE9FE 40%, #CCFBF1 70%, #FEF3C7 100%)',
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        pulseSoft: 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 0.72 },
          '50%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
