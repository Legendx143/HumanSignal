import React, { useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

export interface Glass3DCardProps {
  children: React.ReactNode
  className?: string
  accentColor?: "cyan" | "orange" | "emerald" | "purple" | "amber" | "rose" | "blue"
  glowIntensity?: "subtle" | "medium" | "vibrant"
  maxTilt?: number
  enableGlare?: boolean
  onClick?: () => void
}

const ACCENT_STYLES = {
  cyan: {
    border: "group-hover:border-cyan-400/60",
    glow: "group-hover:shadow-[0_20px_60px_-15px_rgba(6,182,212,0.3)]",
    glareColor: "rgba(6, 182, 212, 0.15)",
    badgeBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
  },
  orange: {
    border: "group-hover:border-orange-400/60",
    glow: "group-hover:shadow-[0_20px_60px_-15px_rgba(234,88,12,0.3)]",
    glareColor: "rgba(234, 88, 12, 0.15)",
    badgeBg: "bg-orange-500/10 border-orange-500/30 text-orange-300",
  },
  emerald: {
    border: "group-hover:border-emerald-400/60",
    glow: "group-hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.3)]",
    glareColor: "rgba(16, 185, 129, 0.15)",
    badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  },
  purple: {
    border: "group-hover:border-purple-400/60",
    glow: "group-hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.3)]",
    glareColor: "rgba(168, 85, 247, 0.15)",
    badgeBg: "bg-purple-500/10 border-purple-500/30 text-purple-300",
  },
  amber: {
    border: "group-hover:border-amber-400/60",
    glow: "group-hover:shadow-[0_20px_60px_-15px_rgba(245,158,11,0.3)]",
    glareColor: "rgba(245, 158, 11, 0.15)",
    badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-300",
  },
  rose: {
    border: "group-hover:border-rose-400/60",
    glow: "group-hover:shadow-[0_20px_60px_-15px_rgba(244,63,94,0.3)]",
    glareColor: "rgba(244, 63, 94, 0.15)",
    badgeBg: "bg-rose-500/10 border-rose-500/30 text-rose-300",
  },
  blue: {
    border: "group-hover:border-sky-400/60",
    glow: "group-hover:shadow-[0_20px_60px_-15px_rgba(14,165,233,0.3)]",
    glareColor: "rgba(14, 165, 233, 0.15)",
    badgeBg: "bg-sky-500/10 border-sky-500/30 text-sky-300",
  },
}

export function Glass3DCard({
  children,
  className = "",
  accentColor = "cyan",
  maxTilt = 10,
  enableGlare = true,
  onClick,
}: Glass3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 })

  // Normalized motion values for cursor position (-0.5 to 0.5)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Fluid spring physics for buttery 3D recovery
  const mouseXSpring = useSpring(x, { stiffness: 280, damping: 22 })
  const mouseYSpring = useSpring(y, { stiffness: 280, damping: 22 })

  // 3D rotation transforms
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${maxTilt}deg`, `-${maxTilt}deg`])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${maxTilt}deg`, `${maxTilt}deg`])

  const accent = ACCENT_STYLES[accentColor] || ACCENT_STYLES.cyan

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const xPct = mouseX / rect.width - 0.5
    const yPct = mouseY / rect.height - 0.5

    x.set(xPct)
    y.set(yPct)

    setGlarePosition({
      x: (mouseX / rect.width) * 100,
      y: (mouseY / rect.height) * 100,
    })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <div
      style={{ perspective: 1200 }}
      className="relative h-full w-full select-none"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className={`group relative h-full w-full rounded-3xl transition-colors duration-500 ${accent.border} ${accent.glow} ${className}`}
      >
        {/* Layer 1: Frosted Glass Panel Base with subtle gradient */}
        <div className="absolute inset-0 rounded-3xl bg-slate-950/35 backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_0_rgba(0,0,0,0.65)] transition-all duration-500 overflow-hidden" />

        {/* Layer 2: Glossy Top Specular Highlight (Rim Light) */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.08] via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* Layer 3: Interactive Glare Reflection (follows mouse cursor) */}
        {enableGlare && (
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(circle 320px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.16), ${accent.glareColor} 30%, transparent 70%)`,
            }}
          />
        )}

        {/* Layer 4: Ambient Core Glow that intensifies on hover */}
        <div
          className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none -z-10"
          style={{
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, ${accent.glareColor}, transparent 70%)`,
          }}
        />

        {/* Layer 5: Preserved 3D Content Container */}
        <div
          className="relative z-10 h-full w-full [transform-style:preserve-3d]"
        >
          {children}
        </div>
      </motion.div>
    </div>
  )
}

export default Glass3DCard
