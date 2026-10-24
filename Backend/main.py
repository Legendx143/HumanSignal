import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import HOST, PORT, CORS_ORIGINS
from routers.session import router as session_router
from routers.websocket_router import router as websocket_router
from pipeline.model_service import model_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("=" * 60)
    print("HumanSignal Behavioral Telemetry & AI Inference Engine")
    print("=" * 60)
    # Preload the AI model artifact into memory
    model_service.load_model()
    yield
    print("[Shutdown] HumanSignal AI backend stopped.")

app = FastAPI(
    title="HumanSignal Behavioral AI Inference Backend",
    description="Real-time inference API for passive psychomotor telemetry & cognitive state classification.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware to allow seamless communication from React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes under /api and root WebSockets
app.include_router(session_router, prefix="/api")
app.include_router(websocket_router)

@app.get("/")
def root():
    return {
        "service": "HumanSignal Behavioral AI API",
        "status": "online",
        "model_loaded": model_service.is_loaded,
        "classes": model_service.classes,
        "features_count": len(model_service.selected_features),
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_ready": model_service.is_loaded,
        "features": model_service.selected_features
    }

if __name__ == "__main__":
    print(f"Starting HumanSignal Backend on {HOST}:{PORT}...")
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
