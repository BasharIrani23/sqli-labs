"""
Challenge 1: In-band Error-Based SQL Injection.

Scenario: a "view product by ID" lookup. The vulnerable version concatenates
the ID directly into a numeric context (no quotes), which is the classic
setup for error-based extraction via functions like extractvalue()/updatexml().
MySQL's own error text is reflected back to the client -- that reflection is
the "in-band, error-based" part.
"""
from flask import Blueprint, request
import mysql.connector
from db_connection import get_conn
from utils import timed_execute, challenge_response, require_json_fields

bp = Blueprint("error_based", __name__, url_prefix="/api/challenge/error-based")


@bp.route("", methods=["POST"])
@require_json_fields("mode", "product_id")
def error_based():
    data = request.get_json()
    mode = data["mode"]
    product_id = str(data["product_id"])

    conn = get_conn()
    cursor = conn.cursor()
    try:
        if mode == "vulnerable":
            # Intentionally unsafe: raw string interpolation, no quotes (numeric context).
            query = f"SELECT id, name, price FROM products WHERE id = {product_id}"
            query_shown = query
            try:
                rows, columns, elapsed = timed_execute(cursor, query)
                return challenge_response(query_shown, mode, success=True,
                                           columns=columns, rows=rows, elapsed_ms=elapsed)
            except mysql.connector.Error as db_err:
                # The whole point of error-based SQLi: the DB error is returned to the client.
                return challenge_response(query_shown, mode, success=False,
                                           error=str(db_err.msg))
        else:
            # Secure: parameterized query, input never touches the SQL text.
            query = "SELECT id, name, price FROM products WHERE id = %s"
            query_shown = f"{query}   -- params: ({product_id!r},)"
            try:
                rows, columns, elapsed = timed_execute(cursor, query, (product_id,))
                return challenge_response(query_shown, mode, success=True,
                                           columns=columns, rows=rows, elapsed_ms=elapsed)
            except mysql.connector.Error as db_err:
                return challenge_response(query_shown, mode, success=False,
                                           error=str(db_err.msg))
    finally:
        cursor.close()
        conn.close()
