import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getConsentHistory } from '../services/api';

const ConsentCenter = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const getUser = () => {
        try { const s = localStorage.getItem('user'); return s ? JSON.parse(s) : null; }
        catch { return null; }
    };
    const user = getUser();
    if (!user) { window.location.href = '/login'; return null; }

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await getConsentHistory(user.master_id);
                setHistory(res.history || []);
            } catch (error) {
                console.error("Error fetching consent history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user.master_id]);

    return (
        <div className="page-bg" style={{ minHeight: '100vh', paddingBottom: 80 }}>
            <section style={{ background: 'var(--bg-secondary)', padding: '32px 0 24px', borderBottom: '1px solid var(--border-light)' }}>
                <div className="container-js" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Link to="/user-dashboard" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 8, display: 'inline-block' }}>← Back to Master Dashboard</Link>
                        <h1 style={{ fontSize: 24, margin: 0, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 8 }}>
                            🛡️ Consent Center
                        </h1>
                        <p style={{ fontSize: 14, margin: '4px 0 0 0' }}>Manage and track your data sharing permissions across departments.</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 12, background: '#f0fdf4', color: '#166534', padding: '4px 8px', borderRadius: 4, border: '1px solid #bbf7d0' }}>SSO Identity: {user?.master_id || 'SP-MH-000001'}</span>
                    </div>
                </div>
            </section>

            <div className="container-js" style={{ paddingTop: 32 }}>
                <div className="card-js" style={{ padding: 24, marginBottom: 24, borderTop: '4px solid #3b82f6' }}>
                    <h2 style={{ fontSize: 18, marginBottom: 16 }}>Consent Audit Log</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>This log records every instance where you granted permission to share your Master Profile or Document Vault data with a government department.</p>

                    {loading ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading consent history...</div>
                    ) : history.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: 12 }}>
                            No consent records found.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                                        <th style={{ padding: '12px 8px' }}>Date & Time</th>
                                        <th style={{ padding: '12px 8px' }}>Requesting Department</th>
                                        <th style={{ padding: '12px 8px' }}>Purpose</th>
                                        <th style={{ padding: '12px 8px' }}>Status</th>
                                        <th style={{ padding: '12px 8px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((log, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '16px 8px', fontWeight: 500 }}>{new Date(log.timestamp).toLocaleString()}</td>
                                            <td style={{ padding: '16px 8px', fontWeight: 600 }}>{log.requesting_dept}</td>
                                            <td style={{ padding: '16px 8px' }}>{log.purpose}</td>
                                            <td style={{ padding: '16px 8px' }}>
                                                <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{log.status}</span>
                                            </td>
                                            <td style={{ padding: '16px 8px' }}>
                                                <button style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Revoke</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConsentCenter;
