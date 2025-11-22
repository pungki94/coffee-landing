import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        coffee: "#4B2E0E",
        "coffee-light": "#6F4E37",
      },
    },
  },
  plugins: [],
};

export default config;

