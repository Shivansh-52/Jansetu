import os
import sqlite3
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import mysql.connector
from pymongo import MongoClient
from dotenv import load_dotenv
import urllib.parse
import random
import datetime

# Load root .env
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(env_path)

print("--- Polyglot Database Bulk Seeder ---")

# Realistic Indian Data Pools
first_names = ["Aarav", "Neha", "Rahul", "Priya", "Vikram", "Sneha", "Karan", "Anjali", "Ravi", "Pooja", "Amit", "Sita", "Rohit", "Divya"]
last_names = ["Sharma", "Verma", "Patel", "Singh", "Kumar", "Gupta", "Desai", "Joshi", "Reddy", "Mehta"]
districts = ["Indore", "Bhopal", "Mumbai", "Pune", "Delhi", "Bengaluru", "Ahmedabad", "Jaipur", "Lucknow", "Patna"]
crops = ["Wheat", "Rice", "Sugarcane", "Cotton", "Maize", "Soybean", "Millet"]
degrees = ["B.Tech Computer Science", "B.Sc Agriculture", "B.A History", "MBBS", "MBA", "B.Com", "M.Tech"]
diagnoses = ["Healthy", "Viral Fever", "Diabetes Type 2", "Hypertension", "Asthma", "Dengue", "Malaria", "Typhoid"]
blood_groups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
statuses = ["active", "maintenance", "offline", "provisioning"]

def generate_name():
    return f"{random.choice(first_names)} {random.choice(last_names)}"

# 1. SQLite (Infrastructure)
try:
    sqlite_path = os.getenv('SQLITE_PATH', './samadhan_path.db')
    conn = sqlite3.connect(sqlite_path)
    c = conn.cursor()
    c.execute("DROP TABLE IF EXISTS infrastructure_nodes")
    c.execute('''CREATE TABLE IF NOT EXISTS infrastructure_nodes (id INTEGER PRIMARY KEY, name TEXT, status TEXT, last_checked TEXT)''')
    for i in range(1, 11):
        c.execute("INSERT INTO infrastructure_nodes (name, status, last_checked) VALUES (?, ?, ?)", 
                  (f"node-{i}-{random.choice(['alpha', 'beta', 'gamma'])}", random.choice(statuses), str(datetime.datetime.now())))
    conn.commit()
    conn.close()
    print(f"SQLite (Infrastructure): Seeded 10 nodes successfully.")
except Exception as e:
    print(f"SQLite Error: {e}")

# 2. PostgreSQL (Education/Gateway/Public Services)
try:
    pg_url = os.getenv('POSTGRES_GATEWAY_URL')
    if pg_url:
        pg_conn = psycopg2.connect(pg_url)
        pg_cursor = pg_conn.cursor()
        pg_cursor.execute("DROP TABLE IF EXISTS education_records;")
        pg_cursor.execute("CREATE TABLE IF NOT EXISTS education_records (id SERIAL PRIMARY KEY, student_name VARCHAR(100), degree VARCHAR(100), graduation_year INT, gpa DECIMAL(3,2));")
        for _ in range(15):
            pg_cursor.execute("INSERT INTO education_records (student_name, degree, graduation_year, gpa) VALUES (%s, %s, %s, %s);",
                              (generate_name(), random.choice(degrees), random.randint(2018, 2026), round(random.uniform(6.0, 9.8), 2)))
        pg_conn.commit()
        pg_cursor.close()
        pg_conn.close()
        print("PostgreSQL (Neon): Seeded 15 education records successfully.")
    else:
        print("PostgreSQL Error: No connection URL found.")
except Exception as e:
    print(f"PostgreSQL Error: {e}")

# 3. MySQL (Agriculture)
try:
    mysql_url = os.getenv('MYSQL_URL')
    if mysql_url:
        parsed = urllib.parse.urlparse(mysql_url)
        db_name = parsed.path[1:] if parsed.path else 'samadhan_path'
        
        mysql_conn = mysql.connector.connect(
            host=parsed.hostname,
            port=parsed.port,
            user=parsed.username,
            password=parsed.password,
            database=db_name,
            ssl_disabled=False
        )
        mysql_cursor = mysql_conn.cursor()
        mysql_cursor.execute("DROP TABLE IF EXISTS agriculture_yields;")
        mysql_cursor.execute("CREATE TABLE IF NOT EXISTS agriculture_yields (id INT AUTO_INCREMENT PRIMARY KEY, farmer_name VARCHAR(100), crop VARCHAR(100), yield_tons DECIMAL(10,2), district VARCHAR(100));")
        for _ in range(20):
            mysql_cursor.execute("INSERT INTO agriculture_yields (farmer_name, crop, yield_tons, district) VALUES (%s, %s, %s, %s);",
                                 (generate_name(), random.choice(crops), round(random.uniform(5.0, 50.0), 2), random.choice(districts)))
        mysql_conn.commit()
        mysql_cursor.close()
        mysql_conn.close()
        print("MySQL (Aiven): Seeded 20 agriculture yields successfully.")
    else:
        print("MySQL Error: No connection URL found.")
except Exception as e:
    print(f"MySQL Error: {e}")

# 4. MongoDB (Healthcare & Core)
try:
    mongo_url = os.getenv('MONGODB_URL')
    if mongo_url:
        mongo_client = MongoClient(mongo_url)
        mongo_db = mongo_client['samadhan_path']
        
        healthcare_data = []
        for _ in range(25):
            healthcare_data.append({
                "patient_name": generate_name(),
                "diagnosis": random.choice(diagnoses),
                "blood_group": random.choice(blood_groups),
                "district": random.choice(districts),
                "visit_date": datetime.datetime.now() - datetime.timedelta(days=random.randint(1, 365)),
                "status": random.choice(["Admitted", "Discharged", "Outpatient"])
            })
        mongo_db.healthcare_records.insert_many(healthcare_data)
        
        print("MongoDB (Atlas): Seeded 25 healthcare records successfully.")
    else:
        print("MongoDB Error: No connection URL found.")
except Exception as e:
    print(f"MongoDB Error: {e}")

print("--------------------------------")
print("Bulk Seeding Complete!")
