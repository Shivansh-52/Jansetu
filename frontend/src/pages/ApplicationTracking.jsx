import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ApplicationTracking = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: 24, marginBottom: 8 }}>Application Tracking</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 30 }}>SamadhanPath Unified Tracking ID: <strong>{id}</strong></p>

            <div style={{ background: 'white', padding: 32, borderRadius: 12, border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: 18, marginBottom: 24, color: 'var(--text-primary)' }}>Education Scholarship</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#059669', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</div>
                        <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: 16 }}>Application Submitted</h4>
                            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Gateway received your request.</p>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#059669', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</div>
                        <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: 16 }}>Identity Verified</h4>
                            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Master ID verification passed.</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#059669', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</div>
                        <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: 16 }}>Consent & Eligibility Verified</h4>
                            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Public Services confirmed income eligibility.</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>●</div>
                        <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: 16 }}>Department Review</h4>
                            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Education department is processing the unified application.</p>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: 8 }}>
                        Return to Dashboard
                    </button>
                    <button onClick={() => navigate('/interoperability')} style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: 'none', borderRadius: 8, color: 'var(--accent)', fontWeight: 600 }}>
                        View Interoperability Log
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplicationTracking;
