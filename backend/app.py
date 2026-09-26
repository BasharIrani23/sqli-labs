from flask import Flask, jsonify
from flask_cors import CORS

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
        return jsonify({"status": "ok"})

    @app.route("/api/challenges")
    def list_challenges():
        return jsonify([
            {"id": "error-based", "title": "In-Band Error-Based",
             "description": "Product lookup by ID reflects raw DB errors."},
            {"id": "union-based", "title": "UNION-Based",
             "description": "Product search vulnerable to UNION SELECT extraction."},
            {"id": "blind-boolean", "title": "Blind Boolean-Based",
             "description": "Login check leaks only a true/false signal."},
            {"id": "blind-time", "title": "Blind Time-Based",
             "description": "Username lookup leaks only response timing."},
        ])

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
