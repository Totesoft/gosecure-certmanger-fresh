import type { Config } from "tailwindcss";
import preset from "@totesoft/ui-kit/preset";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@totesoft/ui-kit/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [preset],
  theme: {
    extend: {
      colors: {
        // These colors use CSS variables you define in globals.css
        bgprimary: "var(--bg-primary)",
        bgsecondary: "var(--bg-secondary)",
        textprimary: "var(--text-primary)",
        textsecondary: "var(--text-secondary)",
      },
    },
  },
};
export default config;
