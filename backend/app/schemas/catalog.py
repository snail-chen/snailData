from pydantic import BaseModel
from typing import List, Optional

class ColumnSchema(BaseModel):
    name: str
    type: str
    nullable: bool = True
    is_pk: bool = False

class TableSchema(BaseModel):
    name: str
    columns: List[ColumnSchema] = []

class DatabaseSchema(BaseModel):
    tables: List[TableSchema]
