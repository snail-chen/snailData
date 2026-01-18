from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.connection import ConnectionCreate, ConnectionResponse
from app.services.connection_service import connection_service

router = APIRouter()

@router.get("/connections", response_model=List[ConnectionResponse])
def list_connections():
    return connection_service.list_connections()

@router.post("/connect", response_model=ConnectionResponse)
def create_connection(conn: ConnectionCreate):
    try:
        return connection_service.create_connection(conn)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
