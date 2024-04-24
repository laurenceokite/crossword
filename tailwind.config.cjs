/** @type {import('tailwindcss').Config}*/
const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    fontSize: {
      tiny: ['0.5rem', '1']
    },
    extend: {},
  },

  plugins: [
    require('@tailwindcss/container-queries')
  ],
};

module.exports = config;
