from pydantic import BaseModel
from typing import Optional, Dict, Any

class ConnectionCreate(BaseModel):
    type: str # mysql, postgres, clickhouse, etc
    name: str
    config: Dict[str, Any]
    secret: Optional[Dict[str, Any]] = None

class ConnectionResponse(BaseModel):
    id: str
    type: str
    name: str
    status: str
