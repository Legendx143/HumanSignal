import React, { useState } from "react"
import { motion } from "framer-motion"
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  RotateCcw, 
  Home, 
  Activity, 
  Layers, 
  Clock, 
  Cpu, 
  Sparkles, 
  Sliders,
  ChevronRight,
  ShieldCheck
} from "lucide-react"
import { SessionSummaryResponse } from "@/services/api"

interface SessionReportStepProps {
  summary: SessionSummaryResponse
  onNewSession: () => void
  onReturnHome: () => void
}

export default function SessionReportStep({ summary, onNewSession, onReturnHome }: SessionReportStepProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"summary" | "features" | "json">("summary")

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(summary, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `HumanSignal-${summary.session_id}-report.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const featureList = summary.features ? Object.entries(summary.features) : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-5xl mx-auto py-6 px-4"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full neo-inset text-cyan-300 text-xs sm:text-sm font-mono mb-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            AI Session Report • {summary.session_id}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Behavioral Telemetry Audit
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopyJson}
            className="px-4 py-2.5 rounded-xl neo-btn text-slate-300 hover:text-white text-xs sm:text-sm font-mono flex items-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy JSON"}
          </button>
          <button
            type="button"
            onClick={handleDownloadJson}
            className="px-4 py-2.5 rounded-xl neo-btn text-slate-300 hover:text-white text-xs sm:text-sm font-mono flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Export Audit
          </button>
        </div>
      </div>

      {/* Tabs with Neomorphic Inset Container */}
      <div className="flex flex-wrap items-center gap-2 neo-inset p-2 rounded-2xl mb-8 text-sm sm:text-base font-mono font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("summary")}
          className={`py-2 px-5 rounded-xl transition-all cursor-pointer ${
            activeTab === "summary"
              ? "neo-btn-primary text-black font-black"
              : "text-slate-300 hover:text-white"
          }`}
        >
          Session Timeline & Metrics
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("features")}
          className={`py-2 px-5 rounded-xl transition-all cursor-pointer ${
            activeTab === "features"
              ? "neo-btn-primary text-black font-black"
              : "text-slate-300 hover:text-white"
          }`}
        >
          20-Feature Random Forest Inputs ({featureList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("json")}
          className={`py-2 px-5 rounded-xl transition-all cursor-pointer ${
            activeTab === "json"
              ? "neo-btn-primary text-black font-black"
              : "text-slate-300 hover:text-white"
          }`}
        >
          FastAPI Payload Inspector
        </button>
      </div>

      {/* TAB 1: SUMMARY & TIMELINE */}
      {activeTab === "summary" && (
        <div className="space-y-8">
          {/* Executive Overview Card */}
          <div className="neo-panel p-6 sm:p-8 rounded-3xl">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-cyan-400" />
              Session Telemetry Breakdown
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="neo-panel p-5 rounded-2xl">
                <div className="text-xs sm:text-sm font-mono font-bold text-slate-300 uppercase">Primary Inferred State</div>
                <div className="text-3xl font-black font-mono text-cyan-300 mt-1.5">{summary.overall_state}</div>
                <div className="text-xs text-slate-400 font-mono mt-1">{Math.round(summary.overall_confidence * 100)}% model score</div>
              </div>

              <div className="neo-panel p-5 rounded-2xl">
                <div className="text-xs sm:text-sm font-mono font-bold text-slate-300 uppercase">Mean Keystroke Rhythm</div>
                <div className="text-3xl font-black font-mono text-white mt-1.5">{summary.final_metrics.mean_iki_ms} ms</div>
                <div className="text-xs text-slate-400 font-mono mt-1">±{summary.final_metrics.std_iki_ms} ms jitter</div>
              </div>

              <div className="neo-panel p-5 rounded-2xl">
                <div className="text-xs sm:text-sm font-mono font-bold text-slate-300 uppercase">Vigilance Latency</div>
                <div className="text-3xl font-black font-mono text-white mt-1.5">{summary.final_metrics.mean_response_time_ms} ms</div>
                <div className="text-xs text-slate-400 font-mono mt-1">±{summary.final_metrics.std_rt_ms} ms dispersion</div>
              </div>

              <div className="neo-panel p-5 rounded-2xl">
                <div className="text-xs sm:text-sm font-mono font-bold text-slate-300 uppercase">Error Correction Ratio</div>
                <div className="text-3xl font-black font-mono text-white mt-1.5">{summary.final_metrics.error_rate}%</div>
                <div className="text-xs text-slate-400 font-mono mt-1">{summary.final_metrics.pause_count} hesitation pauses</div>
              </div>
            </div>
          </div>

          {/* Timeline Segments */}
          <div className="neo-panel p-6 sm:p-8 rounded-3xl">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-5 flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-cyan-400" />
              Temporal Window Progression
            </h2>

            <div className="space-y-4">
              {summary.timeline.map((seg, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-2xl neo-inset text-sm sm:text-base font-mono"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-8 h-8 rounded-full neo-panel flex items-center justify-center font-bold text-slate-200">
                      {idx + 1}
                    </span>
                    <span className="text-slate-300 font-medium">Window @ +{seg.time_offset_seconds}s</span>
                  </div>

                  <div className="flex items-center gap-5">
                    <span className={`px-4 py-1.5 rounded-full font-bold text-sm sm:text-base ${
                      seg.state === "Focused" ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40" :
                      seg.state === "Fatigued" ? "bg-amber-500/15 text-amber-300 border border-amber-500/40" :
                      seg.state === "Overloaded" ? "bg-rose-500/15 text-rose-300 border border-rose-500/40" :
                      "bg-sky-500/15 text-sky-300 border border-sky-500/40"
                    }`}>
                      {seg.state}
                    </span>
                    <span className="text-slate-400 font-bold">
                      {Math.round(seg.confidence * 100)}% conf
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Suggested Actions Card */}
          <div className="neo-panel p-6 sm:p-8 rounded-3xl">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              AI Suggested Actions (OpenRouter)
            </h2>
            <ul className="space-y-3.5 mb-4">
              {(summary.suggested_actions && summary.suggested_actions.length > 0
                ? summary.suggested_actions
                : [
                    "Consider taking a short break.",
                    "Focus on one manageable task.",
                    "Check how you feel before continuing.",
                  ]
              ).map((act, i) => (
                <li key={i} className="flex items-start gap-3 text-base sm:text-lg text-white font-medium p-3.5 rounded-xl neo-inset">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0 shadow" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
            <div className="text-sm font-mono text-slate-300 border-t border-white/10 pt-3 font-medium">
              {summary.suggestions_note || "Suggestions generated through OpenRouter when Fatigued or Overloaded persists."}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 20-FEATURE RANDOM FOREST INPUTS */}
      {activeTab === "features" && (
        <div className="neo-panel p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-cyan-400" />
              Model Feature Vector (20 Engineered Features)
            </h2>
            <span className="text-xs sm:text-sm text-cyan-300 font-mono neo-inset px-4 py-1.5 rounded-lg border border-slate-700">
              humansignal_realtime_candidate.joblib
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-mono">
            These exact 20 normalized temporal and rolling features are fed into the trained random forest model:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base font-mono">
            {featureList.map(([key, value]) => (
              <div
                key={key}
                className="p-4 rounded-xl neo-inset flex items-center justify-between"
              >
                <span className="text-slate-300 font-semibold truncate pr-3">{key}</span>
                <span className="font-black text-cyan-300 shrink-0 text-base sm:text-lg">
                  {typeof value === "number" ? (Number.isInteger(value) ? value : value.toFixed(3)) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FASTAPI JSON INSPECTOR */}
      {activeTab === "json" && (
        <div className="neo-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              API Contract Payload (GET /api/session/{summary.session_id}/summary)
            </h2>
          </div>
          <pre className="p-4 rounded-xl neo-inset text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed max-h-96">
            {JSON.stringify(summary, null, 2)}
          </pre>
        </div>
      )}

      {/* Interpretation & Bottom Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-6 mt-8 border-t border-white/10">
        <button
          type="button"
          onClick={onReturnHome}
          className="px-8 py-3.5 rounded-full neo-btn text-slate-200 hover:text-white text-base font-bold flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Home className="w-5 h-5" />
          Back to Landing Page
        </button>

        <button
          type="button"
          onClick={onNewSession}
          className="px-9 py-4 rounded-full neo-btn-primary text-black font-black text-base sm:text-lg font-mono flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          Start New Behavioral Session
        </button>
      </div>
    </motion.div>
  )
}
