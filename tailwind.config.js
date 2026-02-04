export default {
  content: ['./src/configure/gui/**/*.{html,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: '#ffffff',
          secondary: '#f8f9fa',
          tertiary: '#e9ecef',
          hover: '#dee2e6',
        },
        text: {
          primary: '#212529',
          secondary: '#495057',
          muted: '#6c757d',
        },
        accent: {
          DEFAULT: '#4468F0', // Smart Commerce primary blue
          hover: '#3654d6', // Darkened for hover state
        },
        brand: {
          blue: '#4468F0',
          yellow: '#FCAA1E',
          red: '#e74266',
          teal: '#20b69e',
        },
        semantic: {
          success: '#28a745',
          warning: '#FCAA1E',
          error: '#e74266',
        },
        border: '#dee2e6',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
      },
      boxShadow: {
        custom: '0 4px 12px rgba(68, 104, 240, 0.12)',
      },
      fontSize: {
        xs: '11px',
        sm: '12px',
        base: '13px',
        md: '14px',
        lg: '24px',
      },
    },
  },
  plugins: [],
};
