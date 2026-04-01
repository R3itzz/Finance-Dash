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
        terminal: {
          bg: 'var(--color-terminal-bg)',
          text: 'var(--color-terminal-text)',
          primary: 'var(--color-terminal-primary)',
          secondary: 'var(--color-terminal-secondary)',
          highlight: 'var(--color-terminal-highlight)',
        },
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#1c1c1a', // Reassigned to match terminal background
        }
      },
      fontFamily: {
        sans: ['"Fira Code"', '"Courier New"', 'Courier', 'monospace'],
        mono: ['"Fira Code"', '"Courier New"', 'Courier', 'monospace'],
      },
      boxShadow: {
        'soft': 'none',
        'card': 'none',
      }
    },
  },
  plugins: [],
}
