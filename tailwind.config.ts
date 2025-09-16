import type { Config } from "tailwindcss";
import preset from "@totesoft/ui-kit/preset";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@totesoft/ui-kit/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [preset],
 
};
export default config;
