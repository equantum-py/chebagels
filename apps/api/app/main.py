from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(title="Che Restaurant Platform API", version="0.1.0")
app.include_router(router)

@app.get("/health", tags=["system"])
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "che-api", "version": "0.1.0"}
