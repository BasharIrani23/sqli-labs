"""
Central place for getting a MySQL connection.
Reads connection info from environment variables so the same code works
locally (docker-compose) and if you later redeploy elsewhere (e.g. Railway).
"""
import os
import mysql.connector
from mysql.connector import pooling

_pool = None


def get_pool():
    global _pool
    if _pool is None:
        _pool = pooling.MySQLConnectionPool(
            pool_name="sqlilabs_pool",
            pool_size=5,
            host=os.getenv("DB_HOST", "db"),
            port=int(os.getenv("DB_PORT", "3306")),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", "sqlilabs_root_pw"),
            database=os.getenv("DB_NAME", "sqlilabs"),
            autocommit=True,
        )
    return _pool


def get_conn():
    return get_pool().get_connection()
