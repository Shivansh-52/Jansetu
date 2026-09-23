import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, verifyAadhaar, verifyDigilocker, loginUser } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, Mail, Phone, MapPin, AlertTriangle, Eye, Lock, Cloud, Fingerprint } from 'lucide-react';

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

    // Captcha States
    const [captcha, setCaptcha] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaError, setCaptchaError] = useState('');
    const captchaCanvasRef = React.useRef(null);

    const generateCaptcha = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let captchaStr = '';
        for (let i = 0; i < 6; i++) {
            captchaStr += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptcha(captchaStr);
        setCaptchaInput('');
        
        // Draw on canvas
        setTimeout(() => {
            const canvas = captchaCanvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Background
                ctx.fillStyle = '#f8fafc';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw noise lines
                for (let i = 0; i < 6; i++) {
                    ctx.beginPath();
                    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
                    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
                    ctx.strokeStyle = '#cbd5e1';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                
                // Draw text
                ctx.font = 'bold 22px monospace';
                ctx.fillStyle = '#0f172a';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Add some letter distortion
                for (let i = 0; i < captchaStr.length; i++) {
                    ctx.save();
                    const x = 25 + (i * 22);
                    const y = canvas.height / 2;
                    ctx.translate(x, y);
                    ctx.rotate((Math.random() - 0.5) * 0.5);
                    ctx.fillText(captchaStr[i], 0, 0);
                    ctx.restore();
                }
            }
        }, 0);
    };

    React.useEffect(() => {
        generateCaptcha();
    }, []);

    // KYC State
    const [aadhaarId, setAadhaarId] = useState('');
    const [aadhaarOtp, setAadhaarOtp] = useState('');
    const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
    const [registeredUserId, setRegisteredUserId] = useState(null);
    const [kycData, setKycData] = useState(null);
    const [mismatchReason, setMismatchReason] = useState(null);

    // DigiLocker State
    const [digilockerId, setDigilockerId] = useState('');
    const [digilockerMpin, setDigilockerMpin] = useState('');
    const [otpCode, setOtpCode] = useState('');
    
    // Realistic DigiLocker Modal States
    const [showRealDigilockerModal, setShowRealDigilockerModal] = useState(false);
    const [dlIdentifier, setDlIdentifier] = useState('');
    const [dlPin, setDlPin] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setCaptchaError('');

        if (captchaInput.toLowerCase() !== captcha.toLowerCase()) {
            setCaptchaError('Incorrect captcha. Please try again.');
            generateCaptcha();
            return;
        }

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

    const handleSendAadhaarOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate network latency for OTP
        setTimeout(() => {
            setAadhaarOtpSent(true);
            setIsLoading(false);
        }, 1200);
    };

    const handleVerifyAadhaar = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            // Check mismatch using backend logic
            const response = await verifyAadhaar({ 
                user_id: registeredUserId, 
                aadhaar_number: aadhaarId,
                name: name,
                address: address
            });
            setKycData(response.kyc_data);
            if (response.mismatch || response.name_mismatch || response.address_mismatch) {
                setMismatchReason('The name or address on your Aadhaar card differs slightly from what you entered.');
                setRegStep('mismatch');
            } else {
                setRegStep('digilocker_prompt');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Aadhaar verification failed');
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

    const handleSimulatedDigilockerLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simulate network request to authentic government servers
        setTimeout(() => {
            // Success - directly navigate to user dashboard without API Setu redirect
            setIsLoading(false);
            sessionStorage.setItem('token', 'simulated_digilocker_token_for_hackathon');
            sessionStorage.setItem('role', 'citizen');
            sessionStorage.setItem('user', JSON.stringify({ 
                role: 'citizen', 
                name: name || 'Demo Citizen', 
                email: email || 'aarav.digilocker@gov.in', 
                aadhaar: aadhaarId,
                digilocker_id: dlIdentifier
            }));
            navigate('/user-dashboard', { replace: true });
        }, 2000);
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
        <div style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
            
            {/* Single Column Layout */}
            <div style={{ flex: 1, display: 'flex' }}>
                
                {/* Form Container */}
                <div style={{ flex: 1, padding: '48px', display: 'flex', justifyContent: 'center', backgroundColor: '#ffffff' }}>
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

                                    <div style={{ marginBottom: 24 }}>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
                                            Captcha Verification <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <div style={{ position: 'relative', width: '150px', height: '46px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                                                <canvas ref={captchaCanvasRef} width={150} height={46} style={{ display: 'block', width: '100%', height: '100%' }}></canvas>
                                            </div>
                                            <button type="button" onClick={generateCaptcha} style={{ padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Refresh Captcha">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 2v6h6"/></svg>
                                            </button>
                                            <input 
                                                type="text" 
                                                value={captchaInput}
                                                onChange={(e) => setCaptchaInput(e.target.value)}
                                                placeholder="Enter text"
                                                required
                                                style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }}
                                            />
                                        </div>
                                        {captchaError && (
                                            <div style={{ color: '#dc2626', fontSize: 12, fontWeight: 600, marginTop: 8 }}>{captchaError}</div>
                                        )}
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
                                    onSubmit={aadhaarOtpSent ? handleVerifyAadhaar : handleSendAadhaarOtp}
                                >
                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 32, textAlign: 'center' }}>
                                        <Fingerprint color="#22c55e" size={48} style={{ marginBottom: 24, margin: '0 auto' }} />
                                        <h3 style={{ fontSize: 20, color: '#0f172a', marginBottom: 12 }}>Aadhaar Verification</h3>
                                        
                                        {!aadhaarOtpSent ? (
                                            <>
                                                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Enter your 12-digit Aadhaar number to verify your identity.</p>
                                                <input 
                                                    type="text" 
                                                    value={aadhaarId} 
                                                    onChange={e => setAadhaarId(e.target.value)} 
                                                    required 
                                                    placeholder="XXXX XXXX XXXX" 
                                                    style={{ width: '100%', padding: '16px', borderRadius: 12, border: '2px solid #cbd5e1', fontSize: 18, textAlign: 'center', letterSpacing: 2, marginBottom: 24, outline: 'none' }} 
                                                />
                                                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', borderRadius: 12, backgroundColor: '#22c55e', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                                                    {isLoading ? 'Sending OTP...' : 'Get Aadhaar OTP'}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Enter the 6-digit OTP sent to your Aadhaar registered mobile number.</p>
                                                <input 
                                                    type="text" 
                                                    value={aadhaarOtp} 
                                                    onChange={e => setAadhaarOtp(e.target.value)} 
                                                    required 
                                                    maxLength="6"
                                                    placeholder="000000" 
                                                    style={{ width: '100%', padding: '16px', borderRadius: 12, border: '2px solid #cbd5e1', fontSize: 18, textAlign: 'center', letterSpacing: 4, marginBottom: 24, outline: 'none' }} 
                                                />
                                                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', borderRadius: 12, backgroundColor: '#ea580c', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                                                    {isLoading ? 'Verifying...' : 'Verify & Proceed'}
                                                </button>
                                            </>
                                        )}
                                        
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
                                <motion.div 
                                    key="digilocker_prompt"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                >
                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 32, textAlign: 'center' }}>
                                        <Cloud color="#3b82f6" size={48} style={{ marginBottom: 24, margin: '0 auto' }} />
                                        <h3 style={{ fontSize: 20, color: '#0f172a', marginBottom: 12 }}>DigiLocker Integration</h3>
                                        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Automatically fetch and securely store your official documents.</p>
                                        
                                        <button type="button" onClick={() => setShowRealDigilockerModal(true)} disabled={isLoading} style={{ width: '100%', padding: '14px', borderRadius: 12, backgroundColor: '#3b82f6', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                                            Sign in with MeriPehchaan
                                        </button>
                                        <button type="button" onClick={finalizeLogin} style={{ width: '100%', padding: '14px', background: 'none', border: 'none', color: '#64748b', fontWeight: 600, marginTop: 12, cursor: 'pointer' }}>
                                            Skip & Go to Dashboard
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {showRealDigilockerModal && (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: 20 }}
                                >
                                    <motion.div 
                                        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                                        style={{ background: 'white', width: '100%', maxWidth: 450, borderRadius: 12, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
                                    >
                                        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <ShieldCheck color="#16a34a" size={32} />
                                                <div>
                                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>MeriPehchaan</h3>
                                                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>National Single Sign-On</p>
                                                </div>
                                            </div>
                                            <Cloud color="#3b82f6" size={28} />
                                        </div>
                                        
                                        <form onSubmit={handleSimulatedDigilockerLogin} style={{ padding: '32px 24px' }}>
                                            <h4 style={{ fontSize: 18, color: '#0f172a', fontWeight: 600, marginBottom: 24 }}>Sign In to your account</h4>
                                            
                                            <div style={{ marginBottom: 20 }}>
                                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Mobile / Aadhaar / Username</label>
                                                <input type="text" value={dlIdentifier} onChange={e => setDlIdentifier(e.target.value)} required placeholder="Enter Mobile / Aadhaar / Username" style={{ width: '100%', padding: '14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }} />
                                            </div>
                                            
                                            <div style={{ marginBottom: 24 }}>
                                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>6 digit security PIN</label>
                                                <div style={{ position: 'relative' }}>
                                                    <input type="password" value={dlPin} onChange={e => setDlPin(e.target.value)} required placeholder="Enter 6 digit security PIN" maxLength="6" style={{ width: '100%', padding: '14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }} />
                                                    <span style={{ position: 'absolute', right: 14, top: 14, color: '#3b82f6', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Forgot PIN?</span>
                                                </div>
                                            </div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                                                <input type="checkbox" id="dlconsent" required style={{ accentColor: '#22c55e', width: 16, height: 16 }} />
                                                <label htmlFor="dlconsent" style={{ fontSize: 13, color: '#475569' }}>I consent to MeriPehchaan terms of use.</label>
                                            </div>

                                            <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', borderRadius: 8, backgroundColor: '#2563eb', color: 'white', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                                                {isLoading ? 'Signing In...' : 'Sign In'}
                                            </button>
                                            
                                            <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 24, marginBottom: 0 }}>
                                                New to MeriPehchaan? <span style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}>Sign Up</span>
                                            </p>
                                        </form>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
