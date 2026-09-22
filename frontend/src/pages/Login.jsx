import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, sendOtp, verifyOtp } from '../services/api';
import { motion } from 'framer-motion';
import { User, Building2, ShieldCheck, Mail, Lock, CheckCircle2, Info, Key, Eye } from 'lucide-react';

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
    
    // SSO States
    const [showSsoModal, setShowSsoModal] = useState(false);
    const [ssoType, setSsoType] = useState(null); // 'aadhaar' or 'digilocker'
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

    const performLogin = async (e) => {
        if (e) e.preventDefault();
        setError('');
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
        <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', paddingTop: 60, paddingBottom: 60, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                </div>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
                    Samadhan Path
                </h1>
                <p style={{ fontSize: 16, color: '#64748b', margin: 0, fontWeight: 500 }}>
                    One Citizen. One Profile. Every Service. One Smart Journey.
                </p>
            </div>

            <div style={{ width: '100%', maxWidth: 900, padding: '0 24px' }}>
                
                {/* Role Selector Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Account Role</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Citizen-first unified access</div>
                </div>

                {/* Role Selector Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 40 }}>
                    <div 
                        onClick={() => setActiveRole('citizen')}
                        style={{ 
                            backgroundColor: activeRole === 'citizen' ? '#eff6ff' : '#ffffff', 
                            border: `2px solid ${activeRole === 'citizen' ? '#3b82f6' : '#e2e8f0'}`,
                            borderRadius: 16, padding: 24, cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: activeRole === 'citizen' ? '0 4px 12px rgba(59, 130, 246, 0.1)' : '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: activeRole === 'citizen' ? '#dbeafe' : '#f1f5f9', color: activeRole === 'citizen' ? '#2563eb' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={20} />
                            </div>
                            {activeRole === 'citizen' && (
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', backgroundColor: '#bfdbfe', padding: '4px 10px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    Primary Account <CheckCircle2 size={12} />
                                </span>
                            )}
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Citizen</h3>
                        <p style={{ margin: '0 0 24px 0', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                            Access government services and track applications
                        </p>
                        <div style={{ fontSize: 12, fontWeight: 600, color: activeRole === 'citizen' ? '#2563eb' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            {activeRole === 'citizen' ? '● Active Selection' : 'Click to select'}
                            <span style={{ fontSize: 16 }}>→</span>
                        </div>
                    </div>

                    <div 
                        onClick={() => setActiveRole('dept_officer')}
                        style={{ 
                            backgroundColor: activeRole === 'dept_officer' ? '#f5f3ff' : '#ffffff', 
                            border: `2px solid ${activeRole === 'dept_officer' ? '#8b5cf6' : '#e2e8f0'}`,
                            borderRadius: 16, padding: 24, cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: activeRole === 'dept_officer' ? '0 4px 12px rgba(139, 92, 246, 0.1)' : '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: activeRole === 'dept_officer' ? '#ede9fe' : '#f1f5f9', color: activeRole === 'dept_officer' ? '#7c3aed' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Building2 size={20} />
                            </div>
                            {activeRole === 'dept_officer' ? (
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#6d28d9', backgroundColor: '#ddd6fe', padding: '4px 10px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    Active Selection <CheckCircle2 size={12} />
                                </span>
                            ) : (
                                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: 12 }}>
                                    Government Personnel
                                </span>
                            )}
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Department Officer</h3>
                        <p style={{ margin: '0 0 24px 0', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                            Review assigned applications and manage departmental workflows
                        </p>
                        <div style={{ fontSize: 12, fontWeight: 600, color: activeRole === 'dept_officer' ? '#7c3aed' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            {activeRole === 'dept_officer' ? '● Active Selection' : 'Click to select'}
                            <span style={{ fontSize: 16 }}>→</span>
                        </div>
                    </div>

                    <div 
                        onClick={() => setActiveRole('admin')}
                        style={{ 
                            backgroundColor: activeRole === 'admin' ? '#f0fdf4' : '#ffffff', 
                            border: `2px solid ${activeRole === 'admin' ? '#10b981' : '#e2e8f0'}`,
                            borderRadius: 16, padding: 24, cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: activeRole === 'admin' ? '0 4px 12px rgba(16, 185, 129, 0.1)' : '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: activeRole === 'admin' ? '#dcfce7' : '#f1f5f9', color: activeRole === 'admin' ? '#059669' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ShieldCheck size={20} />
                            </div>
                            {activeRole === 'admin' ? (
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#047857', backgroundColor: '#bbf7d0', padding: '4px 10px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    Active Selection <CheckCircle2 size={12} />
                                </span>
                            ) : (
                                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: 12 }}>
                                    Infrastructure Authority
                                </span>
                            )}
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>System Administrator</h3>
                        <p style={{ margin: '0 0 24px 0', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                            Manage services, integrations, workflows, users and platform security
                        </p>
                        <div style={{ fontSize: 12, fontWeight: 600, color: activeRole === 'admin' ? '#059669' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            {activeRole === 'admin' ? '● Active Selection' : 'Click to select'}
                            <span style={{ fontSize: 16 }}>→</span>
                        </div>
                    </div>
                </div>

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
                                    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/1200px-Aadhaar_Logo.svg.png" alt="Aadhaar" style={{ height: 20 }} />
                                    Login with Aadhaar OTP
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => { setSsoType('digilocker'); setSsoStep(1); setOtpError(''); setSmsBanner(null); setEnteredOtp(''); setAadhaarInput('aarav.digilocker'); setShowSsoModal(true); }}
                                    style={{
                                        width: '100%', padding: '10px 16px', borderRadius: 10, background: '#fff',
                                        border: '1px solid #cbd5e1', color: '#334155', fontWeight: 600, fontSize: 14,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.borderColor = '#94a3b8'}
                                    onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                                >
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e9/DigiLocker_logo.png" alt="DigiLocker" style={{ height: 20, objectFit: 'contain' }} />
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
                                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/1200px-Aadhaar_Logo.svg.png" alt="Aadhaar" style={{ height: 40, marginBottom: 16 }} />
                            ) : (
                                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e9/DigiLocker_logo.png" alt="DigiLocker" style={{ height: 40, marginBottom: 16, objectFit: 'contain' }} />
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
        </div>
    );
};

export default Login;
