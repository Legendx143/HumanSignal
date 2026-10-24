import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, 
  Activity, 
  Terminal, 
  CheckCircle2, 
  Info 
} from "lucide-react"
import FluidCanvas from "@/components/ui/fluid-canvas"
import ConsentSetupStep from "./ConsentSetupStep"
import WorkspaceStep from "./WorkspaceStep"
import LiveResultsStep from "./LiveResultsStep"
import SessionReportStep from "./SessionReportStep"
import { 
  telemetryApi, 
  SessionStartRequest, 
  SessionPredictResponse, 
  SessionSummaryResponse,
  TelemetryEvent
} from "@/services/api"

interface MainDashboardProps {
  onBackToHome: () => void
}

type DashboardStep = "consent" | "workspace" | "live_results" | "report"

export default function MainDashboard({ onBackToHome }: MainDashboardProps) {
  const [currentStep, setCurrentStep] = useState<DashboardStep>("consent")
  const [sessionId, setSessionId] = useState<string>("HS-INIT-ANON")
  const [, setTaskType] = useState<"typing" | "reaction" | "mouse" | "comprehensive">("typing")
  const [mouseConsent, setMouseConsent] = useState(true)
  const [prediction, setPrediction] = useState<SessionPredictResponse | null>(null)
  const [summary, setSummary] = useState<SessionSummaryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Step 1: User approves consent & sets up session
  const handleStartSession = async (req: SessionStartRequest & { mouseConsent?: boolean }) => {
    setIsLoading(true)
    try {
      const res = await telemetryApi.startSession(req)
      setSessionId(res.session_id)
      setTaskType("typing")
      setMouseConsent(req.mouseConsent !== false)
      setCurrentStep("workspace")
    } finally {
      setIsLoading(false)
    }
  }

  // Quick shortcut to preview the exact spec illustrative dashboard
  const handleViewIllustrativeExample = () => {
    const example = telemetryApi.getIllustrativeExample()
    setSessionId(example.session_id)
    setPrediction(example)
    setCurrentStep("live_results")
  }

  // Step 2: User completes workspace tasks
  const handleFinishWorkspace = async (events: TelemetryEvent[]) => {
    setIsLoading(true)
    try {
      // 1. Send buffered events
      await telemetryApi.sendEvents(sessionId, events)
      // 2. Request AI model inference prediction
      const pred = await telemetryApi.predictSession(sessionId)
      setPrediction(pred)
      setCurrentStep("live_results")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: View full session report
  const handleViewReport = async () => {
    setIsLoading(true)
    try {
      const sum = await telemetryApi.getSessionSummary(sessionId)
      setSummary(sum)
      setCurrentStep("report")
    } finally {
      setIsLoading(false)
    }
  }

  // Restart / Retest
  const handleRetest = () => {
    setCurrentStep("workspace")
  }

  const handleNewSession = () => {
    setPrediction(null)
    setSummary(null)
    setCurrentStep("consent")
  }

  const STEPS: { id: DashboardStep; label: string }[] = [
    { id: "consent", label: "1. Setup & Consent" },
    { id: "workspace", label: "2. Guided Typing Task" },
    { id: "live_results", label: "3. Dashboard" },
    { id: "report", label: "4. 20-Feature Report" },
  ]

  return (
    <FluidCanvas
      className="min-h-screen w-full flex flex-col bg-slate-950 text-white selection:bg-cyan-500/30 selection:text-cyan-200"
      colors={["#06b6d4", "#0ea5e9", "#f59e0b", "#6366f1"]}
      dissipation={0.35}
      curl={26}
      glow={0.65}
      quality="medium"
      idle={true}
    >
      {/* Top Navbar with Neomorphic Panel Styling */}
      <header className="sticky top-0 z-50 neo-panel-sm border-b border-white/10 px-4 sm:px-8 py-4 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Return */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBackToHome}
              className="flex items-center gap-3 text-white hover:text-cyan-400 transition-colors group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl neo-inset flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
              <span className="font-black text-2xl tracking-wide text-white">
                Human<span className="text-cyan-400">Signal</span>
              </span>
            </button>

            <span className="text-slate-600 font-bold hidden sm:inline">/</span>

            <span className="text-sm font-mono font-bold text-slate-300 hidden sm:inline px-3 py-1 rounded-lg neo-inset">
              Behavioral Dashboard
            </span>
          </div>

          {/* Stepper Indicator with Neomorphic Inset Well */}
          <nav aria-label="Dashboard Steps" className="hidden lg:flex items-center gap-1.5 neo-inset p-1.5 rounded-full text-sm font-mono">
            {STEPS.map((step, idx) => {
              const isActive = currentStep === step.id
              const isPast = STEPS.findIndex((s) => s.id === currentStep) > idx
              return (
                <div
                  key={step.id}
                  className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-2 ${
                    isActive
                      ? "neo-btn-primary text-black font-extrabold"
                      : isPast
                      ? "text-cyan-300 font-semibold"
                      : "text-slate-400 font-medium"
                  }`}
                >
                  {isPast && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  {step.label}
                </div>
              )
            })}
          </nav>

          {/* Right Action: Session ID & Exit */}
          <div className="flex items-center gap-3">
            {currentStep !== "consent" && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full neo-inset text-sm font-mono font-bold text-cyan-300">
                <Terminal className="w-4 h-4 text-cyan-400" />
                {sessionId}
              </div>
            )}

            <button
              type="button"
              onClick={onBackToHome}
              className="px-5 py-2.5 rounded-full neo-btn text-sm font-bold text-slate-200 hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit to Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden py-8 px-4 sm:px-6">
        {/* Global Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center">
            <div className="p-8 rounded-3xl neo-panel text-center max-w-sm">
              <div className="w-12 h-12 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <div className="text-base font-mono font-bold text-white">Processing Temporal Telemetry...</div>
              <div className="text-xs font-mono text-cyan-300 mt-2">Executing 20-Feature Inference Pipeline</div>
            </div>
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === "consent" && (
              <ConsentSetupStep
                key="consent"
                onStartSession={handleStartSession}
                onViewIllustrativeExample={handleViewIllustrativeExample}
                onCancel={onBackToHome}
              />
            )}

            {currentStep === "workspace" && (
              <WorkspaceStep
                key="workspace"
                sessionId={sessionId}
                mouseConsent={mouseConsent}
                onFinishTask={handleFinishWorkspace}
                onCancel={onBackToHome}
              />
            )}

            {currentStep === "live_results" && prediction && (
              <LiveResultsStep
                key="live_results"
                prediction={prediction}
                onViewReport={handleViewReport}
                onRetest={handleRetest}
              />
            )}

            {currentStep === "report" && summary && (
              <SessionReportStep
                key="report"
                summary={summary}
                onNewSession={handleNewSession}
                onReturnHome={onBackToHome}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="neo-panel-sm border-t border-white/10 py-4 px-6 text-center text-xs sm:text-sm font-mono text-slate-400 mt-auto">
        HumanSignal Real-Time Cognitive Workload & Fatigue Estimation • Zero Raw Text Capture Architecture
      </footer>
    </FluidCanvas>
  )
}
