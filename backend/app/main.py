from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import connections, catalog, query, analysis, python

app = FastAPI(title="DataSnail API", version="0.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(connections.router, prefix="/api", tags=["connections"])
app.include_router(catalog.router, prefix="/api", tags=["catalog"])
app.include_router(query.router, prefix="/api/query", tags=["query"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(connections.router, prefix="/api/connections", tags=["connections"])
app.include_router(python.router, prefix="/api/python", tags=["python"])

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "0.1.0"}
