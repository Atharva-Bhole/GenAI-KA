from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import settings
from app.sample_data.seed_documents import seed_database_if_empty

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_database_if_empty()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "chat": f"{settings.API_V1_STR}/chat/query",
            "documents": f"{settings.API_V1_STR}/documents",
            "spaces": f"{settings.API_V1_STR}/spaces",
            "graph": f"{settings.API_V1_STR}/graph",
            "governance": f"{settings.API_V1_STR}/governance/gaps",
            "benchmark": f"{settings.API_V1_STR}/benchmark/run"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
