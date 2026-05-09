from contextlib import asynccontextmanager
from datetime import datetime
import logging
import traceback

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.core.config import get_settings
from app.services.store import store
from app.routers import admin, auth, deepfake, fakenews, history

logger = logging.getLogger("uvicorn.error")
settings = get_settings()
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    store.seed()
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)


@app.middleware("http")
async def log_deepfake_preflight_origin(request: Request, call_next):
    if request.method == "OPTIONS" and request.url.path.startswith("/api/deepfake"):
        logger.info(f"Deepfake preflight origin header: {request.headers.get('origin')!r}")
    return await call_next(request)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"GLOBAL EXCEPTION: {exc}", exc_info=True)
    logger.error(f"Traceback: {traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__},
    )


logger.info(f"CORS Origins: {settings.cors_origin_list}")

app.state.limiter = limiter
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SlowAPIMiddleware)
app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(fakenews.router, prefix=settings.api_prefix)
app.include_router(deepfake.router, prefix=settings.api_prefix)
app.include_router(history.router, prefix=settings.api_prefix)
app.include_router(admin.router, prefix=settings.api_prefix)


@app.get("/")
def root():
    return {
        "name": settings.app_name,
        "status": "operational",
        "endpoints": [
            "/api/auth/register",
            "/api/auth/login",
            "/api/fakenews/analyze",
            "/api/deepfake/image",
            "/api/deepfake/video",
            "/api/deepfake/audio",
            "/api/history",
            "/api/admin/stats",
        ],
    }


@app.get("/health")
def healthcheck():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat(), "mongo_available": store.mongo_available}
