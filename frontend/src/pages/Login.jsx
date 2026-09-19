import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, sendOtp, verifyOtp } from '../services/api';
import { motion } from 'framer-motion';
import axios from 'axios';

const ROLE_ROUTES = {
    citizen: '/user-dashboard',
    worker: '/worker-dashboard',
    dept_officer: '/dept-officer-dashboard',
    contractor: '/contractor-dashboard',
    admin: '/admin-dashboard',
    governance: '/governance-dashboard'
};



const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // SSO States
    const [showSsoModal, setShowSsoModal] = useState(false);
    const [ssoType, setSsoType] = useState(null); // 'aadhaar' or 'meripehchaan'
    const [ssoStep, setSsoStep] = useState(1);
    const [aadhaarInput, setAadhaarInput] = useState('');
    const [enteredOtp, setEnteredOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [smsBanner, setSmsBanner] = useState(null);

    useEffect(() => {
        const user = sessionStorage.getItem('user');
        if (user) {
            try {
                const parsed = JSON.parse(user);
                navigate(ROLE_ROUTES[parsed.role] || '/', { replace: true });
            } catch { }
        }
    }, [navigate]);

    const performLogin = async (loginEmail, loginPass) => {
        setError('');
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPass })
            });
            const data = await response.json();
            
            if (response.ok) {
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('user', JSON.stringify(data.user));
                sessionStorage.setItem('masterId', data.user.master_id);
                sessionStorage.setItem('connectedServices', JSON.stringify(['education', 'publicServices']));
                navigate(ROLE_ROUTES[data.user.role] || '/dashboard', { replace: true });
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Could not connect to the Gateway service. Make sure it is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        await performLogin(email, password);
    };



    return (
        <div className="page-bg" style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px 20px', position: 'relative', overflow: 'hidden'
        }}>
            {/* Background blobs */}
            <div className="blob" style={{
                width: 400, height: 400, background: 'var(--bg-secondary)',
                top: '-10%', right: '-5%'
            }} />
            <div className="blob" style={{
                width: 300, height: 300, background: 'rgba(43,107,255,0.06)',
                bottom: '10%', left: '-5%'
            }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div 
                        onDoubleClick={() => navigate('/up2')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer', userSelect: 'none' }}
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
                    <h2 style={{ fontSize: 26, marginBottom: 6 }}>Welcome back</h2>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Single Sign-On (SSO) for all Government Services</p>
                </div>



                {/* Card */}
                <div className="card-js" style={{ padding: 32 }}>
                    
                    {/* SSO Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                        <button 
                            type="button"
                            onClick={() => { setSsoType('aadhaar'); setSsoStep(1); setOtpError(''); setSmsBanner(null); setEnteredOtp(''); setAadhaarInput('234567890123'); setShowSsoModal(true); }}
                            style={{
                                width: '100%', padding: '10px 16px', borderRadius: 8, background: '#fff',
                                border: '1px solid #cbd5e1', color: '#334155', fontWeight: 600, fontSize: 13,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer'
                            }}
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/1200px-Aadhaar_Logo.svg.png" alt="Aadhaar" style={{ height: 20 }} />
                            Login with Aadhaar OTP
                        </button>
                        <button 
                            type="button"
                            onClick={() => { setSsoType('digilocker'); setSsoStep(1); setOtpError(''); setSmsBanner(null); setEnteredOtp(''); setAadhaarInput('aarav.digilocker'); setShowSsoModal(true); }}
                            style={{
                                width: '100%', padding: '10px 16px', borderRadius: 8, background: '#fff',
                                border: '1px solid #cbd5e1', color: '#334155', fontWeight: 600, fontSize: 13,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer'
                            }}
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e9/DigiLocker_logo.png" alt="DigiLocker" style={{ height: 20, objectFit: 'contain' }} />
                            Login with DigiLocker SSO
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: 0.5 }}>OR LOGIN WITH CREDENTIALS</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
                    </div>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                padding: '12px 16px', borderRadius: 12,
                                background: '#fef2f2', border: '1px solid #fecaca',
                                color: 'var(--color-danger)', fontSize: 14, fontWeight: 500,
                                marginBottom: 20
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{
                                display: 'block', fontSize: 13, fontWeight: 600,
                                color: 'var(--text-secondary)', marginBottom: 6
                            }}>Master ID / Aadhaar / Mobile / Username</label>
                            <input
                                type="text"
                                className="input-js"
                                placeholder="e.g. 234567890123"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block', fontSize: 13, fontWeight: 600,
                                color: 'var(--text-secondary)', marginBottom: 6
                            }}>Password</label>
                            <input
                                type="password"
                                className="input-js"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: 13 }}>
                        Don't have a Master ID? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Create one now</Link>
                    </div>
                </div>
            </motion.div>

            {/* SSO MODAL */}
            {showSsoModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        style={{ background: 'white', borderRadius: 16, width: 440, padding: 32, position: 'relative' }}
                    >
                        <button onClick={() => setShowSsoModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>×</button>
                        
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            {ssoType === 'aadhaar' ? (
                                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/1200px-Aadhaar_Logo.svg.png" alt="Aadhaar" style={{ height: 40, marginBottom: 16 }} />
                            ) : (
                                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e9/DigiLocker_logo.png" alt="DigiLocker" style={{ height: 40, marginBottom: 16, objectFit: 'contain' }} />
                            )}
                            <h3 style={{ margin: 0, fontSize: 20 }}>
                                {ssoType === 'aadhaar' ? 'Aadhaar Authentication' : 'DigiLocker SSO Authentication'}
                            </h3>
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
                                    A 6-digit verification code has been dispatched directly to your phone <strong>+91 {smsBanner.mobile}</strong> via real Twilio SMS. Please check your messages and enter the code below.
                                </div>
                            </motion.div>
                        )}

                        {otpError && (
                            <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
                                ⚠️ {otpError}
                            </div>
                        )}

                        {ssoStep === 1 ? (
                            <div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, textAlign: 'center' }}>
                                        {ssoType === 'aadhaar' ? 'Enter 12-Digit Aadhaar Number OR Registered Mobile' : 'Enter DigiLocker ID / Registered Mobile'}
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder={ssoType === 'aadhaar' ? "Aadhaar / Mobile (e.g. 234567890123)" : "DigiLocker ID (e.g. aarav.digilocker)"} 
                                        value={aadhaarInput}
                                        onChange={e => setAadhaarInput(e.target.value)}
                                        className="input-js" 
                                        style={{ textAlign: 'center', letterSpacing: 1, fontSize: 15, fontWeight: 600 }} 
                                    />
                                    <span style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'block', textAlign: 'center' }}>
                                        📲 Real OTP will be dispatched via Twilio Verify to your linked phone
                                    </span>
                                </div>

                                <button 
                                    onClick={async () => {
                                        const targetInput = aadhaarInput.trim() || '7717465014';
                                        const cleanNum = targetInput.replace(/\D/g, '') || '7717465014';
                                        setOtpLoading(true);
                                        setOtpError('');
                                        try {
                                            await sendOtp(targetInput);
                                            setSsoStep(2);
                                            setSmsBanner({ mobile: cleanNum });
                                        } catch (err) {
                                            setOtpError(err.response?.data?.error || 'Failed to send Twilio OTP. Please try again.');
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
                        ) : ssoStep === 2 ? (
                            <div>
                                <p style={{ color: '#475569', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
                                    Enter 6-digit OTP sent to your phone <strong>(+91 {aadhaarInput})</strong>.
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
                                        const targetInput = aadhaarInput.trim() || '7717465014';
                                        if (!enteredOtp || enteredOtp.length < 4) {
                                            setOtpError('Please enter the 6-digit verification code.');
                                            return;
                                        }
                                        setOtpLoading(true);
                                        setOtpError('');
                                        try {
                                            const res = await verifyOtp(targetInput, enteredOtp);
                                            setShowSsoModal(false);
                                            setSmsBanner(null);
                                            setEnteredOtp('');
                                            
                                            // Handle successful login
                                            sessionStorage.setItem('token', res.token);
                                            sessionStorage.setItem('user', JSON.stringify(res.user));
                                            if(res.user.master_id) {
                                                sessionStorage.setItem('masterId', res.user.master_id);
                                            }
                                            sessionStorage.setItem('connectedServices', JSON.stringify(['education', 'publicServices']));
                                            navigate(ROLE_ROUTES[res.user.role] || '/dashboard', { replace: true });
                                        } catch (err) {
                                            setOtpError(err.response?.data?.error || 'Incorrect OTP code. Please try again.');
                                        } finally {
                                            setOtpLoading(false);
                                        }
                                    }} 
                                    disabled={otpLoading}
                                    className="btn-js" 
                                    style={{ width: '100%', background: '#10b981', color: 'white', fontWeight: 700, opacity: otpLoading ? 0.7 : 1 }}
                                >
                                    {otpLoading ? 'Verifying Twilio OTP...' : 'Verify OTP & Secure Login'}
                                </button>
                            </div>
                        ) : null}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Login;
