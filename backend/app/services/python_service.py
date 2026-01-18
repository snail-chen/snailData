
import pandas as pd
import io
from typing import Dict, Any, List, Optional
from uuid import uuid4

# Singleton storage for active sessions (MVP: In-memory)
# Structure: { session_id: { "globals": {...}, "history": [...] } }
_sessions: Dict[str, Dict[str, Any]] = {}

class PythonSessionService:
    def __init__(self):
        # In a real app, this might connect to Jupyter Kernels or Ray
        pass

    def _get_session(self, session_id: str) -> Dict[str, Any]:
        if session_id not in _sessions:
            # Initialize new session with some basics
            _sessions[session_id] = {
                "globals": {}, 
                "history": []
            }
        return _sessions[session_id]

    def execute_script(self, session_id: str, code: str) -> Dict[str, Any]:
        session = self._get_session(session_id)
        local_scope = session["globals"]
        
        # Capture stdout
        import sys
        old_stdout = sys.stdout
        redirected_output = sys.stdout = io.StringIO()

        error_msg = None
        status = "success"

        try:
            # Execute code in the session's namespace
            exec(code, local_scope)
        except Exception as e:
            error_msg = str(e)
            status = "error"
        finally:
            sys.stdout = old_stdout

        output = redirected_output.getvalue()
        
        # Determine variables created/updated
        variables = self._scan_variables(local_scope)

        return {
            "status": status,
            "stdout": output,
            "error": error_msg,
            "variables": variables
        }

    def _scan_variables(self, scope: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Scans the scope for Pandas DataFrames and returns their metadata."""
        vars_list = []
        for name, val in scope.items():
            if name.startswith("_"): continue # Skip internal vars
            
            # Identify DataFrames
            if isinstance(val, pd.DataFrame):
                vars_list.append({
                    "name": name,
                    "type": "DataFrame",
                    "rows": len(val),
                    "cols": len(val.columns),
                    "columns": list(val.columns),
                    "preview": val.head(5).to_dict(orient="split") # Optional: lightweight preview
                })
        return vars_list

    def get_variables(self, session_id: str) -> List[Dict[str, Any]]:
        session = self._get_session(session_id)
        return self._scan_variables(session["globals"])

    def publish_variable(self, session_id: str, var_name: str, table_name: Optional[str] = None):
        """
        In a real scenario, this would register the dataframe to DuckDB.
        For MVP, we will mock the 'Registration' by ensuring it's available 
        for the ExecutionService to find (or just confirming existence).
        """
        session = self._get_session(session_id)
        if var_name not in session["globals"]:
            raise ValueError(f"Variable '{var_name}' not found in session")
        
        df = session["globals"][var_name]
        
        if not isinstance(df, pd.DataFrame):
            raise ValueError(f"Variable '{var_name}' is not a DataFrame")

        target_name = table_name or var_name
        
        # Here we would normally do: duckdb_conn.register(target_name, df)
        # For now, we return success metadata so Frontend can 'show' it in the Workspace/Published list.
        return {
            "published_name": target_name,
            "rows": len(df),
            "cols": len(df.columns)
        }

python_service = PythonSessionService()
