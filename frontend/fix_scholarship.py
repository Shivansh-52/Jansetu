import re

with open(r'c:\Users\Shivansh\Desktop\Samadhan Path\frontend\src\pages\ScholarshipApplication.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import
if "import ConsentOtpModal" not in content:
    content = content.replace("import { API_URL } from '../services/api';", "import { API_URL } from '../services/api';\nimport ConsentOtpModal from '../components/ConsentOtpModal';")

# 2. Add isOtpModalOpen state
if "const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);" not in content:
    content = content.replace("const [otpSent, setOtpSent] = useState(false);", "const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);\n    const [otpSent, setOtpSent] = useState(false);")

# 3. Replace the Consent & OTP UI block
# Wait, the UI block for currentStep === 5 is quite big. Let's find it.
start_str = "{/* STEP 6: CONSENT & OTP */}"
end_str = "{/* STEP 7: REVIEW */}"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    old_step_6 = content[start_idx:end_idx]
    
    new_step_6 = """{/* STEP 6: CONSENT & OTP */}
                    {currentStep === 5 && (
                        <div>
                            <h3 style={{ fontSize: 18, marginBottom: 12 }}>Step 6: Security & Consent</h3>
                            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                                To fetch your income and academic records directly from the Digilocker and Revenue Department APIs, we require your explicit consent.
                            </p>
                            
                            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24 }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>Data Sharing Request</h4>
                                <p style={{ fontSize: 13, marginBottom: 8 }}><strong>From:</strong> Revenue Department & Digilocker</p>
                                <p style={{ fontSize: 13, marginBottom: 8 }}><strong>To:</strong> Education Department</p>
                                <p style={{ fontSize: 13, marginBottom: 0 }}><strong>Purpose:</strong> {schemeType === 'LOAN' ? 'Education Loan Eligibility Verification' : 'Scholarship Eligibility Verification'}</p>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => setCurrentStep(4)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8 }}>Decline & Back</button>
                                <button onClick={() => setIsOtpModalOpen(true)} style={{ padding: '10px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600 }}>Sign & Allow Data Sharing</button>
                            </div>

                            <ConsentOtpModal 
                                isOpen={isOtpModalOpen}
                                onClose={() => setIsOtpModalOpen(false)}
                                onVerify={(data) => {
                                    setConsentToken(data);
                                    setIsOtpModalOpen(false);
                                    setCurrentStep(6);
                                }}
                                masterId={masterId}
                                mobile={consentMobile}
                                purpose={schemeType === 'LOAN' ? 'Education Loan Eligibility Verification' : 'Scholarship Eligibility Verification'}
                                requestingDept="Education Department"
                                sourceDept="Revenue Department & Digilocker"
                            />
                        </div>
                    )}

                    """
    content = content[:start_idx] + new_step_6 + content[end_idx:]

with open(r'c:\Users\Shivansh\Desktop\Samadhan Path\frontend\src\pages\ScholarshipApplication.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
