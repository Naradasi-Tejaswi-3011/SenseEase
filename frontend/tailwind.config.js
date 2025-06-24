/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'dyslexic': ['OpenDyslexic', 'Arial', 'sans-serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // High contrast theme colors
        'high-contrast': {
          bg: '#000000',
          text: '#ffffff',
          accent: '#ffff00',
        },
        // Low saturation theme colors
        'low-sat': {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#1a1e21',
        },
        // Brand colors
        'brand': {
          blue: '#0071ce',
          yellow: '#ffc220',
          orange: '#ff6600',
        }
      },
      animation: {
        'reduced-motion': 'none',
      },
      fontSize: {
        'xs-plus': '0.8125rem',
        'sm-plus': '0.9375rem',
        'base-plus': '1.125rem',
        'lg-plus': '1.25rem',
        'xl-plus': '1.375rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}
