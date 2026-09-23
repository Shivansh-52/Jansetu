import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConsentOtpModal from '../components/ConsentOtpModal';
import useUnsavedChangesWarning from '../hooks/useUnsavedChangesWarning';
const STEPS = [
    'Farmer KYC',
    'Crop Details',
    'Scanning Records',
    'Consent',
    'Insurance API',
    'Review',
    'Approval'
];

const InteroperabilityExplanations = {
    0: {
        title: 'Single Verified Citizen Profile',
        description: 'Identity verification is instantaneous. Farmer details are securely fetched from the Master ID without needing to upload Aadhaar or PAN again.',
        tech: 'The Gateway retrieved the authenticated Citizen Profile for Master ID directly, pre-filling KYC details.'
    },
    1: {
        title: 'Reusable Connectors & Standard Data',
        description: 'SamadhanPath connects to existing land and weather systems. For crop insurance, it bridges the gap between Agriculture (crop data), Revenue (land records), and Insurance.',
        tech: 'The Gateway prepares to map the crop sowing details into the Common Agriculture Data Model used by insurers.'
    },
    2: {
        title: 'Interoperability / API Gateway Layer',
        description: 'The API Gateway is scanning multiple government databases at once. It checks Revenue for Land Records (7/12 extract) and Agriculture for sowing certificates.',
        tech: 'Gateway executes concurrent lookup() API calls to Revenue_DB (land ownership) and Agri_DB (sowing proof).'
    },
    3: {
        title: 'Consent-Based Data Sharing',
        description: 'Land records and financial data are highly sensitive. The Gateway pauses the transaction until the farmer explicitly signs a cryptographic consent token.',
        tech: 'We use JWT (JSON Web Tokens) to sign the data sharing consent. No insurer can access the land records without this token.'
    },
    4: {
        title: 'Configurable Workflow Orchestration',
        description: 'The Gateway orchestrates the complex interaction between the farmer, the Revenue database, and the external Crop Insurance system in real-time.',
        tech: 'The Gateway verifies the JWT token, extracts the land data, and routes the sanitized payload to the Insurance API.'
    },
    5: {
        title: 'Data Quality & Minimization Checks',
        description: 'Insurers receive exactly what they need to underwrite the policy, formatted perfectly according to Common Data Standards. The data is government-verified.',
        tech: 'The Gateway transformed raw 7/12 land records into a simple "Land Ownership: Verified" boolean flag for the insurer.'
    },
    6: {
        title: 'Unified Application Tracking & Audit Logs',
        description: 'The policy is approved! The farmer gets a single SP-AGRI tracking ID, and the entire multi-department interaction is permanently hash-logged.',
        tech: 'Writing the successful insurance transaction hash to the immutable Interoperability audit log.'
    }
};

const AgricultureApplication = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [masterId, setMasterId] = useState('');
    
    const [cropInfo, setCropInfo] = useState({ cropName: '', area: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    
    const [profile, setProfile] = useState(null);

    // Apply navigation warning if form is started but not approved
    const isDirty = currentStep > 0 && currentStep < 6;
    useUnsavedChangesWarning(isDirty);

    useEffect(() => {
        if (currentStep === 6) {
            const handlePopState = () => {
                navigate('/user-dashboard', { replace: true });
            };
            window.addEventListener('popstate', handlePopState);
            return () => window.removeEventListener('popstate', handlePopState);
        }
    }, [currentStep, navigate]);

    const getUser = () => {
        try { const s = sessionStorage.getItem('user'); return s ? JSON.parse(s) : null; }
        catch { return null; }
    };
    const user = getUser();
    const mobile = user?.phone || '9876543210';

    useEffect(() => {
        const storedMasterId = sessionStorage.getItem('masterId') || user?.master_id;
        if (!storedMasterId) {
            navigate('/login');
            return;
        }
        setMasterId(storedMasterId);
        
        import('../services/microservicesApi').then(api => {
            api.getAgricultureProfile(storedMasterId)
                .then(setProfile)
                .catch(console.error);
        });
    }, [navigate]);

    const handleConsentApproval = async () => {
        setTimeout(() => {
            setCurrentStep(4);
            setTimeout(() => setCurrentStep(5), 3000);
        }, 1000);
    };

    const submitApplication = async () => {
        setIsSubmitting(true);
        setTimeout(() => {
            try {
                const logs = JSON.parse(sessionStorage.getItem('mockLogs')) || [];
                logs.push({
                    auditId: Date.now(), timestamp: new Date().toISOString(),
                    department: 'Agriculture', action: 'Crop Insurance Approved', result: 'SUCCESS',
                    currentHash: 'a56d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2e1111'
                });
                sessionStorage.setItem('mockLogs', JSON.stringify(logs));
            } catch (e) {}
            setCurrentStep(6);
        }, 2000);
        setTimeout(() => setIsSubmitting(false), 2000);
    };

    const currentExplanation = InteroperabilityExplanations[currentStep];

    return (
        <div style={{ padding: '0', display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            {/* LEFT SIDE - WIZARD (50%) */}
            <div style={{ flex: '1 1 50%', padding: '40px 60px', overflowY: 'auto' }}>
                <h1 style={{ fontSize: 24, marginBottom: 20 }}>Crop Insurance Application</h1>
                
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
                            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Farmer KYC Information</h2>
                            <div style={{ background: '#ecfdf5', padding: 16, borderRadius: 8, marginBottom: 20, border: '1px solid #10b981' }}>
                                <p style={{ margin: 0, fontSize: 14, color: '#059669', fontWeight: 600, marginBottom: 12 }}>✓ Auto-KYC retrieved from Master ID.</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div><label style={{ fontSize: 12, color: '#64748b' }}>Farmer Name</label><div style={{ fontWeight: 500 }}>{profile?.name || 'Loading...'} 🔒</div></div>
                                    <div><label style={{ fontSize: 12, color: '#64748b' }}>Master ID</label><div style={{ fontWeight: 500 }}>{masterId} 🔒</div></div>
                                </div>
                            </div>
                            <button onClick={() => setCurrentStep(1)} className="btn-primary">Continue</button>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div>
                            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Crop & Sowing Details</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                                <input type="text" placeholder="Crop Name (e.g., Wheat, Rice)" className="input-js" value={cropInfo.cropName} onChange={e => setCropInfo({...cropInfo, cropName: e.target.value})} />
                                <input type="number" placeholder="Area Sown (in Hectares)" className="input-js" value={cropInfo.area} onChange={e => setCropInfo({...cropInfo, area: e.target.value})} />
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
                            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>SamadhanPath Gateway is verifying your land records and sowing certificates.</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 30 }}>
                                <div style={{ padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Sowing Certificate (Agriculture DB)</span> <span style={{ color: '#059669', fontWeight: 600 }}>✓ Verified</span>
                                </div>
                                <div style={{ padding: 12, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Land Ownership (Revenue / 7-12 DB)</span> <span style={{ color: '#d97706', fontWeight: 600 }}>Consent Required</span>
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
                            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Land Records Data Access Request</h2>
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 20, borderRadius: 8, marginBottom: 20 }}>
                                <p style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600 }}>Requesting Entity: Crop Insurance Services</p>
                                <p style={{ margin: '0 0 12px 0', fontSize: 14 }}><strong>Source Department:</strong> Revenue Department</p>
                                <p style={{ margin: '0 0 16px 0', fontSize: 14 }}><strong>Purpose:</strong> Insurance Underwriting & Land Verification</p>
                                
                                <hr style={{ borderColor: '#fca5a5', margin: '16px 0' }} />
                                <p style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600 }}>Information Requested:</p>
                                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#991b1b' }}>
                                    <li>Land Ownership Verification</li>
                                    <li>Total Arable Area</li>
                                </ul>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => setCurrentStep(2)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white' }}>Deny</button>
                                <button onClick={() => setIsOtpModalOpen(true)} className="btn-primary" style={{ background: '#059669', borderColor: '#059669' }}>Sign & Allow Data Sharing</button>
                            </div>
                        </div>
                    )}

                    <ConsentOtpModal 
                        isOpen={isOtpModalOpen}
                        onClose={() => setIsOtpModalOpen(false)}
                        onVerify={handleConsentApproval}
                        masterId={masterId}
                        mobile={mobile}
                        purpose="Insurance Underwriting & Land Verification"
                        requestingDept="Crop Insurance Services"
                        sourceDept="Revenue Department"
                    />

                    {currentStep === 4 && (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <div style={{ fontSize: 48, marginBottom: 20 }}>🌾</div>
                            <h2 style={{ fontSize: 20, marginBottom: 12 }}>Insurance Processing in Progress</h2>
                            <p style={{ color: '#64748b', fontSize: 15 }}>Gateway is routing your verified land data to the Insurance API for instant policy generation...</p>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div>
                            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Policy Review</h2>
                            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8, marginBottom: 24, border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: 14, textTransform: 'uppercase', color: '#64748b', marginBottom: 12 }}>Underwriting Data Provided</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                                    <span>Sowing Validity</span>
                                    <span style={{ color: '#059669', fontWeight: 600 }}>✓ Verified (Agri DB)</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                                    <span>Land Ownership</span>
                                    <span style={{ color: '#059669', fontWeight: 600 }}>✓ Verified (Revenue DB)</span>
                                </div>
                            </div>
                            <button onClick={submitApplication} className="btn-primary" disabled={isSubmitting} style={{ width: '100%', fontSize: 16, padding: '14px' }}>
                                {isSubmitting ? 'Finalizing with Insurance...' : 'Submit Final Insurance Request'}
                            </button>
                        </div>
                    )}
                    
                    {currentStep === 6 && (
                         <div style={{ textAlign: 'center', padding: '40px 0' }}>
                         <div style={{ fontSize: 40, marginBottom: 20 }}>🎉</div>
                         <h2 style={{ fontSize: 18, marginBottom: 12, color: '#059669' }}>Policy Issued!</h2>
                         <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Your crop insurance policy has been approved based on verified government data.</p>
                         
                         <button onClick={() => navigate(`/tracking/SP-AGRI-2026-${Math.floor(Math.random() * 10000)}`)} className="btn-primary" style={{ background: '#0f172a', borderColor: '#0f172a' }}>
                             View Policy Dashboard
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
                    Behind The Scenes: Agriculture & Revenue APIs
                </h3>

                <div style={{ 
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 16, padding: 32, backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{ fontSize: 32, marginBottom: 24 }}>🌾</div>
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
                        {currentStep === 1 && "[ UI ] ---> crop_request ---> [ GATEWAY_MEMORY ]"}
                        {currentStep === 2 && "[ AGRI_DB (Sowing) ] <--- lookup() --- [ GATEWAY ] --- lookup() ---> [ REVENUE_DB ]"}
                        {currentStep === 3 && "[ JWT_ENGINE ] ::: Generating land_consent_token :::"}
                        {currentStep === 4 && "[ GATEWAY ] === {jwt_token} ===> [ INSURANCE_API ]"}
                        {currentStep === 5 && "Raw Land Records => Transformation => Insurance API Common Model Payload"}
                        {currentStep === 6 && "Writing INSURANCE_APPROVAL transaction hash to immutable audit log..."}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgricultureApplication;
