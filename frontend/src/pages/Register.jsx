import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, loginUser, sendOtp, verifyOtp } from '../services/api';
import { motion } from 'framer-motion';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Citizen');
    const [department, setDepartment] = useState('');
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const [dob, setDob] = useState('');
    const [district, setDistrict] = useState('');
    const [state, setState] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showDigilockerModal, setShowDigilockerModal] = useState(false);
    const [digilockerStep, setDigilockerStep] = useState(1);
    
    // OTP State variables
    const [aadhaarOrMobile, setAadhaarOrMobile] = useState('7717465014');
    const [enteredOtp, setEnteredOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [smsBanner, setSmsBanner] = useState(null);
    const navigate = useNavigate();

    const containsPersonalInfo = (p) => {
        if (!p) return false;
        const pLower = p.toLowerCase();
        
        // Check name
        if (name) {
            const nameParts = name.toLowerCase().split(' ').filter(n => n.length > 2);
            for (let part of nameParts) {
                if (pLower.includes(part)) return true;
            }
        }
        
        // Check DOB
        if (dob) {
            const dobClean = dob.replace(/-/g, ''); // YYYYMMDD
            const dobRev = dob.split('-').reverse().join(''); // DDMMYYYY
            const year = dob.split('-')[0]; // YYYY
            if (pLower.includes(dobClean) || pLower.includes(dobRev) || pLower.includes(year)) return true;
        }
        return false;
    };

    // Password format validation
    const passwordChecks = [
        { label: 'Min 8 characters', test: (p) => p.length >= 8 },
        { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
        { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
        { label: 'A digit (0-9)', test: (p) => /[0-9]/.test(p) },
        { label: 'Special character (!@#$%)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
        { label: 'No personal info (Name/DOB)', test: (p) => !containsPersonalInfo(p) },
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
        try {
            await registerUser({ name, email, password, role, department, mobile, address, dob, district, state });
            // Auto-login after successful registration
            const loginData = await loginUser(email, password);
            navigate(getDashboardPath(loginData.user?.role || role));
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
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
                    
                    <button 
                        type="button"
                        onClick={() => setShowDigilockerModal(true)}
                        style={{
                            width: '100%', padding: '12px 16px', borderRadius: 8, background: '#f8fafc',
                            border: '1px solid #cbd5e1', color: '#334155', fontWeight: 600, fontSize: 15,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                            cursor: 'pointer', marginBottom: 24, transition: 'all 0.2s'
                        }}
                    >
                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e9/DigiLocker_logo.png" alt="DigiLocker" style={{ height: 24, objectFit: 'contain' }} />
                        Register instantly with DigiLocker
                    </button>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>OR CREATE MANUALLY</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
                    </div>

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

                    <form onSubmit={handleRegister}>


                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Full Name</label>
                            <input type="text" className="input-js" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} required />
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Email Address</label>
                            <input type="email" className="input-js" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>

                        {role === 'Citizen' && (
                            <div style={{ marginBottom: 16, padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>Master Profile Details (Auto-fills Government Forms)</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Mobile Number</label>
                                        <input type="tel" className="input-js" placeholder="10-digit number" value={mobile} onChange={e => setMobile(e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Date of Birth</label>
                                        <input type="date" className="input-js" value={dob} onChange={e => setDob(e.target.value)} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Address</label>
                                    <input type="text" className="input-js" placeholder="Full residential address" value={address} onChange={e => setAddress(e.target.value)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>District</label>
                                        <input type="text" className="input-js" value={district} onChange={e => setDistrict(e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>State</label>
                                        <input type="text" className="input-js" value={state} onChange={e => setState(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        )}

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

                        {/* Password Strength Checklist */}
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
                            {isLoading ? 'Creating Master ID...' : 'Create Master ID'}
                        </button>
                    </form>

                    {/* Footer */}
                    <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)' }}>
                        Already have a Master ID? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign In here</Link>
                    </div>
                </div>
            </motion.div>

            {/* DIGILOCKER MODAL */}
            {showDigilockerModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        style={{ background: 'white', borderRadius: 16, width: 440, padding: 32, position: 'relative' }}
                    >
                        <button onClick={() => setShowDigilockerModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>×</button>
                        
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e9/DigiLocker_logo.png" alt="DigiLocker" style={{ height: 40, marginBottom: 16 }} />
                            <h3 style={{ margin: 0, fontSize: 20 }}>DigiLocker Authentication</h3>
                        </div>

                        {smsBanner && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    padding: '12px 14px',
                                    borderRadius: 10,
                                    background: '#0f172a',
                                    border: '1px solid #3b82f6',
                                    color: '#f8fafc',
                                    marginBottom: 16
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        📲 Twilio Verify OTP Sent
                                    </span>
                                    <span style={{ fontSize: 11, opacity: 0.8 }}>Just now</span>
                                </div>
                                <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.5 }}>
                                    A 6-digit verification code has been dispatched directly to your mobile phone number <strong>+91 {smsBanner.mobile}</strong>. Please check your SMS/WhatsApp messages and enter the OTP below.
                                </div>
                            </motion.div>
                        )}

                        {otpError && (
                            <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
                                ⚠️ {otpError}
                            </div>
                        )}

                        {digilockerStep === 1 ? (
                            <div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                                        Enter 12-Digit Aadhaar Number OR Registered Mobile Number
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="Aadhaar Number / Mobile (e.g. 7717465014)" 
                                        value={aadhaarOrMobile}
                                        onChange={e => setAadhaarOrMobile(e.target.value)}
                                        className="input-js" 
                                        style={{ textAlign: 'center', letterSpacing: 2, fontSize: 16, fontWeight: 600 }} 
                                    />
                                    <span style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'block', textAlign: 'center' }}>
                                        📲 Real OTP will be dispatched via Twilio Verify to +91 {aadhaarOrMobile.trim() || '7717465014'}
                                    </span>
                                </div>

                                <button 
                                    onClick={async () => {
                                        const targetInput = aadhaarOrMobile.trim() || '7717465014';
                                        const cleanNum = targetInput.replace(/\D/g, '') || '7717465014';
                                        setOtpLoading(true);
                                        setOtpError('');
                                        try {
                                            await sendOtp(targetInput);
                                            setDigilockerStep(2);
                                            setSmsBanner({ mobile: cleanNum });
                                        } catch (err) {
                                            setOtpError(err.response?.data?.error || 'Failed to send Twilio OTP.');
                                        } finally {
                                            setOtpLoading(false);
                                        }
                                    }} 
                                    disabled={otpLoading}
                                    className="btn-js" 
                                    style={{ width: '100%', background: '#3b82f6', color: 'white', fontWeight: 700, opacity: otpLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                >
                                    📲 {otpLoading ? 'Sending Real OTP...' : 'Send Real OTP to My Phone'}
                                </button>
                            </div>
                        ) : digilockerStep === 2 ? (
                            <div>
                                <p style={{ color: '#475569', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
                                    Enter 6-digit OTP sent to your phone <strong>(+91 {aadhaarOrMobile})</strong>.
                                </p>
                                <div style={{ marginBottom: 16 }}>
                                    <input 
                                        type="text" 
                                        placeholder="● ● ● ● ● ●" 
                                        maxLength={6}
                                        value={enteredOtp}
                                        onChange={e => setEnteredOtp(e.target.value)}
                                        className="input-js" 
                                        style={{ textAlign: 'center', letterSpacing: 8, fontSize: 22, fontWeight: 700 }} 
                                    />
                                </div>
                                <button 
                                    onClick={async () => {
                                        const targetInput = aadhaarOrMobile.trim() || '7717465014';
                                        if (!enteredOtp || enteredOtp.length < 4) {
                                            setOtpError('Please enter the 6-digit verification code.');
                                            return;
                                        }
                                        setOtpLoading(true);
                                        setOtpError('');
                                        try {
                                            await verifyOtp(targetInput, enteredOtp);
                                            setShowDigilockerModal(false);
                                            setDigilockerStep(1);
                                            setName('Verified Citizen (DigiLocker Aadhaar)');
                                            setEmail(prev => prev || `citizen_${targetInput}@jansetu.ai`);
                                            setDob('1994-06-18');
                                            setMobile(targetInput);
                                            setAddress('Vikas Nagar, Sector 4');
                                            setDistrict('Lucknow');
                                            setState('Uttar Pradesh');
                                            setSmsBanner(null);
                                            setEnteredOtp('');
                                        } catch (err) {
                                            setOtpError(err.response?.data?.error || 'Incorrect OTP entered.');
                                        } finally {
                                            setOtpLoading(false);
                                        }
                                    }} 
                                    disabled={otpLoading}
                                    className="btn-js" 
                                    style={{ width: '100%', background: '#10b981', color: 'white', fontWeight: 700, opacity: otpLoading ? 0.7 : 1 }}
                                >
                                    {otpLoading ? 'Verifying Twilio OTP...' : 'Verify OTP & Fetch Aadhaar Details'}
                                </button>
                            </div>
                        ) : null}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Register;
