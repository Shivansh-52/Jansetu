import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../services/api';
import ConsentOtpModal from '../components/ConsentOtpModal';

const STEPS = [
    '1. Overview',
    '2. Consent & OTP',
    '3. Personal Info',
    '4. Education Info',
    '5. Financial Info',
    '6. Documents',
    '7. Review',
    '8. Submit'
];

const ScholarshipApplication = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const schemeId = searchParams.get('scheme_id') || 'SCH-001';
    const schemeType = searchParams.get('scheme_type') || 'SCHOLARSHIP';
    const defaultSchemeName = searchParams.get('scheme_name') || (schemeType === 'LOAN' ? 'Pradhan Mantri Vidya Lakshmi Student Education Loan' : 'Post-Matric Scholarship for SC/ST/OBC Students (Ministry of Social Justice)');

    const [currentStep, setCurrentStep] = useState(0);
    const [masterId, setMasterId] = useState('');
    const [profile, setProfile] = useState(null);
    const [documents, setDocuments] = useState([]);

    // Selection Confirmation State
    const [selectionConfirmed, setSelectionConfirmed] = useState(false);

    // Form Input for missing fields
    const [formData, setFormData] = useState({
        loan_amount_requested: '500000',
        course_fee: '150000',
        bank_account: '',
        bank_ifsc: ''
    });

    // Verification & Consent State
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [consentMobile, setConsentMobile] = useState('');
    const [consentToken, setConsentToken] = useState(null);
    const [cdmData, setCdmData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedAppId, setSubmittedAppId] = useState(null);

    useEffect(() => {
        const userStr = sessionStorage.getItem('user');
        let mId = sessionStorage.getItem('masterId');
        if (!mId) {
            const parsedUser = userStr ? JSON.parse(userStr) : null;
            mId = parsedUser?.master_id || 'SP-000001';
        }
        setMasterId(mId);

        // Fetch Profile & Documents
        axios.get(`${API_URL}/education/profile?master_id=${mId}`)
            .then(res => {
                if (res.data) {
                    setProfile(res.data);
                    setDocuments(res.data.documents || []);
                    setFormData(prev => ({
                        ...prev,
                        bank_account: res.data.bank_account || 'XXXX-XXXX-4491 (State Bank of India)',
                        bank_ifsc: res.data.bank_ifsc || 'SBIN0001234'
                    }));
                }
            })
            .catch(console.error);
    }, []);

    const handleSendOtp = async () => {
        if (!consentMobile || consentMobile.length < 10) {
            alert('Please enter a valid mobile number');
            return;
        }
        try {
            const res = await axios.post(`${API_URL}/education/consent/send-otp`, {
                master_id: masterId,
                mobile: consentMobile
            });
            if (res.data.success) {
                setOtpSent(true);
            }
        } catch (err) {
            alert('Failed to send OTP');
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const res = await axios.post(`${API_URL}/education/consent/verify-otp`, {
                master_id: masterId,
                otp_code: otpInput,
                purpose: `Interoperability verification for ${defaultSchemeName}`,
                requesting_dept: 'Education Department',
                source_dept: 'Public Services / Revenue Department'
            });

            if (res.data.success) {
                setConsentToken(res.data.consent);

                // Trigger Document CDM Verification
                const verRes = await axios.post(`${API_URL}/education/verify-document`, {
                    master_id: masterId,
                    doc_type: 'income',
                    doc_number: 'INC-2026-9812'
                });

                if (verRes.data.success) {
                    setCdmData(verRes.data.cdm_data);
                }

                alert('✓ Consent verified and Common Data Model transformation executed!');
                setCurrentStep(2); // Proceed to Personal Info
            }
        } catch (err) {
            alert(err.response?.data?.message || 'OTP verification failed');
        }
    };

    const handleSubmitApplication = async () => {
        if (!selectionConfirmed) {
            alert('Selection state is NOT SELECTED. Please confirm your scheme selection first.');
            return;
        }

        if (!consentToken) {
            alert('Cannot submit: Required consent and OTP verification are incomplete.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await axios.post(`${API_URL}/education/applications`, {
                master_id: masterId,
                scheme_id: schemeId,
                scheme_name: defaultSchemeName,
                scheme_type: schemeType,
                consent_id: consentToken.consentId,
                form_data: {
                    ...formData,
                    student_name: profile?.name,
                    course: profile?.course,
                    institution: profile?.institution
                }
            });

            if (res.data.success) {
                setSubmittedAppId(res.data.applicationId);
                setCurrentStep(7); // Submit Success Step
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '30px 20px' }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                
                {/* WIZARD HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <button onClick={() => navigate('/education')} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#475569' }}>
                        ← Back to Education Portal
                    </button>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                        Master ID: <strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>{masterId}</strong>
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12, background: schemeType === 'LOAN' ? '#e0f2fe' : '#fef3c7', color: schemeType === 'LOAN' ? '#0369a1' : '#b45309' }}>
                                {schemeType === 'LOAN' ? 'EDUCATION LOAN WIZARD' : 'SCHOLARSHIP WIZARD'}
                            </span>
                            <h2 style={{ fontSize: 20, margin: '6px 0 0', color: '#0f172a' }}>{defaultSchemeName}</h2>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Selection Status</span>
                            <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: selectionConfirmed ? '#dcfce7' : '#fee2e2', color: selectionConfirmed ? '#15803d' : '#dc2626' }}>
                                {selectionConfirmed ? '✓ SCHEME SELECTED' : 'NOT SELECTED'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* STEP PROGRESS INDICATOR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30, background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', overflowX: 'auto' }}>
                    {STEPS.map((stepLabel, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%', background: currentStep > idx ? '#10b981' : (currentStep === idx ? '#2563eb' : '#e2e8f0'),
                                color: currentStep >= idx ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, marginBottom: 4
                            }}>
                                {currentStep > idx ? '✓' : idx + 1}
                            </div>
                            <span style={{ fontSize: 10, fontWeight: currentStep === idx ? 700 : 500, color: currentStep === idx ? '#2563eb' : '#64748b', textAlign: 'center' }}>
                                {stepLabel.split('. ')[1]}
                            </span>
                        </div>
                    ))}
                </div>

                {/* WIZARD CONTENT BOX */}
                <div style={{ background: 'white', borderRadius: 12, padding: 32, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    
                    {/* STEP 1: OVERVIEW & SELECTION CONFIRMATION */}
                    {currentStep === 0 && (
                        <div>
                            <h3 style={{ fontSize: 18, marginBottom: 12 }}>Step 1: Application Overview & Selection</h3>
                            <p style={{ fontSize: 13, color: '#475569', marginBottom: 20 }}>
                                You are starting an interoperable application for <strong>{defaultSchemeName}</strong>. Please confirm your scheme selection to proceed.
                            </p>

                            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: 16, borderRadius: 8, fontSize: 13, marginBottom: 24 }}>
                                <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 12, fontSize: 14 }}>Scheme Specifications & Details:</div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>• <strong>Type:</strong> {schemeType === 'LOAN' ? 'Subsidized Education Loan' : 'Post-Matric Merit Scholarship'}</div>
                                    <div>• <strong>Target Level:</strong> Undergraduate & Technical Courses</div>
                                    <div>• <strong>Source:</strong> SamadhanPath Interoperability Engine</div>
                                    
                                    {schemeType === 'LOAN' ? (
                                        <>
                                            <div>• <strong>Maximum Amount:</strong> ₹ 15,00,000</div>
                                            <div>• <strong>Interest Rate:</strong> 4.5% p.a. (Subsidized for EWS)</div>
                                            <div>• <strong>Repayment Period:</strong> 5 Years post-graduation</div>
                                            <div>• <strong>Collateral Required:</strong> None (up to ₹ 7.5L)</div>
                                        </>
                                    ) : (
                                        <>
                                            <div>• <strong>Maximum Amount:</strong> ₹ 50,000 per annum</div>
                                            <div>• <strong>Eligibility:</strong> 75%+ Aggregate & Income &lt; ₹ 8L</div>
                                            <div>• <strong>Disbursement:</strong> Direct Benefit Transfer (DBT)</div>
                                            <div>• <strong>Renewal:</strong> Annual (Subject to Performance)</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div style={{ background: selectionConfirmed ? '#ecfdf5' : '#fffbeb', padding: 16, borderRadius: 8, border: selectionConfirmed ? '1px solid #a7f3d0' : '1px solid #fde68a', marginBottom: 24 }}>
                                <label style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={selectionConfirmed} onChange={e => setSelectionConfirmed(e.target.checked)} style={{ width: 18, height: 18 }} />
                                    <span style={{ fontSize: 14, fontWeight: 600, color: selectionConfirmed ? '#065f46' : '#92400e' }}>
                                        "I want to apply for this {schemeType === 'LOAN' ? 'loan' : 'scholarship'}."
                                    </span>
                                </label>
                            </div>

                            <button
                                disabled={!selectionConfirmed}
                                onClick={() => setCurrentStep(1)}
                                style={{ padding: '12px 24px', background: selectionConfirmed ? '#2563eb' : '#94a3b8', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: selectionConfirmed ? 'pointer' : 'not-allowed' }}
                            >
                                Save Selection & Continue →
                            </button>
                        </div>
                    )}

                    {/* STEP 3: PERSONAL INFO */}
                    {currentStep === 2 && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ fontSize: 18, margin: 0 }}>Step 3: Personal Information</h3>
                                <span style={{ background: '#ecfdf5', color: '#059669', fontSize: 11, padding: '4px 8px', borderRadius: 12, fontWeight: 600 }}>
                                    ✓ Auto-filled securely via SamadhanPath API Gateway 🔒
                                </span>
                            </div>

                            {profile && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#f8fafc', padding: 20, borderRadius: 8, fontSize: 13, marginBottom: 24, border: '1px solid #e2e8f0' }}>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>Full Name</label><div style={{ fontWeight: 600 }}>{JSON.parse(sessionStorage.getItem('user') || '{}').name || profile?.name} 🔒</div></div>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>Date of Birth</label><div style={{ fontWeight: 600 }}>{profile.dob} 🔒</div></div>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>Master ID</label><div style={{ fontWeight: 600 }}>{masterId} 🔒</div></div>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>Category</label><div style={{ fontWeight: 600 }}>{profile.category} 🔒</div></div>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>State</label><div style={{ fontWeight: 600 }}>{profile.state} 🔒</div></div>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>District</label><div style={{ fontWeight: 600 }}>{profile.district} 🔒</div></div>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>Gender</label><div style={{ fontWeight: 600 }}>{profile.gender || 'Not Specified'} 🔒</div></div>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>Mobile</label><div style={{ fontWeight: 600 }}>{profile.mobile || 'Verified'} 🔒</div></div>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>Email</label><div style={{ fontWeight: 600 }}>{profile.email || 'Verified'} 🔒</div></div>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>Aadhaar Vault Ref</label><div style={{ fontWeight: 600, color: '#059669' }}>VALIDATED 🔒</div></div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => setCurrentStep(1)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8 }}>Back</button>
                                <button onClick={() => setCurrentStep(3)} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600 }}>Continue →</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: EDUCATION INFORMATION (AUTO-FILLED) */}
                    {currentStep === 3 && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ fontSize: 18, margin: 0 }}>Step 4: Education & Academic Information</h3>
                                <span style={{ background: '#ecfdf5', color: '#059669', fontSize: 11, padding: '4px 8px', borderRadius: 12, fontWeight: 600 }}>
                                    ✓ Auto-filled securely via SamadhanPath API Gateway 🔒
                                </span>
                            </div>

                            {profile && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#f8fafc', padding: 20, borderRadius: 8, fontSize: 13, marginBottom: 24, border: '1px solid #e2e8f0' }}>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>Student ID</label><div style={{ fontWeight: 600 }}>{profile.student_id} 🔒</div></div>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>Institution</label><div style={{ fontWeight: 600 }}>{profile.institution} 🔒</div></div>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>Course</label><div style={{ fontWeight: 600 }}>{profile.course} 🔒</div></div>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>Year / Semester</label><div style={{ fontWeight: 600 }}>{profile.year_semester} 🔒</div></div>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>Enrollment Number</label><div style={{ fontWeight: 600 }}>{profile.enrollment_number} 🔒</div></div>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>Academic Aggregate</label><div style={{ fontWeight: 600, color: '#059669' }}>{profile.academic_performance}% 🔒</div></div>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>Attendance Status</label><div style={{ fontWeight: 600 }}>{profile.attendance_percentage || '92'}% (Satisfactory) 🔒</div></div>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>Study Mode</label><div style={{ fontWeight: 600 }}>{profile.study_mode || 'Regular / Full-Time'} 🔒</div></div>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>Institution Ranking</label><div style={{ fontWeight: 600 }}>{profile.institution_ranking || 'NAAC A++ (Approved)'} 🔒</div></div>
                                    <div><label style={{ fontSize: 11, color: '#64748b' }}>Last Passed Exam</label><div style={{ fontWeight: 600, color: '#059669' }}>{profile.last_passed_exam || 'Cleared with Distinction'} 🔒</div></div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => setCurrentStep(2)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8 }}>Back</button>
                                <button onClick={() => setCurrentStep(4)} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600 }}>Continue →</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: FINANCIAL INFO */}
                    {currentStep === 4 && (
                        <div>
                            <h3 style={{ fontSize: 18, marginBottom: 12 }}>Step 5: Financial Information & Missing Details</h3>
                            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                                Profile fields were auto-filled. Please specify only the missing scheme-specific financial requirements:
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#f8fafc', padding: 20, borderRadius: 8, fontSize: 13, marginBottom: 24, border: '1px solid #e2e8f0' }}>
                                <div><label style={{ fontSize: 11, color: '#64748b' }}>Family Income Status</label><div style={{ fontWeight: 600, color: '#059669' }}>{profile?.family_income_status || 'Eligible (Below 8L)'} 🔒</div></div>
                                <div><label style={{ fontSize: 11, color: '#64748b' }}>{schemeType === 'LOAN' ? 'CIBIL / Credit Verification' : 'DBT Eligibility'}</label><div style={{ fontWeight: 600, color: '#059669' }}>Pre-Approved (No defaults) 🔒</div></div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                                        {schemeType === 'LOAN' ? 'Loan Amount Requested (₹)' : 'Course Annual Fee (₹)'}
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.loan_amount_requested}
                                        onChange={e => setFormData({...formData, loan_amount_requested: e.target.value})}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                                        Bank Account / Direct Benefit Transfer (DBT) Account Number
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.bank_account}
                                        onChange={e => setFormData({...formData, bank_account: e.target.value})}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                                    />
                                </div>
                                
                                {schemeType === 'LOAN' && (
                                    <div>
                                        <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                                            Co-Applicant (Parent/Guardian) PAN Number
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter 10-digit PAN"
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => setCurrentStep(3)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8 }}>Back</button>
                                <button onClick={() => setCurrentStep(5)} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600 }}>Save & Continue →</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 6: DOCUMENTS */}
                    {currentStep === 5 && (
                        <div>
                            <h3 style={{ fontSize: 18, marginBottom: 12 }}>Step 6: Document Vault Verification Status</h3>
                            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                                We checked your Government Document Vault. Existing documents are auto-linked:
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                                <div style={{ padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span>Aadhaar eKYC Verification</span>
                                    <span style={{ color: '#15803d', fontWeight: 700 }}>✓ Digitally Signed</span>
                                </div>
                                <div style={{ padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span>Income Certificate (Revenue Dept)</span>
                                    <span style={{ color: '#15803d', fontWeight: 700 }}>✓ Already Available & Verified</span>
                                </div>
                                <div style={{ padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span>Domicile Certificate (Revenue Dept)</span>
                                    <span style={{ color: '#15803d', fontWeight: 700 }}>✓ Already Available & Verified</span>
                                </div>
                                <div style={{ padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span>Academic HSC Marksheet (State Board)</span>
                                    <span style={{ color: '#15803d', fontWeight: 700 }}>✓ Already Available & Verified</span>
                                </div>
                                {schemeType === 'LOAN' && (
                                    <div style={{ padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                        <span>Co-Applicant PAN Verification (Income Tax Dept)</span>
                                        <span style={{ color: '#15803d', fontWeight: 700 }}>✓ Fetched via API</span>
                                    </div>
                                )}
                                <div style={{ padding: 12, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span>Bank Account Verification</span>
                                    <span style={{ color: '#b45309', fontWeight: 700 }}>⚠ Available (Verification Pending via OTP Consent)</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => setCurrentStep(4)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8 }}>Back</button>
                                <button onClick={() => setCurrentStep(6)} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600 }}>Proceed to Review →</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: CONSENT & OTP */}
                    {currentStep === 1 && (
                        <div>
                            <h3 style={{ fontSize: 18, marginBottom: 12 }}>Step 2: Data Sharing Request & Authorization</h3>
                            
                            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: 20, borderRadius: 12, marginBottom: 24 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>DATA SHARING REQUEST</div>
                                <div style={{ fontSize: 13, color: '#334155', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                    <div><strong>Requester:</strong> Higher Education Department</div>
                                    <div><strong>Source Dept:</strong> Revenue & Public Services Department</div>
                                    <div><strong>Purpose:</strong> Education Scheme Eligibility Verification</div>
                                    <div><strong>Duration:</strong> Single Session Application Use</div>
                                </div>

                                <div style={{ background: 'white', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                                    <div style={{ fontWeight: 600, color: '#059669', marginBottom: 6 }}>Requested Fields:</div>
                                    <div>✓ Income Eligibility Flag</div>
                                    <div>✓ Domicile Validity Status</div>
                                    <div>✓ Academic Marksheet Verification</div>

                                    <div style={{ fontWeight: 600, color: '#dc2626', marginTop: 12, marginBottom: 6 }}>Not Requested (Data Minimization Enforced):</div>
                                    <div>✗ Raw annual income figures or complete financial statements</div>
                                    <div>✗ Detailed personal banking transaction history</div>
                                </div>
                            </div>

                            {!otpSent ? (
                                <div style={{ background: '#f0fdf4', padding: 20, borderRadius: 12, border: '1px solid #bbf7d0', marginTop: 16 }}>
                                    <h4 style={{ margin: '0 0 12px 0', color: '#166534' }}>Verify Your Identity</h4>
                                    <p style={{ fontSize: 13, color: '#15803d', marginBottom: 16 }}>Enter your mobile number to receive the authorization OTP.</p>
                                    
                                    <input
                                        type="text"
                                        maxLength={15}
                                        placeholder="Enter Mobile Number"
                                        value={consentMobile}
                                        onChange={e => setConsentMobile(e.target.value)}
                                        style={{ padding: '12px 16px', fontSize: 16, width: 220, borderRadius: 8, border: '1px solid #cbd5e1', marginBottom: 16, display: 'block' }}
                                    />
                                    
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button onClick={() => setCurrentStep(0)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8 }}>Decline & Back</button>
                                        <button onClick={() => { handleSendOtp(); }} style={{ padding: '10px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600 }}>Generate OTP to Mobile →</button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ background: '#f0fdf4', padding: 20, borderRadius: 12, border: '1px solid #bbf7d0', marginTop: 16 }}>
                                    <h4 style={{ margin: '0 0 12px 0', color: '#166534' }}>OTP Verification Required for Consent</h4>
                                    <p style={{ fontSize: 13, color: '#15803d', marginBottom: 16 }}>An OTP has been sent to your registered mobile <strong>{consentMobile}</strong>. Please enter it below to securely authorize this data sharing.</p>
                                    
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="Enter 6-digit OTP"
                                        value={otpInput}
                                        onChange={e => setOtpInput(e.target.value)}
                                        style={{ padding: '12px 16px', fontSize: 18, letterSpacing: 4, fontWeight: 700, width: 220, borderRadius: 8, border: '1px solid #cbd5e1', marginBottom: 16, display: 'block' }}
                                    />
                                    
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button onClick={() => setOtpSent(false)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8 }}>Cancel</button>
                                        <button onClick={handleVerifyOtp} style={{ padding: '10px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600 }}>Verify OTP & Give Consent →</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 7: REVIEW */}
                    {currentStep === 6 && (
                        <div>
                            <h3 style={{ fontSize: 18, marginBottom: 12 }}>Step 7: Review Final Application</h3>
                            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                                Please review your application details thoroughly before final submission to the {schemeType === 'LOAN' ? 'Banking Partner' : 'Education Department'}.
                            </p>

                            <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13, marginBottom: 24 }}>
                                
                                {/* Section 1: Applicant Info */}
                                <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px dashed #cbd5e1' }}>
                                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 12, fontSize: 14 }}>1. Applicant Profile</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div><strong>Name:</strong> {JSON.parse(sessionStorage.getItem('user') || '{}').name || profile?.name}</div>
                                        <div><strong>Master ID:</strong> {masterId}</div>
                                        <div><strong>Mobile:</strong> {profile?.mobile || 'Verified'}</div>
                                        <div><strong>Category:</strong> {profile?.category}</div>
                                    </div>
                                </div>

                                {/* Section 2: Scheme & Academics */}
                                <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px dashed #cbd5e1' }}>
                                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 12, fontSize: 14 }}>2. Scheme & Academics</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div style={{ gridColumn: 'span 2' }}><strong>Selected Scheme:</strong> <span style={{ color: '#2563eb', fontWeight: 600 }}>{defaultSchemeName}</span></div>
                                        <div><strong>Institution:</strong> {profile?.institution}</div>
                                        <div><strong>Course:</strong> {profile?.course}</div>
                                        <div><strong>Academic Score:</strong> <span style={{ color: '#059669', fontWeight: 600 }}>{profile?.academic_performance}%</span></div>
                                    </div>
                                </div>

                                {/* Section 3: Financials */}
                                <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px dashed #cbd5e1' }}>
                                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 12, fontSize: 14 }}>3. Financial Request</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div><strong>Amount Requested:</strong> <span style={{ fontWeight: 700 }}>₹ {formData.loan_amount_requested}</span></div>
                                        <div><strong>Disbursement A/C:</strong> {formData.bank_account}</div>
                                        <div><strong>Income Status:</strong> {profile?.family_income_status || 'Eligible'}</div>
                                    </div>
                                </div>

                                {/* Section 4: Interoperability Log */}
                                <div>
                                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 12, fontSize: 14 }}>4. Interoperability & Consent Log</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                        <div><strong>Consent Auth Token:</strong> <span style={{ fontFamily: 'monospace', color: '#2563eb' }}>{consentToken?.consentId}</span></div>
                                        <div><strong>Verification Status:</strong> <span style={{ color: '#059669', fontWeight: 700 }}>✓ Verified via API Gateway</span></div>
                                    </div>

                                    {cdmData && (
                                        <div style={{ background: '#1e293b', color: '#e2e8f0', padding: 12, borderRadius: 6, fontSize: 11, fontFamily: 'monospace' }}>
                                            <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: 6 }}>Common Data Model (CDM) Output Log:</div>
                                            <div>&gt; verificationType: "{cdmData.verificationType}"</div>
                                            <div>&gt; eligibilityStatus: "{cdmData.eligibilityStatus}"</div>
                                            <div>&gt; dataMinimizationNotice: "{cdmData.dataMinimizationNotice || 'Raw sensitive data withheld'}"</div>
                                            <div>&gt; issuer: "{cdmData.issuer}"</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => setCurrentStep(5)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8 }}>Back</button>
                                <button
                                    disabled={isSubmitting}
                                    onClick={handleSubmitApplication}
                                    style={{ padding: '12px 28px', background: '#059669', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                                >
                                    {isSubmitting ? 'Submitting to Gateway...' : 'Submit Application →'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 8: SUBMITTED SUCCESS */}
                    {currentStep === 7 && (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                            <h3 style={{ fontSize: 22, color: '#059669', margin: '0 0 8px' }}>Application Submitted Successfully!</h3>
                            <p style={{ fontSize: 14, color: '#475569', marginBottom: 20 }}>
                                Your application has been registered in the interoperable government workflow database.
                            </p>

                            <div style={{ background: '#f0fdf4', border: '2px dashed #059669', padding: 20, borderRadius: 12, display: 'inline-block', marginBottom: 24 }}>
                                <div style={{ fontSize: 12, color: '#166534' }}>UNIFIED APPLICATION TRACKING ID</div>
                                <div style={{ fontSize: 26, fontWeight: 800, color: '#15803d', fontFamily: 'monospace', letterSpacing: 2 }}>{submittedAppId}</div>
                            </div>

                            <div>
                                <button
                                    onClick={() => navigate(`/tracking/${submittedAppId}`)}
                                    style={{ padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                                >
                                    Track Live Stage Progression →
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ScholarshipApplication;
