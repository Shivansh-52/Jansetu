import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSystemHealth, getAuditLogs, getConsentLogs } from '../services/microservicesApi';

const GovernanceDashboard = () => {
    const [health, setHealth] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [consentLogs, setConsentLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('health');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const h = await getSystemHealth();
            setHealth(h);
            const a = await getAuditLogs();
            setAuditLogs(a);
            const c = await getConsentLogs();
            setConsentLogs(c);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const StatusDot = ({ status }) => (
        <span style={{
            display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
            background: status === 'online' ? '#10b981' : '#ef4444',
            marginRight: 8
        }}></span>
    );

    return (
        <div className="page-bg" style={{ minHeight: '100vh', paddingBottom: 80 }}>
            <section style={{ background: 'var(--bg-secondary)', padding: '32px 0 24px', borderBottom: '1px solid var(--border-light)' }}>
                <div className="container-js" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Link to="/user-dashboard" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 8, display: 'inline-block' }}>← Back to Master Dashboard</Link>
                        <h1 style={{ fontSize: 24, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            🌐 Interoperability Command Center
                        </h1>
                        <p style={{ fontSize: 14, margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>System Health & Cross-Department Data Exchange Logs</p>
                    </div>
                </div>

                <div className="container-js">
                    <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                        <button onClick={() => setActiveTab('health')} className={activeTab === 'health' ? 'btn-primary' : 'btn-secondary'} style={{ fontSize: 12, height: 38, padding: '0 16px' }}>
                            🏥 Connected Systems Health
                        </button>
                        <button onClick={() => setActiveTab('audit')} className={activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'} style={{ fontSize: 12, height: 38, padding: '0 16px' }}>
                            📜 Data Exchange Activity (Audit)
                        </button>
                        <button onClick={() => setActiveTab('consent')} className={activeTab === 'consent' ? 'btn-primary' : 'btn-secondary'} style={{ fontSize: 12, height: 38, padding: '0 16px' }}>
                            🛡️ Citizen Consent Logs
                        </button>
                    </div>
                </div>
            </section>

            <div className="container-js" style={{ paddingTop: 32 }}>
                {activeTab === 'health' && (
                    <div className="card-js" style={{ padding: 32 }}>
                        <h3 style={{ margin: '0 0 24px 0', fontSize: 18 }}>System Health & Database Architecture</h3>
                        {loading && !health ? <p>Loading...</p> : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                                <div style={{ border: '1px solid var(--border-light)', borderRadius: 12, padding: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <h4 style={{ margin: '0 0 8px 0' }}>API Gateway</h4>
                                        <StatusDot status={health?.gateway} />
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Port: 5000 | DB: PostgreSQL</p>
                                </div>
                                <div style={{ border: '1px solid var(--border-light)', borderRadius: 12, padding: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <h4 style={{ margin: '0 0 8px 0' }}>Education Dept</h4>
                                        <StatusDot status={health?.education} />
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Port: 4001 | DB: PostgreSQL</p>
                                </div>
                                <div style={{ border: '1px solid var(--border-light)', borderRadius: 12, padding: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <h4 style={{ margin: '0 0 8px 0' }}>Healthcare Dept</h4>
                                        <StatusDot status={health?.healthcare} />
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Port: 4002 | DB: MongoDB</p>
                                </div>
                                <div style={{ border: '1px solid var(--border-light)', borderRadius: 12, padding: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <h4 style={{ margin: '0 0 8px 0' }}>Agriculture Dept</h4>
                                        <StatusDot status={health?.agriculture} />
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Port: 4003 | DB: MySQL</p>
                                </div>
                                <div style={{ border: '1px solid var(--border-light)', borderRadius: 12, padding: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <h4 style={{ margin: '0 0 8px 0' }}>Infrastructure Dept</h4>
                                        <StatusDot status={health?.infrastructure} />
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Port: 4004 | DB: SQLite</p>
                                </div>
                                <div style={{ border: '1px solid var(--border-light)', borderRadius: 12, padding: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <h4 style={{ margin: '0 0 8px 0' }}>Public Services</h4>
                                        <StatusDot status={health?.publicServices} />
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Port: 4005 | DB: PostgreSQL</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="card-js" style={{ padding: 32 }}>
                        <h3 style={{ margin: '0 0 24px 0', fontSize: 18 }}>Inter-departmental Data Exchange Logs</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                    <th style={{ padding: 12 }}>Time</th>
                                    <th style={{ padding: 12 }}>Master ID</th>
                                    <th style={{ padding: 12 }}>Target Dept</th>
                                    <th style={{ padding: 12 }}>Action</th>
                                    <th style={{ padding: 12 }}>Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.map(log => (
                                    <tr key={log.log_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: 12, color: 'var(--text-secondary)' }}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                                        <td style={{ padding: 12, fontWeight: 500 }}>{log.master_id}</td>
                                        <td style={{ padding: 12 }}>{log.department}</td>
                                        <td style={{ padding: 12 }}>{log.action}</td>
                                        <td style={{ padding: 12 }}>
                                            <span style={{ color: log.result === 'SUCCESS' ? '#166534' : '#991b1b', background: log.result === 'SUCCESS' ? '#d1fae5' : '#fee2e2', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
                                                {log.result}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {auditLogs.length === 0 && <p style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>No recent activity.</p>}
                    </div>
                )}

                {activeTab === 'consent' && (
                    <div className="card-js" style={{ padding: 32 }}>
                        <h3 style={{ margin: '0 0 24px 0', fontSize: 18 }}>Citizen Data Consent Registry</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                    <th style={{ padding: 12 }}>Time</th>
                                    <th style={{ padding: 12 }}>Master ID</th>
                                    <th style={{ padding: 12 }}>Requesting Dept</th>
                                    <th style={{ padding: 12 }}>Source Dept</th>
                                    <th style={{ padding: 12 }}>Data / Purpose</th>
                                </tr>
                            </thead>
                            <tbody>
                                {consentLogs.map(log => (
                                    <tr key={log.consent_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: 12, color: 'var(--text-secondary)' }}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                                        <td style={{ padding: 12, fontWeight: 500 }}>{log.master_id}</td>
                                        <td style={{ padding: 12, color: '#1d4ed8' }}>{log.requesting_department}</td>
                                        <td style={{ padding: 12, color: '#166534' }}>{log.source_department}</td>
                                        <td style={{ padding: 12 }}>
                                            <strong>{log.data_requested}</strong><br/>
                                            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{log.purpose}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {consentLogs.length === 0 && <p style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>No consent logs found.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GovernanceDashboard;
