import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const DOMAINS = [
    { id: 'education', title: 'Education', icon: '🎓', path: '/domain-education', color: '#8b5cf6', desc: 'Scholarships, Loans, Academic ID' },
    { id: 'healthcare', title: 'Healthcare', icon: '🏥', path: '/domain-healthcare', color: '#10b981', desc: 'Schemes, Appointments, Records' },
    { id: 'agriculture', title: 'Agriculture', icon: '🌾', path: '/domain-agriculture', color: '#f59e0b', desc: 'Crop Insurance, Land Records' },
    { id: 'infrastructure', title: 'Infrastructure', icon: '🏗️', path: '/register-complaint', color: '#3b82f6', desc: 'Civic Grievances, Potholes, Utilities' },
    { id: 'public-services', title: 'Public Services', icon: '📄', path: '/domain-public-services', color: '#6366f1', desc: 'Income, Domicile, Certificates' }
];

const UserDashboard = () => {
    const navigate = useNavigate();

    const getUser = () => {
        try { const s = localStorage.getItem('user'); return s ? JSON.parse(s) : null; }
        catch { return null; }
    };
    const user = getUser();
    if (!user) { window.location.href = '/login'; return null; }

    return (
        <div className="page-bg" style={{ minHeight: '100vh', paddingBottom: 80 }}>
            {/* Dashboard Header */}
            <section style={{
                background: 'var(--bg-secondary)', padding: '32px 0 24px',
                borderBottom: '1px solid var(--border-light)'
            }}>
                <div className="container-js" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: 16
                }}>
                    <div>
                        <h1 style={{ fontSize: 24, marginBottom: 4 }}>
                            Welcome, <span style={{ color: 'var(--accent)' }}>{user?.name || 'Citizen'}</span>
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                            <p style={{ fontSize: 14, margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>
                                Master ID: <span style={{ padding: '4px 10px', background: '#e0e7ff', color: '#4338ca', borderRadius: 6, marginLeft: 6 }}>{user?.master_id || 'SP-000001'}</span>
                            </p>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)', background: '#f3f4f6', padding: '4px 8px', borderRadius: 12 }}>Single Sign-On Active</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Link to="/asset-passport" className="btn-secondary" style={{ fontSize: 13 }}>
                            🏛️ Asset Passport
                        </Link>
                    </div>
                </div>
            </section>

            <div className="container-js" style={{ paddingTop: 32 }}>
                
                <div style={{ marginBottom: 24, padding: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>✅</span>
                    <div>
                        <h4 style={{ margin: 0, fontSize: 14, color: '#166534' }}>Identity Verified</h4>
                        <p style={{ margin: 0, fontSize: 13, color: '#15803d' }}>You are logged in using SamadhanPath Master ID. You can access all government services without logging in again.</p>
                    </div>
                </div>

                <h2 style={{ fontSize: 20, marginBottom: 20 }}>Government Service Domains</h2>
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 40
                }}>
                    {DOMAINS.map((domain, i) => (
                        <motion.div key={domain.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            onClick={() => navigate(domain.path)}
                            className="card-js"
                            style={{
                                cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12, padding: 24,
                                transition: 'transform 0.2s, box-shadow 0.2s', borderTop: `4px solid ${domain.color}`
                            }}
                        >
                            <div style={{ fontSize: 32 }}>{domain.icon}</div>
                            <h3 style={{ fontSize: 18, margin: 0 }}>{domain.title}</h3>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, flex: 1 }}>{domain.desc}</p>
                            <span style={{ fontSize: 12, fontWeight: 600, color: domain.color, marginTop: 8 }}>Access Services →</span>
                        </motion.div>
                    ))}
                </div>

                <h2 style={{ fontSize: 20, marginBottom: 20 }}>My Activity & Unified Tracking</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginBottom: 40 }}>
                    <div className="card-js" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>📋 Universal Application Tracker</h3>
                        
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                                        <th style={{ padding: '12px 8px' }}>Tracking ID</th>
                                        <th style={{ padding: '12px 8px' }}>Service Name</th>
                                        <th style={{ padding: '12px 8px' }}>Domain</th>
                                        <th style={{ padding: '12px 8px' }}>Status</th>
                                        <th style={{ padding: '12px 8px' }}>Date</th>
                                        <th style={{ padding: '12px 8px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                                        <td style={{ padding: '16px 8px', fontWeight: 600 }}>SP-REQ-2026-0001</td>
                                        <td style={{ padding: '16px 8px' }}>Post-Matric Scholarship</td>
                                        <td style={{ padding: '16px 8px' }}><span style={{ color: '#8b5cf6', background: '#f5f3ff', padding: '4px 8px', borderRadius: 4, fontSize: 11 }}>🎓 Education</span></td>
                                        <td style={{ padding: '16px 8px' }}><span style={{ color: '#047857', background: '#d1fae5', padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>Approved</span></td>
                                        <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>18 Sep 2026</td>
                                        <td style={{ padding: '16px 8px' }}><Link to="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>View</Link></td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                                        <td style={{ padding: '16px 8px', fontWeight: 600 }}>SP-AGR-2026-1144</td>
                                        <td style={{ padding: '16px 8px' }}>Crop Insurance Claim</td>
                                        <td style={{ padding: '16px 8px' }}><span style={{ color: '#b45309', background: '#fef3c7', padding: '4px 8px', borderRadius: 4, fontSize: 11 }}>🌾 Agriculture</span></td>
                                        <td style={{ padding: '16px 8px' }}><span style={{ color: '#b45309', background: '#fef3c7', padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>In Progress</span></td>
                                        <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>19 Sep 2026</td>
                                        <td style={{ padding: '16px 8px' }}><Link to="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>View</Link></td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '16px 8px', fontWeight: 600 }}>SP-INF-2026-4592</td>
                                        <td style={{ padding: '16px 8px' }}>Pothole Complaint (Civic)</td>
                                        <td style={{ padding: '16px 8px' }}><span style={{ color: '#1d4ed8', background: '#dbeafe', padding: '4px 8px', borderRadius: 4, fontSize: 11 }}>🏗️ Infrastructure</span></td>
                                        <td style={{ padding: '16px 8px' }}><span style={{ color: '#1e3a8a', background: '#bfdbfe', padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>Assigned</span></td>
                                        <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>15 Sep 2026</td>
                                        <td style={{ padding: '16px 8px' }}><Link to="/user-dashboard" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>View</Link></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                    <div className="card-js" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>📁 My Documents (Vault)</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Centralized secure vault for your uploaded and government-issued documents.</p>
                        <button className="btn-secondary" style={{ width: '100%', marginTop: 12 }} onClick={() => navigate('/document-vault')}>Open Document Vault</button>
                    </div>
                    <div className="card-js" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>🛡️ Consent Center</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Manage data sharing permissions between departments.</p>
                        <button className="btn-secondary" style={{ width: '100%', marginTop: 12 }} onClick={() => navigate('/consent-center')}>Manage Consent</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserDashboard;
