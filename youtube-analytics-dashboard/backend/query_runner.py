from database import db
import pandas as pd

def run_query(sql: str) -> list[dict]:
    conn = db.get_connection()
    try:
        df = pd.read_sql_query(sql, conn)
        return df.to_dict(orient="records")
    except Exception as e:
        raise RuntimeError(f"SQL execution error: {str(e)}")
    # Note: do NOT close conn — it's the persistent shared connection
