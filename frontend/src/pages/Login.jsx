import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, sendOtp, verifyOtp } from '../services/api';
import { motion } from 'framer-motion';
import { User, Building2, ShieldCheck, Mail, Lock, CheckCircle2, Info, Key, Eye, Fingerprint, Cloud } from 'lucide-react';

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
    const [activeRole, setActiveRole] = useState('citizen');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
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
    
    // SSO States
    const [showSsoModal, setShowSsoModal] = useState(false);
    const [ssoType, setSsoType] = useState(null); // 'aadhaar' or 'digilocker'
    const [ssoStep, setSsoStep] = useState(1);
    const [aadhaarInput, setAadhaarInput] = useState('');
    const [enteredOtp, setEnteredOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [smsBanner, setSmsBanner] = useState(null);

    // Realistic DigiLocker Modal States
    const [showRealDigilockerModal, setShowRealDigilockerModal] = useState(false);
    const [dlIdentifier, setDlIdentifier] = useState('');
    const [dlPin, setDlPin] = useState('');

    const handleSimulatedDigilockerLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            sessionStorage.setItem('token', 'simulated_digilocker_token_for_hackathon');
            sessionStorage.setItem('role', 'citizen');
            sessionStorage.setItem('user', JSON.stringify({ 
                role: 'citizen', 
                name: 'Verified Citizen (DigiLocker)', 
                email: 'aarav.digilocker@gov.in', 
                aadhaar: '234567890123',
                digilocker_id: dlIdentifier
            }));
            navigate('/user-dashboard', { replace: true });
        }, 2000);
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const role = urlParams.get('role');
        const err = urlParams.get('error');
        
        if (token && role) {
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('role', role);
            sessionStorage.setItem('user', JSON.stringify({ role: role, name: 'Verified Citizen (DigiLocker)', email: 'aarav.digilocker@gov.in', aadhaar: '234567890123' }));
            navigate(ROLE_ROUTES[role] || '/', { replace: true });
            return;
        } else if (err) {
            setError(`Authentication Error: ${err}`);
        }

        generateCaptcha();
        const user = sessionStorage.getItem('user');
        if (user) {
            try {
                const parsed = JSON.parse(user);
                navigate(ROLE_ROUTES[parsed.role] || '/', { replace: true });
            } catch { }
        }
    }, [navigate]);

    const performLogin = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setCaptchaError('');

        if (captchaInput.toLowerCase() !== captcha.toLowerCase()) {
            setCaptchaError('Incorrect captcha. Please try again.');
            generateCaptcha();
            return;
        }

        setLoading(true);
        try {
            const data = await loginUser(email, password);
            
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('user', JSON.stringify(data.user));
            sessionStorage.setItem('masterId', data.user.master_id);
            sessionStorage.setItem('connectedServices', JSON.stringify(['education', 'publicServices']));
            navigate(ROLE_ROUTES[data.user.role] || '/dashboard', { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || 'Could not authenticate. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#fafafa', paddingTop: 60, paddingBottom: 60, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <img onDoubleClick={() => navigate('/official-auth')} src="/samadhan-logo.png" alt="Samadhan Path Logo" style={{ height: 64, objectFit: 'contain', cursor: 'pointer' }} title="Double-click for Official Access" />
                </div>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
                    Samadhan Path
                </h1>
                <p style={{ fontSize: 16, color: '#64748b', margin: 0, fontWeight: 500 }}>
                    One Citizen. One Profile. Every Service. One Smart Journey.
                </p>
            </div>

            <div style={{ width: '100%', maxWidth: 900, padding: '0 24px' }}>
                
                {/* Login Form Section */}
                <motion.div 
                    key={activeRole}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 40, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', maxWidth: 500, margin: '0 auto', border: '1px solid #f1f5f9' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                                {activeRole === 'citizen' ? 'Citizen Authentication' : activeRole === 'dept_officer' ? 'Department Login' : 'Admin Portal'}
                            </h2>
                            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                                Authenticating with Samadhan Path Secure Identity Broker
                            </p>
                        </div>
                        <span style={{ 
                            fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 6, letterSpacing: '0.05em', textTransform: 'uppercase',
                            backgroundColor: activeRole === 'citizen' ? '#eff6ff' : activeRole === 'dept_officer' ? '#f5f3ff' : '#f0fdf4',
                            color: activeRole === 'citizen' ? '#2563eb' : activeRole === 'dept_officer' ? '#7c3aed' : '#059669'
                        }}>
                            {activeRole.replace('_', ' ')}
                        </span>
                    </div>

                    {error && (
                        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13, fontWeight: 500, marginBottom: 24 }}>
                            {error}
                        </div>
                    )}

                    {activeRole === 'citizen' && (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                                <button 
                                    type="button"
                                    onClick={() => { setSsoType('aadhaar'); setSsoStep(1); setOtpError(''); setSmsBanner(null); setEnteredOtp(''); setAadhaarInput('234567890123'); setShowSsoModal(true); }}
                                    style={{
                                        width: '100%', padding: '10px 16px', borderRadius: 10, background: '#fff',
                                        border: '1px solid #cbd5e1', color: '#334155', fontWeight: 600, fontSize: 14,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.borderColor = '#94a3b8'}
                                    onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                                >
                                    <Fingerprint color="#22c55e" size={20} />
                                    Login with Aadhaar OTP
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowRealDigilockerModal(true)}
                                    style={{
                                        width: '100%', padding: '10px 16px', borderRadius: 10, background: '#fff',
                                        border: '1px solid #cbd5e1', color: '#334155', fontWeight: 600, fontSize: 14,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.borderColor = '#94a3b8'}
                                    onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                                >
                                    <Cloud color="#3b82f6" size={20} />
                                    Login with DigiLocker SSO
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.5 }}>OR LOGIN WITH CREDENTIALS</span>
                                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                            </div>
                        </>
                    )}

                    <form onSubmit={performLogin}>
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <label style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                                    {activeRole === 'citizen' ? 'Email Address or Mobile Number' : 'Official Government Email'} <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <span style={{ fontSize: 11, color: '#94a3b8' }}>Required</span>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', left: 16, transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                    <Mail size={18} />
                                </div>
                                <input 
                                    type="text" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={activeRole === 'citizen' ? "e.g. 9876543210 or citizen@example.com" : "officer@gov.in"}
                                    required
                                    style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }}
                                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 28 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <label style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                                    Password / Security PIN <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <a href="#" style={{ fontSize: 11, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', left: 16, transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                    <Lock size={18} />
                                </div>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your confidential password"
                                    required
                                    style={{ width: '100%', padding: '12px 44px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }}
                                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 28 }}>
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
                                    style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }}
                                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                                />
                                />
                            </div>
                            {captchaError && (
                                <div style={{ color: '#dc2626', fontSize: 12, fontWeight: 600, marginTop: 8 }}>{captchaError}</div>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ 
                                width: '100%', padding: '14px', borderRadius: 10, backgroundColor: activeRole === 'citizen' ? '#0c66e4' : activeRole === 'dept_officer' ? '#7c3aed' : '#059669',
                                color: 'white', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Authenticating...' : `Sign In as ${activeRole === 'dept_officer' ? 'Department' : activeRole === 'admin' ? 'Admin' : 'Citizen'} →`}
                        </button>
                    </form>

                    {activeRole === 'citizen' && (
                        <>
                            <div style={{ textAlign: 'center', margin: '24px 0', fontSize: 13, color: '#64748b' }}>
                                New Citizen? <Link to="/register" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Create Citizen Account</Link>
                            </div>
                            
                            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <Info size={16} color="#64748b" style={{ flexShrink: 0, marginTop: 2 }} />
                                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                                    <strong style={{ color: '#475569' }}>Official Personnel Notice:</strong> Department Officer and System Administrator accounts are provisioned through internal administrative protocols and cannot be registered through public enrollment.
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>

                <div style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Key size={14} /> View Provisioned Government Test Credentials
                </div>

            </div>

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
                                <Fingerprint color="#22c55e" size={48} style={{ marginBottom: 16 }} />
                            ) : (
                                <Cloud color="#3b82f6" size={48} style={{ marginBottom: 16 }} />
                            )}
                            <h3 style={{ margin: 0, fontSize: 20, color: '#0f172a' }}>
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
                                        style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1', textAlign: 'center', letterSpacing: 1, fontSize: 15, fontWeight: 600, outline: 'none' }} 
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
                                            const result = await sendOtp(targetInput);
                                            setSsoStep(2);
                                            setSmsBanner({ mobile: result.mobile || cleanNum });
                                        } catch (err) {
                                            setOtpError(err.response?.data?.error || 'Failed to send Twilio OTP. Please try again.');
                                        } finally {
                                            setOtpLoading(false);
                                        }
                                    }} 
                                    disabled={otpLoading}
                                    style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#3b82f6', color: 'white', fontWeight: 700, opacity: otpLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                >
                                    📲 {otpLoading ? 'Sending Real OTP...' : 'Send Real OTP to My Phone'}
                                </button>
                            </div>
                        ) : ssoStep === 2 ? (
                            <div>
                                <p style={{ color: '#475569', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
                                    Enter 6-digit OTP sent to your phone <strong>(+91 {smsBanner.mobile})</strong>.
                                </p>
                                <div style={{ marginBottom: 16 }}>
                                    <input 
                                        type="text" 
                                        placeholder="● ● ● ● ● ●" 
                                        maxLength={6}
                                        value={enteredOtp}
                                        onChange={e => setEnteredOtp(e.target.value)}
                                        style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1', textAlign: 'center', letterSpacing: 8, fontSize: 22, fontWeight: 700, outline: 'none' }} 
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
                                    style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#10b981', color: 'white', fontWeight: 700, opacity: otpLoading ? 0.7 : 1 }}
                                >
                                    {otpLoading ? 'Verifying Twilio OTP...' : 'Verify OTP & Secure Login'}
                                </button>
                            </div>
                        ) : null}
                    </motion.div>
                </div>
            )}
            
            {showRealDigilockerModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: 20 }}>
                    <motion.div 
                        initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
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
                                <input type="checkbox" id="dlconsent2" required style={{ accentColor: '#22c55e', width: 16, height: 16 }} />
                                <label htmlFor="dlconsent2" style={{ fontSize: 13, color: '#475569' }}>I consent to MeriPehchaan terms of use.</label>
                            </div>

                            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 8, backgroundColor: '#2563eb', color: 'white', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                                {loading ? 'Signing In...' : 'Sign In'}
                            </button>
                            
                            <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 24, marginBottom: 0 }}>
                                New to MeriPehchaan? <span style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}>Sign Up</span>
                            </p>
                            <button type="button" onClick={() => setShowRealDigilockerModal(false)} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: '#94a3b8', marginTop: 12, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Login;
