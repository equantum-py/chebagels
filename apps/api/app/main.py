from fastapi import FastAPI
from app.api.routes import router

# Database migrations/seeding are deployment tasks. They must not run on every
# serverless cold start because that makes product requests wait on dozens of DB queries.
app = FastAPI(title="Che Restaurant Platform API", version="0.1.0")
app.include_router(router)
