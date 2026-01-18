import uuid
from typing import List, Dict, Any
from app.schemas.connection import ConnectionCreate, ConnectionResponse

# In-memory storage for MVP
_CONNECTIONS: Dict[str, Dict[str, Any]] = {
    # Pre-seed a mock connection
    "mock-conn-1": {
        "id": "mock-conn-1",
        "type": "duckdb",
        "name": "loan_data_v2",
        "status": "connected",
        "config": {"path": ":memory:"}
    }
}

class ConnectionService:
    def list_connections(self) -> List[ConnectionResponse]:
        return [
            ConnectionResponse(
                id=c["id"],
                type=c["type"],
                name=c["name"],
                status=c["status"]
            )
            for c in _CONNECTIONS.values()
        ]

    def create_connection(self, conn: ConnectionCreate) -> ConnectionResponse:
        conn_id = str(uuid.uuid4())
        # TODO: Real validation and connection test
        new_conn = {
            "id": conn_id,
            "type": conn.type,
            "name": conn.name,
            "config": conn.config,
            "status": "connected" # Mock success
        }
        _CONNECTIONS[conn_id] = new_conn
        return ConnectionResponse(**new_conn)

    def get_connection(self, conn_id: str) -> Dict[str, Any]:
        return _CONNECTIONS.get(conn_id)

connection_service = ConnectionService()
