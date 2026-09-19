import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { requestCertificateCorrection } from '../services/api';

const RequestCorrectionModal = ({ isOpen, onClose, certificate, citizenId, onSuccess }) => {
    const [field, setField] = useState('');
    const [currentValue, setCurrentValue] = useState('');
    const [requestedValue, setRequestedValue] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !certificate) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = await requestCertificateCorrection({
                citizenId,
                certificateId: certificate.id,
                certificateType: certificate.certificateType,
                field,
                currentValue,
                requestedValue,
                reason
            });
            onSuccess(data);
        } catch (error) {
            console.error(error);
            alert('Failed to submit correction request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFieldChange = (e) => {
        const selectedField = e.target.value;
        setField(selectedField);
        setCurrentValue(certificate.data[selectedField] || '');
    };

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', zIndex: 1100,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                        background: 'white', borderRadius: 16, width: '100%', maxWidth: 500,
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }}
                >
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>
                            Request Correction
                        </h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#64748b' }}>×</button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                        <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 20, border: '1px solid #e2e8f0', fontSize: 13, color: '#475569' }}>
                            Government-verified information cannot be directly modified. Submit a correction request to the responsible authority.
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>Field Requiring Correction</label>
                            <select className="input-js" value={field} onChange={handleFieldChange} required>
                                <option value="">Select a field</option>
                                {Object.keys(certificate.data).map(k => (
                                    <option key={k} value={k}>{k.replace(/([A-Z])/g, ' $1').trim()}</option>
                                ))}
                            </select>
                        </div>

                        {field && (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>Current Value</label>
                                <input type="text" className="input-js" value={currentValue} disabled style={{ background: '#f1f5f9' }} />
                            </div>
                        )}

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>Requested Value</label>
                            <input type="text" className="input-js" value={requestedValue} onChange={(e) => setRequestedValue(e.target.value)} required placeholder="Enter the correct value" />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>Reason for Correction</label>
                            <textarea className="input-js" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} required placeholder="Explain why this needs correction..."></textarea>
                        </div>

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '10px 16px', background: 'white', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '10px 16px' }}>
                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RequestCorrectionModal;
