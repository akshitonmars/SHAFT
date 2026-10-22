/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#101820',       // Deep slate
          light: '#F4F5F2',      // Soft white
          accent: '#78CFC4',     // Cyan-teal accent
          muted: '#657580',      // Muted slate
          surface: '#162029',    // Slate card surface
          elevated: '#1D2A35',   // Elevated surface
          border: '#243442',     // Subtle border
          borderLight: '#324657' // Focused / highlighted border
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
