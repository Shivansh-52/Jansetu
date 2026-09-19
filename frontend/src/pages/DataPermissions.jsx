import React from 'react';

const DataPermissions = () => {
    return (
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: 24, marginBottom: 8 }}>My Data Permissions</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 40 }}>
                Manage the active data sharing consents you have granted across government departments.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Active Consent Example */}
                <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <h3 style={{ fontSize: 18, margin: 0 }}>Scholarship Eligibility Verification</h3>
                            <span style={{ padding: '4px 8px', background: '#ecfdf5', color: '#059669', fontSize: 12, borderRadius: 12, fontWeight: 600 }}>ACTIVE</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '8px 16px', fontSize: 14 }}>
                            <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Consent ID:</div>
                            <div style={{ fontFamily: 'monospace' }}>CONS-1001</div>
                            
                            <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Requester:</div>
                            <div>Education Department</div>
                            
                            <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Source:</div>
                            <div>Public Services</div>
                            
                            <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Data Shared:</div>
                            <div style={{ color: '#059669', fontWeight: 500 }}>✓ Income Eligibility, ✓ Domicile Status, ✓ Category Status</div>
                        </div>
                    </div>
                    <div>
                        <button style={{ padding: '8px 16px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                            Revoke Consent
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataPermissions;
