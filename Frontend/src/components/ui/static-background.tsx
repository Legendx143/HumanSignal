import React, { memo } from "react"
import { MeshGradient } from "@paper-design/shaders-react"

interface StaticSectionBackgroundProps {
  glowSide?: "left" | "right" | "center" | "balanced"
}

/**
 * StaticSectionBackground
 * Reproduces the Hero section's rich fluid mesh gradient theme:
 * Electric Cyan (#06b6d4), Deep Oceanic Navy (#082f49), Sky Blue (#0284c7), and Warm Radiant Orange (#ea580c)
 * in an un-animated, frozen state with the razor-sharp telemetry grid, extending full-width across the entire screen.
 */
export const StaticSectionBackground = memo(function StaticSectionBackground({
  glowSide = "center",
}: StaticSectionBackgroundProps) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Deep Oceanic Blue Base (rich deep navy, NOT flat dead black) */}
      <div className="absolute inset-0 bg-[#030d18]" />

      {/* 2. Massive, Vibrant Fluid Color Blooms (Exact Hero Palette) */}
      {glowSide === "left" && (
        <>
          {/* Luminous Cyan/Teal on the Left (matching Hero's dominant left glow) */}
          <div className="absolute -top-20 -left-20 w-[900px] h-[900px] rounded-full blur-[110px] opacity-80 bg-gradient-to-tr from-[#082f49] via-[#06b6d4] to-[#0284c7]" />
          <div className="absolute top-1/2 -left-32 w-[700px] h-[700px] rounded-full blur-[120px] opacity-70 bg-gradient-to-r from-[#0284c7] via-[#06b6d4] to-transparent" />
          
          {/* Warm Radiant Amber/Orange on the Right */}
          <div className="absolute top-10 -right-20 w-[800px] h-[800px] rounded-full blur-[120px] opacity-75 bg-gradient-to-bl from-[#ea580c] via-[#f97316] to-[#9a3412]" />
          <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] rounded-full blur-[130px] opacity-60 bg-gradient-to-t from-[#c2410c] to-transparent" />
        </>
      )}

      {glowSide === "right" && (
        <>
          {/* Warm Radiant Amber/Orange on the Left */}
          <div className="absolute top-20 -left-20 w-[750px] h-[750px] rounded-full blur-[120px] opacity-75 bg-gradient-to-br from-[#ea580c] via-[#f97316] to-[#9a3412]" />
          
          {/* Luminous Cyan/Teal on the Right */}
          <div className="absolute -top-10 -right-20 w-[950px] h-[950px] rounded-full blur-[110px] opacity-80 bg-gradient-to-tl from-[#082f49] via-[#06b6d4] to-[#0284c7]" />
          <div className="absolute bottom-10 -right-20 w-[700px] h-[700px] rounded-full blur-[120px] opacity-70 bg-gradient-to-l from-[#0284c7] via-[#06b6d4] to-transparent" />
        </>
      )}

      {(glowSide === "center" || glowSide === "balanced") && (
        <>
          {/* Dual Balanced Radiant Blooms (framing content in vibrant color) */}
          <div className="absolute -top-10 -left-20 w-[850px] h-[850px] rounded-full blur-[110px] opacity-80 bg-gradient-to-tr from-[#082f49] via-[#06b6d4] to-[#0284c7]" />
          <div className="absolute -top-10 -right-20 w-[850px] h-[850px] rounded-full blur-[120px] opacity-75 bg-gradient-to-bl from-[#ea580c] via-[#f97316] to-[#9a3412]" />
          <div className="absolute bottom-0 left-1/3 w-[800px] h-[600px] rounded-full blur-[130px] opacity-65 bg-gradient-to-t from-[#0284c7] via-[#082f49] to-transparent" />
          <div className="absolute bottom-10 right-10 w-[600px] h-[600px] rounded-full blur-[130px] opacity-60 bg-gradient-to-tl from-[#ea580c] via-[#f97316] to-transparent" />
        </>
      )}

      {/* 3. High-DPI Fluid Mesh Gradient Shader (frozen at speed={0}) */}
      <div className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen pointer-events-none">
        <MeshGradient
          className="w-full h-full"
          colors={["#000000", "#082f49", "#06b6d4", "#0284c7", "#ea580c"]}
          speed={0}
          distortion={0.25}
          swirl={0.15}
          grainMixer={0}
          grainOverlay={0}
          minPixelRatio={1.5}
        />
      </div>

      {/* 4. Razor-Sharp Telemetry Matrix Grid (identical to Hero section) */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_95%_90%_at_50%_50%,#000_75%,transparent_100%)] pointer-events-none z-10"
      />

      {/* 5. Gentle Edge Vignette (only 20% opacity at extreme edges for seamless continuity) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/25 pointer-events-none z-10" />
    </div>
  )
})

export default StaticSectionBackground
