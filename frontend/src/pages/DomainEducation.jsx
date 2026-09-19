import React from 'react';
import { useNavigate } from 'react-router-dom';

const DomainEducation = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: 30, display: 'flex', alignItems: 'center', gap: 16 }}>
                <button 
                    onClick={() => navigate('/dashboard')}
                    style={{
                        background: 'none', border: '1px solid var(--border-light)', borderRadius: 8,
                        padding: '8px 12px', cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)'
                    }}
                >
                    ← Back to Dashboard
                </button>
                <h1 style={{ fontSize: 24, margin: 0, color: 'var(--text-primary)' }}>Education Services</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {/* Scholarship - Fully Working Demo */}
                <div 
                    onClick={() => navigate('/education/scholarship')}
                    style={{
                        background: 'white', borderRadius: 12, padding: 24, cursor: 'pointer',
                        border: '1px solid var(--accent)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.2s', position: 'relative'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--accent)', color: 'white', fontSize: 10, padding: '4px 8px', borderRadius: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                        Live Demo
                    </div>
                    <div style={{ fontSize: 32, marginBottom: 16 }}>🎓</div>
                    <h3 style={{ fontSize: 18, marginBottom: 8, color: 'var(--text-primary)' }}>Scholarship Application</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                        Apply for government education scholarships. Uses interoperability to fetch existing records.
                    </p>
                    <div style={{ marginTop: 16, fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                        Start Application →
                    </div>
                </div>

                {/* Education Loans - Fully Working Demo */}
                <div 
                    onClick={() => navigate('/education/loan')}
                    style={{
                        background: 'white', borderRadius: 12, padding: 24, cursor: 'pointer',
                        border: '1px solid var(--accent)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.2s', position: 'relative'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ position: 'absolute', top: 12, right: 12, background: '#10b981', color: 'white', fontSize: 10, padding: '4px 8px', borderRadius: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                        Production
                    </div>
                    <div style={{ fontSize: 32, marginBottom: 16 }}>🏦</div>
                    <h3 style={{ fontSize: 18, marginBottom: 8, color: 'var(--text-primary)' }}>Education Loans</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                        Apply for subsidized government education loans. Uses interoperability with Banking APIs.
                    </p>
                    <div style={{ marginTop: 16, fontSize: 13, color: '#10b981', fontWeight: 600 }}>
                        Start Application →
                    </div>
                </div>

                <div style={{
                    background: '#f9fafb', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)'
                }}>
                    <div style={{ fontSize: 32, marginBottom: 16 }}>📄</div>
                    <h3 style={{ fontSize: 18, marginBottom: 8, color: 'var(--text-primary)' }}>Student Certificates</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                        Request bona-fide, passing, and graduation certificates.
                    </p>
                    <div style={{ marginTop: 16, fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>
                        Coming Soon
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DomainEducation;
