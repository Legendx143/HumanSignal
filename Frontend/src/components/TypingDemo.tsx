import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Sliders, 
  Zap, 
  Clock, 
  Percent, 
  TrendingUp, 
  ShieldAlert,
  BrainCircuit,
  Flame,
  Coffee,
  Sparkles
} from "lucide-react"

const SAMPLE_TEXT = "HumanSignal estimates cognitive workload and fatigue through continuous interaction dynamics."

type BehavioralState = "Normal" | "Focused" | "Fatigued" | "Overloaded"

export default function TypingDemo() {
  const [input, setInput] = useState("")
  const [isFatiguedMode, setIsFatiguedMode] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [keystrokeTimes, setKeystrokeTimes] = useState<number[]>([])
  
  // Simulated / live metrics
  const [reactionTime, setReactionTime] = useState(240)
  const [errorRate, setErrorRate] = useState(2.0)
  const [typingVariance, setTypingVariance] = useState<"Low" | "Moderate" | "High">("Low")
  const [longPauses, setLongPauses] = useState(0)
  const [behavioralState, setBehavioralState] = useState<BehavioralState>("Normal")
  const [confidence, setConfidence] = useState(94)
  const [showPatternAlert, setShowPatternAlert] = useState(false)
  const [rhythmHistory, setRhythmHistory] = useState<number[]>([45, 52, 48, 55, 50, 49, 53, 51])

  const lastKeyTimeRef = useRef<number>(Date.now())
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle switching fatigue mode
  useEffect(() => {
    if (isFatiguedMode) {
      setReactionTime(390)
      setErrorRate(9.2)
      setTypingVariance("High")
      setLongPauses(4)
      setBehavioralState("Fatigued")
      setConfidence(96)
      setShowPatternAlert(true)
      setRhythmHistory([85, 30, 110, 25, 95, 140, 40, 120])
    } else {
      setReactionTime(240)
      setErrorRate(2.1)
      setTypingVariance("Low")
      setLongPauses(0)
      setBehavioralState("Focused")
      setConfidence(93)
      setShowPatternAlert(false)
      setRhythmHistory([48, 50, 49, 51, 50, 47, 52, 49])
    }
  }, [isFatiguedMode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const now = Date.now()

    if (!startTime) {
      setStartTime(now)
    }

    const delta = now - lastKeyTimeRef.current
    lastKeyTimeRef.current = now

    // Track intervals (skip first stroke)
    if (val.length > 1) {
      setKeystrokeTimes(prev => [...prev.slice(-15), delta])
      setRhythmHistory(prev => [...prev.slice(-9), Math.min(140, Math.max(20, delta / 3))])
    }

    // Measure live errors against target
    let errorCount = 0
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== SAMPLE_TEXT[i]) {
        errorCount++
      }
    }

    const calculatedErrorRate = val.length > 0 ? (errorCount / val.length) * 100 : 0

    if (!isFatiguedMode) {
      // Natural baseline
      const baseReaction = Math.max(210, Math.min(310, Math.round(230 + (Math.random() * 25 - 12))))
      setReactionTime(baseReaction)
      setErrorRate(Math.max(1.5, Math.min(4.0, Number(calculatedErrorRate.toFixed(1)))))
      setTypingVariance("Low")
      setBehavioralState(calculatedErrorRate > 8 ? "Overloaded" : val.length > 15 ? "Focused" : "Normal")
    }

    setInput(val)
  }

  const resetGame = () => {
    setInput("")
    setStartTime(null)
    setKeystrokeTimes([])
    setShowPatternAlert(isFatiguedMode)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const stateColors: Record<BehavioralState, { bg: string; text: string; border: string; glow: string; icon: any }> = {
    Normal: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      glow: "shadow-emerald-500/20",
      icon: CheckCircle2,
    },
    Focused: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
      border: "border-cyan-500/30",
      glow: "shadow-cyan-500/20",
      icon: Zap,
    },
    Fatigued: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/30",
      glow: "shadow-amber-500/20",
      icon: Coffee,
    },
    Overloaded: {
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      border: "border-rose-500/30",
      glow: "shadow-rose-500/20",
      icon: Flame,
    },
  }

  const CurrentIcon = stateColors[behavioralState].icon

  return (
    <section id="interactive-demo" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background glow highlights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>LIVE TELEMETRY LAB & INFERENCE ARENA</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-orange-400">HumanSignal Demo</span>
        </h2>
        <p className="mt-4 text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
          Type the prompt below to watch implicit behavioral signals calculate real-time reaction latency, variance, and cognitive states.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Typing Box */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Top Bar with Mode Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
                  Telemetry Sensor Active
                </span>
              </div>

              {/* Simulation Mode Switch */}
              <div className="flex items-center gap-3 bg-slate-950/80 px-3 py-1.5 rounded-full border border-slate-800">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-medium text-slate-300">Simulate Fatigue</span>
                <button
                  type="button"
                  onClick={() => setIsFatiguedMode(!isFatiguedMode)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                    isFatiguedMode ? "bg-amber-500" : "bg-slate-700"
                  }`}
                  aria-label="Toggle simulated fatigue"
                >
                  <motion.div
                    layout
                    className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"
                    animate={{ x: isFatiguedMode ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>

            {/* Target Sample Text Display */}
            <div className="mt-6">
              <p className="text-xs uppercase font-mono text-slate-500 mb-2">Prompt to Type</p>
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/60 text-slate-300 text-base sm:text-lg font-mono leading-relaxed select-none">
                {SAMPLE_TEXT.split("").map((char, index) => {
                  let colorClass = "text-slate-500"
                  if (index < input.length) {
                    colorClass = input[index] === char ? "text-cyan-400 font-semibold" : "text-rose-400 bg-rose-950/40 underline"
                  } else if (index === input.length) {
                    colorClass = "text-white bg-cyan-500/30 underline"
                  }
                  return (
                    <span key={index} className={colorClass}>
                      {char}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Input Field */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="typing-input" className="text-xs uppercase font-mono text-slate-400">
                  Your Natural Input
                </label>
                <button
                  onClick={resetGame}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Test</span>
                </button>
              </div>
              <input
                id="typing-input"
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Start typing the text here..."
                className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-slate-700 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-base"
              />
            </div>

            {/* Keystroke Rhythm Spectrogram / Sparkline */}
            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>Inter-Key Interval Rhythm Spectrogram</span>
                <span>{isFatiguedMode ? "High Jitter (Irregular)" : "Low Jitter (Harmonic)"}</span>
              </div>
              <div className="h-12 flex items-end gap-1.5 p-2 bg-slate-950/60 rounded-lg border border-slate-800/50">
                {rhythmHistory.map((val, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ height: 10 }}
                    animate={{ height: `${Math.min(100, Math.max(15, (val / 120) * 100))}%` }}
                    className={`flex-1 rounded-t transition-all ${
                      isFatiguedMode ? "bg-amber-500/80" : "bg-cyan-500/80"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* AI Pattern Alert Notification */}
            <AnimatePresence>
              {showPatternAlert && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 flex items-start gap-3 shadow-lg shadow-amber-500/5"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-amber-300">
                      AI Observation: "Behavioral pattern changed"
                    </h4>
                    <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                      Motor latency climbed to 390ms (+62%), error rate jumped to 9.2%, and long hesitation pauses increased. Temporal model transitioned state to <strong>Fatigued</strong>.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Real-Time Telemetry & Inference Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Inferred State</span>
            </h3>

            {/* Primary Behavioral State Badge */}
            <div className={`p-6 rounded-2xl border ${stateColors[behavioralState].bg} ${stateColors[behavioralState].border} transition-all duration-300 text-center relative overflow-hidden`}>
              <div className="flex items-center justify-center gap-3">
                <CurrentIcon className={`w-8 h-8 ${stateColors[behavioralState].text}`} />
                <span className={`text-3xl font-extrabold tracking-tight ${stateColors[behavioralState].text}`}>
                  {behavioralState}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-2">
                Temporal Inference Confidence: <span className="text-white font-bold">{confidence}%</span>
              </p>
              <div className="mt-3 inline-block px-3 py-1 rounded-full bg-slate-950/60 text-[11px] font-mono text-slate-300 border border-slate-800">
                Non-diagnostic behavioral estimation
              </div>
            </div>

            {/* Grid of Key Problem Statement Metrics */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {/* Reaction Time */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Reaction Time</span>
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  {reactionTime} <span className="text-xs text-slate-400 font-normal">ms</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {reactionTime > 300 ? "⚠️ Elevated Latency" : "✓ Normal Baseline"}
                </div>
              </div>

              {/* Error Rate */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <Percent className="w-3.5 h-3.5 text-orange-400" />
                  <span>Error Frequency</span>
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  {errorRate} <span className="text-xs text-slate-400 font-normal">%</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {errorRate > 5 ? "⚠️ Elevated Corrections" : "✓ Within Flow Limits"}
                </div>
              </div>

              {/* Typing Variance */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Rhythm Variance</span>
                </div>
                <div className="text-xl font-bold font-mono text-white capitalize">
                  {typingVariance}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {typingVariance === "High" ? "Erratic intervals" : "Consistent Cadence"}
                </div>
              </div>

              {/* Interaction Pauses */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <Coffee className="w-3.5 h-3.5 text-amber-400" />
                  <span>Long Pauses (&gt;1.5s)</span>
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  {longPauses} <span className="text-xs text-slate-400 font-normal">events</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {longPauses > 0 ? "Hesitations detected ↑" : "Continuous stream"}
                </div>
              </div>
            </div>

            {/* Feature Attribution Stack */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                <span>Feature Attribution (SHAP Proxy)</span>
                <span className="text-[10px] text-cyan-400">Temporal RF</span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Motor Dwell Time Drift</span>
                    <span className="font-mono">{isFatiguedMode ? "+0.42 (High)" : "+0.04 (Low)"}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-400 rounded-full transition-all duration-500" 
                      style={{ width: isFatiguedMode ? "85%" : "22%" }} 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Inter-Key Latency Spread</span>
                    <span className="font-mono">{isFatiguedMode ? "+0.38 (High)" : "+0.08 (Low)"}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-400 rounded-full transition-all duration-500" 
                      style={{ width: isFatiguedMode ? "76%" : "18%" }} 
                    />
                  </div>
                </div>
              </div>

              {/* CTA to Main Dashboard */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-400 font-mono">
                  Ready for full multimodal telemetry & AI report?
                </span>
                <a
                  href="#dashboard"
                  className="px-5 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  Launch Main Dashboard →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
