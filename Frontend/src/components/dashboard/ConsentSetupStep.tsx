import React, { useState } from "react"
import { motion } from "framer-motion"
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Terminal, 
  CheckCircle2, 
  Keyboard, 
  Activity, 
  Clock, 
  MousePointer, 
  AlertCircle,
  Sparkles,
  EyeOff
} from "lucide-react"
import { SessionStartRequest } from "@/services/api"

interface ConsentSetupStepProps {
  onStartSession: (req: SessionStartRequest & { mouseConsent: boolean }) => void
  onViewIllustrativeExample?: () => void
  onCancel: () => void
}

export default function ConsentSetupStep({ 
  onStartSession, 
  onViewIllustrativeExample, 
  onCancel 
}: ConsentSetupStepProps) {
  const [consentGiven, setConsentGiven] = useState(true)
  const [mouseConsent, setMouseConsent] = useState(true)
  const [anonymousId] = useState(() => `HS-${Math.floor(1000 + Math.random() * 9000)}-ANON`)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!consentGiven) return

    onStartSession({
      consent: true,
      taskType: "typing",
      context: "Guided Typing Task",
      sessionId: anonymousId,
      mouseConsent,
    })
  }

  const INPUT_COLLECTION_SPECS = [
    {
      category: "Keyboard activity",
      collects: "Key press/release timestamps",
      icon: <Keyboard className="w-5 h-5 text-cyan-400" />,
      detail: "Exact millisecond timestamps of keydown and keyup events to evaluate physical motor cadence."
    },
    {
      category: "Typing rhythm",
      collects: "Time between successive keystrokes",
      icon: <Activity className="w-5 h-5 text-emerald-400" />,
      detail: "Inter-key intervals (IKI) in milliseconds to calculate rhythm variance, speed, and consistency."
    },
    {
      category: "Pauses",
      collects: "Duration and frequency of typing gaps",
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      detail: "Micro-hesitations and sustained pauses (>650ms) indicating cognitive retrieval or fatigue."
    },
    {
      category: "Typing corrections",
      collects: "Error/correction counts, without storing typed content",
      icon: <EyeOff className="w-5 h-5 text-violet-400" />,
      detail: "Counts backspaces and correction events. Zero sensitive characters, passwords, or words are stored."
    },
    {
      category: "Mouse activity",
      collects: "Movement speed and variability, with consent",
      icon: <MousePointer className="w-5 h-5 text-sky-400" />,
      detail: "Cursor velocity and jitter metrics across the workspace. Requires explicit user consent."
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-5xl mx-auto py-10 px-4 sm:px-6"
    >
      {/* Top Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full neo-inset text-cyan-300 text-sm sm:text-base font-mono font-bold mb-4">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          Step 1 of 3 • Session Input Setup & Privacy Consent
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-md">
          Passive Behavioral Telemetry
        </h1>
      </div>

      {/* Critical Reassurance Banner: Zero Manual Entry */}
      <div className="neo-panel p-6 rounded-2xl border-2 border-cyan-500/40 mb-8 flex items-start gap-4">
        <AlertCircle className="w-7 h-7 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-lg sm:text-xl font-black text-white mb-1.5 flex items-center gap-2">
            Zero Manual Data Entry Required
          </div>
          <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
            The user should <strong className="text-cyan-300 font-bold underline decoration-cyan-400">not</strong> manually enter response times 
            or the model's 20 features. All metrics and features are computed autonomously by the FastAPI feature engineering pipeline from your guided typing task.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Specification Input Breakdown Table */}
        <div className="neo-panel p-6 sm:p-8 rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
              <Terminal className="w-6 h-6 text-cyan-400" />
              What the Frontend Collects During Guided Typing
            </h2>
            <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400 neo-inset px-4 py-1.5 rounded-full border border-emerald-500/30 self-start sm:self-auto">
              Zero Raw Text Enforced
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono border-collapse">
              <thead>
                <tr className="border-b border-white/10 neo-inset text-slate-200 uppercase tracking-wider text-xs sm:text-sm font-extrabold">
                  <th className="py-4 px-4 rounded-l-xl">Input Modality</th>
                  <th className="py-4 px-4">What the frontend collects</th>
                  <th className="py-4 px-4 rounded-r-xl hidden md:table-cell">Technical Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {INPUT_COLLECTION_SPECS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.04] transition-colors">
                    <td className="py-4 px-4 font-bold text-white text-base sm:text-lg flex items-center gap-3 whitespace-nowrap">
                      {row.icon}
                      <span>{row.category}</span>
                    </td>
                    <td className="py-4 px-4 text-cyan-300 font-bold text-sm sm:text-base">
                      {row.collects}
                    </td>
                    <td className="py-4 px-4 text-slate-200 font-sans hidden md:table-cell text-sm sm:text-base leading-relaxed font-normal">
                      {row.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Consent Options Card */}
        <div className="neo-panel p-6 sm:p-8 rounded-3xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="text-sm sm:text-base font-mono font-black uppercase tracking-wider text-slate-200">
              Session Identifier & Telemetry Consents
            </label>
            <div className="flex items-center gap-2.5 text-sm sm:text-base font-mono font-bold text-cyan-300 neo-inset px-4 py-2 rounded-xl">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>{anonymousId}</span>
            </div>
          </div>

          {/* Primary Keystroke Consent */}
          <div className="p-5 rounded-2xl neo-inset transition-colors flex items-start gap-4">
            <input
              type="checkbox"
              id="consent-main"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 accent-cyan-500 cursor-pointer shrink-0"
            />
            <label htmlFor="consent-main" className="text-sm sm:text-base text-slate-100 cursor-pointer select-none leading-relaxed font-medium">
              <strong className="text-white font-bold">Required:</strong> I consent to HumanSignal recording passive timing telemetry 
              (key press/release timestamps, typing rhythm, pauses, and error counts) during the short, guided typing task. 
              No keystroke letters, words, or sensitive contents are stored.
            </label>
          </div>

          {/* Mouse Activity Consent Toggle */}
          <div className="p-5 rounded-2xl neo-inset transition-colors flex items-start gap-4">
            <input
              type="checkbox"
              id="consent-mouse"
              checked={mouseConsent}
              onChange={(e) => setMouseConsent(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 accent-cyan-500 cursor-pointer shrink-0"
            />
            <label htmlFor="consent-mouse" className="text-sm sm:text-base text-slate-100 cursor-pointer select-none leading-relaxed font-medium">
              <strong className="text-cyan-300 font-bold">Mouse Activity Consent:</strong> Include cursor movement speed and variability telemetry 
              during the session. (Passively measures movement velocity and trajectory jitter across the task area).
            </label>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3.5 rounded-full neo-btn text-slate-200 hover:text-white transition-all text-sm sm:text-base font-bold cursor-pointer"
            >
              Back to Home
            </button>

            {onViewIllustrativeExample && (
              <button
                type="button"
                onClick={onViewIllustrativeExample}
                className="px-6 py-3.5 rounded-full neo-btn text-cyan-300 text-sm sm:text-base font-mono font-bold flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Preview Spec Dashboard
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!consentGiven}
            className={`w-full sm:w-auto px-10 py-4 rounded-full font-black text-base sm:text-lg flex items-center justify-center gap-3 transition-all cursor-pointer ${
              consentGiven
                ? "neo-btn-primary text-black"
                : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50"
            }`}
          >
            <span>Start Session</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </form>
    </motion.div>
  )
}
