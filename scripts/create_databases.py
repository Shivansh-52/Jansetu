import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import mysql.connector
from dotenv import load_dotenv
import urllib.parse

# Load root .env
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(env_path)

print("--- Creating Cloud Databases ---")

# PostgreSQL
try:
    pg_url = os.getenv('POSTGRES_GATEWAY_URL')
    if pg_url:
        # Connect to 'neondb' instead of 'samadhan_path' to create the DB
        admin_url = pg_url.replace('/samadhan_path', '/neondb')
        conn = psycopg2.connect(admin_url)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if DB exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname='samadhan_path'")
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute("CREATE DATABASE samadhan_path;")
            print("PostgreSQL: Created 'samadhan_path' database.")
        else:
            print("PostgreSQL: 'samadhan_path' already exists.")
        
        cursor.close()
        conn.close()
except Exception as e:
    print(f"PostgreSQL Error: {e}")

# MySQL
try:
    mysql_url = os.getenv('MYSQL_URL')
    if mysql_url:
        parsed = urllib.parse.urlparse(mysql_url)
        
        # Connect to defaultdb
        mysql_conn = mysql.connector.connect(
            host=parsed.hostname,
            port=parsed.port,
            user=parsed.username,
            password=parsed.password,
            database='defaultdb',
            ssl_disabled=False
        )
        cursor = mysql_conn.cursor()
        
        cursor.execute("CREATE DATABASE IF NOT EXISTS samadhan_path;")
        print("MySQL: Created 'samadhan_path' database.")
        
        cursor.close()
        mysql_conn.close()
except Exception as e:
    print(f"MySQL Error: {e}")

print("--------------------------------")
