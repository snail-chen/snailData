from fastapi import APIRouter, HTTPException
from app.schemas.catalog import DatabaseSchema
from app.services.catalog_service import catalog_service

router = APIRouter()

@router.get("/schema/{conn_id}", response_model=DatabaseSchema)
def get_schema(conn_id: str):
    schema = catalog_service.get_schema(conn_id)
    if not schema:
        raise HTTPException(status_code=404, detail="Schema not found or connection invalid")
    return schema
