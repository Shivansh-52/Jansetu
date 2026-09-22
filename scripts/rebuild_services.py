import os

services = {
    "gateway": {
        "port": 4001,
        "db": "samadhanpath.db",
        "init": """
            CREATE TABLE IF NOT EXISTS citizens (
                master_id TEXT PRIMARY KEY,
                full_name TEXT,
                mobile TEXT,
                email TEXT,
                dob TEXT,
                address TEXT,
                district TEXT,
                state TEXT,
                password TEXT,
                role TEXT DEFAULT 'CITIZEN'
            );
            CREATE TABLE IF NOT EXISTS master_identity_mappings (
                master_id TEXT PRIMARY KEY,
                education_id TEXT,
                healthcare_id TEXT,
                agriculture_id TEXT,
                municipal_id TEXT,
                revenue_id TEXT
            );
            CREATE TABLE IF NOT EXISTS applications (
                application_id TEXT PRIMARY KEY,
                master_id TEXT,
                service_id TEXT,
                service_type TEXT,
                department TEXT,
                department_reference_id TEXT,
                status TEXT,
                current_stage TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS consent_logs (
                consent_id TEXT PRIMARY KEY,
                master_id TEXT,
                requester TEXT,
                purpose TEXT,
                fields_shared TEXT,
                duration TEXT,
                status TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS audit_logs (
                log_id INTEGER PRIMARY KEY AUTOINCREMENT,
                master_id TEXT,
                role TEXT,
                department TEXT,
                endpoint TEXT,
                action TEXT,
                status TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """
    },
    "education": {
        "port": 4002,
        "db": "education.db",
        "init": """
            CREATE TABLE IF NOT EXISTS students (
                student_id TEXT PRIMARY KEY,
                student_name TEXT,
                mobile_no TEXT,
                dob TEXT
            );
            CREATE TABLE IF NOT EXISTS education_applications (
                edu_app_id TEXT PRIMARY KEY,
                student_id TEXT,
                application_type TEXT,
                status TEXT,
                stage TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """
    },
    "healthcare": {
        "port": 4003,
        "db": "healthcare.db",
        "init": """
            CREATE TABLE IF NOT EXISTS citizens (
                citizen_id TEXT PRIMARY KEY,
                full_name TEXT,
                phone TEXT
            );
            CREATE TABLE IF NOT EXISTS health_applications (
                health_app_id TEXT PRIMARY KEY,
                citizen_id TEXT,
                service_name TEXT,
                status TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """
    },
    "agriculture": {
        "port": 4004,
        "db": "agriculture.db",
        "init": """
            CREATE TABLE IF NOT EXISTS farmers (
                farmer_id TEXT PRIMARY KEY,
                farmer_name TEXT,
                contact_number TEXT
            );
            CREATE TABLE IF NOT EXISTS agriculture_requests (
                agri_req_id TEXT PRIMARY KEY,
                farmer_id TEXT,
                request_type TEXT,
                status TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """
    },
    "infrastructure": {
        "port": 4005,
        "db": "infrastructure.db",
        "init": """
            CREATE TABLE IF NOT EXISTS citizens (
                municipal_citizen_id TEXT PRIMARY KEY,
                applicant_name TEXT,
                mobile TEXT
            );
            CREATE TABLE IF NOT EXISTS infrastructure_requests (
                infra_req_id TEXT PRIMARY KEY,
                municipal_citizen_id TEXT,
                issue_type TEXT,
                status TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """
    },
    "public-services": {
        "port": 4006,
        "db": "revenue.db",
        "init": """
            CREATE TABLE IF NOT EXISTS applicants (
                applicant_id TEXT PRIMARY KEY,
                full_name TEXT,
                phone_number TEXT
            );
            CREATE TABLE IF NOT EXISTS certificate_applications (
                cert_app_id TEXT PRIMARY KEY,
                applicant_id TEXT,
                certificate_type TEXT,
                status TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """
    }
}

base_js = """
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./{db_name}', (err) => {{
    if (err) console.error('Database opening error: ', err);
}});

db.serialize(() => {{
    {init_queries}
}});

app.get('/api/health', (req, res) => {{
    res.json({{ status: 'OK', service: '{service_name}' }});
}});

const PORT = {port};
app.listen(PORT, () => console.log(`{service_name} Service running on port ${{PORT}}`));
"""

for service, config in services.items():
    dir_name = service if service == "gateway" else f"{service}"
    os.makedirs(dir_name, exist_ok=True)
    
    # Write init queries properly escaped for JS
    queries = config["init"].strip().split(';')
    init_js = ""
    for q in queries:
        if q.strip():
            init_js += f"db.run(`{q.strip()}`);\n    "
            
    content = base_js.format(
        db_name=config["db"],
        init_queries=init_js,
        service_name=service.capitalize(),
        port=config["port"]
    )
    
    with open(f"{dir_name}/index.js", "w") as f:
        f.write(content)
        
print("Services scaffolded successfully.")
