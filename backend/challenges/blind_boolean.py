"""
Challenge 3: Blind Boolean-Based SQL Injection.

Scenario: a login check. The application deliberately reveals nothing but a
true/false "login succeeded" signal and masks raw DB errors -- students must
infer database contents purely from that boolean (e.g. ' OR 1=1-- payloads).
The Live Query Visualizer still shows the constructed query as a teaching
aid; that visibility is a platform feature, not something the target app
itself leaks to an attacker.
"""
from flask import Blueprint, request
import mysql.connector
from db_connection import get_conn
from utils import timed_execute, challenge_response, require_json_fields

bp = Blueprint("blind_boolean", __name__, url_prefix="/api/challenge/blind-boolean")


@bp.route("", methods=["POST"])
@require_json_fields("mode", "username", "password")
def blind_boolean():
    data = request.get_json()
    mode = data["mode"]
    username = str(data["username"])
    password = str(data["password"])

    conn = get_conn()
    cursor = conn.cursor()
    try:
        if mode == "vulnerable":
            query = (f"SELECT id FROM users WHERE username='{username}' "
                      f"AND password='{password}'")
            query_shown = query
            try:
                rows, _columns, elapsed = timed_execute(cursor, query)
                logged_in = len(rows) > 0
                return challenge_response(
                    query_shown, mode, success=logged_in, elapsed_ms=elapsed,
                    message="Login successful" if logged_in else "Login failed"
                )
            except mysql.connector.Error:
                # Masked on purpose -- a truly blind challenge doesn't leak DB errors.
                return challenge_response(
                    query_shown, mode, success=False,
                    message="Login failed"
                )
        else:
            query = "SELECT id FROM users WHERE username=%s AND password=%s"
            query_shown = f"{query}   -- params: ({username!r}, {password!r})"
            try:
                rows, _columns, elapsed = timed_execute(cursor, query, (username, password))
                logged_in = len(rows) > 0
                return challenge_response(
                    query_shown, mode, success=logged_in, elapsed_ms=elapsed,
                    message="Login successful" if logged_in else "Login failed"
                )
            except mysql.connector.Error:
                return challenge_response(
                    query_shown, mode, success=False,
                    message="Login failed"
                )
    finally:
        cursor.close()
        conn.close()
