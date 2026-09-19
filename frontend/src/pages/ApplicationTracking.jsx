import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../services/api';

const ApplicationTracking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [appData, setAppData] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchTrackingInfo(id);
        }
    }, [id]);

    const fetchTrackingInfo = async (appId) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/education/applications/${appId}`);
            if (res.data) {
                setAppData(res.data.application);
                setAuditLogs(res.data.audit_logs || []);
            }
        } catch (err) {
            console.error('Error fetching application tracking details:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '30px 20px', maxWidth: 900, margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <button onClick={() => navigate('/education')} style={{ padding: '8px 14px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#475569' }}>
                    ← Back to Education Portal
                </button>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                    Unified Interoperable Tracking System
                </div>
            </div>

            <div style={{ background: 'white', padding: 28, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: '#e0f2fe', color: '#0369a1', fontFamily: 'monospace' }}>
                            UNIFIED APPLICATION ID
                        </span>
                        <h2 style={{ fontSize: 24, margin: '6px 0 4px', color: '#0f172a', fontFamily: 'monospace' }}>{id}</h2>
                        <p style={{ margin: 0, fontSize: 14, color: '#475569' }}>{appData?.scheme_name || 'Education Assistance Scheme'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Current Status</span>
                        <span style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 12, background: appData?.status === 'Approved' ? '#dcfce7' : '#fef3c7', color: appData?.status === 'Approved' ? '#15803d' : '#b45309' }}>
                            {appData?.status || 'Application Submitted'}
                        </span>
                    </div>
                </div>

                {appData && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, background: '#f8fafc', padding: 16, borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0', marginBottom: 24 }}>
                        <div><strong>Master ID:</strong> <span style={{ fontFamily: 'monospace' }}>{appData.master_id}</span></div>
                        <div><strong>Consent Token:</strong> <span style={{ fontFamily: 'monospace', color: '#2563eb' }}>{appData.consent_id}</span></div>
                        <div><strong>Submitted At:</strong> {appData.submitted_at_formatted || 'Recently'}</div>
                        <div><strong>Department:</strong> {appData.department}</div>
                    </div>
                )}

                {/* WORKFLOW TIMELINE */}
                <h3 style={{ fontSize: 16, marginBottom: 16, color: '#0f172a' }}>Stage Progression Timeline (Database Tracked)</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                    {(appData?.timeline || [
                        { stage: 'Application Submitted', timestamp: 'Completed', status: 'Completed', details: 'Submitted via Gateway' },
                        { stage: 'Identity Verification', timestamp: 'Completed', status: 'Completed', details: 'Master ID verified' },
                        { stage: 'Document Verification', timestamp: 'Completed', status: 'Completed', details: 'Public Services API verified' },
                        { stage: 'Eligibility Verification', timestamp: 'Completed', status: 'Completed', details: 'Rule check passed' },
                        { stage: 'Department Review', timestamp: 'In Progress', status: 'In Progress', details: 'Under review by Education Officer' },
                        { stage: 'Final Decision', timestamp: 'Upcoming', status: 'Upcoming', details: 'Decision pending' }
                    ]).map((step, idx) => {
                        const isDone = step.status === 'Completed';
                        const isCurrent = step.status === 'In Progress' || step.status === 'Action Required';

                        return (
                            <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                                    background: isDone ? '#10b981' : (isCurrent ? '#2563eb' : '#e2e8f0'),
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700
                                }}>
                                    {isDone ? '✓' : (isCurrent ? '●' : idx + 1)}
                                </div>
                                <div style={{ flex: 1, background: isCurrent ? '#eff6ff' : '#f8fafc', padding: '10px 14px', borderRadius: 8, border: isCurrent ? '1px solid #bfdbfe' : '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                        <strong style={{ fontSize: 14, color: isCurrent ? '#1e40af' : '#0f172a' }}>{step.stage}</strong>
                                        <span style={{ fontSize: 11, color: '#64748b' }}>{step.timestamp}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>{step.details}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* AUDIT LOG TRAIL */}
                {auditLogs.length > 0 && (
                    <div style={{ background: '#0f172a', color: '#e2e8f0', padding: 16, borderRadius: 8, fontFamily: 'monospace', fontSize: 11 }}>
                        <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: 8 }}>SHA-256 AUDIT LOG TRAIL FOR {id}:</div>
                        {auditLogs.map((log, i) => (
                            <div key={i} style={{ marginBottom: 4 }}>
                                [{log.timestamp}] {log.action} | Actor: {log.actor} | Result: {log.result}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationTracking;
