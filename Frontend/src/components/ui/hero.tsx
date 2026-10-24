import { useEffect, useRef, useState, useMemo } from "react"
import { MeshGradient, PulsingBorder } from "@paper-design/shaders-react"
import { motion } from "framer-motion"

interface ShaderShowcaseProps {
  onStartTest?: () => void
}

export default function ShaderShowcase({ onStartTest }: ShaderShowcaseProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)

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

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => setIsActive(false)

    const container = containerRef.current
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="min-h-[125vh] min-h-[125dvh] bg-black relative overflow-hidden">
      {/* Hidden SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves={1} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={0.3} />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={4} result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
          <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={3} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#06b6d4" />
            <stop offset="70%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={2} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Crystal-Clear High-DPI Fluid Shader Background */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#081d38", "#0284c7", "#06b6d4", "#38bdf8", "#f97316", "#fbbf24"]}
        speed={isActive ? 0.40 : 0.22}
        distortion={0.18}
        swirl={0.12}
        grainMixer={0}
        grainOverlay={0}
        minPixelRatio={2}
      />

      {/* Subtle Razor-Sharp Telemetry Matrix Grid for crisp geometric definition */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_45%,#000_60%,transparent_100%)] pointer-events-none z-10" 
      />

      {/* Soft Bottom Vignette for High Text Legibility without hazy darkening */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10" />

      {/* Spacing for Fixed Landing Navbar */}
      <div className="relative z-20 h-20 w-full" />

      {/* Main Hero Content - Commanding Large Typography */}
      <main className="absolute bottom-10 left-8 sm:bottom-12 sm:left-12 lg:bottom-14 lg:left-16 z-20 max-w-4xl lg:max-w-5xl">
        <div className="text-left">
          <motion.h1
            className="font-bold text-white mb-6 leading-none tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span
              className="block font-medium text-[#FAF7F2] text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6 sm:mb-8 lg:mb-10 pb-3 sm:pb-4 leading-normal tracking-wide overflow-visible drop-shadow-md"
              style={{
                color: "#FAF7F2",
              }}
            >
              HumanSignal
            </span>
            <span className="block font-black text-white text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] drop-shadow-2xl leading-none">
              Behavioral
            </span>
            <span className="block font-light text-white/90 italic text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-tight">
              Intelligence
            </span>
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl md:text-3xl font-light text-white/85 mb-4 leading-relaxed max-w-3xl drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Detect mental fatigue, overload, and focus without asking questions or recording sensitive text.
            Passive psychomotor telemetry powered by temporal machine learning.
          </motion.p>
        </div>
      </main>

      {/* Cybernetic Pulsing Border Orb */}
      <div className="absolute bottom-8 right-8 z-30">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <PulsingBorder
            colors={["#06b6d4", "#0891b2", "#f97316", "#00FF88", "#ffffff"]}
            colorBack="#00000000"
            speed={1.5}
            roundness={1}
            thickness={0.1}
            softness={0.2}
            intensity={1}
            spots={4}
            spotSize={0.1}
            pulse={0.1}
            smoke={0.5}
            smokeSize={4}
            scale={0.65}
            rotation={0}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
            }}
          />

          {/* Rotating Text Around the Pulsing Border */}
          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ transform: "scale(1.6)" }}
          >
            <defs>
              <path id="circle" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
            </defs>
            <text className="text-sm fill-white/80 font-medium tracking-widest uppercase text-[9px]">
              <textPath href="#circle" startOffset="0%">
                • HumanSignal • Temporal ML • Zero Keylogging •
              </textPath>
            </text>
          </motion.svg>
        </div>
      </div>
    </div>
  )
}
