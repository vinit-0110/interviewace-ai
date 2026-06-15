/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Support toggling dark mode via class on body/html
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f6ff',
          100: '#ebedff',
          200: '#d4d8ff',
          300: '#adb4ff',
          400: '#8189ff',
          500: '#5a54fc', // professional electric indigo
          600: '#4c43f5',
          700: '#3d34db',
          800: '#332ab5',
          900: '#2b2494',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          800: '#0f111a', // premium obsidian slate
          900: '#090a0f', // deep black-blue body bg
          950: '#040508', // deepest obsidian black
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'glass-dark-gradient': 'linear-gradient(135deg, rgba(15, 23, 42, 0.6), rgba(2, 6, 23, 0.8))',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 8px 32px 0 rgba(90, 84, 252, 0.15)',
        'glow': '0 0 15px rgba(90, 84, 252, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
