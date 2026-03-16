from database import db
import pandas as pd
import sqlite3

def run_query(sql: str) -> list[dict]:
    conn = db.get_connection()
    try:
        # We use pandas to run the SQL and format it cleanly to a list of dicts.
        df = pd.read_sql_query(sql, conn)
        return df.to_dict(orient="records")
    except Exception as e:
        # Raising with context to format error
        raise RuntimeError(f"SQL execution error: {str(e)}")
    finally:
        conn.close()
