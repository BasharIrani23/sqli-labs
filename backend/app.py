import os
from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector

from db_connection import get_conn
from challenges.error_based import bp as error_based_bp
from challenges.union_based import bp as union_based_bp
from challenges.blind_boolean import bp as blind_boolean_bp
from challenges.blind_time import bp as blind_time_bp


def create_app():
    app = Flask(__name__)
    CORS(app)  # dev-friendly; tighten origins for real deployment

    app.register_blueprint(error_based_bp)
    app.register_blueprint(union_based_bp)
    app.register_blueprint(blind_boolean_bp)
    app.register_blueprint(blind_time_bp)

    @app.route("/api/health")
    def health():
        db_status = "disconnected"
        db_version = None
        try:
            conn = get_conn()
            cursor = conn.cursor()
            cursor.execute("SELECT VERSION()")
            row = cursor.fetchone()
            if row:
                db_status = "connected"
                db_version = row[0]
            cursor.close()
            conn.close()
        except Exception as e:
            db_status = f"error: {str(e)}"

        return jsonify({
            "status": "ok",
            "database": db_status,
            "database_version": db_version,
            "database_name": os.getenv("DB_NAME", "sqlilabs"),
        })

    @app.route("/api/challenges")
    def list_challenges():
        return jsonify([
            {
                "id": "error-based",
                "title": "In-Band Error-Based",
                "category": "In-Band / Reflection",
                "difficulty": "Intermediate",
                "parameter": "numeric (ID)",
                "target": "products.id",
                "path": "/error-based",
                "description": "Product lookup by ID directly interpolates into SQL; raw database error messages are reflected back to the client.",
                "concepts": ["Type Mismatch", "XPath Injection (EXTRACTVALUE / UPDATEXML)", "Schema Enumeration", "Error Reflection"],
            },
            {
                "id": "union-based",
                "title": "UNION-Based",
                "category": "In-Band / Result Set Extension",
                "difficulty": "Easy to Medium",
                "parameter": "string (LIKE '%search%')",
                "target": "products.name",
                "path": "/union-based",
                "description": "Product search vulnerable to UNION SELECT queries; combine results with hidden tables like admin_secrets.",
                "concepts": ["Column Count Detection", "Data Type Compatibility", "information_schema Enumeration", "CTF Flag Exfiltration"],
            },
            {
                "id": "blind-boolean",
                "title": "Blind Boolean-Based",
                "category": "Inferential / Boolean Signal",
                "difficulty": "Medium to Hard",
                "parameter": "string (credentials)",
                "target": "users.username & users.password",
                "path": "/blind-boolean",
                "description": "Login check reveals only a binary true/false response; database errors are masked, requiring logical inference.",
                "concepts": ["Authentication Bypass", "Boolean Tautologies", "Substring Probing", "Blind Binary Search"],
            },
            {
                "id": "blind-time",
                "title": "Blind Time-Based",
                "category": "Inferential / Latency Channel",
                "difficulty": "Advanced",
                "parameter": "string (username lookup)",
                "target": "users.username",
                "path": "/blind-time",
                "description": "Username availability check leaks zero content difference; the only signal is database execution delay (SLEEP).",
                "concepts": ["Time-Delay Injection", "SLEEP() Function", "Conditional Delays (IF)", "Side-Channel Timing Analysis"],
            },
        ])

    @app.route("/api/schema")
    def get_schema():
        """Returns database tables and column schema for students to explore."""
        try:
            conn = get_conn()
            cursor = conn.cursor(dictionary=True)

            cursor.execute("""
                SELECT table_name, column_name, data_type, is_nullable, column_key
                FROM information_schema.columns
                WHERE table_schema = %s
                ORDER BY table_name, ordinal_position
            """, (os.getenv("DB_NAME", "sqlilabs"),))
            columns = cursor.fetchall()

            # Group columns by table
            tables = {}
            for col in columns:
                t_name = col["table_name"]
                if t_name not in tables:
                    tables[t_name] = {"name": t_name, "columns": [], "row_count": 0}
                tables[t_name]["columns"].append({
                    "name": col["column_name"],
                    "type": col["data_type"],
                    "nullable": col["is_nullable"] == "YES",
                    "key": col["column_key"]
                })

            # Get row count for each table
            for t_name in tables:
                cursor.execute(f"SELECT COUNT(*) as count FROM `{t_name}`")
                row = cursor.fetchone()
                if row:
                    tables[t_name]["row_count"] = row["count"]

            cursor.close()
            conn.close()
            return jsonify({"status": "ok", "tables": list(tables.values())})
        except Exception as e:
            return jsonify({"status": "error", "error": str(e)}), 500

    @app.route("/api/reset-db", methods=["POST"])
    def reset_database():
        """Resets the database tables and seeds to clean initial state."""
        try:
            conn = get_conn()
            cursor = conn.cursor()
            base_dir = os.path.dirname(os.path.abspath(__file__))
            schema_path = os.path.join(base_dir, "db", "schema.sql")
            seed_path = os.path.join(base_dir, "db", "seed.sql")

            for script_path in [schema_path, seed_path]:
                if os.path.exists(script_path):
                    with open(script_path, "r") as f:
                        sql = f.read()
                    for _ in cursor.execute(sql, multi=True):
                        pass

            cursor.close()
            conn.close()
            return jsonify({
                "status": "ok",
                "message": "Database successfully reset to default schema and seed records."
            })
        except Exception as e:
            return jsonify({"status": "error", "error": str(e)}), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
