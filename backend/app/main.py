from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .core.config import settings
from .db.session import engine, SessionLocal
from .models.base import Base
from .models.user import User
from .core.security import get_password_hash

# Import routers
from .api.routes import auth, patient, gesture_mappings, calibration, detections, websocket

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _init_db():
    """Create tables and seed the default nurse account if the DB is empty."""
    logger.info("Initializing database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database tables: {e}")

    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            default_user = User(
                email="nurse@visioncare.com",
                name="Default Nurse",
                hashed_password=get_password_hash("password123"),
                role="nurse",
                ward_id="ICU-1",
            )
            db.add(default_user)
            db.commit()
            logger.info("Seeded default nurse user: nurse@visioncare.com / password123")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    _init_db()
    yield


app = FastAPI(
    title="VisionCare AI Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS setup — allow all origins in development so both
# HTTP REST calls and WebSocket upgrades work without issues.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,   # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(patient.router, prefix="/api/patients", tags=["patients"])
app.include_router(gesture_mappings.router, prefix="/api/gesture-mappings", tags=["gesture-mappings"])
app.include_router(calibration.router, prefix="/api/calibration", tags=["calibration"])
app.include_router(detections.router, prefix="/api/detections", tags=["detections"])
app.include_router(websocket.router, tags=["websockets"])


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy"}
