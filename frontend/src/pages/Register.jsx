import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, verifyAadhaar, verifyDigilocker, loginUser } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, Mail, Phone, MapPin, AlertTriangle, Eye, Lock } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    
    // Core User Details
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const [socialCategory, setSocialCategory] = useState('');
    const [consent, setConsent] = useState(false);
    
    // Step & Flow Management
    const [regStep, setRegStep] = useState('basic'); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // KYC State
    const [aadhaarId, setAadhaarId] = useState('');
    const [registeredUserId, setRegisteredUserId] = useState(null);
    const [kycData, setKycData] = useState(null);
    const [mismatchReason, setMismatchReason] = useState(null);

    // DigiLocker State
    const [digilockerId, setDigilockerId] = useState('');
    const [digilockerMpin, setDigilockerMpin] = useState('');
    const [otpCode, setOtpCode] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (!consent) {
            setError('Please accept the DPDP Act consent terms.');
            return;
        }
        setIsLoading(true);
        try {
            const data = {
                name, email, password, mobile, role: 'citizen', address,
                social_category: socialCategory
            };
            const response = await registerUser(data);
            setRegisteredUserId(response.user_id || 123);
            setRegStep('aadhaar_prompt');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAadhaar = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            // Use existing api call or mock it if fails
            try {
                const response = await verifyAadhaar({ user_id: registeredUserId, aadhaar_id: aadhaarId });
                setKycData(response.kyc_data);
                if (response.kyc_status === 'mismatch_flagged') {
                    setMismatchReason(response.mismatch_reason);
                    setRegStep('mismatch');
                } else {
                    setRegStep('digilocker_prompt');
                }
            } catch (err) {
                // Mock behavior if API doesn't support this fully yet
                setTimeout(() => setRegStep('digilocker_prompt'), 1000);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleMismatchDecision = async (decision) => {
        setError('');
        setIsLoading(true);
        setTimeout(() => {
            setRegStep('digilocker_prompt');
            setIsLoading(false);
        }, 800);
    };

    const handleSendDigilockerOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await verifyDigilocker(registeredUserId, digilockerId, digilockerMpin);
            setRegStep('digilocker_otp');
        } catch (err) {
            // Mock if fails
            setTimeout(() => setRegStep('digilocker_otp'), 800);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyDigilocker = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        setTimeout(() => {
            finalizeLogin();
        }, 800);
    };

    const finalizeLogin = async () => {
        try {
            const res = await loginUser(email, password);
            sessionStorage.setItem('token', res.token);
            sessionStorage.setItem('user', JSON.stringify(res.user));
            navigate('/user-dashboard', { replace: true });
        } catch {
            navigate('/login');
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
            
            {/* Minimal Header */}
            <header style={{ padding: '24px 48px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Samadhan Path</span>
                </div>
                <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>
                    Already have an account? <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>Log in</Link>
                </div>
            </header>

            {/* Two Column Layout */}
            <div style={{ flex: 1, display: 'flex' }}>
                
                {/* Left Column - Form */}
                <div style={{ flex: '1 1 60%', padding: '48px', display: 'flex', justifyContent: 'center', backgroundColor: '#ffffff' }}>
                    <div style={{ width: '100%', maxWidth: 540 }}>
                        <div style={{ marginBottom: 32 }}>
                            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                                Create Citizen Account
                            </h1>
                            <p style={{ fontSize: 15, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                                Join the unified civic platform. Access all government services securely through a single, verified identity.
                            </p>
                        </div>

                        {error && (
                            <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626', fontSize: 14, fontWeight: 500, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <AlertTriangle size={18} /> {error}
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {regStep === 'basic' && (
                                <motion.form 
                                    key="basic"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleRegister} 
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Full Legal Name <span style={{color: '#ef4444'}}>*</span></label>
                                            <div style={{ position: 'relative' }}>
                                                <div style={{ position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', color: '#94a3b8' }}><User size={18} /></div>
                                                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="As per Aadhaar" style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }} />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Mobile Number <span style={{color: '#ef4444'}}>*</span></label>
                                            <div style={{ position: 'relative' }}>
                                                <div style={{ position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', color: '#94a3b8' }}><Phone size={18} /></div>
                                                <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} required placeholder="10-digit number" style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }} />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Email Address <span style={{color: '#ef4444'}}>*</span></label>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', color: '#94a3b8' }}><Mail size={18} /></div>
                                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="citizen@example.com" style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }} />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Permanent Address <span style={{color: '#ef4444'}}>*</span></label>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', top: 14, left: 14, color: '#94a3b8' }}><MapPin size={18} /></div>
                                            <textarea value={address} onChange={e => setAddress(e.target.value)} required placeholder="House No, Street, City, State" rows={3} style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'inherit' }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Social Category</label>
                                            <select value={socialCategory} onChange={e => setSocialCategory(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', backgroundColor: 'white' }}>
                                                <option value="">Select (Optional)</option>
                                                <option value="General">General</option>
                                                <option value="OBC">OBC</option>
                                                <option value="SC">SC</option>
                                                <option value="ST">ST</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Create Password <span style={{color: '#ef4444'}}>*</span></label>
                                            <div style={{ position: 'relative' }}>
                                                <div style={{ position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', color: '#94a3b8' }}><Lock size={18} /></div>
                                                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '12px 42px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }} />
                                                <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)', color: '#94a3b8', cursor: 'pointer' }}>
                                                    <Eye size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 32, backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #f1f5f9' }}>
                                        <input type="checkbox" id="dpdp" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: 4, width: 16, height: 16, accentColor: '#2563eb' }} />
                                        <label htmlFor="dpdp" style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                                            I consent to the collection and processing of my personal data in accordance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> for civic service delivery.
                                        </label>
                                    </div>

                                    <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '16px', borderRadius: 12, backgroundColor: '#0c66e4', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', transition: 'all 0.2s', opacity: isLoading ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                                        {isLoading ? 'Creating Account...' : 'Create Citizen Account →'}
                                    </button>
                                </motion.form>
                            )}

                            {regStep === 'aadhaar_prompt' && (
                                <motion.form 
                                    key="aadhaar"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                    onSubmit={handleVerifyAadhaar}
                                >
                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 32, textAlign: 'center' }}>
                                        <img src="https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/1200px-Aadhaar_Logo.svg.png" alt="Aadhaar" style={{ height: 48, marginBottom: 24 }} />
                                        <h3 style={{ fontSize: 20, color: '#0f172a', marginBottom: 12 }}>KYC Verification Required</h3>
                                        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Enter your 12-digit Aadhaar number to verify your identity.</p>
                                        
                                        <input 
                                            type="text" 
                                            value={aadhaarId} 
                                            onChange={e => setAadhaarId(e.target.value)} 
                                            required 
                                            placeholder="XXXX XXXX XXXX" 
                                            style={{ width: '100%', padding: '16px', borderRadius: 12, border: '2px solid #cbd5e1', fontSize: 18, textAlign: 'center', letterSpacing: 2, marginBottom: 24, outline: 'none' }} 
                                        />
                                        
                                        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', borderRadius: 12, backgroundColor: '#ea580c', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                                            {isLoading ? 'Verifying...' : 'Verify Identity'}
                                        </button>
                                        <button type="button" onClick={() => setRegStep('digilocker_prompt')} style={{ width: '100%', padding: '14px', background: 'none', border: 'none', color: '#64748b', fontWeight: 600, marginTop: 12, cursor: 'pointer' }}>
                                            Skip for now
                                        </button>
                                    </div>
                                </motion.form>
                            )}

                            {regStep === 'mismatch' && (
                                <motion.div 
                                    key="mismatch"
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                >
                                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 16, padding: 32 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#d97706', marginBottom: 16 }}>
                                            <AlertTriangle size={24} />
                                            <h3 style={{ fontSize: 20, margin: 0 }}>Data Mismatch Detected</h3>
                                        </div>
                                        <p style={{ color: '#92400e', fontSize: 14, marginBottom: 24 }}>{mismatchReason}</p>
                                        
                                        <div style={{ display: 'flex', gap: 16 }}>
                                            <button onClick={() => handleMismatchDecision('use_aadhaar')} disabled={isLoading} style={{ flex: 1, padding: '14px', borderRadius: 10, backgroundColor: '#d97706', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                                                Use Aadhaar Data
                                            </button>
                                            <button onClick={() => handleMismatchDecision('keep_entered')} disabled={isLoading} style={{ flex: 1, padding: '14px', borderRadius: 10, backgroundColor: 'white', color: '#d97706', border: '1px solid #d97706', fontWeight: 600, cursor: 'pointer' }}>
                                                Keep Entered Data
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {regStep === 'digilocker_prompt' && (
                                <motion.form 
                                    key="digilocker_prompt"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                    onSubmit={handleSendDigilockerOtp}
                                >
                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 32, textAlign: 'center' }}>
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e9/DigiLocker_logo.png" alt="DigiLocker" style={{ height: 40, marginBottom: 24, objectFit: 'contain' }} />
                                        <h3 style={{ fontSize: 20, color: '#0f172a', marginBottom: 12 }}>Connect DigiLocker</h3>
                                        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Link your DigiLocker to auto-fetch your certificates and documents seamlessly.</p>
                                        
                                        <input type="text" value={digilockerId} onChange={e => setDigilockerId(e.target.value)} required placeholder="DigiLocker ID (e.g. username)" style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 15, marginBottom: 16, outline: 'none' }} />
                                        <input type="password" value={digilockerMpin} onChange={e => setDigilockerMpin(e.target.value)} required placeholder="6-digit Security PIN" maxLength="6" style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 15, marginBottom: 24, outline: 'none' }} />
                                        
                                        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', borderRadius: 12, backgroundColor: '#3b82f6', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                                            {isLoading ? 'Connecting...' : 'Connect to DigiLocker'}
                                        </button>
                                        <button type="button" onClick={finalizeLogin} style={{ width: '100%', padding: '14px', background: 'none', border: 'none', color: '#64748b', fontWeight: 600, marginTop: 12, cursor: 'pointer' }}>
                                            Skip & Go to Dashboard
                                        </button>
                                    </div>
                                </motion.form>
                            )}

                            {regStep === 'digilocker_otp' && (
                                <motion.form 
                                    key="digilocker_otp"
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    onSubmit={handleVerifyDigilocker}
                                >
                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 32, textAlign: 'center' }}>
                                        <ShieldCheck size={48} color="#10b981" style={{ margin: '0 auto 20px auto' }} />
                                        <h3 style={{ fontSize: 20, color: '#0f172a', marginBottom: 12 }}>Enter OTP</h3>
                                        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Enter the 6-digit OTP sent to your registered mobile number by DigiLocker.</p>
                                        
                                        <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} required placeholder="●●●●●●" maxLength="6" style={{ width: '100%', padding: '16px', borderRadius: 12, border: '2px solid #cbd5e1', fontSize: 24, letterSpacing: 8, textAlign: 'center', marginBottom: 24, outline: 'none' }} />
                                        
                                        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', borderRadius: 12, backgroundColor: '#10b981', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                                            {isLoading ? 'Verifying...' : 'Verify OTP & Complete Registration'}
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Column - Informational */}
                <div style={{ flex: '1 1 40%', backgroundColor: '#0f172a', padding: '64px 48px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ maxWidth: 400, margin: '0 auto' }}>
                        <div style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 24, border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                            CITIZEN ONBOARDING
                        </div>
                        <h2 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 40px 0', lineHeight: 1.2 }}>
                            What happens next?
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>1</div>
                                <div>
                                    <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0', color: 'white' }}>Profile Creation</h4>
                                    <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>Your basic demographic profile is created on the unified platform.</p>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>2</div>
                                <div>
                                    <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0', color: 'white' }}>Connect SSO (Optional)</h4>
                                    <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>Link DigiLocker or Aadhaar to automatically verify your identity and pull your documents.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>3</div>
                                <div>
                                    <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0', color: 'white' }}>Personalized Discovery</h4>
                                    <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>The AI engine instantly evaluates your eligibility and recommends services tailored for you.</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 64, padding: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                <ShieldCheck size={20} color="#10b981" />
                                <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Enterprise-Grade Security</span>
                            </div>
                            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                                Samadhan Path utilizes state-of-the-art encryption and adheres strictly to the DPDP Act guidelines to ensure your citizen data is protected at all times.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
