import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DatabaseMonitor() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // The gateway proxy aggregates stats from all DBs
                const res = await axios.get('http://localhost:5000/api/monitor');
                setStats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
        // Refresh every 5 seconds for a cool live demo effect
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ padding: '2rem', backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', fontFamily: 'Inter, sans-serif' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                SamadhanPath Live Database Monitor
            </h1>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Real-time telemetry across our polyglot microservice ecosystem.</p>
            
            {loading ? (
                <div style={{ color: '#38bdf8', fontSize: '1.2rem' }}>Establishing secure connections...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {stats.map((db, i) => (
                        <div key={i} style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', transition: 'transform 0.2s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.2rem', color: '#e2e8f0', margin: 0 }}>{db.service}</h2>
                                <span style={{
                                    backgroundColor: db.status === 'CONNECTED' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: db.status === 'CONNECTED' ? '#4ade80' : '#f87171',
                                    padding: '4px 10px',
                                    borderRadius: '9999px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: db.status === 'CONNECTED' ? '#4ade80' : '#f87171' }}></span>
                                    {db.status}
                                </span>
                            </div>
                            
                            <div style={{ marginBottom: '1rem', color: '#cbd5e1' }}>
                                <small style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Engine</small>
                                <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{db.technology || 'N/A'}</div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '2rem' }}>
                                <div>
                                    <small style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Records</small>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#38bdf8' }}>{db.records ?? '-'}</div>
                                </div>
                                <div>
                                    <small style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Documents</small>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#c084fc' }}>{db.documents ?? '-'}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DatabaseMonitor;
