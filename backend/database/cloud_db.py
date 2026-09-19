import os
import json
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

# We use psycopg2 for Postgres and pymysql for MySQL under the hood
# The URLs in .env must be formatted correctly for SQLAlchemy.
# e.g., postgresql://...
# e.g., mysql+pymysql://...

# 1. Neon PostgreSQL Engine (Education)
neon_url = os.getenv('POSTGRES_EDUCATION_URL')
# ensure it has the correct prefix for sqlalchemy
if neon_url and neon_url.startswith('postgres://'):
    neon_url = neon_url.replace('postgres://', 'postgresql://', 1)
    
if neon_url:
    neon_engine = create_engine(neon_url, pool_pre_ping=True)
else:
    neon_engine = None

# 2. Aiven MySQL Engine (Agriculture)
aiven_url = os.getenv('MYSQL_AGRICULTURE_URL')
if aiven_url:
    aiven_engine = create_engine(aiven_url, pool_pre_ping=True)
else:
    aiven_engine = None


def init_cloud_dbs():
    """Create the required tables in the cloud databases if they don't exist."""
    
    if neon_engine:
        with neon_engine.begin() as conn:
            # We will use their existing 'education_records' table
            # but we need to ensure it has a master_id column to link it
            conn.execute(text('''
                ALTER TABLE education_records ADD COLUMN IF NOT EXISTS master_id VARCHAR(100) UNIQUE;
                ALTER TABLE education_records ADD COLUMN IF NOT EXISTS institution VARCHAR(255);
                ALTER TABLE education_records ADD COLUMN IF NOT EXISTS scholarship_status VARCHAR(50);
                ALTER TABLE education_records ADD COLUMN IF NOT EXISTS student_id VARCHAR(50);
                ALTER TABLE education_records ADD COLUMN IF NOT EXISTS course VARCHAR(100);
                ALTER TABLE education_records ADD COLUMN IF NOT EXISTS year_semester VARCHAR(100);
                ALTER TABLE education_records ADD COLUMN IF NOT EXISTS enrollment_number VARCHAR(100);
                ALTER TABLE education_records ADD COLUMN IF NOT EXISTS academic_aggregate VARCHAR(50);
                ALTER TABLE education_records ADD COLUMN IF NOT EXISTS attendance_status VARCHAR(50);
                ALTER TABLE education_records ADD COLUMN IF NOT EXISTS study_mode VARCHAR(100);
                ALTER TABLE education_records ADD COLUMN IF NOT EXISTS institution_ranking VARCHAR(100);
                ALTER TABLE education_records ADD COLUMN IF NOT EXISTS last_passed_exam VARCHAR(100);
            '''))
        print("[Cloud DB] Linked to existing Neon PostgreSQL (education_records)")
    else:
        print("[Cloud DB] Warning: POSTGRES_EDUCATION_URL not set")
        
    if aiven_engine:
        with aiven_engine.begin() as conn:
            conn.execute(text('''
                CREATE TABLE IF NOT EXISTS agriculture_profiles (
                    master_id VARCHAR(100) PRIMARY KEY,
                    farmer_id VARCHAR(100),
                    land_parcels JSON
                )
            '''))
        print("[Cloud DB] Initialized Aiven MySQL (agriculture_profiles)")
    else:
        print("[Cloud DB] Warning: MYSQL_AGRICULTURE_URL not set")


def insert_education_profile(profile_data):
    if not neon_engine: return
    
    with neon_engine.begin() as conn:
        try:
            curr_edu = profile_data.get("current_education", {})
            conn.execute(
                text('''
                    INSERT INTO education_records (
                        master_id, student_name, degree, graduation_year, gpa, institution, scholarship_status,
                        student_id, course, year_semester, enrollment_number, academic_aggregate, attendance_status, study_mode, institution_ranking, last_passed_exam
                    )
                    VALUES (
                        :master_id, :name, :degree, :grad_year, :gpa, :institution, :scholarship_status,
                        :student_id, :course, :year_semester, :enrollment_number, :academic_aggregate, :attendance_status, :study_mode, :institution_ranking, :last_passed_exam
                    )
                    ON CONFLICT (master_id) DO UPDATE SET
                        student_name = EXCLUDED.student_name,
                        degree = EXCLUDED.degree,
                        graduation_year = EXCLUDED.graduation_year,
                        gpa = EXCLUDED.gpa,
                        institution = EXCLUDED.institution,
                        scholarship_status = EXCLUDED.scholarship_status,
                        student_id = EXCLUDED.student_id,
                        course = EXCLUDED.course,
                        year_semester = EXCLUDED.year_semester,
                        enrollment_number = EXCLUDED.enrollment_number,
                        academic_aggregate = EXCLUDED.academic_aggregate,
                        attendance_status = EXCLUDED.attendance_status,
                        study_mode = EXCLUDED.study_mode,
                        institution_ranking = EXCLUDED.institution_ranking,
                        last_passed_exam = EXCLUDED.last_passed_exam
                '''),
                {
                    "master_id": profile_data.get("master_id"),
                    "name": profile_data.get("name", "Student"),
                    "degree": curr_edu.get("course", "B.Tech"),
                    "grad_year": curr_edu.get("grad_year", 2026),
                    "gpa": float(curr_edu.get("cgpa", 0.0)),
                    "institution": curr_edu.get("institution", "State Technical University"),
                    "scholarship_status": curr_edu.get("scholarship_status", "Approved"),
                    "student_id": curr_edu.get("student_id", "STU-280916"),
                    "course": curr_edu.get("course", "B.Tech Computer Science"),
                    "year_semester": curr_edu.get("year_semester", "3rd Year, 5th Semester"),
                    "enrollment_number": curr_edu.get("enrollment_number", "ENR20260916"),
                    "academic_aggregate": curr_edu.get("academic_aggregate", "85.5%"),
                    "attendance_status": curr_edu.get("attendance_status", "92% (Satisfactory)"),
                    "study_mode": curr_edu.get("study_mode", "Regular / Full-Time"),
                    "institution_ranking": curr_edu.get("institution_ranking", "NAAC A++ (Approved)"),
                    "last_passed_exam": curr_edu.get("last_passed_exam", "Cleared with Distinction")
                }
            )
        except Exception as e:
            print(f"[Cloud DB Error] Could not insert into education_records: {e}")

def insert_agriculture_profile(profile_data):
    if not aiven_engine: return
    
    with aiven_engine.begin() as conn:
        conn.execute(
            text('''
                INSERT INTO agriculture_profiles (master_id, farmer_id, land_parcels)
                VALUES (:master_id, :farmer_id, :land_parcels)
                ON DUPLICATE KEY UPDATE 
                    farmer_id = VALUES(farmer_id),
                    land_parcels = VALUES(land_parcels)
            '''),
            {
                "master_id": profile_data.get("master_id"),
                "farmer_id": profile_data.get("farmer_id"),
                "land_parcels": json.dumps(profile_data.get("land_parcels", []))
            }
        )

def get_education_profile(master_id):
    if not neon_engine: return None
    
    with neon_engine.connect() as conn:
        try:
            result = conn.execute(
                text("SELECT * FROM education_records WHERE master_id = :m_id"),
                {"m_id": master_id}
            ).fetchone()
            
            if result:
                row_dict = result._asdict()
                return {
                    'master_id': row_dict.get('master_id'),
                    'course': row_dict.get('degree'),
                    'institution': row_dict.get('institution') or 'Neon University',
                    'cgpa': float(row_dict.get('gpa', 0)),
                    'scholarship_status': row_dict.get('scholarship_status', 'N/A'),
                    'source': 'Neon PostgreSQL'
                }
        except Exception as e:
            print(f"[Cloud DB Error] Error fetching from education_records: {e}")
            
    return None

def get_agriculture_profile(master_id):
    if not aiven_engine: return None
    
    with aiven_engine.connect() as conn:
        result = conn.execute(
            text("SELECT * FROM agriculture_profiles WHERE master_id = :m_id"),
            {"m_id": master_id}
        ).fetchone()
        
        if result:
            row_dict = result._asdict()
            if isinstance(row_dict.get('land_parcels'), str):
                row_dict['land_parcels'] = json.loads(row_dict['land_parcels'])
            row_dict['source'] = 'Aiven MySQL'
            return row_dict
    return None

