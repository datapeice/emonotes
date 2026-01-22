/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--md-sys-color-primary) / <alpha-value>)",
        "on-primary": "rgb(var(--md-sys-color-on-primary) / <alpha-value>)",
        "primary-container": "rgb(var(--md-sys-color-primary-container) / <alpha-value>)",
        "on-primary-container": "rgb(var(--md-sys-color-on-primary-container) / <alpha-value>)",

        secondary: "rgb(var(--md-sys-color-secondary) / <alpha-value>)",
        "on-secondary": "rgb(var(--md-sys-color-on-secondary) / <alpha-value>)",
        "secondary-container": "rgb(var(--md-sys-color-secondary-container) / <alpha-value>)",
        "on-secondary-container": "rgb(var(--md-sys-color-on-secondary-container) / <alpha-value>)",

        tertiary: "rgb(var(--md-sys-color-tertiary) / <alpha-value>)",
        "on-tertiary": "rgb(var(--md-sys-color-on-tertiary) / <alpha-value>)",
        "tertiary-container": "rgb(var(--md-sys-color-tertiary-container) / <alpha-value>)",
        "on-tertiary-container": "rgb(var(--md-sys-color-on-tertiary-container) / <alpha-value>)",

        background: "rgb(var(--md-sys-color-background) / <alpha-value>)",
        "on-background": "rgb(var(--md-sys-color-on-background) / <alpha-value>)",

        surface: "rgb(var(--md-sys-color-surface) / <alpha-value>)",
        "on-surface": "rgb(var(--md-sys-color-on-surface) / <alpha-value>)",
        "surface-variant": "rgb(var(--md-sys-color-surface-variant) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--md-sys-color-on-surface-variant) / <alpha-value>)",

        outline: "rgb(var(--md-sys-color-outline) / <alpha-value>)",
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

