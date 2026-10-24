import React from "react"
import { motion } from "framer-motion"
import { 
  Brain, 
  ShieldCheck, 
  EyeOff, 
  Sparkles, 
  HeartHandshake,
  Activity,
  Zap,
  Timer,
  Lock,
  Compass
} from "lucide-react"
import StaticSectionBackground from "@/components/ui/static-background"
import Glass3DCard from "@/components/ui/glass-card"

const ABOUT_PILLARS = [
  {
    icon: EyeOff,
    title: "Zero Invasiveness",
    badge: "Hardware-Free",
    accent: "cyan" as const,
    description: "No webcams watching your face, no biometric chest straps, and zero wearable devices. It analyzes the subtle physics of human-computer interaction you already produce naturally.",
    feature: "Zero Optical Sensors",
  },
  {
    icon: ShieldCheck,
    title: "Zero Keylogging",
    badge: "100% Private",
    accent: "emerald" as const,
    description: "We never inspect characters, words, passwords, or URLs. The system measures pure temporal differentials (Δt) and kinematic vectors—keeping all communication 100% confidential.",
    feature: "Pure Timestamp Mathematics",
  },
  {
    icon: Brain,
    title: "Continuous Temporal ML",
    badge: "Dynamic Modeling",
    accent: "orange" as const,
    description: "Unlike static snapshots, our temporal models evaluate sliding psychomotor windows (30s–120s) to differentiate natural breaks from creeping cognitive exhaustion.",
    feature: "Sliding 30s-120s Windows",
  },
  {
    icon: HeartHandshake,
    title: "Ergonomic, Not Diagnostic",
    badge: "Wellness Centric",
    accent: "purple" as const,
    description: "Designed for pacing awareness, flow protection, and developer wellness—not medical pathology or corporate surveillance. You stay in control of your cognitive rhythm.",
    feature: "Flow Protection System",
  },
]

const STATS = [
  { value: "0%", label: "Keystroke Strings Or Text Logged", accent: "text-emerald-400", glow: "shadow-emerald-500/20", icon: Lock },
  { value: "240ms", label: "Baseline Reaction Vigilance", accent: "text-cyan-400", glow: "shadow-cyan-500/20", icon: Timer },
  { value: "4 States", label: "Normal • Focused • Fatigued • Overloaded", accent: "text-orange-400", glow: "shadow-orange-500/20", icon: Activity },
  { value: "< 5ms", label: "Real-time Telemetry Pipeline Latency", accent: "text-purple-400", glow: "shadow-purple-500/20", icon: Zap },
]

export default function AboutSection() {
  return (
    <section id="about" className="relative w-full py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* 1. Static Mesh Gradient Theme matching Hero (Zero Animation, full-width) */}
      <StaticSectionBackground glowSide="left" />

      <div className="relative z-10 max-w-7xl 2xl:max-w-[1550px] mx-auto">
        {/* 2. Top Header with 3D Holographic Pill Badge */}
        <div className="text-center max-w-4xl mx-auto mb-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-slate-950/80 border border-cyan-500/40 text-cyan-300 text-sm sm:text-base font-bold font-mono mb-6 shadow-[0_0_25px_rgba(6,182,212,0.25)] backdrop-blur-xl"
        >
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="tracking-wider">THE PHILOSOPHY BEHIND HUMANSIGNAL</span>
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1] drop-shadow-2xl"
        >
          Detect Fatigue & Stress <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-orange-400">
            Without Ever Asking the Person
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-7 text-slate-100 text-lg sm:text-xl md:text-2xl leading-relaxed font-normal max-w-3xl mx-auto"
        >
          Traditional monitoring relies on intrusive surveys or cameras that break your flow. 
          HumanSignal listens to the subtle psychomotor rhythms of ordinary interaction to understand mental state in real time.
        </motion.p>
      </div>

      {/* 3. Showstopper 3D Glass Master Card: Problem vs Non-Invasive Solution */}
      <div className="relative z-10 mb-24">
        <Glass3DCard accentColor="cyan" maxTilt={5} className="p-8 sm:p-12 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Problem Narrative */}
            <div className="lg:col-span-7 space-y-6 [transform:translateZ(30px)]">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-mono text-xs sm:text-sm font-bold tracking-wider uppercase backdrop-blur-md">
                <Compass className="w-4 h-4" />
                <span>The Problem With Asking "Are You Stressed?"</span>
              </div>

              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                Self-reports are slow, biased, and disrupt deep creative flow.
              </h3>

              <p className="text-slate-100 text-base sm:text-lg lg:text-xl leading-relaxed">
                By the time a developer, designer, or analyst feels exhausted enough to answer a survey, cognitive overload has already degraded performance. Psychomotor deceleration occurs minutes before conscious recognition.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 backdrop-blur-md">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/25 border border-rose-500/50 flex items-center justify-center text-rose-300 shrink-0 font-black text-base shadow-md">
                    ✕
                  </div>
                  <div>
                    <h5 className="text-white font-black text-lg sm:text-xl">Intrusive Pop-ups & Prompts</h5>
                    <p className="text-slate-200 text-sm sm:text-base mt-1 leading-relaxed">
                      Frequent surveys break concentration, fracture working memory, and induce prompt resentment.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 backdrop-blur-md">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/25 border border-rose-500/50 flex items-center justify-center text-rose-300 shrink-0 font-black text-base shadow-md">
                    ✕
                  </div>
                  <div>
                    <h5 className="text-white font-black text-lg sm:text-xl">Creepy Optical Surveillance</h5>
                    <p className="text-slate-200 text-sm sm:text-base mt-1 leading-relaxed">
                      Webcam tracking and gaze monitoring trigger surveillance anxiety and violate personal boundaries.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-transparent border border-emerald-400/50 backdrop-blur-md shadow-lg shadow-emerald-500/10">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/30 border border-emerald-400/70 flex items-center justify-center text-emerald-300 shrink-0 font-black text-base shadow-md">
                    ✓
                  </div>
                  <div>
                    <h5 className="text-emerald-300 font-black text-lg sm:text-xl">HumanSignal's Implicit Physics</h5>
                    <p className="text-slate-100 text-sm sm:text-base mt-1 leading-relaxed">
                      Zero cameras, zero text logging. Computes pure temporal differentials (flight times, pause skewness, kinematic jerk) with mathematical precision.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Holographic Signal Chamber */}
            <div className="lg:col-span-5 relative [transform:translateZ(45px)]">
              <div className="relative rounded-3xl overflow-hidden border border-white/20 bg-slate-950/90 backdrop-blur-2xl p-7 shadow-2xl shadow-cyan-500/10">
                {/* Visual Glass Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                    <span className="font-mono text-sm sm:text-base font-bold text-cyan-200 tracking-wider">
                      LIVE PSYCHOMOTOR STREAM
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-500/50 font-mono text-xs sm:text-sm text-cyan-300 font-bold">
                    Δt &lt; 1ms
                  </span>
                </div>

                {/* Simulated Real-Time Waveform Display */}
                <div className="relative h-48 rounded-2xl bg-black/70 border border-white/15 p-4 flex flex-col justify-between overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
                  
                  {/* Waveform Bars */}
                  <div className="relative z-10 flex items-end justify-between h-28 gap-1 pt-4">
                    {[45, 60, 35, 80, 95, 40, 70, 85, 30, 55, 90, 65, 40, 75, 88, 50, 65, 92, 38, 70].map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height: [`${h}%`, `${Math.max(20, (h * 1.3) % 100)}%`, `${h}%`],
                        }}
                        transition={{
                          duration: 2 + (i % 3) * 0.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className={`w-full rounded-t-sm ${
                          i % 4 === 0 
                            ? "bg-gradient-to-t from-orange-500 to-amber-300 shadow-[0_0_10px_#ea580c]" 
                            : "bg-gradient-to-t from-cyan-500 to-sky-300 shadow-[0_0_10px_#06b6d4]"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="relative z-10 flex items-center justify-between text-xs sm:text-sm font-mono text-slate-300 pt-2 border-t border-white/10 font-bold">
                    <span>Sampling: 1000Hz</span>
                    <span className="text-cyan-300">Entropy: 0.84 (Flow)</span>
                  </div>
                </div>

                {/* Telemetry Metric Readouts */}
                <div className="grid grid-cols-2 gap-4 mt-5">
                  <div className="p-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md">
                    <span className="text-xs sm:text-sm font-mono text-slate-300 font-bold block uppercase tracking-wider">Flight Delta (Δt)</span>
                    <span className="text-xl sm:text-2xl font-black font-mono text-white mt-1 block">112.4 ms</span>
                    <span className="text-xs text-emerald-400 font-bold font-mono">Normal variance</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md">
                    <span className="text-xs sm:text-sm font-mono text-slate-300 font-bold block uppercase tracking-wider">Kinematic Jerk</span>
                    <span className="text-xl sm:text-2xl font-black font-mono text-orange-400 mt-1 block">0.14 m/s³</span>
                    <span className="text-xs text-cyan-300 font-bold font-mono">Ballistic precision</span>
                  </div>
                </div>

                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-slate-900/80 border border-cyan-500/40 text-center">
                  <p className="text-sm sm:text-base font-semibold text-white">
                    "Observing the cadence of touch, never the content of thought."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Glass3DCard>
      </div>

      {/* 4. Four Core Pillars: 3D Interactive Tilt Glass Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 mb-20">
        {ABOUT_PILLARS.map((pillar, idx) => {
          const Icon = pillar.icon
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
              className="h-full"
            >
              <Glass3DCard
                accentColor={pillar.accent}
                maxTilt={12}
                className="p-8 flex flex-col justify-between"
              >
                <div>
                  {/* Top Floating Badge & 3D Glowing Icon */}
                  <div className="flex items-center justify-between mb-6 [transform:translateZ(35px)]">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.08] border border-white/20 flex items-center justify-center text-white backdrop-blur-xl shadow-xl shadow-cyan-500/10 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-cyan-300" />
                    </div>
                    <span className="px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/20 text-xs sm:text-sm font-mono font-bold text-slate-200 tracking-wider">
                      {pillar.badge}
                    </span>
                  </div>

                  {/* 3D Elevated Title */}
                  <h4 className="text-2xl sm:text-3xl font-black text-white mb-3.5 group-hover:text-cyan-300 transition-colors [transform:translateZ(25px)]">
                    {pillar.title}
                  </h4>

                  {/* Body Text */}
                  <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-normal [transform:translateZ(15px)]">
                    {pillar.description}
                  </p>
                </div>

                {/* Bottom Spec Chip */}
                <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between text-sm font-mono [transform:translateZ(20px)]">
                  <span className="text-slate-300 font-semibold">Spec:</span>
                  <span className="text-cyan-300 font-black">{pillar.feature}</span>
                </div>
              </Glass3DCard>
            </motion.div>
          )
        })}
      </div>

      {/* 5. 3D Floating Glass Stats Ribbon */}
      <div className="relative z-10">
        <Glass3DCard accentColor="cyan" maxTilt={4} className="p-8 sm:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            {STATS.map((stat, idx) => {
              const StatIcon = stat.icon
              return (
                <div key={idx} className="text-center p-4 [transform:translateZ(25px)]">
                  <div className="inline-flex p-3 rounded-2xl bg-white/[0.08] border border-white/20 mb-3.5 text-cyan-300 shadow-md">
                    <StatIcon className="w-6 h-6" />
                  </div>
                  <div className={`text-4xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight drop-shadow-xl ${stat.accent}`}>
                    {stat.value}
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-100 mt-2.5 max-w-[240px] mx-auto leading-snug">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>
        </Glass3DCard>
      </div>
      </div>
    </section>
  )
}
