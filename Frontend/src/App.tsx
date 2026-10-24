import React, { useState, useEffect } from "react"
import ShaderShowcase from "@/components/ui/hero"
import LandingNavbar from "@/components/LandingNavbar"
import AboutSection from "@/components/AboutSection"
import TelemetrySection from "@/components/TelemetrySection"
import ArchitectureSection from "@/components/ArchitectureSection"
import EthicsBanner from "@/components/EthicsBanner"
import MainDashboard from "@/components/dashboard/MainDashboard"

export default function App() {
  const [view, setView] = useState<"landing" | "dashboard">(() => {
    return typeof window !== "undefined" && window.location.hash === "#dashboard"
      ? "dashboard"
      : "landing"
  })

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#dashboard") {
        setView("dashboard")
      } else if (window.location.hash === "" || window.location.hash === "#about" || window.location.hash === "#features") {
        setView("landing")
      }
    }
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  const handleOpenDashboard = () => {
    window.location.hash = "#dashboard"
    setView("dashboard")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleBackToLanding = () => {
    window.location.hash = ""
    setView("landing")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (view === "dashboard") {
    return <MainDashboard onBackToHome={handleBackToLanding} />
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30 selection:text-cyan-200 relative">
      {/* Fixed Navigation: Black rounded-corner options box & Start Test button throughout whole page */}
      <LandingNavbar onStartTest={handleOpenDashboard} />

      {/* 1. Hero Section with Start Test connected to Main Dashboard */}
      <section className="relative w-full min-h-[125vh] min-h-[125dvh] overflow-hidden">
        <ShaderShowcase onStartTest={handleOpenDashboard} />
      </section>

      {/* 2. Structured About Section */}
      <AboutSection />

      {/* 3. Six Implicit Behavioral Signal Modalities */}
      <TelemetrySection />

      {/* 4. End-to-End Inference Pipeline & 4 Behavioral States */}
      <ArchitectureSection />

      {/* 5. Ethics, Privacy Guarantee & Footer */}
      <EthicsBanner />
    </div>
  )
}
