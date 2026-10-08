"""Shared helpers for challenge blueprints."""
import time
from decimal import Decimal
from functools import wraps
from flask import jsonify


def serialize_cell(val):
    if isinstance(val, (bytes, bytearray)):
        return val.decode("utf-8", errors="replace")
    if isinstance(val, Decimal):
        return float(val)
    return val


def serialize_rows(rows):
    if not rows:
        return []
    return [[serialize_cell(cell) for cell in row] for row in rows]


def timed_execute(cursor, query, params=None):
    """Run a query, return (rows, column_names, elapsed_ms). Raises on DB error."""
    start = time.perf_counter()
    if params is not None:
        cursor.execute(query, params)
    else:
        cursor.execute(query)
    raw_rows = cursor.fetchall() if cursor.with_rows else []
    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
    columns = [d[0] for d in cursor.description] if cursor.description else []
    rows = serialize_rows(raw_rows)
    return rows, columns, elapsed_ms


def challenge_response(query_shown, mode, success=None, columns=None, rows=None,
                        elapsed_ms=None, error=None, message=None, extra=None):
    """Uniform JSON envelope the Live Query Visualizer expects."""
    payload = {
        "mode": mode,
        "query": query_shown,
        "success": success,
        "columns": columns or [],
        "rows": rows or [],
        "row_count": len(rows) if rows is not None else 0,
        "elapsed_ms": elapsed_ms,
        "error": error,
        "message": message,
    }
    if extra:
        payload["extra"] = extra
    return jsonify(payload)


def require_json_fields(*fields):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            from flask import request
            data = request.get_json(silent=True) or {}
            missing = [f for f in fields if f not in data]
            if missing:
                return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
            return fn(*args, **kwargs)
        return wrapper
    return decorator
