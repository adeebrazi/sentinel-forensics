/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // Change from 'tailwindcss' to this
    autoprefixer: {},
  },
};

export default config;