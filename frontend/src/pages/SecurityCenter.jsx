import React from 'react';

const SecurityCenter = () => {
    return (
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: 24, marginBottom: 8 }}>Security & Privacy Center</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 30 }}>Live security status of the SamadhanPath Interoperability Gateway.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                        Authentication <span style={{ color: '#059669' }}>✓ JWT</span>
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>All inter-departmental API requests are secured with JWT and signed by the Gateway.</p>
                </div>

                <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                        Data Minimization <span style={{ color: '#059669' }}>✓ Enabled</span>
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Departments only share the minimum required fields (e.g., eligibility boolean instead of raw income).</p>
                </div>

                <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                        Consent Engine <span style={{ color: '#059669' }}>✓ Active</span>
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No protected data is retrieved without explicit, cryptographically signed citizen consent.</p>
                </div>

                <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                        Audit Trail <span style={{ color: '#059669' }}>✓ Hash Verified</span>
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>All interoperability events are hash-chained to ensure a tamper-evident audit history.</p>
                </div>
            </div>
        </div>
    );
};

export default SecurityCenter;
