/*********************************************************
 * TailwindCSS Configuration for AWS Cloud Club Frontend  *
 *********************************************************/
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', ...defaultTheme.fontFamily.sans],
        body: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        brand: {
          primary: '#FF9900', // AWS orange
          dark: '#0B1628',
          muted: '#0f172a',
        },
      },
      backgroundImage: {
        glow: 'radial-gradient(circle at 20% 20%, rgba(255,153,0,0.12), transparent 30%), radial-gradient(circle at 80% 10%, rgba(56,189,248,0.12), transparent 25%), radial-gradient(circle at 40% 80%, rgba(99,102,241,0.14), transparent 30%)',
        grid: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-size': '48px 48px',
      },
      boxShadow: {
        soft: '0 15px 50px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
};
