# DataSnail API Documentation

## 1. Analysis API (`/api/analyze`)

### 1.1 Calculate Statistics (`POST /stats`)
Performs 1-pass aggregation on a column or dataset.

**Request**:
```json
{
  "table_name": "loans",
  "column": "loan_amount",
  "type": "distribution" | "missing" | "outlier" | "dupes" | "correlation"
}
```

**Response**:
```json
{
  "title": "Distribution of loan_amount",
  "chart_type": "bar" | "heatmap",
  "data": {
    "xAxis": ["0-1k", "1k-2k"],
    "series": [{ "data": [10, 20] }],
    "summary": { "mean": 1500, "count": 30 }
  }
}
```

#### Supported Types:
- **distribution**: Histogram binning.
- **missing**: Count of Nulls vs Filled.
- **outlier**: IQR based outlier count.
- **dupes**: [NEW] Count of Unique vs Duplicate keys.
- **correlation**: [NEW] Correlation matrix of numeric columns (ignores `column` param).

## 2. Query API (`/api/query`)

### 2.1 Run SQL (`POST /run`)
Executes a raw SQL query against the engine.

**Request**:
```json
{
  "session_id": "default",
  "sql": "SELECT * FROM loans LIMIT 10"
}
```

**Response**:
```json
{
  "columns": [{ "field": "id", "type": "int" }],
  "data": [{ "id": 1 }],
  "total_rows": 1
}
```

## 3. Python Lab API (`/api/python`)

### 3.1 Run Script (`POST /run`)
Executes Python code in a stateful session.

**Request**:
```json
{
  "session_id": "default",
  "code": "df = pd.read_csv('data.csv')"
}
```

**Response**:
```json
{
  "status": "success",
  "output": "Loaded 1000 rows",
  "images": []
}
```
