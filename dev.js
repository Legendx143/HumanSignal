/**
 * HumanSignal Unified Development Server
 * Concurrently spawns the Python FastAPI Backend & React Vite Frontend
 */
import { spawn } from "child_process"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log("\x1b[36m%s\x1b[0m", "==================================================")
console.log("\x1b[36m%s\x1b[0m", "  HumanSignal Unified Dev Server Starting...")
console.log("\x1b[36m%s\x1b[0m", "  - Backend:  http://localhost:8000 (FastAPI & WebSockets)")
console.log("\x1b[36m%s\x1b[0m", "  - Frontend: http://localhost:5173 (React Vite)")
console.log("\x1b[36m%s\x1b[0m", "==================================================")

const isWin = process.platform === "win32"
const pythonCmd = "python"
const npmCmd = isWin ? "npm.cmd" : "npm"

// 1. Spawn Backend
const backend = spawn(pythonCmd, ["start_backend.py"], {
  cwd: path.join(__dirname, "Backend"),
  stdio: "pipe",
  shell: isWin,
})

backend.stdout.on("data", (data) => {
  process.stdout.write(`\x1b[35m[BACKEND]\x1b[0m ${data}`)
})

backend.stderr.on("data", (data) => {
  const str = data.toString()
  if (str.includes("INFO:") || str.includes("WARNING:")) {
    process.stdout.write(`\x1b[35m[BACKEND]\x1b[0m ${str}`)
  } else {
    process.stderr.write(`\x1b[31m[BACKEND-ERR]\x1b[0m ${str}`)
  }
})

backend.on("error", (err) => {
  console.error("\x1b[31m[BACKEND ERROR]\x1b[0m Failed to start backend:", err)
})

// 2. Spawn Frontend
const frontend = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(__dirname, "Frontend"),
  stdio: "pipe",
  shell: isWin,
})

frontend.stdout.on("data", (data) => {
  process.stdout.write(`\x1b[34m[FRONTEND]\x1b[0m ${data}`)
})

frontend.stderr.on("data", (data) => {
  process.stderr.write(`\x1b[33m[FRONTEND]\x1b[0m ${data}`)
})

frontend.on("error", (err) => {
  console.error("\x1b[31m[FRONTEND ERROR]\x1b[0m Failed to start frontend:", err)
})

// Graceful cleanup
function cleanup() {
  console.log("\n\x1b[36mShutting down HumanSignal servers...\x1b[0m")
  try {
    if (isWin) {
      if (backend.pid) spawn("taskkill", ["/pid", backend.pid.toString(), "/f", "/t"])
      if (frontend.pid) spawn("taskkill", ["/pid", frontend.pid.toString(), "/f", "/t"])
    } else {
      backend.kill("SIGINT")
      frontend.kill("SIGINT")
    }
  } catch {}
  process.exit(0)
}

process.on("SIGINT", cleanup)
process.on("SIGTERM", cleanup)
