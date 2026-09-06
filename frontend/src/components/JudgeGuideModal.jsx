import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loginUser } from '../services/api';

const DEMO_ACCOUNTS = [
    { role: 'contractor', title: 'Contractor', email: 'contractor@jansetu.ai', pass: 'contractor123', icon: '👷‍♂️', route: '/contractor-dashboard', color: '#ea580c' },
    { role: 'governance', title: 'Governance Head', email: 'gov@jansetu.ai', pass: 'gov123', icon: '🏛️', route: '/governance-dashboard', color: '#4f46e5' },
    { role: 'dept_officer', title: 'Dept Officer', email: 'officer@jansetu.ai', pass: 'officer123', icon: '📋', route: '/dept-officer-dashboard', color: '#0284c7' },
    { role: 'admin', title: 'Administrator', email: 'admin@jansetu.ai', pass: 'admin123', icon: '🛡️', route: '/admin-dashboard', color: '#059669' },
    { role: 'worker', title: 'Field Worker', email: 'worker@jansetu.ai', pass: 'worker123', icon: '🔧', route: '/worker-dashboard', color: '#d97706' },
    { role: 'citizen', title: 'Citizen Reporter', email: 'citizen@jansetu.ai', pass: 'citizen123', icon: '🧑‍💻', route: '/user-dashboard', color: '#2563eb' }
];

const JudgeGuideModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('features');
    const [loadingRole, setLoadingRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Automatically open for first-time visitors in this browser session
        const hasSeenGuide = sessionStorage.getItem('hasSeenJudgeGuide');
        if (!hasSeenGuide) {
            const timer = setTimeout(() => {
                setIsOpen(true);
                sessionStorage.setItem('hasSeenJudgeGuide', 'true');
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleQuickLogin = async (acc) => {
        setLoadingRole(acc.role);
        try {
            const res = await loginUser(acc.email, acc.pass, 'public');
            setIsOpen(false);
            navigate(acc.route, { replace: true });
        } catch (e) {
            // If already logged in or error, still navigate to the dashboard
            setIsOpen(false);
            navigate(acc.route);
        } finally {
            setLoadingRole(null);
        }
    };

    const handleNavigate = (path) => {
        setIsOpen(false);
        navigate(path);
    };

    return (
        <>
            {/* Floating Trigger Button */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 9999,
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
                    padding: '12px 20px',
                    borderRadius: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.02em'
                }}
            >
                <span style={{
                    display: 'flex', width: 10, height: 10, borderRadius: '50%',
                    background: '#22c55e', boxShadow: '0 0 10px #22c55e'
                }} />
                <span>🏆 Evaluator Guide / Demo Tour</span>
            </motion.button>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16,
                        background: 'rgba(15, 23, 42, 0.7)',
                        backdropFilter: 'blur(8px)'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ duration: 0.25 }}
                            style={{
                                width: '100%',
                                maxWidth: 760,
                                maxHeight: '90vh',
                                background: 'white',
                                borderRadius: 24,
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                border: '1px solid var(--border-light)'
                            }}
                        >
                            {/* Modal Header */}
                            <div style={{
                                padding: '20px 28px',
                                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{
                                            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                                            letterSpacing: '0.08em', background: 'rgba(255,255,255,0.15)',
                                            padding: '2px 8px', borderRadius: 12
                                        }}>
                                            Smart India Hackathon Edition
                                        </span>
                                        <span style={{
                                            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                                            letterSpacing: '0.08em', background: '#22c55e', color: '#0f172a',
                                            padding: '2px 8px', borderRadius: 12
                                        }}>
                                            JanSetu AI • Samadhan Path
                                        </span>
                                    </div>
                                    <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, fontFamily: 'var(--font-heading)' }}>
                                        Evaluator Guide & Demo Roadmap
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: 'none',
                                        color: 'white',
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        fontSize: 18,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Sub-Header Tabs */}
                            <div style={{
                                display: 'flex',
                                borderBottom: '1px solid var(--border-light)',
                                background: 'var(--bg-secondary)',
                                padding: '0 28px'
                            }}>
                                <button
                                    onClick={() => setActiveTab('features')}
                                    style={{
                                        padding: '14px 18px',
                                        border: 'none',
                                        background: 'none',
                                        borderBottom: activeTab === 'features' ? '3px solid var(--accent)' : '3px solid transparent',
                                        color: activeTab === 'features' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        fontWeight: activeTab === 'features' ? 700 : 500,
                                        fontSize: 14,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8
                                    }}
                                >
                                    ⭐ 5 Breakthrough Features & Tour
                                </button>
                                <button
                                    onClick={() => setActiveTab('logins')}
                                    style={{
                                        padding: '14px 18px',
                                        border: 'none',
                                        background: 'none',
                                        borderBottom: activeTab === 'logins' ? '3px solid var(--accent)' : '3px solid transparent',
                                        color: activeTab === 'logins' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        fontWeight: activeTab === 'logins' ? 700 : 500,
                                        fontSize: 14,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8
                                    }}
                                >
                                    ⚡ 1-Click Role Logins ({DEMO_ACCOUNTS.length})
                                </button>
                            </div>

                            {/* Content Body */}
                            <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
                                {activeTab === 'features' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 8px' }}>
                                            Follow this guided flow to evaluate all 5 breakthrough pillars of <strong>Samadhan Path</strong>:
                                        </p>

                                        {/* Step 1 */}
                                        <div className="card-js" style={{ padding: 16, borderLeft: '4px solid #ef4444' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>
                                                        Feature 1 • 🚨 AI Complaint Validation & Emergency Mode
                                                    </span>
                                                    <h4 style={{ margin: '4px 0 6px', fontSize: 15 }}>
                                                        Real-time Master Issue Merging & Threat Escalation
                                                    </h4>
                                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                                                        • Type emergency triggers (e.g. <em>"Live sparking electrical wire near metro"</em>) to see the red Emergency Civic Mode trigger.<br />
                                                        • Multiple reports within 150m auto-cluster into a Master Issue to prevent duplicate work.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleNavigate('/register-complaint')}
                                                    className="btn-primary"
                                                    style={{ fontSize: 12, padding: '8px 14px', whiteSpace: 'nowrap' }}
                                                >
                                                    Test Register →
                                                </button>
                                            </div>
                                        </div>

                                        {/* Step 2 */}
                                        <div className="card-js" style={{ padding: 16, borderLeft: '4px solid #4f46e5' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase' }}>
                                                        Feature 2 • 🏛️ Dual-Level Governance & Zone Hotspots
                                                    </span>
                                                    <h4 style={{ margin: '4px 0 6px', fontSize: 15 }}>
                                                        Multi-Tier Routing (State/District/City/Zone/Ward) + AI Root Cause Analysis
                                                    </h4>
                                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                                                        • Head Department monitors policy & SLAs while Local Authority executes repairs.<br />
                                                        • AI diagnoses systemic civic infrastructure failures (RCA) and recurrent hotspots.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleNavigate('/governance-dashboard')}
                                                    className="btn-primary"
                                                    style={{ fontSize: 12, padding: '8px 14px', whiteSpace: 'nowrap' }}
                                                >
                                                    Open Governance →
                                                </button>
                                            </div>
                                        </div>

                                        {/* Step 3 */}
                                        <div className="card-js" style={{ padding: 16, borderLeft: '4px solid #ea580c' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' }}>
                                                        Feature 3 • 📜 Contractor & Digital Asset Passport / DLP
                                                    </span>
                                                    <h4 style={{ margin: '4px 0 6px', fontSize: 15 }}>
                                                        Defect Liability Period (DLP) & Contractor Zero-Cost Repairs
                                                    </h4>
                                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                                                        • Issues occurring on freshly constructed roads/assets hold the contractor accountable under DLP warranty.<br />
                                                        • Inspect Digital Asset Passports with QR Codes and project handover milestones.
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                    <button
                                                        onClick={() => handleNavigate('/asset-passport')}
                                                        className="btn-secondary"
                                                        style={{ fontSize: 12, padding: '6px 12px', whiteSpace: 'nowrap' }}
                                                    >
                                                        Asset Passports →
                                                    </button>
                                                    <button
                                                        onClick={() => handleNavigate('/contractor-dashboard')}
                                                        className="btn-primary"
                                                        style={{ fontSize: 12, padding: '6px 12px', whiteSpace: 'nowrap' }}
                                                    >
                                                        Contractor Portal →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Step 4 */}
                                        <div className="card-js" style={{ padding: 16, borderLeft: '4px solid #059669' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                                                        Feature 4 • 🔍 Two-Tier Resolution Verification
                                                    </span>
                                                    <h4 style={{ margin: '4px 0 6px', fontSize: 15 }}>
                                                        Govt Field Inspection + Citizen Confirmation / Appeal & IVR Call Simulator
                                                    </h4>
                                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                                                        • Tier 1: Field Officer inspects and uploads evidence.<br />
                                                        • Tier 2: Citizen confirms resolution via web or automated IVR callback.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleNavigate('/track')}
                                                    className="btn-primary"
                                                    style={{ fontSize: 12, padding: '8px 14px', whiteSpace: 'nowrap' }}
                                                >
                                                    Track & Verify →
                                                </button>
                                            </div>
                                        </div>

                                        {/* Step 5 */}
                                        <div className="card-js" style={{ padding: 16, borderLeft: '4px solid #8b5cf6' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase' }}>
                                                        Feature 5 • 🎮 Civic Mitra Gamification
                                                    </span>
                                                    <h4 style={{ margin: '4px 0 6px', fontSize: 15 }}>
                                                        Karma Points, Badges & Citizen Champion Leaderboards
                                                    </h4>
                                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                                                        • Earn karma points for verified civic reports and resolution confirmations.<br />
                                                        • Unlock badges like <em>Civic Guardian</em>, <em>Pothole Hunter</em>, and climb the ward leaderboard.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleNavigate('/user-dashboard')}
                                                    className="btn-primary"
                                                    style={{ fontSize: 12, padding: '8px 14px', whiteSpace: 'nowrap' }}
                                                >
                                                    Citizen Karma →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'logins' && (
                                    <div>
                                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>
                                            Click any role below to <strong>instant-login with 1-click</strong> and jump directly into that role's interface:
                                        </p>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                                            {DEMO_ACCOUNTS.map((acc) => (
                                                <div
                                                    key={acc.role}
                                                    style={{
                                                        padding: 16,
                                                        borderRadius: 14,
                                                        background: 'var(--bg-secondary)',
                                                        border: '1px solid var(--border-light)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'space-between',
                                                        gap: 12
                                                    }}
                                                >
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                            <span style={{ fontSize: 20 }}>{acc.icon}</span>
                                                            <strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>{acc.title}</strong>
                                                        </div>
                                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                                            📧 {acc.email}<br />
                                                            🔑 {acc.pass}
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        disabled={loadingRole === acc.role}
                                                        onClick={() => handleQuickLogin(acc)}
                                                        className="btn-primary"
                                                        style={{
                                                            fontSize: 12,
                                                            padding: '8px 12px',
                                                            background: acc.color,
                                                            width: '100%',
                                                            opacity: loadingRole === acc.role ? 0.7 : 1
                                                        }}
                                                    >
                                                        {loadingRole === acc.role ? 'Logging in...' : `1-Click Enter as ${acc.title} →`}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div style={{
                                padding: '16px 28px',
                                background: 'var(--bg-secondary)',
                                borderTop: '1px solid var(--border-light)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                    💡 You can reopen this guide anytime using the floating button at bottom-right.
                                </span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="btn-secondary"
                                    style={{ fontSize: 13, padding: '8px 18px' }}
                                >
                                    Got it, Close Tour
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default JudgeGuideModal;
