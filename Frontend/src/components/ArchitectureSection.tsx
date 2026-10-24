import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Cpu, 
  Layers, 
  Workflow, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Coffee, 
  Flame,
  ShieldCheck,
  ArrowRight,
  Sliders
} from "lucide-react"
import StaticSectionBackground from "@/components/ui/static-background"
import Glass3DCard from "@/components/ui/glass-card"

const PIPELINE_STEPS = [
  {
    step: "01",
    title: "Frontend Events",
    subtitle: "Passive Interaction Capture",
    desc: "Collects key press/release timestamps, typing rhythm (IKI), pause durations & frequency, corrections count (without storing text), and mouse movement speed/variability with consent.",
    icon: Workflow,
    accent: "cyan" as const,
    tech: "Zero-Raw-Text Frontend",
  },
  {
    step: "02",
    title: "FastAPI Backend",
    subtitle: "Asynchronous REST & WebSockets",
    desc: "Ingests buffered telemetry events via high-throughput endpoints (/api/session/events and /predict) with session isolation and zero persistence of raw sensitive content.",
    icon: Layers,
    accent: "orange" as const,
    tech: "FastAPI Python 3.13",
  },
  {
    step: "03",
    title: "Feature Engineering",
    subtitle: "Exact 20 Model Inputs",
    desc: "Calculates the same 20 features using the exact dataset preprocessing: standard deviations, 30s rolling means, and population-normalized Z-scores across psychomotor signals.",
    icon: Sliders,
    accent: "emerald" as const,
    tech: "20-Feature Pipeline",
  },
  {
    step: "04",
    title: "Trained ML Model",
    subtitle: "Joblib Ensemble Inference",
    desc: "Executes inference using the trained humansignal_realtime_candidate.joblib ensemble classifier to output probabilistic confidence distributions across states.",
    icon: Cpu,
    accent: "cyan" as const,
    tech: "Random Forest / Extra Trees",
  },
  {
    step: "05",
    title: "State Prediction",
    subtitle: "4 Operational Cognitive States",
    desc: "Probabilistic classification into Normal, Focused, Fatigued, or Overloaded, updating the sequential state history timeline (e.g. Normal → Focused → Fatigued).",
    icon: CheckCircle2,
    accent: "purple" as const,
    tech: "State Classification",
  },
  {
    step: "06",
    title: "OpenRouter Suggestions",
    subtitle: "Targeted Micro-Interventions",
    desc: "Generates tailored, actionable ergonomic recommendations via OpenRouter LLM when Fatigued or Overloaded persists, restoring cognitive clarity and preventing burnout.",
    icon: Sparkles,
    accent: "purple" as const,
    tech: "OpenRouter API",
  },
]

const STATES_MATRIX = [
  {
    id: "normal",
    name: "Normal",
    icon: CheckCircle2,
    accent: "emerald" as const,
    badgeColor: "bg-emerald-500/20 border-emerald-400/50 text-emerald-300",
    color: "text-emerald-400",
    pacePrimary: "40 – 60 WPM",
    paceDetail: "Consistent, moderate baseline cadence",
    reactionValue: "220 – 260 ms",
    reactionStatus: "Alert Baseline",
    reactionColor: "text-emerald-300 bg-emerald-500/20 border-emerald-400/40",
    errorPrimary: "1% – 3%",
    errorDetail: "Standard typist baseline error rate",
    mouseDetail: "Smooth direct trajectories, predictable acceleration",
    inference: "Standard operating workload; sustainable cognitive balance.",
    statusIndicator: "Stable Rhythm",
  },
  {
    id: "focused",
    name: "Focused",
    icon: Zap,
    accent: "cyan" as const,
    badgeColor: "bg-cyan-500/20 border-cyan-400/50 text-cyan-300",
    color: "text-cyan-400",
    pacePrimary: "High Cadence",
    paceDetail: "Automated rhythm, ultra-low flight jitter",
    reactionValue: "200 – 240 ms",
    reactionStatus: "Peak Vigilance",
    reactionColor: "text-cyan-300 bg-cyan-500/20 border-cyan-400/40",
    errorPrimary: "< 2%",
    errorDetail: "Fluent self-correction, zero thrashing",
    mouseDetail: "Direct ballistic paths with minimal overshoot",
    inference: "Deep cognitive engagement / Flow state; do not interrupt.",
    statusIndicator: "Peak Flow",
  },
  {
    id: "fatigued",
    name: "Fatigued",
    icon: Coffee,
    accent: "amber" as const,
    badgeColor: "bg-amber-500/20 border-amber-400/50 text-amber-300",
    color: "text-amber-400",
    pacePrimary: "Motor Decay",
    paceDetail: "Decelerating pace, prolonged dwell times",
    reactionValue: "350 – 430 ms",
    reactionStatus: "+60% Latency Drift",
    reactionColor: "text-amber-300 bg-amber-500/20 border-amber-400/40",
    errorPrimary: "6% – 12%",
    errorDetail: "Delayed error detection, sluggish corrections",
    mouseDetail: "Sluggish velocity vectors and lingering idle pauses",
    inference: "Psychomotor depletion; recommend 5-min cognitive break.",
    statusIndicator: "Rest Needed",
  },
  {
    id: "overloaded",
    name: "Overloaded",
    icon: Flame,
    accent: "rose" as const,
    badgeColor: "bg-rose-500/20 border-rose-400/50 text-rose-300",
    color: "text-rose-400",
    pacePrimary: "Erratic Bursts",
    paceDetail: "Rapid frantic input separated by abrupt stalls",
    reactionValue: "420 – 550+ ms",
    reactionStatus: "Acute Strain",
    reactionColor: "text-rose-300 bg-rose-500/20 border-rose-400/40",
    errorPrimary: "> 10%",
    errorDetail: "Bursty repeated backspacing and rewrites",
    mouseDetail: "Elevated kinematic jerk with high trajectory entropy",
    inference: "Acute cognitive strain / frustration; suggest task pacing.",
    statusIndicator: "Strain Alert",
  },
]

export default function ArchitectureSection() {
  const [selectedState, setSelectedState] = useState<string>("focused")

  return (
    <section id="architecture" className="relative w-full py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div id="pipeline" className="absolute -top-10" />
      {/* 1. Static Mesh Gradient Theme matching Hero (Zero Animation, full-width) */}
      <StaticSectionBackground glowSide="center" />

      <div className="relative z-10 max-w-7xl 2xl:max-w-[1650px] mx-auto">
        {/* 2. Top Header with 3D Holographic Badge */}
        <div className="text-center max-w-4xl mx-auto mb-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-slate-950/80 border border-cyan-500/40 text-cyan-300 text-sm sm:text-base font-bold font-mono mb-6 shadow-[0_0_25px_rgba(6,182,212,0.25)] backdrop-blur-xl"
        >
          <Workflow className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="tracking-wider">END-TO-END INFERENCE PIPELINE</span>
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1] drop-shadow-2xl"
        >
          How Behavioral Signals Become <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-orange-400">
            State Intelligence
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-slate-100 text-lg sm:text-xl md:text-2xl leading-relaxed font-normal max-w-3xl mx-auto"
        >
          From microsecond input events to rolling temporal normalization and sequence classification without recording user content.
        </motion.p>
      </div>

      {/* 3. Four Pipeline Step Cards with 3D Tilt & Flow Connectors */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
        {PIPELINE_STEPS.map((step, idx) => {
          const StepIcon = step.icon
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
              className="relative h-full"
            >
              <Glass3DCard
                accentColor={step.accent}
                maxTilt={12}
                className="p-8 flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: 3D Step Number and Glowing Icon Orb */}
                  <div className="flex items-center justify-between mb-6 [transform:translateZ(40px)]">
                    <span className="text-5xl sm:text-6xl font-black font-mono text-white/40 group-hover:text-cyan-400 transition-colors">
                      {step.step}
                    </span>
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.08] border border-white/20 flex items-center justify-center text-white backdrop-blur-xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <StepIcon className="w-8 h-8 text-cyan-300" />
                    </div>
                  </div>

                  {/* Step Title & Subtitle */}
                  <div className="[transform:translateZ(25px)]">
                    <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-cyan-300 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base font-mono text-cyan-300 font-bold mt-1.5 mb-4">
                      {step.subtitle}
                    </p>
                  </div>

                  {/* Step Description */}
                  <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-normal [transform:translateZ(15px)]">
                    {step.desc}
                  </p>
                </div>

                {/* Bottom Tech Badge */}
                <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between text-sm font-mono [transform:translateZ(20px)]">
                  <span className="text-slate-300 font-semibold">Core Engine:</span>
                  <span className="text-cyan-300 font-black">{step.tech}</span>
                </div>
              </Glass3DCard>

              {/* Connecting Holographic Arrow for Desktop */}
              {idx < PIPELINE_STEPS.length - 1 && (
                <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-950 border border-cyan-500/50 items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)] pointer-events-none">
                  <ArrowRight className="w-4 h-4 animate-pulse" />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* 4. The Four Behavioral States: 3D Glass Command Matrix */}
      <div className="relative z-10">
        <Glass3DCard accentColor="cyan" maxTilt={2} className="p-6 sm:p-8 lg:p-10">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 [transform:translateZ(25px)]">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-mono text-xs sm:text-sm font-bold tracking-wider uppercase mb-3 backdrop-blur-md">
                <Sliders className="w-4 h-4" />
                <span>Operational State Space</span>
              </div>
              <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                The Four Behavioral States
              </h3>
              <p className="text-lg sm:text-xl text-slate-100 mt-2 font-normal">
                Comparative psychomotor signatures across all telemetry dimensions.
              </p>
            </div>

            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/90 border border-white/20 text-sm sm:text-base font-mono text-white shadow-xl backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 text-cyan-400 shrink-0" />
              <span className="font-bold">Non-Diagnostic Behavioral Framework</span>
            </div>
          </div>

          {/* 4 3D Glass State Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 [transform:translateZ(30px)]">
            {STATES_MATRIX.map((item, idx) => {
              const StateIcon = item.icon
              const isSelected = selectedState === item.id
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedState(item.id)}
                  className={`group relative rounded-3xl p-6 sm:p-7 xl:p-8 border transition-all duration-300 cursor-pointer flex flex-col justify-between backdrop-blur-2xl ${
                    isSelected
                      ? "bg-slate-900/95 border-white/30 shadow-[0_25px_60px_rgba(0,0,0,0.8)] scale-[1.02]"
                      : "bg-slate-950/70 border-white/10 hover:border-white/25 hover:bg-slate-900/80 hover:shadow-2xl"
                  }`}
                >
                  <div>
                    {/* Top Row: State Icon & Title */}
                    <div className="flex items-center gap-4 mb-7 pb-4 border-b border-white/10">
                      <div className={`p-3.5 rounded-2xl bg-white/[0.08] border border-white/20 ${item.color} shadow-lg shadow-black/40 group-hover:scale-105 transition-transform duration-300`}>
                        <StateIcon className="w-8 h-8" />
                      </div>
                      <span className={`text-3xl sm:text-4xl font-black tracking-tight ${item.color}`}>
                        {item.name}
                      </span>
                    </div>

                    {/* Metrics Stack */}
                    <div className="space-y-4">
                      {/* Metric 1: Interaction Pace */}
                      <div className="p-4 rounded-2xl bg-black/70 border border-white/15 shadow-inner">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
                            Interaction Pace
                          </span>
                        </div>
                        <div className="text-base sm:text-lg font-black font-mono text-white tracking-tight">
                          {item.pacePrimary}
                        </div>
                        <div className="text-sm sm:text-base text-slate-100 mt-1 leading-relaxed font-normal">
                          {item.paceDetail}
                        </div>
                      </div>

                      {/* Metric 2: Reaction Latency */}
                      <div className="p-4 rounded-2xl bg-black/70 border border-white/15 shadow-inner">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
                            Reaction Latency
                          </span>
                          <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${item.reactionColor}`}>
                            {item.reactionStatus}
                          </span>
                        </div>
                        <div className="text-base sm:text-lg font-black font-mono text-white tracking-tight">
                          {item.reactionValue}
                        </div>
                      </div>

                      {/* Metric 3: Error Frequency */}
                      <div className="p-4 rounded-2xl bg-black/70 border border-white/15 shadow-inner">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
                            Error Frequency
                          </span>
                        </div>
                        <div className="text-base sm:text-lg font-black font-mono text-white tracking-tight">
                          {item.errorPrimary}
                        </div>
                        <div className="text-sm sm:text-base text-slate-100 mt-1 leading-relaxed font-normal">
                          {item.errorDetail}
                        </div>
                      </div>

                      {/* Metric 4: Mouse Kinematics */}
                      <div className="p-4 rounded-2xl bg-black/70 border border-white/15 shadow-inner">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
                            Mouse Kinematics
                          </span>
                        </div>
                        <div className="text-sm sm:text-base text-slate-100 font-normal leading-relaxed">
                          {item.mouseDetail}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Inference Quote */}
                  <div className="mt-6 pt-5 border-t border-white/10 p-4 rounded-2xl bg-white/[0.06] border border-white/15 text-sm sm:text-base text-white font-medium leading-relaxed italic shadow-md">
                    "{item.inference}"
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
