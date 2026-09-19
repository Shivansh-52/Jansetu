import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DomainPublicServices = () => {
    const [selectedService, setSelectedService] = useState(null);
    const [applicationStatus, setApplicationStatus] = useState(null);
    
    const getUser = () => {
        try { const s = sessionStorage.getItem('user'); return s ? JSON.parse(s) : null; }
        catch { return null; }
    };
    const user = getUser();
    if (!user) { window.location.href = '/login'; return null; }

    const handleApply = (e) => {
        e.preventDefault();
        setApplicationStatus('SUBMITTED');
        setTimeout(() => {
            setApplicationStatus('SUCCESS');
        }, 1500);
    };

    return (
        <div className="page-bg" style={{ minHeight: '100vh', paddingBottom: 80 }}>
            <section style={{ background: 'var(--bg-secondary)', padding: '32px 0 24px', borderBottom: '1px solid var(--border-light)' }}>
                <div className="container-js" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Link to="/user-dashboard" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 8, display: 'inline-block' }}>← Back to Master Dashboard</Link>
                        <h1 style={{ fontSize: 24, margin: 0, color: '#6366f1', display: 'flex', alignItems: 'center', gap: 8 }}>
                            📄 Public Services Domain
                        </h1>
                        <p style={{ fontSize: 14, margin: '4px 0 0 0' }}>Income, Domicile, Caste Certificates & E-Seva</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 12, background: '#f0fdf4', color: '#166534', padding: '4px 8px', borderRadius: 4, border: '1px solid #bbf7d0' }}>SSO Identity: {user?.master_id || 'SP-000001'}</span>
                    </div>
                </div>
            </section>

            <div className="container-js" style={{ paddingTop: 32 }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
                    {/* Left Sidebar */}
                    <div>
                        <div className="card-js" style={{ padding: 24, background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)', color: 'white' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, color: 'white' }}>DigiLocker Integration</h3>
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                                <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>Stored Documents</p>
                                <p style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>5</p>
                            </div>
                            <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span>Verified via:</span>
                                <strong>{user?.master_id || 'SP-000001'}</strong>
                            </div>
                            <button className="btn-secondary" style={{ width: '100%', background: 'white', color: '#4338ca', border: 'none', marginTop: 12 }}>Open Vault</button>
                        </div>

                        <div className="card-js" style={{ padding: 24, marginTop: 24 }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Service Catalog</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', color: selectedService === 'income' ? 'var(--accent)' : 'var(--text-primary)' }} onClick={() => setSelectedService('income')}>
                                    📄 Apply for Income Certificate
                                </li>
                                <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', color: selectedService === 'domicile' ? 'var(--accent)' : 'var(--text-primary)' }} onClick={() => setSelectedService('domicile')}>
                                    🏠 Apply for Domicile Certificate
                                </li>
                                <li style={{ padding: '12px 0', cursor: 'pointer' }} onClick={() => setSelectedService('caste')}>
                                    📝 Apply for Caste Certificate
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div>
                        {!selectedService ? (
                            <div className="card-js" style={{ padding: 60, textAlign: 'center' }}>
                                <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                                <h3 style={{ fontSize: 18, marginBottom: 8 }}>Select a Public Service</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Choose a service from the catalog to apply using your Master ID.</p>
                            </div>
                        ) : (
                            <div className="card-js" style={{ padding: 32 }}>
                                {applicationStatus === 'SUCCESS' ? (
                                    <div style={{ textAlign: 'center', padding: 40 }}>
                                        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                                        <h3 style={{ fontSize: 20, color: '#166534', marginBottom: 8 }}>Application Submitted Successfully</h3>
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Your application has been routed to the Revenue Department via the SamadhanPath Interoperability Layer.</p>
                                        <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 8, display: 'inline-block' }}>
                                            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>Unified Tracking ID</p>
                                            <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>SP-PUB-2026-7781</p>
                                        </div>
                                        <br/>
                                        <button className="btn-primary" style={{ marginTop: 32 }} onClick={() => { setApplicationStatus(null); setSelectedService(null); }}>Back to Catalog</button>
                                    </div>
                                ) : (
                                    <>
                                        <h2 style={{ fontSize: 22, marginBottom: 8, color: '#4338ca' }}>
                                            {selectedService === 'income' ? 'Income Certificate Application' : selectedService === 'domicile' ? 'Domicile Certificate Application' : 'Caste Certificate Application'}
                                        </h2>
                                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                                            Verified Government Portal
                                        </p>

                                        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: 16, borderRadius: 8, marginBottom: 24 }}>
                                            <h4 style={{ margin: '0 0 12px 0', fontSize: 13, color: '#475569', textTransform: 'uppercase' }}>Auto-Filled from Master Profile</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                <div><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Name:</span> <br/><strong>{user?.name}</strong></div>
                                                <div><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>DOB:</span> <br/><strong>{user?.dob || '01-01-1990'}</strong></div>
                                                <div><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Address:</span> <br/><strong>{user?.address || '123 Smart City Road'}</strong></div>
                                                <div><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>District:</span> <br/><strong>{user?.district || 'Lucknow'}</strong></div>
                                            </div>
                                        </div>

                                        <form onSubmit={handleApply}>
                                            <div style={{ marginBottom: 16 }}>
                                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Purpose of Application</label>
                                                <select className="input-js" required>
                                                    <option value="">Select Purpose</option>
                                                    <option value="education">Educational Purposes</option>
                                                    <option value="employment">Employment / Jobs</option>
                                                    <option value="scheme">Government Scheme Beneficiary</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            
                                            <div style={{ margin: '24px 0', padding: 16, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8 }}>
                                                <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#92400e' }}>🛡️ Background Verification Consent</h4>
                                                <p style={{ margin: 0, fontSize: 12, color: '#b45309' }}>
                                                    By submitting, you consent to the Revenue Department validating your residence and identity details centrally via your SamadhanPath Master Profile. No physical document upload is required for basic verification.
                                                </p>
                                            </div>

                                            <button type="submit" className="btn-primary" disabled={applicationStatus === 'SUBMITTED'} style={{ background: '#6366f1', border: 'none' }}>
                                                {applicationStatus === 'SUBMITTED' ? 'Validating & Routing...' : 'Submit to Interoperability Layer'}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DomainPublicServices;
