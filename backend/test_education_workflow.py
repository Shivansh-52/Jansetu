"""
Automated Backend Integration Test for Education Domain Workflow
Tests profile lookup, loan/scholarship catalogues, rule-based eligibility,
document verification, OTP consent generation, application submission (EDU-2026-XXXXXX),
and officer review status update.
"""

import sys
import os
import unittest
import json

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

from app import app
from seed_education_demo_data import seed_education_data

class TestEducationWorkflow(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        print("\n=== Running Education Domain Integration Tests ===")
        seed_education_data()
        cls.client = app.test_client()

    def test_01_get_education_profile(self):
        res = self.client.get('/api/education/profile?master_id=SP-000001')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['master_id'], 'SP-000001')
        self.assertIn('documents', data)
        print("✓ Step 1: Student Profile API verified")

    def test_02_get_scholarships(self):
        res = self.client.get('/api/education/scholarships')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertGreaterEqual(len(data['scholarships']), 4)
        print("✓ Step 2: Scholarships Catalogue API verified")

    def test_03_get_loans(self):
        res = self.client.get('/api/education/loans')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(len(data['loans']), 6) # 6 Demo categories
        print("✓ Step 3: Education Loan Catalogue (6 Categories) API verified")

    def test_04_rule_based_eligibility(self):
        payload = {"master_id": "SP-000001", "course": "B.Tech Computer Science", "score": 84.5, "income": 220000}
        res = self.client.post('/api/education/eligibility', json=payload)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn('recommendations', data)
        self.assertGreaterEqual(len(data['recommendations']), 2)
        print("✓ Step 4: Deterministic Rule-Based Eligibility Engine verified")

    def test_05_document_verification_cdm(self):
        payload = {"master_id": "SP-000001", "doc_type": "income", "doc_number": "INC-2026-9812"}
        res = self.client.post('/api/education/verify-document', json=payload)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data['success'])
        self.assertIn('cdm_data', data)
        self.assertEqual(data['cdm_data']['verificationStatus'], 'VERIFIED')
        print("✓ Step 5: Document Verification & CDM Transformation verified")

    def test_06_otp_consent_verification(self):
        # 1. Send OTP
        res1 = self.client.post('/api/education/consent/send-otp', json={"master_id": "SP-000001", "mobile": "9876543210"})
        self.assertEqual(res1.status_code, 200)

        # 2. Verify OTP
        res2 = self.client.post('/api/education/consent/verify-otp', json={"master_id": "SP-000001", "otp_code": "123456"})
        self.assertEqual(res2.status_code, 200)
        data2 = json.loads(res2.data)
        self.assertTrue(data2['success'])
        self.assertIn('consentId', data2['consent'])
        self.consent_id = data2['consent']['consentId']
        print(f"✓ Step 6: OTP Verification & Consent Issued ({self.consent_id})")

    def test_07_application_submission_unified_id(self):
        # First verify consent
        res2 = self.client.post('/api/education/consent/verify-otp', json={"master_id": "SP-000001", "otp_code": "123456"})
        consent_id = json.loads(res2.data)['consent']['consentId']

        payload = {
            "master_id": "SP-000001",
            "scheme_id": "LOAN-001",
            "scheme_name": "SamadhanPath Demo Student Education Loan",
            "scheme_type": "LOAN",
            "consent_id": consent_id,
            "form_data": {"course_fee": "₹ 1,50,000", "loan_amount_requested": "₹ 5,00,000"}
        }
        res = self.client.post('/api/education/applications', json=payload)
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertTrue(data['success'])
        self.assertTrue(data['applicationId'].startswith("EDU-2026-"))
        print(f"✓ Step 7: Application Submitted with ID: {data['applicationId']}")

    def test_08_officer_review_update(self):
        # Fetch applications
        res = self.client.get('/api/education/officer/applications')
        self.assertEqual(res.status_code, 200)
        apps = json.loads(res.data)['applications']
        self.assertGreater(len(apps), 0)
        app_id = apps[0]['applicationId']

        # Update status
        up_res = self.client.post('/api/education/officer/update-status', json={
            "application_id": app_id,
            "status": "Approved",
            "remarks": "Income & Academic records verified via Gateway CDM. Approved.",
            "officer_id": "OFFICER-EDU-01"
        })
        self.assertEqual(up_res.status_code, 200)
        print(f"✓ Step 8: Officer Approval Status Update verified for {app_id}")

if __name__ == '__main__':
    unittest.main()
