export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'brutal': ['"Space Grotesk"', 'sans-serif'],
        'organic': ['"Inter Var"', 'sans-serif'],
      },
      colors: {
        dopamine: {
          50: '#fef7ff',
          500: '#c026d3',
          600: '#a21caf',
          700: '#86198f',
        },
        brutal: {
          900: '#0f0f0f',
          950: '#020202',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-10px,0)' },
        }
      }
    },
  },
  plugins: [],
}
