from fastapi import APIRouter, HTTPException
from app.schemas.analysis import AnalysisRequest, AnalysisResponse
from app.services.analysis_service import analysis_service

router = APIRouter()

@router.post("/analyze/stats", response_model=AnalysisResponse)
def analyze_stats(req: AnalysisRequest):
    return analysis_service.analyze_stats(req)
