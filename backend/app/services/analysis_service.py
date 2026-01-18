from app.schemas.analysis import AnalysisRequest, AnalysisResponse
import duckdb
import os

class AnalysisService:
    def __init__(self):
        # In a real app, this would be managed by ConnectionService
        # Here we just point to our mock data folder
        self.data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "loans.csv")

    def analyze_stats(self, req: AnalysisRequest) -> AnalysisResponse:
        conn = duckdb.connect(database=':memory:')
        # Register the CSV as a table
        conn.execute(f"CREATE TABLE loans AS SELECT * FROM read_csv_auto('{self.data_path}')")
        
        if req.type == 'distribution':
            return self._compute_histogram(conn, req.column)
        elif req.type == 'outlier':
            return self._compute_outliers(conn, req.column)
        elif req.type == 'missing':
            return self._compute_missing(conn, req.column)
        elif req.type == 'dupes':
            return self._compute_dupes(conn, req.column)
        elif req.type == 'correlation':
            return self._compute_correlation(conn)
        
        conn.close()
        return AnalysisResponse(title="Unknown", chart_type="none", data={})

    def _compute_dupes(self, conn, column: str) -> AnalysisResponse:
        # If column is * or None, check full row duplicates
        target = column if column and column != '*' else '*'
        
        group_sql = f"GROUP BY {target}" if target != '*' else "GROUP BY ALL"
        select_sql = f"SELECT {target}" if target != '*' else "SELECT *"
        
        stats = conn.execute(f"SELECT COUNT(*) FROM loans").fetchone()
        total_rows = stats[0]
        
        unique_rows = conn.execute(f"""
            SELECT COUNT(*) FROM (
                {select_sql} FROM loans {group_sql}
            )
        """).fetchone()[0]
        
        dupes = total_rows - unique_rows
        
        conn.close()
        
        return AnalysisResponse(
            title=f"Duplicate Analysis: {target}",
            chart_type="bar",
            data={
                "xAxis": ["Unique", "Duplicate"],
                "series": [{"data": [unique_rows, dupes], "type": "bar"}],
                "summary": {
                    "count": total_rows,
                    "missing": 0,
                    "mean": 0,
                    "std": 0,
                    "min": 0,
                    "max": 0
                }
            }
        )

    def _compute_correlation(self, conn) -> AnalysisResponse:
        # 1. Select only numeric columns
        schema = conn.execute("DESCRIBE loans").fetchall()
        numeric_cols = [row[0] for row in schema if 'INT' in row[1] or 'DOUBLE' in row[1] or 'FLOAT' in row[1]]
        
        # 2. Compute Correlation Matrix
        # DuckDB 0.9+ supports corr matrix via some tricks or just pair-wise
        # For simplicity in this mocked/local version, we do pair-wise for up to 10 cols
        
        cols_to_use = numeric_cols[:10] # Limit to 10 for performance
        labels = cols_to_use
        
        matrix_data = []
        
        for col_a in cols_to_use:
            row_data = []
            for col_b in cols_to_use:
                val = conn.execute(f"SELECT CORR({col_a}, {col_b}) FROM loans").fetchone()[0]
                row_data.append(round(val or 0, 2))
            matrix_data.append(row_data)
            
        conn.close()
        
        return AnalysisResponse(
            title="Correlation Matrix",
            chart_type="heatmap",
            data={
                "xAxis": labels, # Cols
                "yAxis": labels, # Rows
                "series": [{"data": matrix_data, "type": "heatmap"}],
                "summary": {
                    "count": len(cols_to_use),
                    "missing": 0,
                    "mean": 0,
                    "std": 0,
                    "min": 0,
                    "max": 0
                }
            }
        )

    def _compute_missing(self, conn, column: str) -> AnalysisResponse:
        # 1. Count Total vs Missing
        stats = conn.execute(f"""
            SELECT 
                COUNT(*) as total,
                COUNT({column}) as filled,
                AVG({column}) as mean,
                STDDEV({column}) as std,
                MIN({column}) as min_val,
                MAX({column}) as max_val
            FROM loans
        """).fetchone()
        
        total, filled = stats[0], stats[1]
        missing = total - filled
        mean, std, min_val, max_val = stats[2], stats[3], stats[4], stats[5]
        
        conn.close()
        
        return AnalysisResponse(
            title=f"Missing Value Analysis: {column}",
            chart_type="bar",
            data={
                "xAxis": ["Filled", "Missing"],
                "series": [{"data": [filled, missing], "type": "bar"}],
                "summary": {
                    "count": total,
                    "missing": missing,
                    "mean": round(mean or 0, 2),
                    "std": round(std or 0, 2),
                    "min": min_val,
                    "max": max_val
                }
            }
        )

    def _compute_outliers(self, conn, column: str) -> AnalysisResponse:
        # 1. Calculate IQR
        stats = conn.execute(f"""
            SELECT 
                quantile_cont({column}, 0.25) as q1,
                quantile_cont({column}, 0.75) as q3,
                AVG({column}) as mean,
                STDDEV({column}) as std,
                MIN({column}) as min_val,
                MAX({column}) as max_val,
                COUNT(*) as count
            FROM loans
        """).fetchone()
        
        q1, q3 = stats[0], stats[1]
        mean, std, min_val, max_val, count = stats[2], stats[3], stats[4], stats[5], stats[6]
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        # 2. Count Outliers
        outliers = conn.execute(f"""
            SELECT COUNT(*) FROM loans 
            WHERE {column} < {lower_bound} OR {column} > {upper_bound}
        """).fetchone()[0]
        
        # 3. Visualization Data (Box Plot Parts)
        # Recharts doesn't natively support boxplots well with just 5 numbers in a simple way 
        # so we will return a distribution like chart for now highlighting outliers
        
        # Simplified: Return count of normal vs outliers
        conn.close()
        
        return AnalysisResponse(
            title=f"Outlier Analysis: {column}",
            chart_type="bar",
            data={
                "xAxis": ["Normal", "Outliers"],
                "series": [{"data": [count - outliers, outliers], "type": "bar"}],
                "summary": {
                    "count": count,
                    "missing": 0, # Simplified
                    "mean": round(mean, 2),
                    "std": round(std, 2),
                    "min": min_val,
                    "max": max_val
                }
            }
        )

    def _compute_histogram(self, conn, column: str) -> AnalysisResponse:
        # 1. Get Min/Max for binning
        stats = conn.execute(f"SELECT MIN({column}), MAX({column}) FROM loans").fetchone()
        min_val, max_val = stats[0], stats[1]
        
        # 2. Compute Histogram (10 bins)
        # Using DuckDB's width_bucket or just manual grouping
        step = (max_val - min_val) / 10 if max_val > min_val else 1
        
        query = f"""
            SELECT 
                FLOOR(({column} - {min_val}) / {step}) * {step} + {min_val} as bin_start,
                COUNT(*) as count
            FROM loans
            GROUP BY 1
            ORDER BY 1
        """
        results = conn.execute(query).fetchall()
        
        bins = []
        counts = []
        for row in results:
            bin_start = row[0]
            bin_label = f"{int(bin_start / 1000)}k"
            bins.append(bin_label)
            counts.append(row[1])

        # 3. Compute Summary Stats separately
        summary = conn.execute(f"""
            SELECT 
                COUNT(*), 
                COUNT({column}), 
                AVG({column}), 
                STDDEV({column}),
                MIN({column}),
                MAX({column})
            FROM loans
        """).fetchone()
        
        conn.close()
        
        return AnalysisResponse(
            title=f"Distribution of {column}",
            chart_type="bar",
            data={
                "xAxis": bins,
                "series": [{"data": counts, "type": "bar"}],
                "summary": {
                    "count": summary[0],
                    "missing": summary[0] - summary[1],
                    "mean": round(summary[2] or 0, 2),
                    "std": round(summary[3] or 0, 2),
                    "min": summary[4],
                    "max": summary[5]
                }
            }
        )

analysis_service = AnalysisService()
