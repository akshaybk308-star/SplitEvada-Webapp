export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      colors: {
        space: { 950: "#04041a", 900: "#07071a", 800: "#0d0b26", 700: "#12082a" },
      },
      boxShadow: {
        "glow-violet": "0 0 40px rgba(124,58,237,0.45)",
        "glow-cyan":   "0 0 40px rgba(20,184,166,0.45)",
        "glow-lime":   "0 0 40px rgba(132,204,22,0.45)",
        "glow-pink":   "0 0 40px rgba(236,72,153,0.45)",
        "glass":       "0 8px 32px rgba(0,0,0,0.35)",
      },
      animation: {
        "float":       "float 6s ease-in-out infinite",
        "glow-pulse":  "glowPulse 3s ease-in-out infinite",
        "twinkle":     "twinkle 4s ease-in-out infinite",
        "slide-up":    "slideUp 0.4s cubic-bezier(0.16,1,0.3,1)",
        "fade-in":     "fadeIn 0.3s ease",
      },
      keyframes: {
        float:      { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-8px)" } },
        glowPulse:  { "0%,100%": { opacity: "0.6" }, "50%": { opacity: "1" } },
        twinkle:    { "0%,100%": { opacity: "0.2", transform: "scale(0.8)" }, "50%": { opacity: "1", transform: "scale(1.3)" } },
        slideUp:    { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        fadeIn:     { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
      },
    },
  },
  plugins: [],
}
