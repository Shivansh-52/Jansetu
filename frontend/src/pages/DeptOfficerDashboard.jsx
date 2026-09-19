import React, { useEffect, useState } from 'react';
import { getDeptOfficerDashboard, getDeptComplaints, getDeptWorkers, assignComplaint, reassignComplaint, API_URL } from '../services/api';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const DeptOfficerDashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({});
    const [complaints, setComplaints] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [educationApps, setEducationApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('education_apps'); // education_apps, unassigned, assigned, in_progress, resolved
    const [assignModal, setAssignModal] = useState(null);
    const [selectedWorker, setSelectedWorker] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Remarks state for officer approval
    const [officerRemarks, setOfficerRemarks] = useState('Income and academic documents verified via Gateway CDM. Approved.');

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) { try { setUser(JSON.parse(u)); } catch { } }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [user]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const dept = user?.department || 'Education';
            const [dashData, compData, workData] = await Promise.all([
                getDeptOfficerDashboard(dept).catch(() => ({ stats: {} })),
                getDeptComplaints(dept).catch(() => []),
                getDeptWorkers(dept).catch(() => [])
            ]);
            setStats(dashData.stats || {});
            setComplaints(compData || []);
            setWorkers(workData || []);

            // Fetch Education Applications
            const eduRes = await axios.get(`${API_URL}/education/officer/applications`).catch(() => null);
            if (eduRes && eduRes.data) {
                setEducationApps(eduRes.data.applications || []);
            }
        } catch (err) {
            console.error('Failed to load dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!assignModal || !selectedWorker) return;
        setActionLoading(true);
        try {
            await assignComplaint(assignModal._id, selectedWorker, user?.id || 'officer-01');
            setSuccessMsg(`Assigned to ${workers.find(w => w._id === selectedWorker)?.name || 'worker'}`);
            setAssignModal(null);
            setSelectedWorker('');
            setTimeout(() => setSuccessMsg(''), 3000);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.error || 'Assignment failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateEducationAppStatus = async (appId, newStatus) => {
        setActionLoading(true);
        try {
            const res = await axios.post(`${API_URL}/education/officer/update-status`, {
                application_id: appId,
                status: newStatus,
                remarks: officerRemarks,
                officer_id: user?.name || 'Education Officer'
            });
            if (res.data.success) {
                setSuccessMsg(`Application ${appId} updated to ${newStatus}`);
                setTimeout(() => setSuccessMsg(''), 3000);
                fetchAll();
            }
        } catch (err) {
            alert('Failed to update application status');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredComplaints = complaints.filter(c => {
        if (activeTab === 'unassigned') return !c.worker_id || c.status === 'Pending';
        if (activeTab === 'assigned') return c.status === 'Assigned';
        if (activeTab === 'in_progress') return c.status === 'In Progress';
        if (activeTab === 'resolved') return c.status === 'Resolved';
        return true;
    });

    const statusColor = (s) => {
        const map = { Pending: '#ff9800', Assigned: '#2196f3', 'In Progress': '#ff6f00', Resolved: '#4caf50', Approved: '#10b981', Rejected: '#ef4444' };
        return map[s] || '#888';
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '30px 20px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #2B6BFF, #1a4fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'white' }}>
                        🏛️
                    </div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                            Education & Department Officer Portal
                        </h1>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                            Review & sanction interoperable Education Loans, Scholarships & Grievances
                        </p>
                    </div>
                </div>

                {/* Success Toast */}
                <AnimatePresence>
                    {successMsg && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ position: 'fixed', top: 80, right: 20, zIndex: 1000, background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                            ✅ {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* METRICS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                    <div style={{ background: 'white', padding: 20, borderRadius: 12, borderLeft: '4px solid #2563eb' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#2563eb' }}>{educationApps.length}</div>
                        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Education Applications</div>
                    </div>
                    <div style={{ background: 'white', padding: 20, borderRadius: 12, borderLeft: '4px solid #f59e0b' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{educationApps.filter(a => a.status === 'Application Submitted' || a.current_stage === 'Department Review').length}</div>
                        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Pending Review</div>
                    </div>
                    <div style={{ background: 'white', padding: 20, borderRadius: 12, borderLeft: '4px solid #10b981' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{educationApps.filter(a => a.status === 'Approved').length}</div>
                        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Sanctioned / Approved</div>
                    </div>
                    <div style={{ background: 'white', padding: 20, borderRadius: 12, borderLeft: '4px solid #ef4444' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{educationApps.filter(a => a.status === 'Rejected').length}</div>
                        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Rejected</div>
                    </div>
                </div>

                {/* NAVIGATION TABS */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    {[
                        { key: 'education_apps', label: `🎓 Education Applications (${educationApps.length})` },
                        { key: 'unassigned', label: `📋 Grievances (${complaints.length})` }
                    ].map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: activeTab === t.key ? '#2563eb' : 'white', color: activeTab === t.key ? 'white' : '#64748b' }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* TAB 1: EDUCATION APPLICATIONS REVIEW */}
                {activeTab === 'education_apps' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ background: 'white', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }}>
                            <label style={{ fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Officer Decision Remarks:</label>
                            <input
                                type="text"
                                value={officerRemarks}
                                onChange={e => setOfficerRemarks(e.target.value)}
                                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                            />
                        </div>

                        {educationApps.map(app => (
                            <div key={app.applicationId} style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: `4px solid ${statusColor(app.status)}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                                    <div>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 6 }}>
                                            <span style={{ fontWeight: 800, fontSize: 16, color: '#2563eb', fontFamily: 'monospace' }}>{app.applicationId}</span>
                                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: statusColor(app.status) + '18', color: statusColor(app.status), fontWeight: 700 }}>
                                                {app.status}
                                            </span>
                                            <span style={{ fontSize: 11, color: '#64748b' }}>Master ID: <strong>{app.master_id}</strong></span>
                                        </div>
                                        <h3 style={{ fontSize: 16, margin: '4px 0', color: '#0f172a' }}>{app.scheme_name}</h3>
                                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                                            Submitted: {app.submitted_at_formatted || 'Recently'} | Consent Token: <span style={{ fontFamily: 'monospace' }}>{app.consent_id}</span>
                                        </div>

                                        {app.verification_summary && (
                                            <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, fontSize: 12, marginTop: 10, display: 'flex', gap: 16 }}>
                                                <span style={{ color: '#059669' }}>✓ Identity Verified</span>
                                                <span style={{ color: '#059669' }}>✓ Revenue API Income Verified</span>
                                                <span style={{ color: '#059669' }}>✓ CDM Transformed</span>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        <button
                                            disabled={actionLoading}
                                            onClick={() => handleUpdateEducationAppStatus(app.applicationId, 'Approved')}
                                            style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                                        >
                                            ✓ Approve Application
                                        </button>
                                        <button
                                            disabled={actionLoading}
                                            onClick={() => handleUpdateEducationAppStatus(app.applicationId, 'Additional Information Required')}
                                            style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                                        >
                                            ⚠ Request Info
                                        </button>
                                        <button
                                            disabled={actionLoading}
                                            onClick={() => handleUpdateEducationAppStatus(app.applicationId, 'Rejected')}
                                            style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                                        >
                                            ✗ Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* TAB 2: GRIEVANCES */}
                {activeTab === 'unassigned' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {complaints.map(c => (
                            <div key={c._id} style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                                <div style={{ fontWeight: 700 }}>{c.ref_id || c._id}</div>
                                <p style={{ margin: '4px 0', fontSize: 13 }}>{c.complaint_text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeptOfficerDashboard;
