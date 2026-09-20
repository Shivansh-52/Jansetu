import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';
import { ShieldCheck, ArrowRight, Loader, Info } from 'lucide-react';

const ConsentOtpModal = ({ 
    isOpen, 
    onClose, 
    onVerify, 
    masterId, 
    mobile, 
    purpose, 
    requestingDept, 
    sourceDept 
}) => {
    const onVerified = onVerify;
    const [otpSent, setOtpSent] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSendOtp = async () => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/consent/send-otp', {
                master_id: masterId,
                mobile: mobile
            });
            setOtpSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otpInput.length !== 6) {
            setError('Please enter a 6-digit OTP');
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/consent/verify-otp', {
                master_id: masterId,
                otp_code: otpInput,
                purpose: purpose,
                requesting_dept: requestingDept,
                source_dept: sourceDept
            });

            if (res.data && res.data.message === 'Consent Verification Successful') {
                onVerified(res.data.data);
            } else {
                setError(res.data?.message || 'Verification failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                background: 'white', padding: '30px', borderRadius: '12px',
                width: '100%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>Security & Consent Verification</h3>
                
                {error && (
                    <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px', lineHeight: '1.5' }}>
                    <strong>Purpose:</strong> {purpose}<br/>
                    <strong>From:</strong> {sourceDept}<br/>
                    <strong>To:</strong> {requestingDept}
                </p>

                {!otpSent ? (
                    <div>
                        <p style={{ fontSize: '14px', color: '#15803d', marginBottom: '20px' }}>
                            Generate an OTP to authorize securely sharing your profile data.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={onClose} disabled={loading} style={{
                                flex: 1, padding: '12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer'
                            }}>Cancel</button>
                            <button onClick={handleSendOtp} disabled={loading} style={{
                                flex: 2, padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                            }}>
                                {loading ? 'Sending...' : 'Send OTP to Mobile 📱'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#166534' }}>OTP Verification</h4>
                            <p style={{ fontSize: '13px', color: '#15803d', marginBottom: '16px' }}>
                                An OTP has been sent to your registered mobile <strong>{mobile || 'Number'}</strong>.
                            </p>
                            
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="Enter 6-digit OTP"
                                value={otpInput}
                                onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                                style={{
                                    padding: '12px 16px', fontSize: '18px', letterSpacing: '4px', fontWeight: 'bold',
                                    width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '16px', boxSizing: 'border-box'
                                }}
                            />
                            
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setOtpSent(false)} disabled={loading} style={{
                                    flex: 1, padding: '12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer'
                                }}>Back</button>
                                <button onClick={handleVerifyOtp} disabled={loading} style={{
                                    flex: 2, padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                                }}>
                                    {loading ? 'Verifying...' : 'Verify & Authorize ✅'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsentOtpModal;
