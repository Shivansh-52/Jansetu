import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InteroperabilityMonitor = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = () => {
            try {
                // Mocking the backend API call to fetch logs
                const localLogs = JSON.parse(sessionStorage.getItem('mockLogs')) || [];
                
                // If empty, supply some initial mocked data to make the demo look good
                if (localLogs.length === 0) {
                    const defaultLogs = [
                        { auditId: 1, timestamp: new Date(Date.now() - 60000).toISOString(), department: 'Public Services', action: 'Verify Domicile', result: 'SUCCESS', currentHash: 'a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7' },
                        { auditId: 2, timestamp: new Date(Date.now() - 120000).toISOString(), department: 'Public Services', action: 'Verify Income', result: 'SUCCESS', currentHash: '9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k' },
                        { auditId: 3, timestamp: new Date(Date.now() - 180000).toISOString(), department: 'Gateway', action: 'Consent JWT Issued', result: 'APPROVED', currentHash: 'b5a4d3e2f1g0h9i8j7k6l5m4n3o2p1q0' }
                    ];
                    setLogs(defaultLogs);
                } else {
                    setLogs([...localLogs].reverse());
                }
            } catch (err) {
                console.error("Failed to fetch mock logs");
            }
        };
        fetchLogs();
        const interval = setInterval(fetchLogs, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: 24, marginBottom: 8 }}>Interoperability Monitor</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 30 }}>Live API orchestration and hash-chained audit trail.</p>

            <div style={{ background: '#1e293b', padding: 24, borderRadius: 12, color: '#f8fafc', fontFamily: 'monospace' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 150px 200px 1fr', gap: 16, borderBottom: '1px solid #334155', paddingBottom: 12, marginBottom: 12, fontWeight: 700, color: '#94a3b8' }}>
                    <div>TIME</div>
                    <div>DEPARTMENT</div>
                    <div>ACTION</div>
                    <div>HASH / RESULT</div>
                </div>
                
                {logs.length === 0 ? (
                    <div style={{ padding: '20px 0', color: '#64748b' }}>No interoperability events found yet.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {logs.map((log) => (
                            <div key={log.auditId} style={{ display: 'grid', gridTemplateColumns: '150px 150px 200px 1fr', gap: 16, fontSize: 13, alignItems: 'center' }}>
                                <div style={{ color: '#64748b' }}>{new Date(log.timestamp).toLocaleTimeString()}</div>
                                <div style={{ color: '#38bdf8' }}>{log.department}</div>
                                <div style={{ color: '#e2e8f0' }}>{log.action}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <span style={{ color: log.result === 'SUCCESS' || log.result === 'APPROVED' ? '#4ade80' : '#f87171' }}>{log.result}</span>
                                    <span style={{ fontSize: 10, color: '#475569' }}>Hash: {log.currentHash.substring(0, 16)}...</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InteroperabilityMonitor;
