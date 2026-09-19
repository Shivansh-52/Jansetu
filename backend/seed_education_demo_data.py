"""
SamadhanPath Education Domain Demo Data Seeder
Populates 50-100 realistic synthetic student profiles, document vaults,
scholarships, loan categories, consents, and initial applications.
"""

import sys
import os
import random
import datetime

# Add parent dir to path so backend imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

from database.mongo import init_db, get_db

def seed_education_data():
    print("🚀 Seeding SamadhanPath Education Domain Demo Data...")
    
    # Initialize DB
    db = init_db()
    if db is None:
        print("❌ Could not connect to database. Check MONGO_URI.")
        return

    # Data Pools
    first_names = ["Aarav", "Neha", "Rahul", "Priya", "Vikram", "Sneha", "Karan", "Anjali", "Ravi", "Pooja", 
                   "Amit", "Sita", "Rohit", "Divya", "Siddharth", "Kavya", "Aditya", "Riya", "Yash", "Ishita"]
    last_names = ["Sharma", "Verma", "Patel", "Singh", "Kumar", "Gupta", "Desai", "Joshi", "Reddy", "Mehta", 
                  "Chowdhury", "Nair", "Iyer", "Banerjee", "Chatterjee"]
    
    cities_mp = [("Bhopal", "Madhya Pradesh"), ("Indore", "Madhya Pradesh"), ("Gwalior", "Madhya Pradesh"), 
                 ("Jabalpur", "Madhya Pradesh"), ("Ujjain", "Madhya Pradesh"), ("Pune", "Maharashtra"), 
                 ("Mumbai", "Maharashtra"), ("Nagpur", "Maharashtra"), ("Delhi", "Delhi"), ("Bengaluru", "Karnataka")]
    
    institutions = [
        "National Institute of Technology, Bhopal",
        "Indian Institute of Technology, Indore",
        "Maulana Azad National Institute of Technology",
        "Devi Ahilya Vishwavidyalaya, Indore",
        "RGPV Technical University, Bhopal",
        "College of Engineering, Pune",
        "Delhi Technological University",
        "Bangalore Institute of Technology"
    ]
    
    courses = [
        "B.Tech Computer Science & Engineering",
        "B.Tech Electrical Engineering",
        "B.Tech Mechanical Engineering",
        "B.Tech Civil Engineering",
        "B.Sc Agriculture (Hons)",
        "MBBS",
        "B.Com (Hons)",
        "M.Tech Software Engineering",
        "MBA Finance & Systems",
        "Diploma in Electrical Engineering"
    ]
    
    categories = ["General", "OBC-NCL", "SC", "ST", "EWS"]

    # 1. Clear existing education collections
    db.education_profiles.delete_many({})
    db.documents.delete_many({})
    db.scholarships.delete_many({})
    db.loan_schemes.delete_many({})
    db.applications.delete_many({'domain': 'Education'})
    db.consents.delete_many({})

    # 2. Seed Scholarships
    scholarships = [
        {
            "id": "SCH-001",
            "scheme_name": "SamadhanPath Demo Merit-cum-Means Post-Matric Scholarship",
            "provider": "Department of Higher Education",
            "purpose": "Financial assistance for meritorious students from economically weaker sections.",
            "eligibility": "Minimum 75% marks in previous academic year, Family Income < ₹2,50,000/year",
            "min_score": 75.0,
            "max_income": 250000,
            "category_eligible": ["General", "OBC-NCL", "SC", "ST", "EWS"],
            "required_documents": ["Income Certificate", "Academic Marksheet", "Domicile Certificate", "Bank DBT Details"],
            "start_date": "2026-07-01",
            "end_date": "2026-11-30",
            "benefit": "₹50,000 per year + Full Course Fee Subvention",
            "status": "OPEN",
            "source_type": "DEMO Prototype Scheme (Ref: Central Sector Scheme Guidelines)"
        },
        {
            "id": "SCH-002",
            "scheme_name": "SamadhanPath Demo Technical & Professional Education Fellowship",
            "provider": "AICTE / Higher Education Council",
            "purpose": "Fellowship support for B.Tech, M.Tech, and MCA engineering students.",
            "eligibility": "Currently enrolled in B.Tech/M.Tech, minimum 80% aggregate score",
            "min_score": 80.0,
            "max_income": 600000,
            "category_eligible": ["General", "OBC-NCL", "SC", "ST", "EWS"],
            "required_documents": ["Student ID Proof", "Academic Transcript", "Income Certificate"],
            "start_date": "2026-08-15",
            "end_date": "2026-12-15",
            "benefit": "₹75,000 per year direct tuition grant",
            "status": "OPEN",
            "source_type": "DEMO Prototype Scheme"
        },
        {
            "id": "SCH-003",
            "scheme_name": "SamadhanPath Demo Central Sector Girls STEM Education Grant",
            "provider": "Department of Social Justice & Empowerment",
            "purpose": "Encouraging female participation in STEM degree courses.",
            "eligibility": "Female students pursuing B.Sc, B.Tech, or MBBS, Family Income < ₹4,50,000/year",
            "min_score": 70.0,
            "max_income": 450000,
            "category_eligible": ["General", "OBC-NCL", "SC", "ST", "EWS"],
            "required_documents": ["Gender Certificate", "College Admission Proof", "Income Certificate"],
            "start_date": "2026-06-01",
            "end_date": "2026-10-31",
            "benefit": "₹60,000 per year + Free Laptop Allowance",
            "status": "OPEN",
            "source_type": "DEMO Prototype Scheme"
        },
        {
            "id": "SCH-004",
            "scheme_name": "SamadhanPath Demo SC/ST Higher Studies Special Support",
            "provider": "Tribal & Social Welfare Department",
            "purpose": "Full fee waiver and maintenance stipend for SC/ST students in higher education.",
            "eligibility": "SC/ST category candidates enrolled in recognized university degree program",
            "min_score": 60.0,
            "max_income": 300000,
            "category_eligible": ["SC", "ST"],
            "required_documents": ["Caste Certificate", "Income Certificate", "Admission Fee Receipt"],
            "start_date": "2026-05-01",
            "end_date": "2026-12-31",
            "benefit": "100% Tuition Fee Refund + ₹4,000 monthly hostel stipend",
            "status": "OPEN",
            "source_type": "DEMO Prototype Scheme"
        }
    ]
    db.scholarships.insert_many(scholarships)
    print(f"✅ Seeded {len(scholarships)} Demo Scholarships.")

    # 3. Seed Loan Categories (6 Categories)
    loans = [
        {
            "id": "LOAN-001",
            "scheme_name": "SamadhanPath Demo Student Education Loan",
            "category_name": "1. Student Education Loan",
            "provider": "Public Sector Banks Interoperable Network",
            "purpose": "Covering undergraduate degree tuition fees and study materials.",
            "eligible_education_level": "Undergraduate (B.Tech, B.Sc, B.Com, B.A)",
            "eligible_course_type": "Full-Time Degree Courses",
            "max_amount": "Up to ₹10,000,000 (Collateral-Free up to ₹7,50,000)",
            "interest_info": "Subsidized Interest Rate ~ 7.25% p.a. (Demo Rate)",
            "repayment_info": "Flexible EMIs up to 15 years post-moratorium",
            "moratorium_info": "Course Duration + 1 Year Grace Period",
            "required_documents": ["Admission Proof", "Academic Marksheets", "Parent/Self Income Verification", "KYC"],
            "application_window": "Year-round Open Window",
            "eligibility": "Admitted to recognized institution, Aggregate score ≥ 60%",
            "status": "ACTIVE",
            "source_type": "DEMO Prototype Category (Ref: Vidya Lakshmi Benchmark)"
        },
        {
            "id": "LOAN-002",
            "scheme_name": "SamadhanPath Demo Higher Education Premier Loan",
            "category_name": "2. Higher Education Loan",
            "provider": "Nationalized Banks Association",
            "purpose": "Post-graduate degrees (M.Tech, MBA, MS, LLM) in premier national institutes.",
            "eligible_education_level": "Post-Graduate & Master Degrees",
            "eligible_course_type": "Premier Institutes (IIT, NIT, IIM, AIIMS)",
            "max_amount": "Up to ₹20,000,000 without collateral",
            "interest_info": "Concessional Interest Rate ~ 6.85% p.a. (Demo Rate)",
            "repayment_info": "Up to 15 years",
            "moratorium_info": "Course Duration + 1 Year",
            "required_documents": ["Entrance Test Scorecard", "Offer Letter", "PAN/Aadhaar", "Income Certificate"],
            "application_window": "Open",
            "eligibility": "Secured seat in premier institute, Academic score ≥ 70%",
            "status": "ACTIVE",
            "source_type": "DEMO Prototype Category"
        },
        {
            "id": "LOAN-003",
            "scheme_name": "SamadhanPath Demo Professional Course Loan",
            "category_name": "3. Professional Course Loan",
            "provider": "State Financial Assistance Council",
            "purpose": "Professional clinical, legal, aviation, and architecture programs (MBBS, BDS, CA, Commercial Pilot).",
            "eligible_education_level": "Professional Degrees",
            "eligible_course_type": "MBBS, CA, Commercial Pilot License, Architecture",
            "max_amount": "Up to ₹30,000,000 with institutional guarantee",
            "interest_info": "Indicative Interest Rate ~ 7.50% p.a. (Demo Rate)",
            "repayment_info": "Up to 20 years",
            "moratorium_info": "Course Duration + Internship Period (up to 2 Years)",
            "required_documents": ["Professional Entrance Rank Proof", "Fee Structure Breakdown", "KYC & Domicile"],
            "application_window": "Open",
            "eligibility": "Cleared national entrance examination (NEET, JEE, NATA)",
            "status": "ACTIVE",
            "source_type": "DEMO Prototype Category"
        },
        {
            "id": "LOAN-004",
            "scheme_name": "SamadhanPath Demo Skill & Vocational Education Loan",
            "category_name": "4. Skill/Vocational Education Loan",
            "provider": "National Skill Development Financing Agency",
            "purpose": "Funding NSQF-aligned skill courses, ITI diplomas, and polytechnics.",
            "eligible_education_level": "Diploma / Vocational Certificate",
            "eligible_course_type": "Polytechnic, ITI, Certified Skill Training",
            "max_amount": "Up to ₹300,000 (No Collateral)",
            "interest_info": "Subsidized Interest Rate ~ 6.00% p.a. (Demo Rate)",
            "repayment_info": "Up to 7 years",
            "moratorium_info": "Course Duration + 6 Months",
            "required_documents": ["Skill Center Admission Letter", "10th/12th Marksheet", "Income Verification"],
            "application_window": "Open",
            "eligibility": "10th/12th Pass student enrolled in approved vocational center",
            "status": "ACTIVE",
            "source_type": "DEMO Prototype Category"
        },
        {
            "id": "LOAN-005",
            "scheme_name": "SamadhanPath Demo Research & Doctorate Higher Studies Loan",
            "category_name": "5. Research/Higher Studies Loan",
            "provider": "Higher Education Research Support Board",
            "purpose": "Ph.D., Post-Doctoral fellowships, and overseas research thesis work.",
            "eligible_education_level": "Ph.D. / Research Fellowship",
            "eligible_course_type": "Doctoral Research & International Collaboration",
            "max_amount": "Up to ₹25,000,000 with research grant linkage",
            "interest_info": "Zero Interest during Research Period, 6.50% p.a. after completion",
            "repayment_info": "Up to 12 years post-thesis submission",
            "moratorium_info": "Ph.D. Duration (up to 5 Years)",
            "required_documents": ["Research Proposal Approval", "Supervisor Letter", "Published Papers / Marksheet"],
            "application_window": "Open",
            "eligibility": "Master's degree with ≥ 75% marks, approved research proposal",
            "status": "ACTIVE",
            "source_type": "DEMO Prototype Category"
        },
        {
            "id": "LOAN-006",
            "scheme_name": "SamadhanPath Demo Need-Based Student Financial Assistance",
            "category_name": "6. Need-Based Student Financial Assistance",
            "provider": "Social Welfare Micro-Credit Trust",
            "purpose": "Emergency micro-loans for exam fees, hostel rent, and laptop equipment.",
            "eligible_education_level": "All Enrolled Students",
            "eligible_course_type": "Any Accredited Course",
            "max_amount": "Up to ₹150,000 instant credit line",
            "interest_info": "0% Interest (Fully Subsidized by State)",
            "repayment_info": "Repayable in easy installments over 36 months",
            "moratorium_info": "Till Course Completion",
            "required_documents": ["Valid Student ID", "Income Certificate (< ₹2.0 Lakh)"],
            "application_window": "Open",
            "eligibility": "Family Income < ₹2,00,000 per annum",
            "status": "ACTIVE",
            "source_type": "DEMO Prototype Category"
        }
    ]
    db.loan_schemes.insert_many(loans)
    print(f"✅ Seeded {len(loans)} Demo Loan Categories.")

    # 4. Seed 75 Student Profiles & Documents
    profiles = []
    documents = []

    # Ensure fixed demo users exist
    fixed_master_ids = ["SP-000001", "SP-000002", "SP-000003"]
    
    for i in range(1, 76):
        if i <= len(fixed_master_ids):
            master_id = fixed_master_ids[i-1]
        else:
            master_id = f"SP-{100000 + i:06d}"

        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        city, state = random.choice(cities_mp)
        course = random.choice(courses)
        inst = random.choice(institutions)
        score = round(random.uniform(62.0, 94.5), 1)
        income = random.choice([150000, 180000, 220000, 240000, 320000, 450000, 550000, 650000])
        category = random.choice(categories)
        yr = random.choice(["1st Year / 2nd Sem", "2nd Year / 4th Sem", "3rd Year / 6th Sem", "4th Year / 8th Sem"])

        prof = {
            "master_id": master_id,
            "student_id": f"STU-{10000 + i}",
            "name": name,
            "dob": f"{random.randint(2001, 2005)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
            "institution": inst,
            "course": course,
            "year_semester": yr,
            "enrollment_number": f"ENR-2024-{1000 + i}",
            "academic_performance": score,
            "family_income": income,
            "family_income_status": f"Eligible (₹{income:,}/yr)",
            "category": category,
            "address": f"Plot {random.randint(1, 100)}, Ward {random.randint(1, 25)}, Main Road",
            "state": state,
            "district": city,
            "student_status": "Active Student",
            "bank_account": f"XXXX-XXXX-{random.randint(1000, 9999)} (State Bank of India)",
            "bank_ifsc": "SBIN0001234",
            "bank_verified": True
        }
        profiles.append(prof)

        # Build Documents for each user
        docs_for_user = [
            {
                "master_id": master_id,
                "doc_type": "income",
                "doc_name": "Income Certificate",
                "doc_number": f"INC-2026-{1000 + i}",
                "issuing_dept": "Public Services / Revenue Department",
                "issue_date": "2026-01-15",
                "expiry_date": "2027-03-31",
                "verification_status": "Verified",
                "last_verified": "2026-08-10"
            },
            {
                "master_id": master_id,
                "doc_type": "domicile",
                "doc_name": "Domicile Certificate",
                "doc_number": f"DOM-2026-{1000 + i}",
                "issuing_dept": "Public Services / Revenue Department",
                "issue_date": "2026-02-10",
                "expiry_date": "Permanent",
                "verification_status": "Verified",
                "last_verified": "2026-08-10"
            },
            {
                "master_id": master_id,
                "doc_type": "caste",
                "doc_name": f"{category} Category Certificate",
                "doc_number": f"CST-2026-{1000 + i}",
                "issuing_dept": "Revenue Department",
                "issue_date": "2026-03-05",
                "expiry_date": "Permanent",
                "verification_status": "Verified",
                "last_verified": "2026-08-10"
            },
            {
                "master_id": master_id,
                "doc_type": "academic",
                "doc_name": "12th Standard HSC Marksheet",
                "doc_number": f"HSC-2026-{1000 + i}",
                "issuing_dept": "State Secondary Education Board",
                "issue_date": "2022-06-20",
                "expiry_date": "Permanent",
                "verification_status": "Verified",
                "last_verified": "2026-08-10"
            },
            {
                "master_id": master_id,
                "doc_type": "student_id",
                "doc_name": "College Student Identity Card",
                "doc_number": f"SID-{1000 + i}",
                "issuing_dept": f"{inst} Academic Office",
                "issue_date": "2024-08-01",
                "expiry_date": "2028-06-30",
                "verification_status": "Verified",
                "last_verified": "2026-08-10"
            }
        ]
        documents.extend(docs_for_user)

    db.education_profiles.insert_many(profiles)
    db.documents.insert_many(documents)
    print(f"✅ Seeded {len(profiles)} Student Profiles and {len(documents)} Document Vault records.")

    # 5. Seed Sample Applications with EDU-2026-XXXXXX IDs
    sample_apps = []
    for idx, p in enumerate(profiles[:10]):
        app_id = f"EDU-2026-{100001 + idx:06d}"
        scheme = random.choice(loans + scholarships)
        s_type = "LOAN" if "LOAN" in scheme["id"] else "SCHOLARSHIP"
        stage = random.choice(["Department Review", "Approved", "Document Verification", "Processing"])
        consent_id = f"CONS-2026-{5000 + idx}"

        timeline = [
            {"stage": "Draft Created", "timestamp": "10 Sep 2026, 10:00 AM", "status": "Completed", "details": "Drafted"},
            {"stage": "Application Submitted", "timestamp": "10 Sep 2026, 10:15 AM", "status": "Completed", "details": f"Consent ID: {consent_id}"},
            {"stage": "Identity Verification", "timestamp": "10 Sep 2026, 10:16 AM", "status": "Completed", "details": "Master ID verified"},
            {"stage": "Document Verification", "timestamp": "10 Sep 2026, 10:18 AM", "status": "Completed", "details": "Revenue API verified"},
            {"stage": "Eligibility Verification", "timestamp": "10 Sep 2026, 10:20 AM", "status": "Completed", "details": "Passed rules"},
            {"stage": "Department Review", "timestamp": "11 Sep 2026, 02:30 PM", "status": "Completed" if stage in ["Approved", "Processing"] else "In Progress", "details": "Reviewing"},
            {"stage": "Additional Information Required", "timestamp": "-", "status": "Upcoming", "details": "None"},
            {"stage": "Processing", "timestamp": "12 Sep 2026, 11:00 AM" if stage in ["Approved", "Processing"] else "-", "status": "In Progress" if stage == "Processing" else ("Completed" if stage == "Approved" else "Upcoming"), "details": "Processing"},
            {"stage": "Approved / Rejected", "timestamp": "12 Sep 2026, 04:00 PM" if stage == "Approved" else "-", "status": "Completed" if stage == "Approved" else "Upcoming", "details": "Final decision"},
            {"stage": "Finalized", "timestamp": "-", "status": "Upcoming", "details": "Disbursement pending"}
        ]

        sample_apps.append({
            "applicationId": app_id,
            "master_id": p["master_id"],
            "scheme_id": scheme["id"],
            "scheme_name": scheme["scheme_name"],
            "scheme_type": s_type,
            "domain": "Education",
            "department": "Higher Education Department",
            "status": "Approved" if stage == "Approved" else ("Application Submitted" if stage == "Department Review" else stage),
            "current_stage": stage,
            "submitted_at": datetime.datetime.utcnow().isoformat() + "Z",
            "submitted_at_formatted": "10 Sep 2026, 10:15 AM",
            "consent_id": consent_id,
            "form_data": {
                "student_name": p["name"],
                "course": p["course"],
                "institution": p["institution"],
                "loan_amount_requested": "₹ 4,50,000",
                "bank_account": p["bank_account"]
            },
            "timeline": timeline,
            "verification_summary": {
                "identity_verified": True,
                "income_verified": True,
                "academic_verified": True,
                "cdm_data_exchanged": True
            }
        })

    db.applications.insert_many(sample_apps)
    print(f"✅ Seeded {len(sample_apps)} Sample Applications with format EDU-2026-XXXXXX.")
    print("✨ SamadhanPath Education Seeding Complete!")

if __name__ == '__main__':
    seed_education_data()
