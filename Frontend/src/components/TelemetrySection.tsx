import React from "react"
import { motion } from "framer-motion"
import { 
  Keyboard, 
  MousePointer2, 
  Gauge, 
  Split, 
  Delete, 
  PauseCircle, 
  ShieldCheck, 
  EyeOff
} from "lucide-react"
import StaticSectionBackground from "@/components/ui/static-background"
import Glass3DCard from "@/components/ui/glass-card"

const TELEMETRY_MODALITIES = [
  {
    id: "01",
    icon: Keyboard,
    title: "Typing Rhythm",
    subtitle: "Dwell & Flight Times (Δt)",
    accent: "cyan" as const,
    badge: "Temporal Dynamics",
    description: "Measures millisecond intervals between key press and release without storing text strings. Cadence jitter and flight-time variance reveal psychomotor deceleration.",
    metricLabel: "Dwell Precision",
    metricValue: "±1.2 ms",
    weight: "96% Correlation",
    visual: "cadence",
  },
  {
    id: "02",
    icon: MousePointer2,
    title: "Mouse Kinematics",
    subtitle: "Jerk & Velocity Vectors",
    accent: "orange" as const,
    badge: "Motor Control",
    description: "Tracks cursor curvature, sub-movement counts, and kinematic jerk. Erratic micro-jitters correlate with acute cognitive overload and decision frustration.",
    metricLabel: "Trajectory Entropy",
    metricValue: "0.28 d²/dt²",
    weight: "91% Correlation",
    visual: "vectors",
  },
  {
    id: "03",
    icon: Gauge,
    title: "Reaction Time",
    subtitle: "Stimulus-to-Action Latency",
    accent: "emerald" as const,
    badge: "Cognitive Vigilance",
    description: "Evaluates the delay between task prompts and initial motor events. Vigilance depletion consistently drifts reaction latencies from 240ms up to 390ms+.",
    metricLabel: "Vigilance Latency",
    metricValue: "248 ms",
    weight: "94% Correlation",
    visual: "gauge",
  },
  {
    id: "04",
    icon: Split,
    title: "Task Switching",
    subtitle: "Context Churn & Attention",
    accent: "purple" as const,
    badge: "Focus Continuity",
    description: "Monitors the frequency and duration of window and tab alternations. Excessive fragmented switches signal cognitive thrashing and divided attention.",
    metricLabel: "Context Churn",
    metricValue: "3.2 sw/min",
    weight: "89% Correlation",
    visual: "switching",
  },
  {
    id: "05",
    icon: Delete,
    title: "Error Frequency",
    subtitle: "Correction Bursts & Backspaces",
    accent: "rose" as const,
    badge: "Working Memory Load",
    description: "Quantifies the ratio of delete/backspace operations to constructive inputs. Bursty rapid backspaces reflect working memory slip and acute mental strain.",
    metricLabel: "Correction Burst",
    metricValue: "1.8% baseline",
    weight: "93% Correlation",
    visual: "bursts",
  },
  {
    id: "06",
    icon: PauseCircle,
    title: "Interaction Pauses",
    subtitle: "Micro vs Macro Hesitations",
    accent: "amber" as const,
    badge: "Decision Flow",
    description: "Differentiates between healthy syntactical pauses (300ms) and cognitive blocks (>2000ms). Prolonged idle staring indicates impending cognitive exhaustion.",
    metricLabel: "Hesitation Skew",
    metricValue: "0.34s index",
    weight: "90% Correlation",
    visual: "pauses",
  },
]

export default function TelemetrySection() {
  return (
    <section id="features" className="relative w-full py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* 1. Static Mesh Gradient Theme matching Hero (Zero Animation, full-width) */}
      <StaticSectionBackground glowSide="right" />

      <div className="relative z-10 max-w-7xl 2xl:max-w-[1550px] mx-auto">
        {/* 2. Top Header & 3D Glass Privacy Guarantee */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-slate-950/80 border border-cyan-500/40 text-cyan-300 text-sm sm:text-base font-bold font-mono mb-6 shadow-[0_0_25px_rgba(6,182,212,0.25)] backdrop-blur-xl"
          >
            <EyeOff className="w-5 h-5 text-cyan-400" />
            <span className="tracking-wider">ZERO INVASIVE SENSORS • NO WEBCAM • NO KEYLOGGING</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1] drop-shadow-2xl"
          >
            Six Implicit <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-orange-400">
              Behavioral Signals
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-slate-100 text-lg sm:text-xl md:text-2xl leading-relaxed font-normal"
          >
            Instead of interrupting focus with subjective self-report questionnaires, HumanSignal continuously derives psychomotor signatures from ordinary human-computer physics.
          </motion.p>
        </div>

        {/* 3D Glass Privacy Guarantee Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:max-w-md w-full"
        >
          <Glass3DCard accentColor="emerald" maxTilt={6} className="p-7">
            <div className="flex items-start gap-5 [transform:translateZ(25px)]">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0 shadow-lg shadow-emerald-500/25">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-white font-black text-lg sm:text-xl">
                  100% Privacy-Preserving Guarantee
                </h4>
                <p className="text-slate-200 text-sm sm:text-base mt-1.5 leading-relaxed font-normal">
                  No keystroke text strings or URLs are ever recorded. Only millisecond delta timestamps (Δt) and kinematic velocity vectors are processed.
                </p>
              </div>
            </div>
          </Glass3DCard>
        </motion.div>
      </div>

      {/* 3. The 6 Modality Cards: 3D Interactive Glass Sensor Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {TELEMETRY_MODALITIES.map((modality, idx) => {
          const Icon = modality.icon
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="h-full"
            >
              <Glass3DCard
                accentColor={modality.accent}
                maxTilt={12}
                className="p-8 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: 3D Floated Number & Category Badge */}
                  <div className="flex items-center justify-between mb-6 [transform:translateZ(30px)]">
                    <span className="font-mono text-3xl font-black text-white/50">
                      #{modality.id}
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/20 text-xs sm:text-sm font-mono font-bold text-cyan-200 shadow-sm">
                      {modality.badge}
                    </span>
                  </div>

                  {/* 3D Glowing Icon Orb */}
                  <div className="mb-6 [transform:translateZ(45px)]">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.08] border border-white/20 flex items-center justify-center text-white backdrop-blur-xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-cyan-300" />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="[transform:translateZ(25px)]">
                    <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-cyan-300 transition-colors">
                      {modality.title}
                    </h3>
                    <p className="text-sm sm:text-base font-mono text-cyan-300 font-bold mt-1.5 mb-5">
                      {modality.subtitle}
                    </p>
                  </div>

                  {/* Interactive 3D Mini Signal Visualizer */}
                  <div className="mb-6 p-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md [transform:translateZ(30px)] overflow-hidden">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-slate-300 mb-2.5">
                      <span className="font-semibold uppercase tracking-wider">{modality.metricLabel}</span>
                      <span className="text-white font-black text-sm sm:text-base">{modality.metricValue}</span>
                    </div>

                    {/* Sensor Graphic simulation */}
                    {modality.visual === "cadence" && (
                      <div className="flex items-end gap-1 h-9 pt-1">
                        {[40, 65, 30, 85, 50, 70, 95, 40, 60, 80, 55, 90].map((val, i) => (
                          <div
                            key={i}
                            style={{ height: `${val}%` }}
                            className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan-600 to-cyan-300 shadow-[0_0_8px_#06b6d4]"
                          />
                        ))}
                      </div>
                    )}

                    {modality.visual === "vectors" && (
                      <div className="relative h-9 flex items-center">
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-1/3 h-full bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_10px_#ea580c]"
                          />
                        </div>
                      </div>
                    )}

                    {modality.visual === "gauge" && (
                      <div className="flex items-center gap-2.5 h-9">
                        <div className="flex-1 bg-white/10 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-400 h-full w-[65%] rounded-full shadow-[0_0_8px_#10b981]" />
                        </div>
                        <span className="text-xs sm:text-sm font-mono text-emerald-300 font-bold">Optimal</span>
                      </div>
                    )}

                    {modality.visual === "switching" && (
                      <div className="flex items-center gap-1.5 h-9">
                        {[1, 2, 3, 4, 5, 6].map((blk, i) => (
                          <div
                            key={i}
                            className={`h-5 rounded flex-1 ${
                              i === 2 || i === 4 ? "bg-purple-500/90 shadow-[0_0_8px_#a855f7]" : "bg-white/15"
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {modality.visual === "bursts" && (
                      <div className="flex items-center justify-between h-9 text-xs sm:text-sm font-mono">
                        <span className="text-rose-300 font-bold">12 Backspaces / min</span>
                        <div className="flex gap-1.5">
                          {[1, 2, 3].map((_, i) => (
                            <div key={i} className="w-2.5 h-5 bg-rose-400 rounded-sm animate-pulse shadow-[0_0_6px_#f43f5e]" />
                          ))}
                        </div>
                      </div>
                    )}

                    {modality.visual === "pauses" && (
                      <div className="flex items-center justify-between h-9 text-xs sm:text-sm font-mono">
                        <span className="text-amber-200 font-bold">Hesitation Skew: Low</span>
                        <div className="w-20 h-2.5 bg-amber-400/30 rounded-full overflow-hidden">
                          <div className="w-10 h-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-normal [transform:translateZ(15px)]">
                    {modality.description}
                  </p>
                </div>

                {/* Footer Telemetry Specs */}
                <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between text-sm font-mono [transform:translateZ(20px)]">
                  <span className="text-slate-300 font-semibold">{modality.weight}</span>
                  <span className="text-cyan-300 font-bold group-hover:text-cyan-200 transition-colors">
                    Live Extracted →
                  </span>
                </div>
              </Glass3DCard>
            </motion.div>
          )
        })}
      </div>
      </div>
    </section>
  )
}
