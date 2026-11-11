export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        accent: {
          50: '#fdf2f8',
          500: '#ec4899',
          600: '#db2777',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
        display: ['"Space Grotesk"', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 45px -20px rgba(15, 23, 42, 0.3)',
      },
      spacing: {
        18: '4.5rem',
      },
    },
  },
  plugins: [],
}
