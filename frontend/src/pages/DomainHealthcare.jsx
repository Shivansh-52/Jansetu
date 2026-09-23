import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getHealthcareProfile } from '../services/microservicesApi';
const DomainHealthcare = () => {
    const navigate = useNavigate();
    const [selectedService, setSelectedService] = useState(null);
    const [applicationStatus, setApplicationStatus] = useState(null);
    const [profile, setProfile] = useState(null);
    
    const [masterId, setMasterId] = useState(null);
    
    React.useEffect(() => {
        const userStr = sessionStorage.getItem('user');
        const id = userStr ? (JSON.parse(userStr).master_id || 'SP-12963072') : 'SP-000001';
        setMasterId(id);
        getHealthcareProfile(id).then(setProfile).catch(console.error);
    }, []);

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
                        <h1 style={{ fontSize: 24, margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: 8 }}>
                            🏥 Healthcare Domain
                        </h1>
                        <p style={{ fontSize: 14, margin: '4px 0 0 0' }}>ABHA ID Integration, Health Schemes, and Records</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 12, background: '#f0fdf4', color: '#166534', padding: '4px 8px', borderRadius: 4, border: '1px solid #bbf7d0' }}>SSO Identity: {masterId || 'SP-000001'}</span>
                    </div>
                </div>
            </section>

            <div className="container-js" style={{ paddingTop: 32 }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
                    {/* Left Sidebar - ABHA ID */}
                    <div>
                        <div className="card-js" style={{ padding: 24, background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)', color: 'white' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, color: 'white' }}>Mock Health Registry</h3>
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                                <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>ABHA Health ID</p>
                                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '0.05em' }}>{profile ? profile.healthId : 'Loading...'}</p>
                            </div>
                            <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span>Linked to:</span>
                                <strong>{masterId || 'SP-000001'}</strong>
                            </div>
                            <button className="btn-secondary" style={{ width: '100%', background: 'white', color: '#047857', border: 'none', marginTop: 12 }}>View Medical History</button>
                        </div>

                        <div className="card-js" style={{ padding: 24, marginTop: 24 }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Service Catalog</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', color: selectedService === 'scheme' ? 'var(--accent)' : 'var(--text-primary)' }} onClick={() => {
                                    if (!sessionStorage.getItem('user')) { alert("Please log in to use this service."); navigate('/login'); return; }
                                    setSelectedService('scheme');
                                }}>
                                    🏥 Ayushman Bharat Registration
                                </li>
                                <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', color: selectedService === 'appointment' ? 'var(--accent)' : 'var(--text-primary)' }} onClick={() => {
                                    if (!sessionStorage.getItem('user')) { alert("Please log in to use this service."); navigate('/login'); return; }
                                    setSelectedService('appointment');
                                }}>
                                    👨‍⚕️ Book OPD Appointment
                                </li>
                                <li style={{ padding: '12px 0', cursor: 'pointer' }} onClick={() => {
                                    if (!sessionStorage.getItem('user')) { alert("Please log in to use this service."); navigate('/login'); return; }
                                    setSelectedService('insurance');
                                }}>
                                    📋 State Health Insurance Claim
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div>
                        {!selectedService ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                                {/* Health Subsidy - Fully Working Demo */}
                                <div 
                                    onClick={() => {
                                        if (!sessionStorage.getItem('user')) { alert("Please log in to use this service."); navigate('/login'); return; }
                                        navigate('/healthcare/apply');
                                    }}
                                    style={{
                                        background: 'white', borderRadius: 12, padding: 24, cursor: 'pointer',
                                        border: '1px solid var(--accent)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        transition: 'transform 0.2s', position: 'relative'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--accent)', color: 'white', fontSize: 10, padding: '4px 8px', borderRadius: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                                        Production
                                    </div>
                                    <div style={{ fontSize: 32, marginBottom: 16 }}>🏥</div>
                                    <h3 style={{ fontSize: 18, marginBottom: 8, color: 'var(--text-primary)' }}>Health Subsidy</h3>
                                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                                        Apply for medical subsidies. Uses interoperability to fetch Health and Income records.
                                    </p>
                                    <div style={{ marginTop: 16, fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                                        Start Application →
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="card-js" style={{ padding: 32 }}>
                                {applicationStatus === 'SUCCESS' ? (
                                    <div style={{ textAlign: 'center', padding: 40 }}>
                                        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                                        <h3 style={{ fontSize: 20, color: '#166534', marginBottom: 8 }}>Request Submitted Successfully</h3>
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Your request has been securely routed to the Health Ministry via the SamadhanPath Interoperability Layer.</p>
                                        <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 8, display: 'inline-block' }}>
                                            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>Unified Tracking ID</p>
                                            <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>SP-HLT-2026-9921</p>
                                        </div>
                                        <br/>
                                        <button className="btn-primary" style={{ marginTop: 32 }} onClick={() => { setApplicationStatus(null); setSelectedService(null); }}>Back to Catalog</button>
                                    </div>
                                ) : (
                                    <>
                                        <h2 style={{ fontSize: 22, marginBottom: 8, color: '#047857' }}>
                                            {selectedService === 'scheme' ? 'Ayushman Bharat Beneficiary Registration' : 'OPD Appointment Booking'}
                                        </h2>
                                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                                            Verified Government Portal
                                        </p>

                                        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: 16, borderRadius: 8, marginBottom: 24 }}>
                                            <h4 style={{ margin: '0 0 12px 0', fontSize: 13, color: '#475569', textTransform: 'uppercase' }}>Auto-Filled from Master Profile</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                <div><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Name:</span> <br/><strong>{profile?.name || 'Verified Citizen'}</strong></div>
                                                <div><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>DOB:</span> <br/><strong>{profile?.dob || '01-01-1990'}</strong></div>
                                                <div><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Blood Group:</span> <br/><strong>{profile?.details?.bloodGroup || 'O+'}</strong></div>
                                                <div><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ABHA ID:</span> <br/><strong>{profile?.healthId || 'Loading...'}</strong></div>
                                            </div>
                                        </div>

                                        <form onSubmit={handleApply}>
                                            <div style={{ marginBottom: 16 }}>
                                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Primary Health Center / Hospital</label>
                                                <select className="input-js" required>
                                                    <option value="">Select Hospital in your District</option>
                                                    <option value="H1">District Civil Hospital</option>
                                                    <option value="H2">State Medical College</option>
                                                    <option value="H3">Community Health Center</option>
                                                </select>
                                            </div>
                                            
                                            {selectedService === 'appointment' && (
                                                <div style={{ marginBottom: 16 }}>
                                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Preferred Date</label>
                                                    <input type="date" className="input-js" required />
                                                </div>
                                            )}

                                            <div style={{ margin: '24px 0', padding: 16, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8 }}>
                                                <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#92400e' }}>🛡️ Privacy & Consent</h4>
                                                <p style={{ margin: 0, fontSize: 12, color: '#b45309' }}>
                                                    By submitting, you allow SamadhanPath to transmit your Master Identity to the National Health Authority API. Your data is encrypted end-to-end.
                                                </p>
                                            </div>

                                            <button type="submit" className="btn-primary" disabled={applicationStatus === 'SUBMITTED'} style={{ background: '#10b981', border: 'none' }}>
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

export default DomainHealthcare;
