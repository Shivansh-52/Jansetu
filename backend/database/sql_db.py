import sqlite3
import json
import os

# We store the local SQL databases in the backend directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HEALTHCARE_DB_PATH = os.path.join(BASE_DIR, 'healthcare_postgres_sim.db')
AGRICULTURE_DB_PATH = os.path.join(BASE_DIR, 'agriculture_mysql_sim.db')

def get_healthcare_db():
    conn = sqlite3.connect(HEALTHCARE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_agriculture_db():
    conn = sqlite3.connect(AGRICULTURE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_sql_dbs():
    """Initialize the tables for the simulated SQL databases."""
    
    # Initialize Healthcare (PostgreSQL Simulation)
    with get_healthcare_db() as h_conn:
        h_conn.execute('''
            CREATE TABLE IF NOT EXISTS healthcare_profiles (
                master_id TEXT PRIMARY KEY,
                abha_id TEXT,
                blood_group TEXT,
                allergies TEXT,
                chronic_conditions TEXT
            )
        ''')
        h_conn.commit()
        
    # Initialize Agriculture (MySQL Simulation)
    with get_agriculture_db() as a_conn:
        a_conn.execute('''
            CREATE TABLE IF NOT EXISTS agriculture_profiles (
                master_id TEXT PRIMARY KEY,
                farmer_id TEXT,
                land_parcels TEXT
            )
        ''')
        a_conn.commit()
        
    print("[DB] Initialized Healthcare (PostgreSQL Sim) and Agriculture (MySQL Sim) databases.")

def insert_healthcare_profile(profile_data):
    """Insert or replace healthcare profile in SQL"""
    with get_healthcare_db() as conn:
        conn.execute('''
            INSERT OR REPLACE INTO healthcare_profiles (master_id, abha_id, blood_group, allergies, chronic_conditions)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            profile_data.get('master_id'),
            profile_data.get('abha_id'),
            profile_data.get('blood_group'),
            json.dumps(profile_data.get('allergies', [])),
            json.dumps(profile_data.get('chronic_conditions', []))
        ))
        conn.commit()

def insert_agriculture_profile(profile_data):
    """Insert or replace agriculture profile in SQL"""
    with get_agriculture_db() as conn:
        conn.execute('''
            INSERT OR REPLACE INTO agriculture_profiles (master_id, farmer_id, land_parcels)
            VALUES (?, ?, ?)
        ''', (
            profile_data.get('master_id'),
            profile_data.get('farmer_id'),
            json.dumps(profile_data.get('land_parcels', []))
        ))
        conn.commit()

def get_healthcare_profile(master_id):
    with get_healthcare_db() as conn:
        row = conn.execute('SELECT * FROM healthcare_profiles WHERE master_id = ?', (master_id,)).fetchone()
        if row:
            return {
                'master_id': row['master_id'],
                'abha_id': row['abha_id'],
                'blood_group': row['blood_group'],
                'allergies': json.loads(row['allergies']),
                'chronic_conditions': json.loads(row['chronic_conditions']),
                'source': 'PostgreSQL'
            }
        return None

def get_agriculture_profile(master_id):
    with get_agriculture_db() as conn:
        row = conn.execute('SELECT * FROM agriculture_profiles WHERE master_id = ?', (master_id,)).fetchone()
        if row:
            return {
                'master_id': row['master_id'],
                'farmer_id': row['farmer_id'],
                'land_parcels': json.loads(row['land_parcels']),
                'source': 'MySQL'
            }
        return None
