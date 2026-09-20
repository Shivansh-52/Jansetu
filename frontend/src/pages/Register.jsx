import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, loginUser, sendOtp, verifyOtp, verifyAadhaar, updateAadhaarDetails, verifyDigilocker } from '../services/api';
import { motion } from 'framer-motion';

const Register = () => {
    // Basic Details State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const [role, setRole] = useState('Citizen');
    const [department, setDepartment] = useState(''); // not used for citizen but keeping for safety

    // Flow State
    const [regStep, setRegStep] = useState('basic'); // basic, aadhaar_prompt, mismatch, digilocker_prompt, digilocker_otp
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // Aadhaar State
    const [aadhaarId, setAadhaarId] = useState('');
    const [registeredUserId, setRegisteredUserId] = useState('');
    const [kycData, setKycData] = useState(null);
    const [mismatchReason, setMismatchReason] = useState('');

    // DigiLocker State
    const [digilockerId, setDigilockerId] = useState('');
    const [digilockerMpin, setDigilockerMpin] = useState('');
    const [otpCode, setOtpCode] = useState('');

    const navigate = useNavigate();

    const containsPersonalInfo = (p) => {
        if (!p) return false;
        const pLower = p.toLowerCase();
        if (name) {
            const nameParts = name.toLowerCase().split(' ').filter(n => n.length > 2);
            for (let part of nameParts) {
                if (pLower.includes(part)) return true;
            }
        }
        return false;
    };

    const passwordChecks = [
        { label: 'Min 8 characters', test: (p) => p.length >= 8 },
        { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
        { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
        { label: 'A digit (0-9)', test: (p) => /[0-9]/.test(p) },
        { label: 'Special character (!@#$%)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
        { label: 'No personal info (Name)', test: (p) => !containsPersonalInfo(p) },
    ];
    const isPasswordValid = passwordChecks.every(c => c.test(password));

    const getDashboardPath = (userRole) => {
        switch (userRole?.toLowerCase()) {
            case 'citizen': return '/user-dashboard';
            case 'worker': return '/worker-dashboard';
            case 'dept_officer': return '/dept-officer-dashboard';
            case 'admin': return '/admin-dashboard';
            case 'governance': return '/governance-dashboard';
            default: return '/';
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!isPasswordValid) {
            setError('Password does not meet the required format.');
            return;
        }
        setIsLoading(true);
        setError('');
        // Defer database registration: just move to the next step
        setTimeout(() => {
            setRegStep('aadhaar_prompt'); 
            setIsLoading(false);
        }, 500);
    };

    const handleVerifyAadhaar = async () => {
        if (!aadhaarId) {
            setError('Please enter your Aadhaar Number');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const kycRes = await verifyAadhaar({ aadhaar_number: aadhaarId, name, address });
            setKycData(kycRes.kyc_data);
            
            if (kycRes.mismatch) {
                let reason = [];
                if (kycRes.name_mismatch) reason.push("Name");
                if (kycRes.address_mismatch) reason.push("Address");
                setMismatchReason(reason.join(" & "));
                setRegStep('mismatch');
            } else {
                // Perfect match, proceed to digilocker
                setRegStep('digilocker_prompt');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Aadhaar Verification failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMismatchDecision = async (useAadhaar) => {
        if (useAadhaar && kycData) {
            setName(kycData.name || name);
            setAddress(kycData.address || address);
        }
        setRegStep('digilocker_prompt');
    };

    const handleSendDigilockerOtp = async () => {
        if (!digilockerId || !digilockerMpin) {
            setError('Please enter both DigiLocker ID and MPIN');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            // Simulated OTP Send
            await sendOtp(mobile, true);
            setRegStep('digilocker_otp');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyDigilocker = async () => {
        if (!otpCode || otpCode.length < 4) {
            setError('Please enter the verification code.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await verifyOtp(mobile, otpCode, true);
            
            // NOW register the user with all accumulated data
            const registerPayload = { 
                name, email, password, role, department, mobile, address, 
                aadhaar: aadhaarId, digilocker_id: digilockerId 
            };
            const res = await registerUser(registerPayload);
            const finalUserId = res.user_id;

            // Verify Digilocker and auto-seed demo data
            await verifyDigilocker(finalUserId);
            
            await finalizeLogin();
        } catch (err) {
            setError(err.response?.data?.error || 'Verification or Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const finalizeLogin = async () => {
        const loginData = await loginUser(email, password);
        if (loginData.user?.master_id) {
            sessionStorage.setItem('masterId', loginData.user.master_id);
        } else if (registeredUserId) {
            sessionStorage.setItem('masterId', registeredUserId);
        }
        sessionStorage.setItem('connectedServices', JSON.stringify(['education', 'publicServices']));
        navigate(getDashboardPath(loginData.user?.role || role));
    };

    return (
        <div className="page-bg" style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px 20px', position: 'relative', overflow: 'hidden'
        }}>
            <div className="blob" style={{ width: 400, height: 400, background: 'var(--bg-secondary)', top: '-10%', left: '-5%' }} />
            <div className="blob" style={{ width: 300, height: 300, background: 'rgba(43,107,255,0.06)', bottom: '5%', right: '-5%' }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div 
                        onDoubleClick={() => navigate('/up2')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24, cursor: 'pointer', userSelect: 'none' }}
                    >
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16
                        }}>SP</div>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 22, color: 'var(--text-primary)' }}>
                            Samadhan<span style={{ color: 'var(--accent)' }}>Path</span>
                        </span>
                    </div>
                    <h2 style={{ fontSize: 28, marginBottom: 8 }}>Create your Master ID</h2>
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0 }}>One digital identity for all government services</p>
                </div>

                {/* Card */}
                <div className="card-js" style={{ padding: 32 }}>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                padding: '12px 16px', borderRadius: 12,
                                background: '#fef2f2', border: '1px solid #fecaca',
                                color: 'var(--color-danger)', fontSize: 14, fontWeight: 500, marginBottom: 20
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    {regStep === 'basic' && (
                        <form onSubmit={handleRegister}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Full Name</label>
                                <input type="text" className="input-js" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} required />
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Email Address</label>
                                <input type="email" className="input-js" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Mobile Number</label>
                                <input type="tel" className="input-js" placeholder="10-digit mobile number" value={mobile} onChange={e => setMobile(e.target.value)} required />
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Residential Address</label>
                                <input type="text" className="input-js" placeholder="Full residential address" value={address} onChange={e => setAddress(e.target.value)} required />
                            </div>

                            <div style={{ marginBottom: 8, position: 'relative' }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Password</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-js"
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    style={{ paddingRight: 60 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: 14, top: 38,
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        fontSize: 12, fontWeight: 700, color: 'var(--accent)',
                                        fontFamily: 'var(--font-body)', textTransform: 'uppercase'
                                    }}
                                >
                                    {showPassword ? 'HIDE' : 'SHOW'}
                                </button>
                            </div>

                            {password.length > 0 && (
                                <div style={{
                                    marginBottom: 20, padding: '12px 16px', borderRadius: 12,
                                    background: 'var(--bg-secondary)', border: '1px solid var(--border-light)'
                                }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                                        Password Requirements
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                                        {passwordChecks.map((check, i) => {
                                            const passed = check.test(password);
                                            return (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: passed ? '#2ecc71' : '#94a3b8', fontWeight: 500, transition: 'color 0.2s' }}>
                                                    <span style={{ fontSize: 10 }}>{passed ? '✅' : '⬜'}</span>
                                                    {check.label}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', opacity: isLoading ? 0.7 : 1 }}>
                                {isLoading ? 'Creating Master ID...' : 'Continue to Aadhaar KYC'}
                            </button>
                            
                            <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)' }}>
                                Already have a Master ID? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign In here</Link>
                            </div>
                        </form>
                    )}

                    {regStep === 'aadhaar_prompt' && (
                        <div style={{ textAlign: 'center' }}>
                            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/1200px-Aadhaar_Logo.svg.png" alt="Aadhaar" style={{ height: 40, marginBottom: 16 }} />
                            <h3 style={{ marginBottom: 20, color: 'var(--text-primary)' }}>Step 1: Aadhaar Identity Verification</h3>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                                Please verify your identity to proceed.
                            </p>

                            <div style={{ marginBottom: 20, textAlign: 'left' }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                    Aadhaar Number
                                </label>
                                <input 
                                    type="text" 
                                    className="input-js" 
                                    placeholder="e.g. 234567890123"
                                    value={aadhaarId}
                                    onChange={e => setAadhaarId(e.target.value)}
                                />
                            </div>

                            <button onClick={handleVerifyAadhaar} className="btn-primary" disabled={isLoading} style={{ width: '100%', opacity: isLoading ? 0.7 : 1 }}>
                                {isLoading ? 'Verifying...' : 'Verify Aadhaar Details'}
                            </button>
                        </div>
                    )}

                    {regStep === 'mismatch' && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: 64, height: 64, background: '#fffbeb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#d97706', fontSize: 28 }}>
                                ⚠️
                            </div>
                            <h3 style={{ marginBottom: 12, color: 'var(--text-primary)' }}>{mismatchReason} Mismatch Detected</h3>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                                We noticed a difference between the data you entered and your official Aadhaar records. 
                                <br/><br/>
                                <a href="https://uidai.gov.in" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>Update your Aadhaar here</a>
                            </p>
                            
                            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 12, padding: 16, marginBottom: 24, textAlign: 'left' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Registered Data:</span>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#334155', marginTop: 8 }}>{name}</div>
                                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{address}</div>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Aadhaar Data:</span>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#047857', marginTop: 8 }}>{kycData?.name}</div>
                                        <div style={{ fontSize: 13, color: '#047857', marginTop: 4 }}>{kycData?.address}</div>
                                    </div>
                                </div>
                            </div>

                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, fontWeight: 500 }}>
                                Your entered data must match Aadhaar to proceed. You can either proceed by overwriting your data with the official Aadhaar data, or you can go update your Aadhaar records first and come back later.
                            </p>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button 
                                    onClick={() => {
                                        window.open("https://myaadhaar.uidai.gov.in/update-demographics", "_blank");
                                    }} 
                                    disabled={isLoading}
                                    style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8, color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Update Aadhaar First ↗
                                </button>
                                <button 
                                    onClick={() => handleMismatchDecision(true)} 
                                    disabled={isLoading}
                                    style={{ flex: 1, padding: '12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Only Use Aadhaar Data
                                </button>
                            </div>
                        </div>
                    )}

                    {regStep === 'digilocker_prompt' && (
                        <div style={{ textAlign: 'center' }}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e9/DigiLocker_logo.png" alt="DigiLocker" style={{ height: 40, marginBottom: 16, objectFit: 'contain' }} />
                            <h3 style={{ marginBottom: 20, color: 'var(--text-primary)' }}>Step 2: DigiLocker Document Link</h3>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                                Link your DigiLocker to auto-import all your official certificates into your vault.
                            </p>

                            <div style={{ marginBottom: 16, textAlign: 'left' }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                    DigiLocker ID
                                </label>
                                <input 
                                    type="text" 
                                    className="input-js" 
                                    placeholder="e.g. aarav.digilocker"
                                    value={digilockerId}
                                    onChange={e => setDigilockerId(e.target.value)}
                                />
                            </div>

                            <div style={{ marginBottom: 20, textAlign: 'left' }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                    6-Digit Security MPIN
                                </label>
                                <input 
                                    type="password" 
                                    className="input-js" 
                                    placeholder="● ● ● ● ● ●"
                                    value={digilockerMpin}
                                    maxLength={6}
                                    onChange={e => setDigilockerMpin(e.target.value)}
                                    style={{ letterSpacing: 4, fontWeight: 700 }}
                                />
                                <span style={{ fontSize: 11, color: '#64748b', marginTop: 8, display: 'block' }}>
                                    📲 OTP will be sent to your registered mobile (+91 {mobile})
                                </span>
                            </div>

                            <button onClick={handleSendDigilockerOtp} className="btn-primary" disabled={isLoading} style={{ width: '100%', opacity: isLoading ? 0.7 : 1 }}>
                                {isLoading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </div>
                    )}

                    {regStep === 'digilocker_otp' && (
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ marginBottom: 20, color: 'var(--text-primary)' }}>Verify DigiLocker Link</h3>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                                Enter the 6-digit verification code sent to <strong>+91 {mobile}</strong>
                            </p>
                            
                            <div style={{ marginBottom: 24 }}>
                                <input 
                                    type="text" 
                                    className="input-js" 
                                    placeholder="● ● ● ● ● ●" 
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={e => setOtpCode(e.target.value)}
                                    style={{ textAlign: 'center', letterSpacing: 8, fontSize: 24, fontWeight: 700 }}
                                />
                            </div>

                            <button onClick={handleVerifyDigilocker} className="btn-js" disabled={isLoading} style={{ width: '100%', background: '#10b981', color: 'white', fontWeight: 700, padding: '14px', borderRadius: 8, border: 'none', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                                {isLoading ? 'Verifying & Generating Demo Data...' : 'Verify & Auto-Seed Account'}
                            </button>
                        </div>
                    )}

                </div>
            </motion.div>
        </div>
    );
};

export default Register;
