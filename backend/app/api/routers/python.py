
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from app.services.python_service import python_service

router = APIRouter()

class ExecuteRequest(BaseModel):
    session_id: str
    code: str

class ExecuteResponse(BaseModel):
    status: str
    stdout: str
    error: Optional[str] = None
    variables: List[Dict[str, Any]]

class PublishRequest(BaseModel):
    session_id: str
    var_name: str
    table_name: Optional[str] = None

@router.post("/run", response_model=ExecuteResponse)
def run_python(req: ExecuteRequest):
    """Execute Python code in a persistent session."""
    return python_service.execute_script(req.session_id, req.code)

@router.get("/variables", response_model=List[Dict[str, Any]])
def get_variables(session_id: str):
    """Get list of active DataFrame variables in the session."""
    return python_service.get_variables(session_id)

@router.post("/publish")
def publish_variable(req: PublishRequest):
    """Publish a Python variable to the SQL workspace (Mocked)."""
    try:
        return python_service.publish_variable(req.session_id, req.var_name, req.table_name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
