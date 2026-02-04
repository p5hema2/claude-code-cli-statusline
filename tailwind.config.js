export default {
  content: ['./src/configure/gui/**/*.{html,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0d1117',
          secondary: '#161b22',
          tertiary: '#21262d',
          hover: '#30363d',
        },
        text: {
          primary: '#e6edf3',
          secondary: '#8b949e',
          muted: '#6e7681',
        },
        accent: {
          DEFAULT: '#2a75d5', // Darkened from #58a6ff for WCAG 2.0 AA (4.5:1 contrast with white)
          hover: '#58a6ff', // Use original color for hover state
        },
        semantic: {
          success: '#3fb950',
          warning: '#d29922',
          error: '#f85149',
        },
        border: '#30363d',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
      },
      boxShadow: {
        custom: '0 8px 24px rgba(0, 0, 0, 0.4)',
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
