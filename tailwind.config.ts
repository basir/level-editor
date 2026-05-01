import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        editor: {
          bg: "#0f0f0f",
          panel: "#1a1a1a",
          cell: "#1e1e1e",
          border: "#2a2a2a",
          stone: "#4a4a4a",
          hole: "#0a0a0a",
          source: "#1d4ed8",
          target: "#15803d",
          mirror: "#292929",
          fog: "#1e2a1e",
          prefill: "#333333",
          beam: "#F59E0B",
          trap: "#dc2626"
        }
      }
    }
  },
  plugins: []
}

export default config
