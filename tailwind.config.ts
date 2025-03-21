import type { Config } from "tailwindcss";

const config: Config = {
  presets: [require("@aragon/ods/tailwind.config")],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./plugins/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@aragon/ods/**/*.js",
  ],

  theme: {
    extend: {
      fontFamily: {
        chakraPetch: ["Chakra Petch", "sans-serif"],
      },
      backgroundImage: {
        "ellipse-34":
          "radial-gradient(50% 50% at 50% 50%, rgba(161, 109, 238, 0.80) 0%, rgba(235, 216, 253, 0.80) 100%);",
        "ellipse-35":
          "radial-gradient(50% 50% at 50% 50%, rgba(186, 139, 246, 0.40) 0%, rgba(241, 253, 210, 0.40) 100%)",
        "ellipse-36":
          "radial-gradient(50% 50% at 50% 50%, rgba(161, 109, 238, 0.40) 0%, rgba(213, 179, 252, 0.40) 100%)",

        "ellipse-37": "radial-gradient(50% 50% at 50% 50%, rgba(224, 254, 0, 0.30) 0%, rgba(224, 254, 0, 0.80) 100%);",
        "ellipse-38": "radial-gradient(50% 50% at 50% 50%, rgba(224, 254, 0, 0.20) 0%, rgba(241, 253, 210, 0.40) 100%)",
        "ellipse-39": "radial-gradient(50% 50% at 50% 50%, rgba(224, 254, 0, 0.40) 0%, rgba(224, 254, 0, 0.40) 100%);",
      },
      colors: {
        primary: {
          50: "rgb(var(--ods-color-primary-50) / <alpha-value>)",
          100: "rgb(var(--ods-color-primary-100) / <alpha-value>)",
          200: "rgb(var(--ods-color-primary-200) / <alpha-value>)",
          300: "rgb(var(--ods-color-primary-300) / <alpha-value>)",
          400: "rgb(var(--ods-color-primary-400) / <alpha-value>)",
          500: "rgb(var(--ods-color-primary-500) / <alpha-value>)",
          600: "rgb(var(--ods-color-primary-600) / <alpha-value>)",
          700: "rgb(var(--ods-color-primary-700) / <alpha-value>)",
          800: "rgb(var(--ods-color-primary-800) / <alpha-value>)",
          900: "rgb(var(--ods-color-primary-900) / <alpha-value>)",
        },
        neutral: {
          0: "rgb(var(--ods-color-neutral-0) / <alpha-value>)",
          50: "rgb(var(--ods-color-neutral-50) / <alpha-value>)",
          100: "rgb(var(--ods-color-neutral-100) / <alpha-value>)",
          200: "rgb(var(--ods-color-neutral-200) / <alpha-value>)",
          300: "rgb(var(--ods-color-neutral-300) / <alpha-value>)",
          400: "rgb(var(--ods-color-neutral-400) / <alpha-value>)",
          500: "rgb(var(--ods-color-neutral-500) / <alpha-value>)",
          600: "rgb(var(--ods-color-neutral-600) / <alpha-value>)",
          700: "rgb(var(--ods-color-neutral-700) / <alpha-value>)",
          800: "rgb(var(--ods-color-neutral-800) / <alpha-value>)",
          900: "rgb(var(--ods-color-neutral-900) / <alpha-value>)",
        },
        info: {
          100: "rgb(var(--ods-color-info-100) / <alpha-value>)",
          200: "rgb(var(--ods-color-info-200) / <alpha-value>)",
          300: "rgb(var(--ods-color-info-300) / <alpha-value>)",
          400: "rgb(var(--ods-color-info-400) / <alpha-value>)",
          500: "rgb(var(--ods-color-info-500) / <alpha-value>)",
          600: "rgb(var(--ods-color-info-600) / <alpha-value>)",
          700: "rgb(var(--ods-color-info-700) / <alpha-value>)",
          800: "rgb(var(--ods-color-info-800) / <alpha-value>)",
          900: "rgb(var(--ods-color-info-900) / <alpha-value>)",
        },
        success: {
          100: "rgb(var(--ods-color-success-100) / <alpha-value>)",
          200: "rgb(var(--ods-color-success-200) / <alpha-value>)",
          300: "rgb(var(--ods-color-success-300) / <alpha-value>)",
          400: "rgb(var(--ods-color-success-400) / <alpha-value>)",
          500: "rgb(var(--ods-color-success-500) / <alpha-value>)",
          600: "rgb(var(--ods-color-success-600) / <alpha-value>)",
          700: "rgb(var(--ods-color-success-700) / <alpha-value>)",
          800: "rgb(var(--ods-color-success-800) / <alpha-value>)",
          900: "rgb(var(--ods-color-success-900) / <alpha-value>)",
        },
        warning: {
          100: "rgb(var(--ods-color-warning-100) / <alpha-value>)",
          200: "rgb(var(--ods-color-warning-200) / <alpha-value>)",
          300: "rgb(var(--ods-color-warning-300) / <alpha-value>)",
          400: "rgb(var(--ods-color-warning-400) / <alpha-value>)",
          500: "rgb(var(--ods-color-warning-500) / <alpha-value>)",
          600: "rgb(var(--ods-color-warning-600) / <alpha-value>)",
          700: "rgb(var(--ods-color-warning-700) / <alpha-value>)",
          800: "rgb(var(--ods-color-warning-800) / <alpha-value>)",
          900: "rgb(var(--ods-color-warning-900) / <alpha-value>)",
        },
        critical: {
          100: "rgb(var(--ods-color-critical-100) / <alpha-value>)",
          200: "rgb(var(--ods-color-critical-200) / <alpha-value>)",
          300: "rgb(var(--ods-color-critical-300) / <alpha-value>)",
          400: "rgb(var(--ods-color-critical-400) / <alpha-value>)",
          500: "rgb(var(--ods-color-critical-500) / <alpha-value>)",
          600: "rgb(var(--ods-color-critical-600) / <alpha-value>)",
          700: "rgb(var(--ods-color-critical-700) / <alpha-value>)",
          800: "rgb(var(--ods-color-critical-800) / <alpha-value>)",
          900: "rgb(var(--ods-color-critical-900) / <alpha-value>)",
        },
      },
      boxShadow: {
        tooltip: "0px 22.73px 45.45px -10.91px rgb(var(--ods-color-neutral-600) / 0.24)",
      },
    },
  },
};

export default config;
