from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import inspect

from app.api.routes import router
from app.db.base import Base
from app.db.session import engine
import app.models  # noqa: F401
from app.seeds import run as seed_demo_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Demo bootstrap for Vercel/Neon. Idempotent: creates only missing tables
    # and seeds only missing demo rows. Alembic remains the production migration path.
    if not inspect(engine).has_table("brands"):
        Base.metadata.create_all(bind=engine)
    seed_demo_data()
    yield


app = FastAPI(
    title="Che Restaurant Platform API",
    version="0.1.0",
    lifespan=lifespan,
)
app.include_router(router)
