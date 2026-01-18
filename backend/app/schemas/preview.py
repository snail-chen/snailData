from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class PreviewRequest(BaseModel):
    connection_id: Optional[str] = None
    table_name: str
    limit: int = 1000
    offset: int = 0
    filter: Optional[str] = None # SQL Where Clause

class PreviewResponse(BaseModel):
    columns: List[Dict[str, Any]] # [{"field": "id", "headerName": "ID"}]
    data: List[Dict[str, Any]]
    total_rows: Optional[int] = None

class QueryRequest(BaseModel):
    session_id: Optional[str] = "default"
    sql: str
    limit: int = 1000
