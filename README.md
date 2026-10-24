# HumanSignal

> **Real-time cognitive fatigue, overload, and focus estimation powered by passive behavioral telemetry and temporal machine learning — with zero raw text capture.**

---

## 1. Problem Statement

Modern knowledge workers and high-reliability operators (developers, air traffic controllers, analysts, healthcare professionals) spend hours performing continuous cognitive tasks on digital interfaces. Cognitive fatigue and mental overload degrade attention, amplify error rates, and compromise wellbeing.

However, traditional methods to gauge cognitive state rely on:
- **Intrusive interruptions**: Periodic self-report surveys (e.g., NASA-TLX) that disrupt deep work and introduce subjective bias.
- **Physical hardware constraints**: EEG headbands, eye-trackers, or heart-rate monitors that require specialized hardware, daily calibration, and create physical discomfort.
- **Surveillance & privacy violations**: Invasive employee-monitoring software that logs screen recordings, keystroke characters, and sensitive application content.

**The fundamental challenge**: How can we continuously and objectively measure cognitive fatigue and workload in real time, purely through standard human-computer interactions, without recording what the user is typing or violating personal privacy?

---

## 2. Problems

Existing cognitive monitoring and workplace productivity tools suffer from critical structural flaws:

| Challenge | Current Approach | HumanSignal Analysis |
| :--- | :--- | :--- |
| **Intrusive Interruption** | Asking users to rate fatigue every 30–60 minutes | Breaks flow state, induces survey fatigue, and yields subjective, lagging data. |
| **Privacy Violation** | Keyloggers and screen recorders | Captures passwords, confidential emails, and proprietary code, creating major security and legal liabilities. |
| **Hardware Overhead** | Biometric sensors (EEG, ECG, pupil dilation) | Impractical for standard remote work, expensive to deploy, and physically cumbersome. |
| **Manual Data Entry** | Forcing users to enter raw latency numbers or task metrics | High friction; users abandon the assessment or report inaccurate estimates. |
| **Static Snapshots** | Point-in-time assessments without temporal context | Misses gradual cognitive decline, micro-hesitations, and rhythm degradation over time. |

---

## 3. Solution

**HumanSignal** introduces an implicit, zero-keylogging behavioral intelligence platform that detects cognitive states (*Normal*, *Focused*, *Fatigued*, and *Overloaded*) by measuring **how** you interact with your computer, rather than **what** you type.

### How It Works: The 5-Stage Pipeline

```
[ Guided / Passive Task ]
           │
           ▼
[ Passive Telemetry Stream ]  ──► Keystroke Timestamps, IKI, Gaps, Motor Jitter
           │                       (Zero characters or typed text recorded)
           ▼
[ FastAPI Backend Ingestion ] ──► Real-Time Event Buffering & Session Validation
           │
           ▼
[ Feature Engineering ]       ──► 20 Normalized Temporal & Rolling Interaction Features
           │
           ▼
[ Random Forest Inference ]   ──► State Classification (Normal, Focused, Fatigued, Overloaded)
           │
           ▼
[ OpenRouter AI Interventions]──► Contextual Micro-Break & Task-Pacing Suggestions
```

### Core Innovations

1. **Zero-Raw-Text Privacy Architecture**:
   - The frontend intercepts only millisecond event timestamps (`keydown`, `keyup`), dwell times, and error count flags.
   - Letters, symbols, words, and passwords are never buffered, inspected, transmitted, or stored on disk.
2. **20-Feature Temporal Signal Engineering**:
   - Computes inter-key intervals (mean, standard deviation, kurtosis), pause frequencies (>650ms hesitation thresholds), correction ratios, and velocity variance.
   - Normalizes interaction dynamics against baseline psychomotor profiles using rolling z-scores.
3. **Real-Time ML Inference**:
   - Evaluated by a trained Random Forest candidate model (`humansignal_realtime_candidate.joblib`) returning state probabilities and confidence scores in <15ms.
4. **Actionable AI Micro-Interventions (OpenRouter)**:
   - When sustained *Fatigued* or *Overloaded* states are detected, the system queries OpenRouter LLM endpoints to generate tailored, ergonomic micro-breaks and task-pacing recommendations.
5. **Interactive Dashboard with Neomorphic UI**:
   - Real-time WebGL fluid dynamics background stirring beneath soft, tactile dark-mode neomorphic panels, meters, and confidence gauges.

---

## 4. Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [Vite 6](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) with custom Dark Neomorphism design system (`.neo-panel`, `.neo-inset`, `.neo-btn`)
- **Animation & Motion**: [Framer Motion](https://www.framer.com/motion/)
- **Shaders & Fluid Simulation**: Custom WebGL2/WebGL1 GPU Gems 38 fluid advection engine (`FluidCanvas`) + Paper Design mesh shaders
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend & API
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11+)
- **Server**: [Uvicorn](https://www.uvicorn.org/) with ASGI async event loop
- **Real-Time Communication**: WebSockets & RESTful endpoints
- **Data Validation**: [Pydantic v2](https://docs.pydantic.dev/) schemas
- **Testing**: [Pytest](https://docs.pytest.org/) with 100% endpoint and inference test coverage

### Machine Learning & AI
- **Model Architecture**: Random Forest Classifier (`humansignal_realtime_candidate.joblib`)
- **Core Libraries**: `scikit-learn`, `numpy`, `pandas`, `joblib`, `scipy`
- **Feature Pipeline**: 20 normalized temporal, rhythm, hesitation, and correction metrics
- **Cognitive Interventions**: [OpenRouter API](https://openrouter.ai/) for dynamic, context-aware fatigue mitigations

### Infrastructure & Development
- **Repository Pattern**: Full-stack monorepo
- **Unified Orchestrator**: `dev.js` concurrent launcher (runs FastAPI on `:8000` and Vite on `:5173` simultaneously)
- **Version Control**: Multi-layer `.gitignore` safeguarding secrets, datasets, models, and virtual environments

---
