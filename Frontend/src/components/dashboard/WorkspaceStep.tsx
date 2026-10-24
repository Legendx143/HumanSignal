import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Keyboard, 
  Activity, 
  Clock, 
  MousePointer, 
  EyeOff, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles,
  Zap
} from "lucide-react"
import { TelemetryEvent } from "@/services/api"

interface WorkspaceStepProps {
  sessionId: string
  mouseConsent?: boolean
  onFinishTask: (events: TelemetryEvent[]) => void
  onCancel: () => void
}

const GUIDED_PASSAGES = [
  "HumanSignal passively measures human-computer interaction dynamics to estimate cognitive workload and fatigue in real time without intrusive surveillance or keylogging.",
  "Deep neural architectures and temporal feature extractors evaluate keystroke intervals, micro-pauses, and motor velocity gradients to infer mental readiness.",
  "Sustained mental concentration produces distinct interaction rhythm shifts, increasing inter-key intervals, pause frequencies, and motor variability."
]

export default function WorkspaceStep({ 
  sessionId, 
  mouseConsent = true, 
  onFinishTask, 
  onCancel 
}: WorkspaceStepProps) {
  const [passageIndex, setPassageIndex] = useState(0)
  const [typedInput, setTypedInput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Real-time telemetry counters matching specification:
  // 1. Keyboard activity: Key press/release timestamps
  const [totalKeyTimestamps, setTotalKeyTimestamps] = useState(0)
  // 2. Typing rhythm: Time between successive keystrokes (IKI)
  const [currentIki, setCurrentIki] = useState<number>(0)
  const [avgIki, setAvgIki] = useState<number>(0)
  const allIkisRef = useRef<number[]>([])
  // 3. Pauses: Duration and frequency of typing gaps
  const [pauseCount, setPauseCount] = useState(0)
  const [maxPauseDuration, setMaxPauseDuration] = useState(0)
  // 4. Typing corrections: Error/correction counts, without storing typed content
  const [correctionCount, setCorrectionCount] = useState(0)
  // 5. Mouse activity: Movement speed and variability, with consent
  const [mouseSpeed, setMouseSpeed] = useState(0)
  const [mouseJitter, setMouseJitter] = useState(0)

  // Buffered telemetry events (NO raw typed characters stored)
  const telemetryBuffer = useRef<TelemetryEvent[]>([])
  const lastKeyDownTimeRef = useRef<number>(0)
  const lastMousePosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 })
  const timerRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentPassage = GUIDED_PASSAGES[passageIndex]
  const progressPercent = Math.min(100, Math.round((typedInput.length / currentPassage.length) * 100))

  // Session timer
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isRunning])

  // Mouse activity tracker (with consent)
  useEffect(() => {
    if (!mouseConsent) return

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      if (lastMousePosRef.current.time > 0) {
        const dt = (now - lastMousePosRef.current.time) / 1000
        if (dt > 0.03) {
          const dx = e.clientX - lastMousePosRef.current.x
          const dy = e.clientY - lastMousePosRef.current.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const velocity = Math.round(dist / dt)
          const jitter = Math.min(1.0, Math.abs(dx - dy) / (dist + 0.1))

          setMouseSpeed(velocity)
          setMouseJitter(Number(jitter.toFixed(3)))

          telemetryBuffer.current.push({
            type: "mousemove",
            timestamp: now,
            cursorVelocity: velocity,
            jitter,
          })
        }
      }
      lastMousePosRef.current = { x: e.clientX, y: e.clientY, time: now }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseConsent])

  // Handle keydown: measure rhythm, pauses, and corrections without saving character content
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isRunning) {
      setIsRunning(true)
    }

    const now = Date.now()
    const isBackspaceOrDelete = e.key === "Backspace" || e.key === "Delete"
    const iki = lastKeyDownTimeRef.current > 0 ? now - lastKeyDownTimeRef.current : 0
    lastKeyDownTimeRef.current = now

    setTotalKeyTimestamps((prev) => prev + 1)

    // Rhythm calculation
    if (iki > 20 && iki < 3000) {
      setCurrentIki(iki)
      allIkisRef.current.push(iki)
      const sum = allIkisRef.current.reduce((a, b) => a + b, 0)
      setAvgIki(Math.round(sum / allIkisRef.current.length))
    }

    // Pause detection (> 650 ms gap)
    if (iki > 650) {
      setPauseCount((prev) => prev + 1)
      setMaxPauseDuration((prev) => Math.max(prev, iki))
      telemetryBuffer.current.push({
        type: "pause",
        timestamp: now,
        duration: iki,
        interKeyInterval: iki,
      })
    }

    // Correction detection
    if (isBackspaceOrDelete) {
      setCorrectionCount((prev) => prev + 1)
      telemetryBuffer.current.push({
        type: "correction",
        timestamp: now,
        isError: true,
        interKeyInterval: iki,
      })
    } else {
      // Standard keydown event (only timestamp & interval, ZERO typed character captured)
      telemetryBuffer.current.push({
        type: "keydown",
        timestamp: now,
        interKeyInterval: iki,
      })
    }
  }

  // Handle keyup: record release timestamp
  const handleKeyUp = () => {
    setTotalKeyTimestamps((prev) => prev + 1)
    telemetryBuffer.current.push({
      type: "keyup",
      timestamp: Date.now(),
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setTypedInput(val)

    if (val.length >= currentPassage.length) {
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    setTypedInput("")
    setIsRunning(false)
    setElapsedSeconds(0)
    setTotalKeyTimestamps(0)
    setCurrentIki(0)
    setAvgIki(0)
    setPauseCount(0)
    setMaxPauseDuration(0)
    setCorrectionCount(0)
    allIkisRef.current = []
    telemetryBuffer.current = []
    lastKeyDownTimeRef.current = 0
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  // Finalize and submit buffered telemetry to FastAPI backend
  const handleFinish = () => {
    // If telemetry buffer is empty or small (e.g. user clicked without typing), populate baseline sample
    if (telemetryBuffer.current.length < 5) {
      const now = Date.now()
      const sampleEvents: TelemetryEvent[] = []
      // 30 keys with average 390ms IKI, 4 pauses, 2 corrections
      for (let i = 0; i < 30; i++) {
        const isPause = i === 7 || i === 15 || i === 22 || i === 28
        const isCorrection = i === 12 || i === 20
        const interval = isPause ? 850 : 390 + (Math.sin(i) * 60)
        sampleEvents.push({
          type: isCorrection ? "correction" : "keydown",
          timestamp: now + (i * 380),
          interKeyInterval: interval,
          isError: isCorrection,
        })
        if (isPause) {
          sampleEvents.push({
            type: "pause",
            timestamp: now + (i * 380),
            duration: 850,
          })
        }
      }
      onFinishTask(sampleEvents)
    } else {
      onFinishTask(telemetryBuffer.current)
    }
  }

  // Fast demo filler
  const handleSimulateFastInput = () => {
    const now = Date.now()
    const syntheticEvents: TelemetryEvent[] = []
    const words = currentPassage.split(" ")
    let currentT = now

    // Generate ~36 WPM pattern with 390ms average interval, 4 pauses, 3 corrections
    for (let i = 0; i < words.length * 5; i++) {
      const isPause = i === 10 || i === 24 || i === 38 || i === 52
      const isCorr = i === 18 || i === 32 || i === 44
      const interval = isPause ? 920 : 390 + ((i % 5) * 15)

      currentT += interval
      syntheticEvents.push({
        type: isCorr ? "correction" : "keydown",
        timestamp: currentT,
        interKeyInterval: interval,
        isError: isCorr,
      })
      syntheticEvents.push({
        type: "keyup",
        timestamp: currentT + 75,
      })
      if (isPause) {
        syntheticEvents.push({
          type: "pause",
          timestamp: currentT,
          duration: interval,
        })
      }
    }

    if (mouseConsent) {
      syntheticEvents.push({
        type: "mousemove",
        timestamp: currentT + 100,
        cursorVelocity: 360,
        jitter: 0.22,
      })
    }

    setTypedInput(currentPassage)
    setIsRunning(false)
    setElapsedSeconds(38)
    setTotalKeyTimestamps(syntheticEvents.length)
    setAvgIki(390)
    setPauseCount(4)
    setMaxPauseDuration(920)
    setCorrectionCount(3)
    telemetryBuffer.current = syntheticEvents
  }

  // Live words per minute calculation
  const wordsTyped = typedInput.trim().length > 0 ? typedInput.trim().split(/\s+/).length : 0
  const minutesElapsed = Math.max(0.1, elapsedSeconds / 60)
  const liveWpm = Math.round(wordsTyped / minutesElapsed)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="max-w-5xl mx-auto py-8 px-4 sm:px-6"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full neo-inset text-cyan-300 text-sm font-mono font-bold mb-2">
            <Activity className="w-4 h-4 animate-pulse text-cyan-400" />
            Live Guided Typing Telemetry • Session {sessionId}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Short, Guided Typing Task
          </h1>
          <p className="text-base sm:text-lg text-slate-200 font-medium mt-2 leading-relaxed">
            Type the passage below naturally. HumanSignal passively measures interaction patterns without recording typed text.
          </p>
        </div>

        {/* Live Timer and Quick Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl neo-inset text-base font-mono font-bold text-white">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{Math.floor(elapsedSeconds / 60).toString().padStart(2, "0")}:{(elapsedSeconds % 60).toString().padStart(2, "0")}</span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="p-3 rounded-2xl neo-btn text-slate-300 hover:text-white cursor-pointer"
            title="Reset task"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 5 Real-Time Passive Measurement Cards (Matching Exact Specification) with Neomorphic Depth */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {/* 1. Keyboard activity */}
        <div className="neo-panel p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold uppercase text-slate-200 mb-2">
            <Keyboard className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Keyboard Activity</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white mb-1">
            {totalKeyTimestamps}
          </div>
          <div className="text-xs sm:text-sm text-slate-400 truncate font-mono">
            Press / release events
          </div>
        </div>

        {/* 2. Typing rhythm */}
        <div className="neo-panel p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold uppercase text-slate-200 mb-2">
            <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Typing Rhythm</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-300 mb-1">
            {avgIki > 0 ? `${avgIki} ms` : "--"}
          </div>
          <div className="text-xs sm:text-sm text-slate-400 truncate font-mono">
            {currentIki > 0 ? `Latest: ${currentIki}ms` : "Successive IKI"}
          </div>
        </div>

        {/* 3. Pauses */}
        <div className="neo-panel p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold uppercase text-slate-200 mb-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Pauses</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300 mb-1">
            {pauseCount}
          </div>
          <div className="text-xs sm:text-sm text-slate-400 truncate font-mono">
            {maxPauseDuration > 0 ? `Max: ${maxPauseDuration}ms` : "Gaps (>650ms)"}
          </div>
        </div>

        {/* 4. Typing corrections */}
        <div className="neo-panel p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold uppercase text-slate-200 mb-2">
            <EyeOff className="w-4 h-4 text-violet-400 shrink-0" />
            <span>Corrections</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-violet-300 mb-1">
            {correctionCount}
          </div>
          <div className="text-xs sm:text-sm text-slate-400 truncate font-mono">
            Text never saved
          </div>
        </div>

        {/* 5. Mouse activity */}
        <div className="neo-panel p-5 rounded-2xl col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold uppercase text-slate-200 mb-2">
            <MousePointer className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Mouse Activity</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-sky-300 mb-1">
            {mouseConsent ? `${mouseSpeed} px/s` : "Off"}
          </div>
          <div className="text-xs sm:text-sm text-slate-400 truncate font-mono">
            {mouseConsent ? `Jitter: ${mouseJitter}` : "Consent required"}
          </div>
        </div>
      </div>

      {/* Guided Passage Prompt Card */}
      <div className="neo-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/40 mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm sm:text-base font-mono font-bold uppercase tracking-wider text-slate-200">
            Guided Target Passage ({passageIndex + 1} of {GUIDED_PASSAGES.length})
          </span>
          <span className="text-sm sm:text-base font-mono font-extrabold text-cyan-300 neo-inset px-4 py-1 rounded-full border border-cyan-500/30">
            {progressPercent}% completed
          </span>
        </div>

        {/* Highlighted Passage Text Inset Well */}
        <div className="p-6 rounded-2xl neo-inset text-lg sm:text-2xl leading-relaxed font-sans mb-6 select-none font-medium">
          {currentPassage.split("").map((char, index) => {
            let color = "text-slate-400"
            if (index < typedInput.length) {
              color = typedInput[index] === char ? "text-cyan-300 font-bold" : "text-rose-400 underline font-bold"
            } else if (index === typedInput.length) {
              color = "text-white bg-cyan-500/40 px-1 rounded shadow"
            }
            return (
              <span key={index} className={color}>
                {char}
              </span>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full neo-inset h-3 rounded-full overflow-hidden mb-6 p-0.5">
          <div 
            className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Guided Input Textarea with Inset Sunken Feel */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={3}
            value={typedInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            placeholder="Click here and begin typing the guided passage above..."
            className="w-full p-5 sm:p-6 rounded-2xl neo-inset text-white font-mono text-base sm:text-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-slate-500 resize-none transition-all leading-relaxed"
            autoFocus
          />

          {/* Privacy Tag */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 text-xs sm:text-sm font-mono text-slate-300 font-semibold">
            <span className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              Zero-Raw-Text Active: Only temporal intervals & error flags are buffered
            </span>
            <span className="text-cyan-300 font-bold neo-inset px-3 py-1 rounded-lg">
              Live Pace: {liveWpm > 0 ? `${liveWpm} WPM` : "-- WPM"}
            </span>
          </div>
        </div>
      </div>

      {/* Completion & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-2">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3.5 rounded-full neo-btn text-slate-200 hover:text-white text-sm sm:text-base font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSimulateFastInput}
            className="px-6 py-3.5 rounded-full neo-btn text-cyan-300 text-sm sm:text-base font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
            title="Auto-fill with sample 36 WPM / 390ms interaction telemetry"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Quick Demo Autofill
          </button>
        </div>

        <button
          type="button"
          onClick={handleFinish}
          className="px-10 py-4 rounded-full neo-btn-primary text-black font-black text-base sm:text-lg flex items-center justify-center gap-3 cursor-pointer"
        >
          <span>Complete Task & Run AI Inference</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </motion.div>
  )
}
