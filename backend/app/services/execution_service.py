from typing import List, Dict, Any, Optional
from app.schemas.preview import PreviewRequest, PreviewResponse
import duckdb
import os
import pandas as pd

class ExecutionService:
    def __init__(self):
        # Initialize persistent DuckDB connection
        self.conn = duckdb.connect(':memory:')
        self._init_data()

    def _init_data(self):
        # Pre-load loans.csv for demo
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            data_path = os.path.join(base_dir, "data", "loans.csv")
            if os.path.exists(data_path):
                self.conn.execute(f"CREATE TABLE loans AS SELECT * FROM read_csv_auto('{data_path}')")
                print(f"Loaded {data_path} into 'loans' table.")
            else:
                print(f"Warning: {data_path} not found.")
        except Exception as e:
            print(f"Failed to init data: {e}")

    def preview_table(self, req: PreviewRequest) -> PreviewResponse:
        # Legacy/Mock support wrapper around run_query or specialized preview logic
        if req.table_name == "loans":
             return self.run_sql(f"SELECT * FROM loans LIMIT {req.limit}")
             
        # Fallback for other mock tables if they don't exist in DuckDB
        return self._mock_logs(req.limit) if req.table_name == "app_logs" else PreviewResponse(columns=[], data=[])

    def run_sql(self, sql: str) -> PreviewResponse:
        try:
            # Execute SQL
            df = self.conn.execute(sql).df()
            
            # Convert to Dictionary
            data = df.to_dict(orient='records')
            
            # Map columns
            columns = []
            for col in df.columns:
                dtype = str(df[col].dtype)
                col_type = "numeric" if "int" in dtype or "float" in dtype else "text"
                if "datetime" in dtype: col_type = "datetime"
                columns.append({
                    "field": col,
                    "headerName": col,
                    "type": col_type
                })
                
            return PreviewResponse(columns=columns, data=data, total_rows=len(data))
            
        except Exception as e:
            print(f"SQL Execution Error: {e}")
            # Return empty response with error logging (or raise HTTP exception in router)
            raise e

    def _mock_logs(self, limit: int) -> PreviewResponse:
        columns = [
            {"field": "id", "headerName": "ID", "type": "numeric"},
            {"field": "action", "headerName": "Action", "type": "text"},
            {"field": "timestamp", "headerName": "Timestamp", "type": "datetime"},
        ]
        data = [{"id": i, "action": "LOGIN", "timestamp": "2023-01-01T12:00:00"} for i in range(limit)]
        return PreviewResponse(columns=columns, data=data, total_rows=500)

execution_service = ExecutionService()
