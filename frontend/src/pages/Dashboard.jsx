import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const DOMAINS = [
    { id: 'education', title: 'Education', icon: '🎓', path: '/education', color: '#8b5cf6', desc: 'Scholarships, Loans, Academic ID' },
    { id: 'healthcare', title: 'Healthcare', icon: '🏥', path: '/healthcare', color: '#10b981', desc: 'Schemes, Appointments, Records' },
    { id: 'agriculture', title: 'Agriculture', icon: '🌾', path: '/agriculture', color: '#f59e0b', desc: 'Crop Insurance, Land Records' },
    { id: 'infrastructure', title: 'Infrastructure', icon: '🏗️', path: '/register-complaint', color: '#3b82f6', desc: 'Civic Grievances, Potholes, Utilities' },
    { id: 'public-services', title: 'Public Services', icon: '📄', path: '/domain-public-services', color: '#6366f1', desc: 'Income, Domicile, Certificates' }
];

const Dashboard = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [profiles, setProfiles] = useState({ education: null, healthcare: null, agriculture: null });
    const [loading, setLoading] = useState(true);
    const [connectedServices, setConnectedServices] = useState([]);

    const getUser = () => {
        try { const s = sessionStorage.getItem('user'); return s ? JSON.parse(s) : null; }
        catch { return null; }
    };
    const user = getUser();

    useEffect(() => {
        if (!user) { window.location.href = '/login'; return; }
        
        try {
            const services = JSON.parse(sessionStorage.getItem('connectedServices')) || [];
            setConnectedServices(services);
        } catch (e) {
            setConnectedServices([]);
        }

        const fetchData = async () => {
            const masterId = user.master_id || user.id || user._id;
            if (!masterId) {
                setLoading(false);
                return;
            }
            try {
                const [actRes, profRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/auth/${masterId}/activity`),
                    axios.get(`http://localhost:5000/api/auth/${masterId}/profiles`)
                ]);
                setActivities(actRes.data || []);
                setProfiles(profRes.data || { education: null, healthcare: null, agriculture: null });
            } catch (err) {
                console.error("Error loading dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.master_id, user?.id]);

    const renderDomainBadge = (domain) => {
        const d = (domain || '').toLowerCase();
        if (d.includes('edu')) {
            return <span style={{ color: '#8b5cf6', background: '#f5f3ff', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>🎓 Education</span>;
        }
        if (d.includes('agr')) {
            return <span style={{ color: '#b45309', background: '#fef3c7', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>🌾 Agriculture</span>;
        }
        if (d.includes('infra')) {
            return <span style={{ color: '#1d4ed8', background: '#dbeafe', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>🏗️ Infrastructure</span>;
        }
        if (d.includes('health')) {
            return <span style={{ color: '#059669', background: '#d1fae5', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>🏥 Healthcare</span>;
        }
        return <span style={{ color: '#4f46e5', background: '#e0e7ff', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>📄 {domain || 'Public Services'}</span>;
    };

    const renderStatusBadge = (status) => {
        const s = (status || '').toLowerCase();
        if (s.includes('approved') || s.includes('resolved') || s.includes('completed')) {
            return <span style={{ color: '#047857', background: '#d1fae5', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>Approved</span>;
        }
        if (s.includes('progress') || s.includes('review') || s.includes('processing')) {
            return <span style={{ color: '#b45309', background: '#fef3c7', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>In Progress</span>;
        }
        if (s.includes('rejected')) {
            return <span style={{ color: '#b91c1c', background: '#fee2e2', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>Rejected</span>;
        }
        return <span style={{ color: '#1e3a8a', background: '#bfdbfe', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{status || 'Assigned'}</span>;
    };

    if (!user) return null;

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', paddingBottom: 80 }}>
            <div style={{ marginBottom: 30 }}>
                <h1 style={{ fontSize: 28, marginBottom: 8, color: 'var(--text-primary)' }}>
                    Welcome, <span style={{ color: 'var(--accent)' }}>{user.name || 'Citizen'}</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage your government services and data permissions.</p>
            </div>

            {/* My Government Identity Card (Premium styling) */}
            <div style={{
                background: 'white', borderRadius: 12, padding: 24,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: 30,
                border: '1px solid var(--border-light)'
            }}>
                <h2 style={{ fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-secondary)', marginBottom: 20 }}>
                    My Government Identity
                </h2>
                
                <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                    <div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Master ID</p>
                        <p style={{ fontSize: 24, fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent)' }}>
                            {user.master_id || 'SP-000001'}
                        </p>
                    </div>

                    <div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Registered Details</p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                            {user.email || 'No email provided'}
                        </p>
                        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
                            {user.phone || 'No phone provided'}
                        </p>
                    </div>

                    <div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Connected Services</p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {['education', 'publicServices', 'infrastructure'].map(svc => (
                                <div key={svc} style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '6px 12px', background: connectedServices.includes(svc) ? '#ecfdf5' : '#f3f4f6',
                                    color: connectedServices.includes(svc) ? '#059669' : '#6b7280',
                                    borderRadius: 20, fontSize: 13, fontWeight: 500
                                }}>
                                    {connectedServices.includes(svc) ? '✓' : '○'} {svc.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </div>
                            ))}
                            {['healthcare', 'agriculture'].map(svc => (
                                <div key={svc} style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '6px 12px', background: '#f3f4f6', color: '#9ca3af',
                                    borderRadius: 20, fontSize: 13, fontWeight: 500
                                }}>
                                    Coming Soon
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: 24, padding: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>✅</span>
                <div>
                    <h4 style={{ margin: 0, fontSize: 14, color: '#166534' }}>Identity Verified</h4>
                    <p style={{ margin: 0, fontSize: 13, color: '#15803d' }}>You are logged in using SamadhanPath Master ID. You can access all government services without logging in again.</p>
                </div>
            </div>

            <h2 style={{ fontSize: 20, marginBottom: 20 }}>Government Service Domains</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 40 }}>
                {DOMAINS.map((domain, i) => (
                    <motion.div key={domain.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        onClick={() => navigate(domain.path)}
                        style={{
                            background: 'white', borderRadius: 12, padding: 24, cursor: 'pointer',
                            border: '1px solid var(--accent)', boxShadow: '0 10px 15px -3px rgba(43,107,255, 0.1)',
                            transition: 'transform 0.2s', borderTop: `4px solid ${domain.color}`
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ fontSize: 32, marginBottom: 16 }}>{domain.icon}</div>
                        <h3 style={{ fontSize: 18, marginBottom: 8, color: 'var(--text-primary)' }}>{domain.title}</h3>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                            {domain.desc}
                        </p>
                        <div style={{ marginTop: 16, fontSize: 13, color: domain.color, fontWeight: 600 }}>
                            Access Services →
                        </div>
                    </motion.div>
                ))}
            </div>

            <h2 style={{ fontSize: 20, marginBottom: 20 }}>My Active Department Profiles</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 40 }}>
                {profiles.education && (
                    <div className="card-js" style={{ padding: 20, borderTop: '4px solid #8b5cf6', background: 'white', borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <span style={{ fontSize: 24 }}>🎓</span>
                            <h3 style={{ margin: 0, fontSize: 16 }}>Education Profile</h3>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            <p style={{ margin: '4px 0' }}><strong>Course:</strong> {profiles.education.current_education?.course || profiles.education.course}</p>
                            <p style={{ margin: '4px 0' }}><strong>Institution:</strong> {profiles.education.current_education?.institution || profiles.education.institution}</p>
                            <p style={{ margin: '4px 0' }}><strong>Status:</strong> Active Student</p>
                        </div>
                    </div>
                )}
                {profiles.healthcare && (
                    <div className="card-js" style={{ padding: 20, borderTop: '4px solid #10b981', background: 'white', borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <span style={{ fontSize: 24 }}>🏥</span>
                            <h3 style={{ margin: 0, fontSize: 16 }}>Healthcare Profile</h3>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            <p style={{ margin: '4px 0' }}><strong>ABHA ID:</strong> {profiles.healthcare.abha_id || profiles.healthcare.healthId}</p>
                            <p style={{ margin: '4px 0' }}><strong>Blood Group:</strong> {profiles.healthcare.blood_group || profiles.healthcare.details?.bloodGroup || 'N/A'}</p>
                            <p style={{ margin: '4px 0' }}><strong>Status:</strong> Covered</p>
                        </div>
                    </div>
                )}
                {profiles.agriculture && (
                    <div className="card-js" style={{ padding: 20, borderTop: '4px solid #f59e0b', background: 'white', borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <span style={{ fontSize: 24 }}>🌾</span>
                            <h3 style={{ margin: 0, fontSize: 16 }}>Agriculture Profile</h3>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            <p style={{ margin: '4px 0' }}><strong>Farmer ID:</strong> {profiles.agriculture.farmer_id}</p>
                            <p style={{ margin: '4px 0' }}><strong>Land Parcels:</strong> {profiles.agriculture.land_parcels?.length || 0} registered</p>
                            <p style={{ margin: '4px 0' }}><strong>Status:</strong> Verified Farmer</p>
                        </div>
                    </div>
                )}
                {!profiles.education && !profiles.healthcare && !profiles.agriculture && !loading && (
                    <div style={{ padding: 16, color: 'var(--text-secondary)', fontSize: 14 }}>
                        No active domain profiles found. Complete KYC to auto-seed demo data!
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, margin: 0 }}>My Activity & Unified Tracking</h2>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#10b981' }}>●</span> Live Linked Services
                </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginBottom: 40 }}>
                <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border-light)' }}>
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
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                                            🔄 Loading real applications from MongoDB Atlas...
                                        </td>
                                    </tr>
                                ) : activities.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                                            No submitted applications found for this Master ID. Explore the government service domains above to submit requests.
                                        </td>
                                    </tr>
                                ) : (
                                    activities.map((item, idx) => (
                                        <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '16px 8px', fontWeight: 600 }}>{item.id}</td>
                                            <td style={{ padding: '16px 8px', fontWeight: 500 }}>{item.service_name}</td>
                                            <td style={{ padding: '16px 8px' }}>{renderDomainBadge(item.domain)}</td>
                                            <td style={{ padding: '16px 8px' }}>{renderStatusBadge(item.status)}</td>
                                            <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{item.date}</td>
                                            <td style={{ padding: '16px 8px' }}>
                                                <Link to={item.action_link || '/user-dashboard'} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border-light)' }}>
                    <h3 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>📁 My Documents (Vault)</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Centralized secure vault for your uploaded and government-issued documents.</p>
                    <button className="btn-secondary" style={{ width: '100%', marginTop: 12 }} onClick={() => navigate('/document-vault')}>Open Document Vault</button>
                </div>
                <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border-light)' }}>
                    <h3 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>🛡️ Consent Center</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Manage data sharing permissions between departments.</p>
                    <button className="btn-secondary" style={{ width: '100%', marginTop: 12 }} onClick={() => navigate('/consent-center')}>Manage Consent</button>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
