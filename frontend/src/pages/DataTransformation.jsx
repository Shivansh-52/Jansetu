import React from 'react';

const DataTransformation = () => {
    return (
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: 24, marginBottom: 8 }}>Common Data Model Transformation</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 40 }}>
                Visualizing how the SamadhanPath Gateway standardizes data between independent department schemas.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                {/* Example 1: Name Mapping */}
                <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 1fr 50px 1fr', alignItems: 'center', textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>Source (Public Services)</div>
                            <div style={{ padding: '12px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 8, fontFamily: 'monospace' }}>full_name</div>
                        </div>
                        <div style={{ color: 'var(--accent)', fontSize: 24 }}>→</div>
                        <div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>Gateway (Common Model)</div>
                            <div style={{ padding: '12px', background: '#e0e7ff', border: '1px solid #a5b4fc', borderRadius: 8, fontFamily: 'monospace', color: '#4338ca', fontWeight: 600 }}>name</div>
                        </div>
                        <div style={{ color: 'var(--accent)', fontSize: 24 }}>→</div>
                        <div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>Target (Education)</div>
                            <div style={{ padding: '12px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 8, fontFamily: 'monospace' }}>studentName</div>
                        </div>
                    </div>
                </div>

                {/* Example 2: Income Eligibility Mapping */}
                <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 1fr 50px 1fr', alignItems: 'center', textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>Source (Public Services)</div>
                            <div style={{ padding: '12px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 8, fontFamily: 'monospace' }}>annual_income</div>
                            <div style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>*Raw Data Masked*</div>
                        </div>
                        <div style={{ color: 'var(--accent)', fontSize: 24 }}>→</div>
                        <div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>Gateway (Common Model)</div>
                            <div style={{ padding: '12px', background: '#e0e7ff', border: '1px solid #a5b4fc', borderRadius: 8, fontFamily: 'monospace', color: '#4338ca', fontWeight: 600 }}>incomeEligibility</div>
                            <div style={{ fontSize: 10, color: '#059669', marginTop: 4 }}>*Boolean True/False*</div>
                        </div>
                        <div style={{ color: 'var(--accent)', fontSize: 24 }}>→</div>
                        <div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>Target (Education)</div>
                            <div style={{ padding: '12px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 8, fontFamily: 'monospace' }}>incomeEligibility</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataTransformation;
