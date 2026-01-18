from fastapi import APIRouter, HTTPException
from app.schemas.preview import PreviewRequest, PreviewResponse, QueryRequest
from app.services.execution_service import execution_service

router = APIRouter()

@router.post("/preview", response_model=PreviewResponse)
def preview_data(req: PreviewRequest):
    try:
        return execution_service.preview_table(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/run", response_model=PreviewResponse)
def run_query(req: QueryRequest):
    try:
        return execution_service.run_sql(req.sql)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
