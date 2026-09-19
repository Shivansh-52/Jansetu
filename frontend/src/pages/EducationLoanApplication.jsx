import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
    'Basic',
    'Financial',
    'Requirements',
    'Consent',
    'Credit Check',
    'Review',
    'Offer'
];

const InteroperabilityExplanations = {
    0: {
        title: 'Single Verified Citizen Profile',
        description: 'Identity verification is instantaneous. Your profile details are securely fetched from the Master ID without needing to upload Aadhaar or PAN again.',
        tech: 'The Gateway retrieved the authenticated Citizen Profile for Master ID directly, pre-filling KYC details.'
    },
    1: {
        title: 'Reusable Connectors & Standard Data',
        description: 'SamadhanPath connects to existing legacy systems. For an education loan, it bridges the gap between the Education Department (fees) and Financial Services.',
        tech: 'The Gateway maps the required loan amount requested here into the Common Data Model used by participating banks.'
    },
    2: {
        title: 'Interoperability / API Gateway Layer',
        description: 'The API Gateway is scanning multiple government databases at once. It checks Education for course fees and Public Services for asset/income declarations.',
        tech: 'Gateway executes concurrent lookup() API calls to Edu_DB (fee verification) and Public_Services_DB (asset check).'
    },
    3: {
        title: 'Consent-Based Data Sharing',
        description: 'Financial asset data is highly sensitive. The Gateway pauses the transaction until the citizen explicitly signs a cryptographic consent token.',
        tech: 'We use JWT (JSON Web Tokens) to sign the data sharing consent. No bank can access the asset data without this token.'
    },
    4: {
        title: 'Configurable Workflow Orchestration',
        description: 'The Gateway orchestrates the complex interaction between the citizen, the Public Services database, and the external Banking system in real-time.',
        tech: 'The Gateway verifies the JWT token, extracts the asset data, and routes the sanitized payload to the Banking API.'
    },
    5: {
        title: 'Data Quality & Minimization Checks',
        description: 'Banks receive exactly what they need to underwrite the loan, formatted perfectly according to Common Data Standards. The data is government-verified, reducing fraud.',
        tech: 'The Gateway transformed raw property records into a simple "Asset Backing: Verified" boolean flag for the bank.'
    },
    6: {
        title: 'Unified Application Tracking & Audit Logs',
        description: 'The loan is approved! The citizen gets a single SP-LOAN tracking ID, and the entire multi-department interaction is permanently hash-logged.',
        tech: 'Writing the successful banking transaction hash to the immutable Interoperability audit log.'
    }
};

const EducationLoanApplication = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [masterId, setMasterId] = useState('');
    
    const [loanInfo, setLoanInfo] = useState({ amount: '', duration: '5' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const storedMasterId = localStorage.getItem('masterId');
        if (!storedMasterId) {
            navigate('/login');
            return;
        }
        setMasterId(storedMasterId);
        
        import('../services/microservicesApi').then(api => {
            api.getEducationProfile(storedMasterId)
                .then(setProfile)
                .catch(console.error);
        });
    }, [navigate]);

    const handleConsentApproval = async () => {
        try {
            setTimeout(() => {
                setCurrentStep(4);
                
                // Simulate Bank Processing visually
                setTimeout(() => {
                    setCurrentStep(5);
                }, 3000);
            }, 1000);
        } catch (err) {
            alert('Failed to generate consent.');
        }
    };

    const submitApplication = async () => {
        setIsSubmitting(true);
        try {
            setTimeout(() => {
                try {
                    const logs = JSON.parse(localStorage.getItem('mockLogs')) || [];
                    logs.push({
                        auditId: Date.now(), timestamp: new Date().toISOString(),
                        department: 'Banking Services', action: 'Loan Sanctioned', result: 'APPROVED',
                        currentHash: 'c73d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2e1234'
                    });
                    localStorage.setItem('mockLogs', JSON.stringify(logs));
                } catch (e) {}

                setCurrentStep(6);
            }, 2000);
        } catch (err) {
            alert('Submission failed');
        } finally {
            setTimeout(() => setIsSubmitting(false), 2000);
        }
    };

    const currentExplanation = InteroperabilityExplanations[currentStep];

    return (
        <div style={{ padding: '0', display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            
            {/* LEFT SIDE - WIZARD (50%) */}
            <div style={{ flex: '1 1 50%', padding: '40px 60px', overflowY: 'auto' }}>
                <h1 style={{ fontSize: 24, marginBottom: 20 }}>Education Loan Application</h1>
                
                {/* Stepper */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40, borderBottom: '2px solid #e5e7eb', paddingBottom: 20 }}>
                    {STEPS.map((step, idx) => (
                        <div key={step} style={{ 
                            color: currentStep >= idx ? 'var(--accent)' : '#9ca3af',
                            fontWeight: currentStep === idx ? 700 : 500,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 13
                        }}>
                            <div style={{
                                width: 24, height: 24, borderRadius: '50%', background: currentStep >= idx ? 'var(--accent)' : '#e5e7eb',
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8
                            }}>
                                {idx + 1}
                            </div>
                            {step}
                        </div>
                    ))}
                </div>

                <div style={{ background: 'white', padding: 32, borderRadius: 12, border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    {currentStep === 0 && (
                        <div>
                            <h2 style={{ fontSize: 18, marginBottom: 20 }}>KYC & Basic Information</h2>
                            <div style={{ background: '#ecfdf5', padding: 16, borderRadius: 8, marginBottom: 20, border: '1px solid #10b981' }}>
                                <p style={{ margin: 0, fontSize: 14, color: '#059669', fontWeight: 600, marginBottom: 12 }}>✓ Auto-KYC retrieved from Master ID.</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div><label style={{ fontSize: 12, color: '#64748b' }}>Applicant Name</label><div style={{ fontWeight: 500 }}>{profile?.name || 'Loading...'} 🔒</div></div>
                                    <div><label style={{ fontSize: 12, color: '#64748b' }}>Master ID</label><div style={{ fontWeight: 500 }}>{masterId} 🔒</div></div>
                                </div>
                            </div>
                            <button onClick={() => setCurrentStep(1)} className="btn-primary">Continue</button>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div>
                            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Loan Requirements</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                                <input type="number" placeholder="Requested Loan Amount (₹)" className="input-js" value={loanInfo.amount} onChange={e => setLoanInfo({...loanInfo, amount: e.target.value})} />
                                <select className="input-js" value={loanInfo.duration} onChange={e => setLoanInfo({...loanInfo, duration: e.target.value})}>
                                    <option value="3">3 Years Repayment</option>
                                    <option value="5">5 Years Repayment</option>
                                    <option value="10">10 Years Repayment</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => setCurrentStep(0)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white' }}>Back</button>
                                <button onClick={() => setCurrentStep(2)} className="btn-primary">Save & Continue</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div>
                            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Scanning Department Databases</h2>
                            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>SamadhanPath Gateway is verifying your admission and checking for available financial guarantees.</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 30 }}>
                                <div style={{ padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Admission & Fee Structure (Education)</span> <span style={{ color: '#059669', fontWeight: 600 }}>✓ Verified</span>
                                </div>
                                <div style={{ padding: 12, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Asset & Income Proof (Public Services)</span> <span style={{ color: '#d97706', fontWeight: 600 }}>Consent Required</span>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => setCurrentStep(1)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white' }}>Back</button>
                                <button onClick={() => setCurrentStep(3)} className="btn-primary">Proceed to Consent</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div>
                            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Financial Data Access Request</h2>
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 20, borderRadius: 8, marginBottom: 20 }}>
                                <p style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600 }}>Requesting Entity: State Bank / Financial Services</p>
                                <p style={{ margin: '0 0 12px 0', fontSize: 14 }}><strong>Source Department:</strong> Public Services</p>
                                <p style={{ margin: '0 0 16px 0', fontSize: 14 }}><strong>Purpose:</strong> Loan Underwriting & Risk Assessment</p>
                                
                                <hr style={{ borderColor: '#fca5a5', margin: '16px 0' }} />
                                <p style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600 }}>Information Requested:</p>
                                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#991b1b' }}>
                                    <li>Verified Annual Income</li>
                                    <li>Declared Asset Backing</li>
                                </ul>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => setCurrentStep(2)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white' }}>Deny</button>
                                <button onClick={handleConsentApproval} className="btn-primary" style={{ background: '#059669', borderColor: '#059669' }}>Sign & Allow Data Sharing</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <div style={{ fontSize: 48, marginBottom: 20 }}>🏦</div>
                            <h2 style={{ fontSize: 20, marginBottom: 12 }}>Bank Processing in Progress</h2>
                            <p style={{ color: '#64748b', fontSize: 15 }}>Gateway is routing your verified asset data to the Bank API for instant credit assessment...</p>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div>
                            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Loan Application Review</h2>
                            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8, marginBottom: 24, border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: 14, textTransform: 'uppercase', color: '#64748b', marginBottom: 12 }}>Underwriting Data Provided</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                                    <span>Identity KYC</span>
                                    <span style={{ color: '#059669', fontWeight: 600 }}>✓ Verified (Master ID)</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                                    <span>Asset Verification</span>
                                    <span style={{ color: '#059669', fontWeight: 600 }}>✓ Verified (Public Services)</span>
                                </div>
                            </div>
                            <button onClick={submitApplication} className="btn-primary" disabled={isSubmitting} style={{ width: '100%', fontSize: 16, padding: '14px' }}>
                                {isSubmitting ? 'Finalizing with Bank...' : 'Submit Final Loan Request'}
                            </button>
                        </div>
                    )}
                    
                    {currentStep === 6 && (
                         <div style={{ textAlign: 'center', padding: '40px 0' }}>
                         <div style={{ fontSize: 40, marginBottom: 20 }}>🎉</div>
                         <h2 style={{ fontSize: 18, marginBottom: 12, color: '#059669' }}>Loan Sanctioned!</h2>
                         <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>The bank has approved your education loan based on the verified government data.</p>
                         
                         <button onClick={() => navigate(`/tracking/SP-LOAN-2026-${Math.floor(Math.random() * 10000)}`)} className="btn-primary" style={{ background: '#0f172a', borderColor: '#0f172a' }}>
                             View Loan Dashboard
                         </button>
                     </div>
                    )}
                </div>
            </div>

            {/* RIGHT SIDE - INTEROPERABILITY DASHBOARD (50%) */}
            <div style={{ flex: '1 1 50%', background: '#0f172a', color: 'white', padding: '60px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 20, right: 20 }}>
                    <span style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: 20, fontSize: 12, fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        INTEROPERABILITY VISUALIZER
                    </span>
                </div>
                
                <h3 style={{ fontSize: 14, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.1em', marginBottom: 40 }}>
                    Behind The Scenes: Banking & Government APIs
                </h3>

                <div style={{ 
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 16, padding: 32, backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{ fontSize: 32, marginBottom: 24 }}>🏦</div>
                    <h2 style={{ fontSize: 28, fontWeight: 700, color: '#f8fafc', marginBottom: 16 }}>
                        {currentExplanation?.title || ''}
                    </h2>
                    
                    <p style={{ fontSize: 18, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 32 }}>
                        {currentExplanation?.description || ''}
                    </p>
                    
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: 12, borderLeft: '4px solid #10b981' }}>
                        <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#10b981', marginBottom: 8, letterSpacing: '0.05em' }}>
                            Technical Execution
                        </h4>
                        <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', fontFamily: 'monospace', lineHeight: 1.5 }}>
                            {currentExplanation?.tech || ''}
                        </p>
                    </div>
                </div>
                
                {/* Visualizer animation graphic depending on step */}
                <div style={{ marginTop: 40, padding: 20, border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 12, textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
                        {currentStep === 0 && "[ MASTER_DB ] <--- fetch_kyc() --- [ GATEWAY ]"}
                        {currentStep === 1 && "[ UI ] ---> loan_request ---> [ GATEWAY_MEMORY ]"}
                        {currentStep === 2 && "[ EDU_DB (Fees) ] <--- lookup() --- [ GATEWAY ] --- lookup() ---> [ ASSET_DB ]"}
                        {currentStep === 3 && "[ JWT_ENGINE ] ::: Generating financial_consent_token :::"}
                        {currentStep === 4 && "[ GATEWAY ] === {jwt_token} ===> [ BANKING_API ]"}
                        {currentStep === 5 && "Raw Assets => Transformation => Banking API Common Model Payload"}
                        {currentStep === 6 && "Writing BANK_APPROVAL transaction hash to immutable audit log..."}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EducationLoanApplication;
