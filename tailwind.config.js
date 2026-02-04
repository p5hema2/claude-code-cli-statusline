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
          primary: 'rgb(var(--color-bg-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-bg-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--color-bg-tertiary) / <alpha-value>)',
          hover: 'rgb(var(--color-bg-hover) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        },
        border: 'rgb(var(--color-border) / <alpha-value>)',
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
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
      },
      boxShadow: {
        custom: '0 4px 12px rgb(var(--color-shadow))',
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
