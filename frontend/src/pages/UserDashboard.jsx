import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
    Bell, ShieldCheck, FileText, Activity, CheckCircle, 
    Clock, ArrowRight, Lock, UploadCloud, User, 
    BriefcaseMedical, GraduationCap, Tractor, Building2, Landmark,
    AlertCircle, Search, ChevronRight
} from 'lucide-react';

const DOMAINS = [
    { id: 'education', title: 'Education', icon: <GraduationCap size={32} />, path: '/education', color: '#8b5cf6', desc: 'Scholarships, Loans, Academic ID' },
    { id: 'healthcare', title: 'Healthcare', icon: <BriefcaseMedical size={32} />, path: '/healthcare', color: '#10b981', desc: 'Schemes, Appointments, Records' },
    { id: 'agriculture', title: 'Agriculture', icon: <Tractor size={32} />, path: '/agriculture', color: '#f59e0b', desc: 'Crop Insurance, Land Records' },
    { id: 'infrastructure', title: 'Infrastructure', icon: <Building2 size={32} />, path: '/register-complaint', color: '#3b82f6', desc: 'Civic Grievances, Potholes, Utilities' },
    { id: 'public-services', title: 'Public Services', icon: <Landmark size={32} />, path: '/domain-public-services', color: '#6366f1', desc: 'Income, Domicile, Certificates' }
];

const NOTIFICATIONS = [
    { id: 1, title: 'Identity Verified', message: 'Your Aadhaar identity has been successfully verified and linked.', time: '2 hrs ago', type: 'success' },
    { id: 2, title: 'DigiLocker Connected', message: 'Your official documents are now synced with your Samadhan Path profile.', time: '5 hrs ago', type: 'info' },
    { id: 3, title: 'Action Required', message: 'Please complete your Healthcare profile to access ABHA benefits.', time: '1 day ago', type: 'warning' }
];

const CONSENT_LOGS = [
    { id: 1, department: 'Department of Higher Education', data: 'Academic Records, Identity', date: 'Oct 24, 2023', status: 'Active' },
    { id: 2, department: 'Ministry of Health', data: 'Basic Identity', date: 'Oct 15, 2023', status: 'Revoked' }
];

const UserDashboard = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [profiles, setProfiles] = useState({ education: null, healthcare: null, agriculture: null });
    const [loading, setLoading] = useState(true);
    const [connectedServices, setConnectedServices] = useState([]);
    const [showDocModal, setShowDocModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // overview, consent

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
            // Read user fresh from sessionStorage inside the effect
            let masterId = sessionStorage.getItem('masterId');
            if (!masterId) {
                try {
                    const u = JSON.parse(sessionStorage.getItem('user') || '{}');
                    masterId = u.master_id || u.id || u._id;
                } catch(e) {}
            }
            // Final fallback
            if (!masterId) masterId = 'SP-000001';

            console.log('[Dashboard] Fetching with masterId:', masterId);

            try {
                // Fetch from multiple sources in parallel
                const [actRes, profRes, eduAppsRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/auth/${masterId}/activity`).catch(() => ({ data: [] })),
                    axios.get(`http://localhost:5000/api/auth/${masterId}/profiles`).catch(() => ({ data: {} })),
                    axios.get(`http://localhost:5000/api/education/applications?master_id=${masterId}`).catch(() => ({ data: { applications: [] } }))
                ]);

                // Map education applications to activity format
                const eduApps = (eduAppsRes.data?.applications || []).map(app => ({
                    trackingId: app.applicationId,
                    serviceName: app.scheme_name,
                    domain: app.domain || 'Education',
                    status: app.status || 'Application Submitted',
                    date: app.submitted_at_formatted || app.submitted_at || 'N/A',
                    type: 'application'
                }));

                // Merge with any audit log activity
                const auditActivity = (actRes.data || []).filter(a => a.trackingId || a.applicationId);
                const combined = [...eduApps, ...auditActivity];
                setActivities(combined);
                setProfiles(profRes.data || { education: null, healthcare: null, agriculture: null });
            } catch (err) {
                console.error("Error loading dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []); // Run once on mount - reads fresh from sessionStorage inside

    const renderDomainBadge = (domain) => {
        const d = (domain || '').toLowerCase();
        if (d.includes('edu')) return <span style={{ color: '#8b5cf6', background: '#f5f3ff', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>Education</span>;
        if (d.includes('agr')) return <span style={{ color: '#b45309', background: '#fef3c7', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>Agriculture</span>;
        if (d.includes('infra')) return <span style={{ color: '#1d4ed8', background: '#dbeafe', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>Infrastructure</span>;
        if (d.includes('health')) return <span style={{ color: '#059669', background: '#d1fae5', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>Healthcare</span>;
        return <span style={{ color: '#4f46e5', background: '#e0e7ff', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{domain || 'Public Services'}</span>;
    };

    const renderStatusBadge = (status) => {
        const s = (status || '').toLowerCase();
        if (s.includes('approved') || s.includes('resolved') || s.includes('completed')) {
            return <span style={{ color: '#047857', background: '#d1fae5', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: 3, background: '#059669' }} /> Approved</span>;
        }
        if (s.includes('progress') || s.includes('review') || s.includes('processing')) {
            return <span style={{ color: '#b45309', background: '#fef3c7', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: 3, background: '#d97706' }} /> In Progress</span>;
        }
        if (s.includes('rejected')) {
            return <span style={{ color: '#b91c1c', background: '#fee2e2', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: 3, background: '#dc2626' }} /> Rejected</span>;
        }
        return <span style={{ color: '#1e3a8a', background: '#bfdbfe', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: 3, background: '#2563eb' }} /> {status || 'Assigned'}</span>;
    };

    if (!user) return null;

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 80 }}>
            {/* HERO SECTION */}
            <div style={{ 
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', 
                padding: '60px 20px 100px 20px', 
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(50px)' }} />
                <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: 1, display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <ShieldCheck size={16} /> VERIFIED CITIZEN
                        </span>
                        <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                            Welcome back, {user.name?.split(' ')[0] || 'Citizen'}
                        </h1>
                        <p style={{ fontSize: 16, color: '#bfdbfe', margin: 0, maxWidth: 600, lineHeight: 1.6 }}>
                            Your unified civic portal. Access seamless government services, track your applications, and manage your data securely.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: '-60px auto 0 auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 40 }}>
                    
                    {/* DIGITAL IDENTITY CARD */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        style={{ 
                            background: 'white', borderRadius: 24, padding: 32, 
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
                            border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden'
                        }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 6, background: 'linear-gradient(90deg, #10b981, #3b82f6)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                            <div>
                                <h2 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 1.5, color: '#64748b', margin: '0 0 4px 0', fontWeight: 700 }}>Master ID</h2>
                                <p style={{ fontSize: 24, fontWeight: 800, fontFamily: 'monospace', color: '#0f172a', margin: 0, letterSpacing: 2 }}>
                                    {user.master_id || 'SP-000001'}
                                </p>
                            </div>
                            <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '8px 12px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13 }}>
                                <CheckCircle size={16} /> Verified
                            </div>
                        </div>
                        
                        <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 20, background: '#e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748b' }}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{user.name || 'Citizen User'}</div>
                                    <div style={{ fontSize: 13, color: '#64748b' }}>{user.email || 'No email provided'}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: 13, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <ShieldCheck size={14} color="#3b82f6" /> 
                                Linked with Aadhaar & DigiLocker
                            </div>
                        </div>
                    </motion.div>

                    {/* QUICK STATS & NOTIFICATIONS */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        style={{ 
                            background: 'white', borderRadius: 24, padding: 32, 
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
                            border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column'
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Bell size={20} color="#3b82f6" /> Recent Updates
                            </h2>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6', cursor: 'pointer' }}>View All</span>
                        </div>
                        
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {NOTIFICATIONS.map(notif => (
                                <div key={notif.id} style={{ display: 'flex', gap: 12 }}>
                                    <div style={{ marginTop: 2 }}>
                                        {notif.type === 'success' ? <CheckCircle size={16} color="#10b981" /> :
                                         notif.type === 'warning' ? <AlertCircle size={16} color="#f59e0b" /> :
                                         <Activity size={16} color="#3b82f6" />}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{notif.title}</div>
                                        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4, lineHeight: 1.4 }}>{notif.message}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {notif.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* EXPLORE DOMAINS GRID */}
                <div style={{ marginBottom: 48 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>Explore Government Services</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                        {DOMAINS.map((domain, i) => (
                            <motion.div key={domain.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                                onClick={() => navigate(domain.path)}
                                style={{
                                    background: 'white', borderRadius: 20, padding: 24, cursor: 'pointer',
                                    border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                    transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column'
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)';
                                    e.currentTarget.style.borderColor = domain.color;
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                                    e.currentTarget.style.borderColor = '#f1f5f9';
                                }}
                            >
                                <div style={{ color: domain.color, marginBottom: 16, background: `${domain.color}15`, width: 56, height: 56, borderRadius: 16, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {domain.icon}
                                </div>
                                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>{domain.title}</h3>
                                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5, flex: 1 }}>
                                    {domain.desc}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: domain.color, fontWeight: 700 }}>
                                    Access Services <ArrowRight size={14} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* TRACKING & CONSENT TABS */}
                <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', overflow: 'hidden', marginBottom: 40 }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                        <button onClick={() => setActiveTab('overview')} style={{ padding: '20px 24px', background: activeTab === 'overview' ? 'white' : 'transparent', border: 'none', borderBottom: activeTab === 'overview' ? '2px solid #3b82f6' : '2px solid transparent', fontSize: 15, fontWeight: activeTab === 'overview' ? 700 : 500, color: activeTab === 'overview' ? '#3b82f6' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FileText size={18} /> Unified Application Tracker
                        </button>
                        <button onClick={() => setActiveTab('consent')} style={{ padding: '20px 24px', background: activeTab === 'consent' ? 'white' : 'transparent', border: 'none', borderBottom: activeTab === 'consent' ? '2px solid #3b82f6' : '2px solid transparent', fontSize: 15, fontWeight: activeTab === 'consent' ? 700 : 500, color: activeTab === 'consent' ? '#3b82f6' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Lock size={18} /> Consent & Data Audit
                        </button>
                    </div>

                    <div style={{ padding: 32 }}>
                        {activeTab === 'overview' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a' }}>Recent Applications</h3>
                                    <div style={{ position: 'relative' }}>
                                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                        <input type="text" placeholder="Search tracking ID..." style={{ padding: '8px 16px 8px 36px', borderRadius: 20, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }} />
                                    </div>
                                </div>
                                
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                                <th style={{ padding: '16px 8px', fontWeight: 600 }}>Tracking ID</th>
                                                <th style={{ padding: '16px 8px', fontWeight: 600 }}>Service Name</th>
                                                <th style={{ padding: '16px 8px', fontWeight: 600 }}>Domain</th>
                                                <th style={{ padding: '16px 8px', fontWeight: 600 }}>Status</th>
                                                <th style={{ padding: '16px 8px', fontWeight: 600 }}>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>Loading applications...</td></tr>
                                            ) : activities.length === 0 ? (
                                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>No applications submitted yet.</td></tr>
                                            ) : (
                                                activities.map((item, idx) => (
                                                    <tr key={item.trackingId || item.id || idx} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => item.trackingId && navigate(`/tracking/${item.trackingId}`)}>
                                                        <td style={{ padding: '16px 8px', fontWeight: 600, color: '#2563eb', fontFamily: 'monospace' }}>{item.trackingId || item.id || 'N/A'}</td>
                                                        <td style={{ padding: '16px 8px', color: '#1e293b' }}>{item.serviceName || item.service_name || item.action || 'N/A'}</td>
                                                        <td style={{ padding: '16px 8px' }}>{renderDomainBadge(item.domain)}</td>
                                                        <td style={{ padding: '16px 8px' }}>{renderStatusBadge(item.status)}</td>
                                                        <td style={{ padding: '16px 8px', color: '#64748b' }}>{item.date || item.timestamp || 'N/A'}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'consent' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <div>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>Consent Audit Logs</h3>
                                        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Monitor who accessed your data and manage permissions via DPDP Act.</p>
                                    </div>
                                    <button onClick={() => navigate('/consent-center')} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        Manage Consent <ChevronRight size={14} />
                                    </button>
                                </div>

                                <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                                                <th style={{ padding: '16px', fontWeight: 600 }}>Requesting Department</th>
                                                <th style={{ padding: '16px', fontWeight: 600 }}>Data Accessed</th>
                                                <th style={{ padding: '16px', fontWeight: 600 }}>Date</th>
                                                <th style={{ padding: '16px', fontWeight: 600 }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {CONSENT_LOGS.map(log => (
                                                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '16px', fontWeight: 500, color: '#0f172a' }}>{log.department}</td>
                                                    <td style={{ padding: '16px', color: '#475569' }}>{log.data}</td>
                                                    <td style={{ padding: '16px', color: '#64748b' }}>{log.date}</td>
                                                    <td style={{ padding: '16px' }}>
                                                        <span style={{ 
                                                            padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                                                            background: log.status === 'Active' ? '#dcfce7' : '#f1f5f9',
                                                            color: log.status === 'Active' ? '#16a34a' : '#64748b'
                                                        }}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* MY DOCUMENTS VAULT SUMMARY */}
                <div style={{ background: 'linear-gradient(to right, #0f172a, #1e293b)', borderRadius: 24, padding: 32, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 16 }}>
                            <UploadCloud size={32} color="#38bdf8" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px 0' }}>My Documents (Vault)</h3>
                            <p style={{ fontSize: 14, color: '#94a3b8', margin: 0, maxWidth: 400, lineHeight: 1.5 }}>
                                Centralized secure vault for your uploaded and government-issued documents. Integrated with DigiLocker.
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => setShowDocModal(true)} style={{ padding: '12px 24px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                            Add Documents
                        </button>
                        <button onClick={() => navigate('/document-vault')} style={{ padding: '12px 24px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                            View Vault
                        </button>
                    </div>
                </div>

            </div>

            {/* ADD DOCUMENT MODAL */}
            {showDocModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', padding: 32, borderRadius: 24, width: '100%', maxWidth: 450, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Add Documents</h3>
                        <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14 }}>Choose how you want to add documents to your vault.</p>
                        
                        <button onClick={() => { setShowDocModal(false); navigate('/document-vault?action=digilocker'); }} style={{ width: '100%', padding: 20, marginBottom: 16, background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s' }}>
                            <div style={{ background: 'white', padding: 12, borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <UploadCloud size={24} color="#0284c7" />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 700, color: '#0369a1', fontSize: 16 }}>Fetch from DigiLocker</div>
                                <div style={{ fontSize: 13, color: '#0ea5e9', marginTop: 4 }}>Securely import verified documents</div>
                            </div>
                        </button>

                        <button onClick={() => { setShowDocModal(false); navigate('/document-vault?action=upload'); }} style={{ width: '100%', padding: 20, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s' }}>
                            <div style={{ background: 'white', padding: 12, borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <FileText size={24} color="#475569" />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 700, color: '#334155', fontSize: 16 }}>Upload Manually</div>
                                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Upload PDF or image files</div>
                            </div>
                        </button>
                        
                        <div style={{ marginTop: 24, textAlign: 'center' }}>
                            <button onClick={() => setShowDocModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Cancel</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
