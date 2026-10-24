import React, { useMemo } from "react"
import { motion } from "framer-motion"

interface LandingNavbarProps {
  onStartTest: () => void
}

export default function LandingNavbar({ onStartTest }: LandingNavbarProps) {
  // Generate deterministic particle offsets to avoid re-render jumps
  const particles = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        left: `${20 + ((i * 17) % 60)}%`,
        top: `${20 + ((i * 23) % 60)}%`,
        xOffset: (i % 2 === 0 ? 1 : -1) * (5 + ((i * 3) % 10)),
      })),
    []
  )

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-6 flex items-center justify-between pointer-events-none transition-all duration-300">
      {/* SVG Defs for Logo Glow if not already loaded */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="logo-glow-nav" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={3} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="logo-gradient-nav" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
      </svg>

      {/* Logo - Click to scroll to top */}
      <motion.div
        onClick={handleScrollToTop}
        className="pointer-events-auto flex items-center group cursor-pointer relative"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        title="HumanSignal Home"
      >
        <motion.svg
          fill="currentColor"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="size-10 text-white group-hover:drop-shadow-lg transition-all duration-300"
          style={{
            filter: "url(#logo-glow-nav)",
          }}
          whileHover={{
            fill: "url(#logo-gradient-nav)",
            rotate: [0, -2, 2, 0],
            transition: {
              fill: { duration: 0.3 },
              rotate: { duration: 0.6, ease: "easeInOut" },
            },
          }}
        >
          <motion.path
            d="M15 85V15h12l18 35 18-35h12v70h-12V35L45 70h-10L17 35v50H15z"
            initial={{ pathLength: 1 }}
            whileHover={{
              pathLength: [1, 0, 1],
              transition: { duration: 1.2, ease: "easeInOut" },
            }}
          />
        </motion.svg>

        {/* Floating Particle Sparkles */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute w-1 h-1 bg-white/60 rounded-full"
              style={{
                left: p.left,
                top: p.top,
              }}
              animate={{
                y: [-10, -20, -10],
                x: [0, p.xOffset, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: p.id * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Rectangular Black Rounded-Corner Box with Three Options - Fixed throughout whole page */}
      <nav className="pointer-events-auto flex items-center space-x-2 sm:space-x-4 px-6 py-2.5 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
        <a
          href="#about"
          className="text-white font-bold text-base sm:text-lg md:text-xl px-4 py-1.5 rounded-xl hover:text-cyan-300 hover:bg-white/10 transition-colors tracking-wide"
        >
          About
        </a>
        <a
          href="#features"
          className="text-white font-bold text-base sm:text-lg md:text-xl px-4 py-1.5 rounded-xl hover:text-cyan-300 hover:bg-white/10 transition-colors tracking-wide"
        >
          Features
        </a>
        <a
          href="#architecture"
          className="text-white font-bold text-base sm:text-lg md:text-xl px-4 py-1.5 rounded-xl hover:text-cyan-300 hover:bg-white/10 transition-colors tracking-wide"
        >
          Architecture
        </a>
      </nav>

      {/* Static Start Test Action Button - Fixed throughout whole page */}
      <div className="pointer-events-auto">
        <button 
          type="button"
          onClick={onStartTest}
          className="px-8 py-2.5 rounded-2xl bg-white text-black font-bold text-sm md:text-base whitespace-nowrap transition-colors hover:bg-slate-100 cursor-pointer h-11 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
        >
          Start Test
        </button>
      </div>
    </header>
  )
}
