import React from "react"
import { Shield, Lock } from "lucide-react"
import Glass3DCard from "@/components/ui/glass-card"

export default function EthicsBanner() {
  return (
    <footer className="relative border-t border-white/10 bg-black py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Bottom ambient glow matching Hero palette */}
      <div className="absolute -bottom-10 left-10 w-[700px] h-[500px] rounded-full blur-[110px] opacity-60 bg-gradient-to-tr from-[#082f49] via-[#06b6d4] to-[#0284c7] pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-[600px] h-[500px] rounded-full blur-[120px] opacity-55 bg-gradient-to-bl from-[#ea580c] via-[#f97316] to-[#9a3412] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0e_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0e_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Important Ethics Callout in 3D Glass */}
        <div className="mb-14">
          <Glass3DCard accentColor="cyan" maxTilt={4} className="p-8 sm:p-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 [transform:translateZ(25px)]">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 shadow-xl shadow-cyan-500/20">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-white font-black text-xl sm:text-2xl flex items-center gap-2">
                    Ethical Principle: Behavioral Estimation, Not Medical Diagnosis
                  </h4>
                  <p className="text-slate-200 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed font-normal">
                    HumanSignal evaluates psychomotor flow, ergonomic strain, and pacing dynamics for workplace and gaming comfort. It does not provide clinical diagnoses, psychiatric assessments, or medical evaluation.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2.5 text-sm font-mono font-bold text-cyan-200 bg-white/[0.05] px-5 py-3 rounded-2xl border border-white/15 shadow-xl backdrop-blur-md">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Zero-Text Keylogging Guarantee</span>
              </div>
            </div>
          </Glass3DCard>
        </div>

        {/* Footer Details */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-slate-300 gap-4 pt-8 border-t border-white/10 font-mono">
          <div>
            © 2026 HumanSignal AI • Non-Invasive Multimodal Telemetry
          </div>
          <div className="flex items-center gap-6 font-semibold">
            <a href="#about" className="hover:text-cyan-300 transition-colors">About</a>
            <a href="#features" className="hover:text-cyan-300 transition-colors">Signals</a>
            <a href="#pipeline" className="hover:text-cyan-300 transition-colors">ML Pipeline</a>
            <span className="text-slate-500">v0.1-candidate</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
