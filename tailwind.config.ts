import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { accent: "#7b8cff" } } },
  plugins: [],
};
export default config;
