import React, { useEffect, useState } from 'react';
import { getUserComplaints, getComplaintsByEmail, submitFeedback, reopenComplaint, getCitizenGamification } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import StatusTracker from '../components/StatusTracker';
import { motion, AnimatePresence } from 'framer-motion';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [gamification, setGamification] = useState(null);
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [appealReason, setAppealReason] = useState('');
    const [appealLoading, setAppealLoading] = useState(false);
    const [showAppealForm, setShowAppealForm] = useState(false);

    const getUser = () => {
        try { const s = localStorage.getItem('user'); return s ? JSON.parse(s) : null; }
        catch { return null; }
    };
    const user = getUser();
    const userId = user?.id || user?._id;
    if (!user || !userId) { window.location.href = '/login'; return null; }

    const fetchComplaints = async () => {
        try {
            const byId = await getUserComplaints(userId);
            const idList = Array.isArray(byId) ? byId : [];

            let merged = [...idList];
            if (user.email) {
                try {
                    const byEmail = await getComplaintsByEmail(user.email);
                    if (Array.isArray(byEmail)) {
                        const existingIds = new Set(idList.map(c => c._id));
                        const newOnes = byEmail.filter(c => !existingIds.has(c._id));
                        merged = [...merged, ...newOnes];
                    }
                } catch { }
            }

            setComplaints(merged.slice().reverse());

            // Fetch gamification
            const gProfile = await getCitizenGamification(userId);
            setGamification(gProfile);
        } catch { 
            setComplaints([]); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchComplaints(); }, []);

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!selectedComplaint) return;
        try {
            await submitFeedback({ complaint_id: selectedComplaint._id, rating: feedbackRating, comment: feedbackComment });
            alert('Feedback submitted! Thank you.');
            fetchComplaints();
            setSelectedComplaint(null);
        } catch { alert('Failed to submit feedback.'); }
    };

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Verified').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length,
        verified: complaints.filter(c => c.status === 'Verified').length
    };

    const handleAppealSubmit = async () => {
        if (!selectedComplaint || !appealReason.trim()) return;
        setAppealLoading(true);
        try {
            await reopenComplaint(selectedComplaint._id, appealReason);
            alert('Complaint reopened successfully! It will be reassigned for re-investigation.');
            setShowAppealForm(false);
            setAppealReason('');
            setSelectedComplaint(null);
            fetchComplaints();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to reopen complaint.');
        } finally {
            setAppealLoading(false);
        }
    };

    const statusPillStyle = (status) => {
        const map = {
            'Submitted': { bg: '#f0f2f5', color: '#4A5B7A' },
            'Assigned': { bg: '#eaf2ff', color: '#2B6BFF' },
            'In Progress': { bg: '#fff7ed', color: '#e67e22' },
            'Resolved': { bg: '#e6f4ea', color: '#2ecc71' },
            'Verified': { bg: '#e0f7fa', color: '#00838f' },
            'Reopened': { bg: '#fff3e0', color: '#ff6f00' }
        };
        const m = map[status] || map['Submitted'];
        return { background: m.bg, color: m.color, border: 'none', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 };
    };

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
                        <p style={{ fontSize: 14, margin: 0 }}>Citizen Grievance & Civic Mitra Dashboard</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Link to="/asset-passport" className="btn-secondary" style={{ fontSize: 13 }}>
                            🏛️ Asset Passport
                        </Link>
                        <button className="btn-primary" onClick={() => navigate('/register-complaint')}>
                            + New Complaint
                        </button>
                    </div>
                </div>
            </section>

            <div className="container-js" style={{ paddingTop: 32 }}>
                
                {/* 🎮 Civic Mitra Gamification Bar */}
                <div className="card-js" style={{
                    padding: 24, marginBottom: 32,
                    background: 'linear-gradient(135deg, #0e1a33 0%, #1e293b 100%)',
                    color: 'white', border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 22 }}>⭐</span>
                                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'white' }}>Civic Mitra Rewards & Participation</h3>
                            </div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                                Active Citizen Level: <strong style={{ color: '#38bdf8' }}>{gamification?.level || 'Civic Guardian (Level 2)'}</strong>
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>Civic Karma</span>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#34d399' }}>{gamification?.karma_points || 150} pts</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                        {(gamification?.badges || ['Civic Pioneer', 'Pothole Patrol']).map((b, idx) => (
                            <span key={idx} style={{
                                fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20,
                                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#f8fafc'
                            }}>
                                🏅 {b}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: 16, marginBottom: 32
                }}>
                    {[
                        { label: 'Total', value: stats.total, icon: '📋', color: 'var(--accent)' },
                        { label: 'Pending', value: stats.pending, icon: '⏳', color: '#e67e22' },
                        { label: 'Resolved', value: stats.resolved, icon: '✅', color: 'var(--color-success)' },
                        { label: 'AI Verified', value: stats.verified, icon: '🤖', color: '#00838f' }
                    ].map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }} className="card-js" style={{ padding: 24 }}>
                            <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
                            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-heading)', color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Complaint List */}
                <h2 style={{ fontSize: 20, marginBottom: 20 }}>Your Registered Complaints</h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>Loading...</div>
                ) : complaints.length === 0 ? (
                    <div className="card-js" style={{ padding: 60, textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>📂</div>
                        <h3 style={{ fontSize: 18, marginBottom: 8 }}>No complaints yet</h3>
                        <p style={{ marginBottom: 24 }}>You haven't submitted any grievances.</p>
                        <button className="btn-primary" onClick={() => navigate('/register-complaint')}>
                            Submit Your First Complaint (+50 Karma)
                        </button>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20
                    }}>
                        {complaints.map((c, i) => {
                            const isMaster = c.is_master_issue;
                            const coCount = c.co_citizen_count || 1;
                            const isUnderDlp = c.asset_accountability?.is_under_dlp;

                            return (
                                <motion.div key={c._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }} className="card-js"
                                    style={{
                                        padding: 0, overflow: 'hidden', cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                    }}
                                    onClick={() => navigate(`/complaint/${c._id}`)}
                                >
                                    <div style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <span style={statusPillStyle(c.status)}>{c.status}</span>
                                            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>
                                                {new Date(c.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {isMaster && (
                                            <span style={{
                                                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                                                background: '#e0e7ff', color: '#4338ca', display: 'inline-block', marginBottom: 6
                                            }}>
                                                🤖 Master Issue ({coCount} co-reporters)
                                            </span>
                                        )}

                                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>
                                            {c.category} Issue
                                        </h3>
                                        <p style={{
                                            fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
                                            overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: 0
                                        }}>{c.complaint_text || c.text}</p>
                                    </div>
                                    <div style={{
                                        padding: '12px 24px', borderTop: '1px solid var(--border-light)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        background: 'var(--bg-primary)'
                                    }}>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            <span className="pill-js" style={{ fontSize: 10, height: 24, padding: '0 8px' }}>{c.priority}</span>
                                            <span className="pill-js" style={{ fontSize: 10, height: 24, padding: '0 8px' }}>{c.department}</span>
                                            {isUnderDlp && (
                                                <span style={{ fontSize: 10, height: 24, padding: '2px 8px', borderRadius: 12, background: '#fef3c7', color: '#b45309', fontWeight: 600 }}>
                                                    ⚡ DLP Warranty
                                                </span>
                                            )}
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>View & Confirm →</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
