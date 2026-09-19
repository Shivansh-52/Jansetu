import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
    'Basic',
    'Academic',
    'Requirements',
    'Consent',
    'Verification',
    'Review',
    'Submit'
];

const InteroperabilityExplanations = {
    0: {
        title: 'Single Verified Citizen Profile',
        description: 'One profile (identity, academic, bank details) is reused everywhere so people stop re-entering the same information.',
        tech: 'The Gateway securely fetched the Citizen Profile for Master ID directly, pre-filling verified details.'
    },
    1: {
        title: 'Reusable Connectors & Standard Data',
        description: 'Ready-made plug-ins for each government system (APAAR, Education) so departments can communicate without replacing their legacy systems.',
        tech: 'This academic data will be structured in a Common Data Standard format so the target department can ingest it seamlessly.'
    },
    2: {
        title: 'Interoperability / API Gateway Layer',
        description: 'A middle layer that connects to each department\'s existing system through APIs, without replacing any of them.',
        tech: 'The Gateway is simultaneously checking the Education Database and the Public Services Database to see if requirements are already met.'
    },
    3: {
        title: 'Consent-Based Data Sharing',
        description: 'Data only moves between systems when the citizen has given explicit consent for that specific purpose.',
        tech: 'We use JWT (JSON Web Tokens) to cryptographically sign the consent. The Public Services department will verify this signature before releasing any data.'
    },
    4: {
        title: 'Configurable Workflow Orchestration',
        description: 'A flexible engine orchestrates the API calls in the background according to the Education department\'s specific rules.',
        tech: 'The Gateway is now securely routing the JWT consent token to Public Services, and awaiting the response.'
    },
    5: {
        title: 'Data Quality & Minimization Checks',
        description: 'Only the exact information needed is shared. For example, instead of sharing raw salary figures, only a "True/False" eligibility flag is shared.',
        tech: 'Notice how Income Eligibility says "Verified" without showing actual income. The API Gateway translated the raw data into a Common Data Standard.'
    },
    6: {
        title: 'Unified Application Tracking & Audit Logs',
        description: 'Every action is hash-logged for security. The citizen receives one unified tracking ID that works across all connected departments.',
        tech: 'Generating a unified SP-EDU tracking ID and writing the final hash-chained transaction to the Interoperability log.'
    }
};

const ScholarshipApplication = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [masterId, setMasterId] = useState('');
    
    // Form State
    const [academicInfo, setAcademicInfo] = useState({ institution: '', course: '', category: 'General' });
    const [consentToken, setConsentToken] = useState(null);
    const [verificationResults, setVerificationResults] = useState(null);
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
            // Mocking the Gateway Consent request
            setTimeout(() => {
                setConsentToken('mock-jwt-consent-token-abc123');
                setCurrentStep(4);
                
                // Simulate Verification Process visually
                setTimeout(() => {
                    setVerificationResults({
                        income: { verified: true, source: 'Public Services' },
                        domicile: { verified: true, source: 'Public Services' }
                    });
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
                        department: 'Education', action: 'Scholarship Application Received', result: 'SUCCESS',
                        currentHash: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
                    });
                    localStorage.setItem('mockLogs', JSON.stringify(logs));
                } catch (e) {}

                setCurrentStep(6);
                navigate(`/tracking/SP-EDU-2026-${Math.floor(Math.random() * 10000)}`);
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
                <h1 style={{ fontSize: 24, marginBottom: 20 }}>Scholarship Application</h1>
                
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
                            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Basic Information</h2>
                            <div style={{ background: '#ecfdf5', padding: 16, borderRadius: 8, marginBottom: 20, border: '1px solid #10b981' }}>
                                <p style={{ margin: 0, fontSize: 14, color: '#059669', fontWeight: 600, marginBottom: 12 }}>✓ Retrieved from your Master ID profile.</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div><label style={{ fontSize: 12, color: '#64748b' }}>Name</label><div style={{ fontWeight: 500 }}>{profile?.name || 'Loading...'} 🔒</div></div>
                                    <div><label style={{ fontSize: 12, color: '#64748b' }}>Master ID</label><div style={{ fontWeight: 500 }}>{masterId} 🔒</div></div>
                                </div>
                            </div>
                            <button onClick={() => setCurrentStep(1)} className="btn-primary">Continue</button>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div>
                            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Academic Information</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                                <input type="text" placeholder="Institution Name" className="input-js" value={academicInfo.institution} onChange={e => setAcademicInfo({...academicInfo, institution: e.target.value})} />
                                <input type="text" placeholder="Course Name (e.g. MCA)" className="input-js" value={academicInfo.course} onChange={e => setAcademicInfo({...academicInfo, course: e.target.value})} />
                                <select className="input-js" value={academicInfo.category} onChange={e => setAcademicInfo({...academicInfo, category: e.target.value})}>
                                    <option>General</option>
                                    <option>OBC</option>
                                    <option>SC/ST</option>
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
                            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Checking Connected Systems</h2>
                            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>SamadhanPath Gateway is checking if the required documents already exist in other department databases.</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 30 }}>
                                <div style={{ padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Academic Record (Education)</span> <span style={{ color: '#059669', fontWeight: 600 }}>✓ Found</span>
                                </div>
                                <div style={{ padding: 12, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Income Eligibility (Public Services)</span> <span style={{ color: '#d97706', fontWeight: 600 }}>Consent Required</span>
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
                            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Data Access Request</h2>
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 20, borderRadius: 8, marginBottom: 20 }}>
                                <p style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600 }}>Requesting Department: Education Department</p>
                                <p style={{ margin: '0 0 12px 0', fontSize: 14 }}><strong>Source Department:</strong> Public Services</p>
                                <p style={{ margin: '0 0 16px 0', fontSize: 14 }}><strong>Purpose:</strong> Scholarship Eligibility Verification</p>
                                
                                <hr style={{ borderColor: '#fca5a5', margin: '16px 0' }} />
                                <p style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600 }}>Information Requested:</p>
                                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#991b1b' }}>
                                    <li>Income Eligibility Status</li>
                                    <li>Domicile Status</li>
                                </ul>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => setCurrentStep(2)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white' }}>Deny</button>
                                <button onClick={handleConsentApproval} className="btn-primary" style={{ background: '#059669', borderColor: '#059669' }}>Allow Data Sharing</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <div style={{ fontSize: 48, marginBottom: 20 }}>🔄</div>
                            <h2 style={{ fontSize: 20, marginBottom: 12 }}>API Orchestration in Progress</h2>
                            <p style={{ color: '#64748b', fontSize: 15 }}>Gateway is routing your signed JWT Consent Token to Public Services...</p>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div>
                            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Application Review</h2>
                            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8, marginBottom: 24, border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: 14, textTransform: 'uppercase', color: '#64748b', marginBottom: 12 }}>Verified Interoperable Data</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                                    <span>Income Eligibility</span>
                                    <span style={{ color: '#059669', fontWeight: 600 }}>✓ Verified (Public Services)</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                                    <span>Consent Status</span>
                                    <span style={{ color: '#059669', fontWeight: 600 }}>✓ Active</span>
                                </div>
                            </div>
                            <button onClick={submitApplication} className="btn-primary" disabled={isSubmitting} style={{ width: '100%', fontSize: 16, padding: '14px' }}>
                                {isSubmitting ? 'Submitting to Education DB...' : 'Submit Scholarship Application'}
                            </button>
                        </div>
                    )}
                    
                    {currentStep === 6 && (
                         <div style={{ textAlign: 'center', padding: '40px 0' }}>
                         <div style={{ fontSize: 40, marginBottom: 20 }}>✅</div>
                         <h2 style={{ fontSize: 18, marginBottom: 12 }}>Processing Complete</h2>
                         <p style={{ color: '#64748b', fontSize: 14 }}>Redirecting to Unified Tracker...</p>
                     </div>
                    )}
                </div>
            </div>

            {/* RIGHT SIDE - INTEROPERABILITY DASHBOARD (50%) */}
            <div style={{ flex: '1 1 50%', background: '#0f172a', color: 'white', padding: '60px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 20, right: 20 }}>
                    <span style={{ padding: '6px 12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: 20, fontSize: 12, fontWeight: 700, border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                        INTEROPERABILITY VISUALIZER
                    </span>
                </div>
                
                <h3 style={{ fontSize: 14, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.1em', marginBottom: 40 }}>
                    Behind The Scenes: What the Gateway is doing
                </h3>

                <div style={{ 
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 16, padding: 32, backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{ fontSize: 32, marginBottom: 24 }}>💡</div>
                    <h2 style={{ fontSize: 28, fontWeight: 700, color: '#f8fafc', marginBottom: 16 }}>
                        {currentExplanation?.title || ''}
                    </h2>
                    
                    <p style={{ fontSize: 18, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 32 }}>
                        {currentExplanation?.description || ''}
                    </p>
                    
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: 12, borderLeft: '4px solid #38bdf8' }}>
                        <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#38bdf8', marginBottom: 8, letterSpacing: '0.05em' }}>
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
                        {currentStep === 0 && "[ MASTER_DB ] <--- fetch_profile() --- [ GATEWAY ]"}
                        {currentStep === 1 && "[ UI ] ---> form_data ---> [ GATEWAY_MEMORY ]"}
                        {currentStep === 2 && "[ EDU_DB ] <--- lookup() --- [ GATEWAY ] --- lookup() ---> [ PUBLIC_SERVICES_DB ]"}
                        {currentStep === 3 && "[ JWT_ENGINE ] ::: Generating signed_consent_token :::"}
                        {currentStep === 4 && "[ GATEWAY ] === {jwt_token} ===> [ PUBLIC_SERVICES_DB ]"}
                        {currentStep === 5 && "Raw Data (₹450,000) => Transformation => Boolean (Eligible: True)"}
                        {currentStep === 6 && "Writing transaction hash to immutable audit log..."}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScholarshipApplication;
