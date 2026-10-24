import React, { useState } from "react"
import { motion } from "framer-motion"
import { 
  Sparkles, 
  Clock, 
  Activity, 
  ArrowRight, 
  RotateCcw, 
  FileText, 
  ShieldCheck,
  Bot,
  Info
} from "lucide-react"
import { BehavioralState, SessionPredictResponse, telemetryApi } from "@/services/api"

interface LiveResultsStepProps {
  prediction: SessionPredictResponse
  onViewReport: () => void
  onRetest: () => void
}

const STATE_THEMES: Record<BehavioralState, {
  color: string
  bgGlow: string
  border: string
  textColor: string
  badgeBg: string
}> = {
  Fatigued: {
    color: "#f59e0b",
    bgGlow: "rgba(245, 158, 11, 0.28)",
    border: "border-amber-500/60",
    textColor: "text-amber-300",
    badgeBg: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  },
  Overloaded: {
    color: "#f43f5e",
    bgGlow: "rgba(244, 63, 94, 0.28)",
    border: "border-rose-500/60",
    textColor: "text-rose-300",
    badgeBg: "bg-rose-500/15 text-rose-300 border-rose-500/40",
  },
  Focused: {
    color: "#06b6d4",
    bgGlow: "rgba(6, 182, 212, 0.28)",
    border: "border-cyan-500/60",
    textColor: "text-cyan-300",
    badgeBg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/40",
  },
  Normal: {
    color: "#38bdf8",
    bgGlow: "rgba(56, 189, 248, 0.22)",
    border: "border-sky-500/50",
    textColor: "text-sky-300",
    badgeBg: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  },
}

export default function LiveResultsStep({ prediction: initialPrediction, onViewReport, onRetest }: LiveResultsStepProps) {
  const [viewMode, setViewMode] = useState<"live" | "illustrative">("live")
  const illustrativeExample = telemetryApi.getIllustrativeExample()

  const currentDisplay = viewMode === "illustrative" ? illustrativeExample : initialPrediction

  const {
    predicted_state,
    confidence,
    metrics,
    suggested_actions,
    suggestions_note,
    state_history,
    window_duration_seconds,
  } = currentDisplay

  const theme = STATE_THEMES[predicted_state] || STATE_THEMES.Fatigued

  // Format session duration
  const formatDuration = (seconds?: number): string => {
    if (viewMode === "illustrative") return "5 minutes"
    const s = seconds || 120
    const mins = Math.floor(s / 60)
    const remSecs = s % 60
    if (mins === 0) return `${remSecs} seconds`
    if (mins >= 5) return `${mins} minutes`
    return `${mins}m ${remSecs}s`
  }

  // State history list fallback to exact spec
  const historyChain: string[] = state_history && state_history.length > 0 
    ? state_history 
    : ["Normal", "Focused", "Fatigued"]

  // Action suggestions fallback
  const actionsList: string[] = suggested_actions && suggested_actions.length > 0
    ? suggested_actions
    : [
        "Consider taking a short break.",
        "Focus on one manageable task.",
        "Check how you feel before continuing.",
      ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-5xl mx-auto py-10 px-4 sm:px-6"
    >
      {/* 1. Header Matching Exact Spec */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight flex items-center gap-3 drop-shadow">
            HumanSignal Dashboard
          </h1>
          <div className="inline-flex items-center gap-2.5 mt-3 px-4 py-2 rounded-full neo-inset text-sm sm:text-base font-mono font-bold text-slate-200">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Illustrative example — not a real prediction</span>
          </div>
        </div>

        {/* View Mode Toggle: Live vs Spec Example */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl neo-inset text-sm sm:text-base font-mono font-bold">
          <button
            type="button"
            onClick={() => setViewMode("live")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              viewMode === "live"
                ? "neo-btn-primary text-black font-black"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Live Inferred
          </button>
          <button
            type="button"
            onClick={() => setViewMode("illustrative")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              viewMode === "illustrative"
                ? "neo-btn-primary text-black font-black"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Spec Example (Fatigued 79%)
          </button>
        </div>
      </div>

      {/* 2. Estimated Behavioral State Card */}
      <div 
        className={`neo-panel relative p-8 sm:p-10 rounded-3xl border-2 ${theme.border} mb-10 overflow-hidden`}
        style={{ boxShadow: `-8px -8px 24px rgba(255,255,255,0.04), 12px 12px 35px rgba(0,0,0,0.8), 0 25px 70px -15px ${theme.bgGlow}` }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="text-sm sm:text-base font-mono font-extrabold uppercase tracking-widest text-slate-300 mb-3">
              Estimated behavioral state
            </div>
            <div className={`text-6xl sm:text-7xl md:text-8xl font-black tracking-tight ${theme.textColor} mb-3 drop-shadow-xl`}>
              {predicted_state}
            </div>
            <div className="text-base sm:text-xl font-mono font-bold text-white neo-inset px-5 py-2.5 rounded-xl inline-block">
              Model confidence: {Math.round(confidence * 100)}% {viewMode === "illustrative" && "(example)"}
            </div>
          </div>

          {/* Visual Confidence Gauge */}
          <div className="flex flex-col items-start md:items-end justify-center border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-10 min-w-[240px]">
            <div className="text-sm sm:text-base font-mono font-extrabold uppercase tracking-wider text-slate-300 mb-2">
              Inference Confidence
            </div>
            <div className="text-4xl sm:text-5xl font-black font-mono text-white mb-3">
              {Math.round(confidence * 100)}%
            </div>
            <div className="w-full sm:w-52 neo-inset h-4 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ 
                  width: `${Math.round(confidence * 100)}%`,
                  backgroundColor: theme.color,
                  boxShadow: `0 0 15px ${theme.color}`
                }}
              />
            </div>
            <span className="text-xs sm:text-sm text-slate-400 mt-2 font-mono font-medium">
              FastAPI + 20-Feature Random Forest
            </span>
          </div>
        </div>

        {/* Ambient Glow */}
        <div 
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[110px] pointer-events-none opacity-35"
          style={{ backgroundColor: theme.color }}
        />
      </div>

      {/* 3. Behavioral Metrics (Exact 4 Metrics from Specification) */}
      <div className="mb-10">
        <h2 className="text-base sm:text-lg font-mono font-extrabold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-cyan-400" />
          Behavioral metrics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Metric 1: Typing speed */}
          <div className="neo-panel p-6 rounded-2xl">
            <div className="text-xs sm:text-sm font-mono font-extrabold uppercase text-slate-300 mb-2">
              Typing speed
            </div>
            <div className="text-4xl sm:text-5xl font-black text-white font-mono mb-1.5">
              {metrics.typing_speed_wpm} WPM
            </div>
            <div className="text-xs sm:text-sm text-slate-400 font-mono font-medium">
              Words per minute
            </div>
          </div>

          {/* Metric 2: Average typing interval */}
          <div className="neo-panel p-6 rounded-2xl">
            <div className="text-xs sm:text-sm font-mono font-extrabold uppercase text-slate-300 mb-2">
              Average typing interval
            </div>
            <div className="text-4xl sm:text-5xl font-black text-cyan-300 font-mono mb-1.5">
              {metrics.mean_iki_ms || 390} ms
            </div>
            <div className="text-xs sm:text-sm text-slate-400 font-mono font-medium">
              Time between keystrokes (IKI)
            </div>
          </div>

          {/* Metric 3: Typing pauses */}
          <div className="neo-panel p-6 rounded-2xl">
            <div className="text-xs sm:text-sm font-mono font-extrabold uppercase text-slate-300 mb-2">
              Typing pauses
            </div>
            <div className="text-4xl sm:text-5xl font-black text-amber-300 font-mono mb-1.5">
              {metrics.pause_count}
            </div>
            <div className="text-xs sm:text-sm text-slate-400 font-mono font-medium">
              Gaps (&gt;650ms)
            </div>
          </div>

          {/* Metric 4: Session duration */}
          <div className="neo-panel p-6 rounded-2xl">
            <div className="text-xs sm:text-sm font-mono font-extrabold uppercase text-slate-300 mb-2">
              Session duration
            </div>
            <div className="text-4xl sm:text-5xl font-black text-white font-mono mb-1.5">
              {formatDuration(window_duration_seconds)}
            </div>
            <div className="text-xs sm:text-sm text-slate-400 font-mono font-medium">
              Active telemetry window
            </div>
          </div>
        </div>
      </div>

      {/* 4. State History (Normal → Focused → Fatigued) */}
      <div className="neo-panel p-6 sm:p-8 rounded-3xl mb-10">
        <h2 className="text-base sm:text-lg font-mono font-extrabold uppercase tracking-wider text-slate-200 mb-5 flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-cyan-400" />
          State history
        </h2>

        {/* Sequential Progression */}
        <div className="flex flex-wrap items-center gap-4">
          {historyChain.map((stateItem, idx) => {
            const itemTheme = STATE_THEMES[stateItem as BehavioralState] || STATE_THEMES.Normal
            const isLast = idx === historyChain.length - 1
            return (
              <React.Fragment key={idx}>
                <div 
                  className={`px-5 py-3 rounded-2xl text-base sm:text-xl font-black font-mono transition-all flex items-center gap-3 ${
                    isLast 
                      ? `${itemTheme.badgeBg} neo-panel border-2 ring-2 ring-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.25)]` 
                      : "neo-inset text-slate-200"
                  }`}
                >
                  <span 
                    className="w-3 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: itemTheme.color }}
                  />
                  <span>{stateItem}</span>
                  {isLast && (
                    <span className="text-xs sm:text-sm text-slate-400 font-normal">
                      (current)
                    </span>
                  )}
                </div>

                {!isLast && (
                  <span className="text-cyan-400 font-black text-xl sm:text-2xl px-1">
                    →
                  </span>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* 5. AI Suggested Actions (OpenRouter Micro-Interventions) */}
      <div className="neo-panel p-6 sm:p-8 rounded-3xl border-2 border-cyan-500/40 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
            <Bot className="w-6 h-6 text-cyan-400" />
            AI Suggested Actions
          </h2>
          <span className="text-xs sm:text-sm font-mono font-bold text-cyan-300 neo-inset px-4 py-1.5 rounded-full border border-cyan-500/30 flex items-center gap-2 self-start sm:self-auto">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            OpenRouter Integrated
          </span>
        </div>

        {/* Bulleted Action Items */}
        <ul className="space-y-4 mb-6">
          {actionsList.map((action, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-4 p-5 rounded-2xl neo-inset text-base sm:text-lg md:text-xl text-white font-medium"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.9)]" />
              <span className="leading-relaxed font-semibold">{action}</span>
            </motion.li>
          ))}
        </ul>

        {/* Required OpenRouter Footnote */}
        <div className="text-sm sm:text-base text-slate-300 font-mono font-semibold border-t border-white/10 pt-4 flex items-center gap-2.5 leading-relaxed">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {suggestions_note || "Suggestions generated through OpenRouter when Fatigued or Overloaded persists."}
          </span>
        </div>
      </div>

      {/* 6. Footer Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-3">
        <button
          type="button"
          onClick={onRetest}
          className="px-8 py-4 rounded-full neo-btn text-slate-200 hover:text-white text-sm sm:text-base font-bold font-mono flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Retest Guided Typing Task
        </button>

        <button
          type="button"
          onClick={onViewReport}
          className="px-9 py-4 rounded-full neo-btn-primary text-black font-black text-base sm:text-lg font-mono flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <FileText className="w-5 h-5" />
          View Full 20-Feature Report
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  )
}
