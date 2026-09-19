import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MyGovernmentData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [masterId, setMasterId] = useState('SP-000001');
    const [logs, setLogs] = useState([]);

    const fetchData = async (idToFetch) => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/citizen/me/records?master_id=${idToFetch}`);
            setData(res.data.commonDataModel);
            setLogs(res.data.logs || []);
        } catch (err) {
            console.error('Error fetching data:', err);
            setData(null);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(masterId);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData(masterId);
    };

    const renderDomainCard = (title, icon, content) => (
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {icon} {title}
            </h3>
            {content ? (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 'bold', marginBottom: '12px' }}>
                        <span style={{ fontSize: '1.2rem' }}>✓</span> Records Available
                    </div>
                    {Object.entries(content).map(([key, value]) => (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                            <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span style={{ color: '#0f172a', fontWeight: '500' }}>{value}</span>
                        </div>
                    ))}
                    <div style={{ marginTop: '12px', fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#16a34a' }}>✓</span> All associated documents verified
                    </div>
                </div>
            ) : (
                <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '6px', textAlign: 'center' }}>
                    No records found in this department
                </div>
            )}
        </div>
    );

    return (
        <div style={{ padding: '2rem', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', color: '#0f172a', margin: 0 }}>My Government Data</h1>
                        <p style={{ color: '#64748b', marginTop: '8px' }}>Your unified citizen profile across all departments.</p>
                    </div>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
                        <input 
                            type="text" 
                            value={masterId} 
                            onChange={(e) => setMasterId(e.target.value)}
                            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '200px', fontSize: '1rem' }}
                            placeholder="Enter Master ID"
                        />
                        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Load
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', fontSize: '1.2rem' }}>Retrieving your secure records...</div>
                ) : data ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
                        
                        {/* LEFT COLUMN: Data Cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '1.5rem', borderRadius: '12px' }}>
                                <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>Master Identity</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                    <div><small style={{ color: '#94a3b8' }}>Master ID</small><div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{data.masterId}</div></div>
                                    <div><small style={{ color: '#94a3b8' }}>Full Name</small><div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{data.identity?.name || 'N/A'}</div></div>
                                    <div><small style={{ color: '#94a3b8' }}>Phone</small><div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{data.identity?.phone || 'N/A'}</div></div>
                                    <div><small style={{ color: '#94a3b8' }}>Email</small><div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{data.identity?.email || 'N/A'}</div></div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                {renderDomainCard('Education', '🎓', data.education)}
                                {renderDomainCard('Healthcare', '🏥', data.healthcare)}
                                {renderDomainCard('Agriculture', '🌾', data.agriculture)}
                                {renderDomainCard('Public Services', '📜', data.publicServices)}
                                {renderDomainCard('Infrastructure', '🏙️', data.infrastructure)}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Interoperability Audit Log */}
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>Interoperability Activity</h3>
                                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Live API Orchestration Logs</p>
                            </div>
                            <div style={{ padding: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
                                {logs.map((log, index) => (
                                    <div key={index} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>{log.time}</div>
                                        <div style={{ 
                                            fontSize: '0.9rem', 
                                            color: log.message.includes('FAILED') ? '#ef4444' : log.message.includes('SUCCESS') ? '#10b981' : '#334155',
                                            fontWeight: log.message.includes('SUCCESS') || log.message.includes('FAILED') ? 'bold' : 'normal'
                                        }}>
                                            {log.message}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#ef4444', backgroundColor: '#fee2e2', borderRadius: '12px' }}>
                        Failed to fetch data for {masterId}. Check if the user exists or if services are running.
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyGovernmentData;
