"""
Challenge 4: Blind Time-Based SQL Injection.

Scenario: a "check username availability" lookup. The response body is
identical no matter what (no boolean leak, no error leak) -- the only signal
an attacker (or student) has is response latency, e.g. via SLEEP()-style
payloads. We return elapsed_ms so the Live Query Visualizer can plot it,
which is a platform teaching feature, not something a real attacker would
have.
"""
from flask import Blueprint, request
import mysql.connector
from db_connection import get_conn
from utils import timed_execute, challenge_response, require_json_fields

bp = Blueprint("blind_time", __name__, url_prefix="/api/challenge/blind-time")


@bp.route("", methods=["POST"])
@require_json_fields("mode", "username")
def blind_time():
    data = request.get_json()
    mode = data["mode"]
    username = str(data["username"])

    conn = get_conn()
    cursor = conn.cursor()
    try:
        if mode == "vulnerable":
            query = f"SELECT id FROM users WHERE username='{username}'"
            query_shown = query
            try:
                _rows, _columns, elapsed = timed_execute(cursor, query)
                return challenge_response(
                    query_shown, mode, success=None, elapsed_ms=elapsed,
                    message="Request processed"
                )
            except mysql.connector.Error:
                return challenge_response(
                    query_shown, mode, success=None,
                    message="Request processed"
                )
        else:
            query = "SELECT id FROM users WHERE username=%s"
            query_shown = f"{query}   -- params: ({username!r},)"
            try:
                _rows, _columns, elapsed = timed_execute(cursor, query, (username,))
                return challenge_response(
                    query_shown, mode, success=None, elapsed_ms=elapsed,
                    message="Request processed"
                )
            except mysql.connector.Error:
                return challenge_response(
                    query_shown, mode, success=None,
                    message="Request processed"
                )
    finally:
        cursor.close()
        conn.close()
