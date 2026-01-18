from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class AnalysisRequest(BaseModel):
    table_name: str
    column: str
    type: str # 'distribution', 'stats', 'outlier'

class AnalysisResponse(BaseModel):
    title: str
    chart_type: str # 'bar', 'histogram', 'scalar'
    data: Dict[str, Any]
