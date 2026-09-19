import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RequestCorrectionModal from './RequestCorrectionModal';
import ShareDataModal from './ShareDataModal';

const CertificateDetailModal = ({ isOpen, onClose, certificate, citizenId, onCorrectionSuccess }) => {
    const [showCorrection, setShowCorrection] = useState(false);
    const [showShare, setShowShare] = useState(false);

    if (!isOpen || !certificate) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                        background: 'white', borderRadius: 16, width: '100%', maxWidth: 600,
                        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }}
                >
                    <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: 20, color: 'var(--text-primary)' }}>
                            {certificate.certificateType}
                        </h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#64748b' }}>×</button>
                    </div>

                    <div style={{ padding: '32px' }}>
                        <div style={{ background: '#f8fafc', borderRadius: 8, padding: 20, marginBottom: 24, border: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: 14, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identity Information</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                                {Object.entries(certificate.data).map(([key, value]) => (
                                    <div key={key}>
                                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4, textTransform: 'capitalize' }}>
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </div>
                                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                                            {value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: '#ecfdf5', borderRadius: 8, padding: 20, marginBottom: 24, border: '1px solid #a7f3d0' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: 14, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification Information</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                                <div>
                                    <div style={{ fontSize: 12, color: '#065f46', opacity: 0.8, marginBottom: 4 }}>Status</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        ✓ {certificate.status}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, color: '#065f46', opacity: 0.8, marginBottom: 4 }}>Issuing Authority</div>
                                    <div style={{ fontSize: 14, fontWeight: 500, color: '#065f46' }}>{certificate.issuingAuthority}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, color: '#065f46', opacity: 0.8, marginBottom: 4 }}>Verification Date</div>
                                    <div style={{ fontSize: 14, fontWeight: 500, color: '#065f46' }}>{certificate.verificationDate}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, color: '#065f46', opacity: 0.8, marginBottom: 4 }}>Government Reference</div>
                                    <div style={{ fontSize: 14, fontWeight: 500, color: '#065f46' }}>{certificate.governmentReferenceId}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: '#fffbeb', borderRadius: 8, padding: 16, marginBottom: 32, border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 20 }}>🔒</span>
                            <div>
                                <strong style={{ display: 'block', fontSize: 14, color: '#92400e' }}>Data Protection</strong>
                                <span style={{ fontSize: 13, color: '#b45309' }}>This record is government-verified and read-only. Direct modification by citizens is restricted.</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => setShowCorrection(true)} className="btn-secondary" style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                                Request Correction
                            </button>
                            <button onClick={() => setShowShare(true)} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                                Manage Sharing
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            <RequestCorrectionModal 
                isOpen={showCorrection} 
                onClose={() => setShowCorrection(false)}
                certificate={certificate}
                citizenId={citizenId}
                onSuccess={(data) => {
                    setShowCorrection(false);
                    onCorrectionSuccess(data);
                }}
            />

            <ShareDataModal
                isOpen={showShare}
                onClose={() => setShowShare(false)}
                certificate={certificate}
                citizenId={citizenId}
            />

        </AnimatePresence>
    );
};

export default CertificateDetailModal;
