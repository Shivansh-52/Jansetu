import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getGovCertificates, getCertificateAuditLogs } from '../services/api';
import CertificateDetailModal from '../components/CertificateDetailModal';

const ICONS = {
    'Aadhaar Card': '🪪',
    'Class 10 Marksheet': '🎓',
    'Income Certificate': '💰',
    'Category Certificate': '🏷️',
    'Domicile Certificate': '🏠',
    'Health ID (ABHA) Card': '🏥',
    'Farmer Registration Certificate': '🌾'
};

const MyCertificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [corrections, setCorrections] = useState([]);
    const [consents, setConsents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCert, setSelectedCert] = useState(null);
    const [citizenId, setCitizenId] = useState('');

    useEffect(() => {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setCitizenId(user.master_id || 'SP-12963072');
            fetchData(user.master_id || 'SP-12963072');
        }
    }, []);

    const fetchData = async (id) => {
        setLoading(true);
        try {
            const certs = await getGovCertificates(id);
            setCertificates(certs);
            const auditData = await getCertificateAuditLogs(id);
            setAuditLogs(auditData.auditLogs || []);
            setCorrections(auditData.corrections || []);
            setConsents(auditData.consents || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center' }}>Loading government records...</div>;
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: 32, color: 'var(--text-primary)' }}>My Government Certificates</h1>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 16 }}>
                    View your government-verified identity, education, income and category records in one secure place.
                </p>
            </div>

            <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid var(--border-light)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 40 }}>
                <div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>Government Data Status</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%' }}></span>
                        Verified Government Records
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>Last synchronized</div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>Records available</div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>{certificates.length}</div>
                </div>
                <div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>Data integrity</div>
                    <div style={{ fontSize: 16, fontWeight: 500, color: '#059669' }}>{certificates.length}/{certificates.length} Verified</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 32, alignItems: 'start' }}>
                <div>
                    <h2 style={{ margin: '0 0 24px 0', fontSize: 20 }}>Verified Certificates</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                        {certificates.map(cert => (
                            <motion.div 
                                whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                key={cert.id} 
                                style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border-light)', padding: 24, cursor: 'pointer', transition: 'all 0.2s' }}
                                onClick={() => setSelectedCert(cert)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                    <span style={{ fontSize: 24 }}>{ICONS[cert.certificateType] || '📄'}</span>
                                    <h3 style={{ margin: 0, fontSize: 16 }}>{cert.certificateType}</h3>
                                </div>
                                
                                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                                    <div>{cert.data.name}</div>
                                    <div style={{ fontFamily: 'monospace' }}>
                                        {cert.certificateType === 'Aadhaar Card' ? cert.data.aadhaar : 
                                         cert.certificateType === 'Health ID (ABHA) Card' ? cert.data.abhaNumber :
                                         cert.certificateType === 'Farmer Registration Certificate' ? cert.data.registrationNumber :
                                         cert.data.certificateNumber || cert.data.rollNumber}
                                    </div>
                                </div>

                                <div style={{ background: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                                    ✓ Government Verified
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-secondary)', borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#92400e' }}>🔒 Locked</span>
                                    <span>Verified: {cert.verificationDate}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border-light)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', background: '#f8fafc' }}>
                        <h2 style={{ margin: 0, fontSize: 18 }}>Audit Trail & Activity</h2>
                    </div>
                    <div style={{ padding: 24 }}>
                        
                        <div style={{ marginBottom: 32 }}>
                            <h3 style={{ fontSize: 14, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 16 }}>Active Consents ({consents.length})</h3>
                            {consents.length === 0 ? (
                                <div style={{ fontSize: 13, color: '#94a3b8' }}>No active data sharing consents.</div>
                            ) : (
                                consents.map(c => (
                                    <div key={c.consent_id} style={{ background: '#f0f9ff', padding: 12, borderRadius: 8, marginBottom: 8, border: '1px solid #e0f2fe' }}>
                                        <div style={{ fontSize: 12, color: '#0284c7', fontWeight: 600, marginBottom: 4 }}>{c.department}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{c.purpose}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={{ marginBottom: 32 }}>
                            <h3 style={{ fontSize: 14, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 16 }}>Correction Requests ({corrections.length})</h3>
                            {corrections.length === 0 ? (
                                <div style={{ fontSize: 13, color: '#94a3b8' }}>No pending correction requests.</div>
                            ) : (
                                corrections.map(c => (
                                    <div key={c.request_id} style={{ background: '#fffbeb', padding: 12, borderRadius: 8, marginBottom: 8, border: '1px solid #fef3c7' }}>
                                        <div style={{ fontSize: 12, color: '#d97706', fontWeight: 600, marginBottom: 4 }}>{c.request_id}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>{c.field_name}</div>
                                        <div style={{ fontSize: 11, color: '#b45309' }}>{c.status}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div>
                            <h3 style={{ fontSize: 14, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 16 }}>Recent Activity</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {auditLogs.slice(0, 5).map(log => (
                                    <div key={log.event_id} style={{ display: 'flex', gap: 12 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1', flexShrink: 0, marginTop: 6 }}></div>
                                        <div>
                                            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                                                {log.action.replace(/_/g, ' ')}
                                            </div>
                                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                                {log.resource}
                                            </div>
                                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                                                {log.timestamp}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <CertificateDetailModal
                isOpen={!!selectedCert}
                onClose={() => {
                    setSelectedCert(null);
                    fetchData(citizenId);
                }}
                certificate={selectedCert}
                citizenId={citizenId}
                onCorrectionSuccess={() => fetchData(citizenId)}
            />
        </div>
    );
};

export default MyCertificates;
