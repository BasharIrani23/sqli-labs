"""
Challenge 2: UNION-Based SQL Injection.

Scenario: a product search box. The vulnerable version concatenates the
search term into a LIKE clause. Because `products` and `admin_secrets` both
have 3 selected columns of compatible types, a UNION SELECT payload against
admin_secrets returns in-band.
"""
from flask import Blueprint, request
import mysql.connector
from db_connection import get_conn
from utils import timed_execute, challenge_response, require_json_fields

bp = Blueprint("union_based", __name__, url_prefix="/api/challenge/union-based")


@bp.route("", methods=["POST"])
@require_json_fields("mode", "search")
def union_based():
    data = request.get_json()
    mode = data["mode"]
    search = str(data["search"])

    conn = get_conn()
    cursor = conn.cursor()
    try:
        if mode == "vulnerable":
            query = f"SELECT id, name, price FROM products WHERE name LIKE '%{search}%'"
            query_shown = query
            try:
                rows, columns, elapsed = timed_execute(cursor, query)
                return challenge_response(query_shown, mode, success=True,
                                           columns=columns, rows=rows, elapsed_ms=elapsed)
            except mysql.connector.Error as db_err:
                return challenge_response(query_shown, mode, success=False,
                                           error=str(db_err.msg))
        else:
            query = "SELECT id, name, price FROM products WHERE name LIKE %s"
            param = f"%{search}%"
            query_shown = f"{query}   -- params: ({param!r},)"
            try:
                rows, columns, elapsed = timed_execute(cursor, query, (param,))
                return challenge_response(query_shown, mode, success=True,
                                           columns=columns, rows=rows, elapsed_ms=elapsed)
            except mysql.connector.Error as db_err:
                return challenge_response(query_shown, mode, success=False,
                                           error=str(db_err.msg))
    finally:
        cursor.close()
        conn.close()
