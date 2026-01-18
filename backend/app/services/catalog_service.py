from typing import List, Dict, Any
from app.schemas.catalog import DatabaseSchema, TableSchema, ColumnSchema

# In-memory mock schema cache
_SCHEMAS: Dict[str, DatabaseSchema] = {
    "mock-conn-1": DatabaseSchema(tables=[
        TableSchema(name="loan_data_v2", columns=[
            ColumnSchema(name="user_id", type="INT", is_pk=True),
            ColumnSchema(name="annual_inc", type="FLOAT"),
            ColumnSchema(name="loan_status", type="VARCHAR"),
            ColumnSchema(name="risk_score", type="FLOAT"),
        ]),
        TableSchema(name="app_logs", columns=[
            ColumnSchema(name="id", type="INT", is_pk=True),
            ColumnSchema(name="action", type="VARCHAR"),
            ColumnSchema(name="timestamp", type="DATETIME"),
        ])
    ])
}

class CatalogService:
    def get_schema(self, conn_id: str) -> DatabaseSchema:
        # TODO: Implement metadata scanner for SQL engines
        return _SCHEMAS.get(conn_id, DatabaseSchema(tables=[]))

catalog_service = CatalogService()
