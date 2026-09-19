import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { shareCertificateData } from '../services/api';

const ShareDataModal = ({ isOpen, onClose, certificate, citizenId }) => {
    const [department, setDepartment] = useState('');
    const [purpose, setPurpose] = useState('');
    const [selectedFields, setSelectedFields] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [consentId, setConsentId] = useState('');

    if (!isOpen || !certificate) return null;

    const handleFieldToggle = (field) => {
        setSelectedFields(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fieldsToShare = Object.keys(selectedFields).filter(k => selectedFields[k]);
        if (fieldsToShare.length === 0) {
            alert('Please select at least one field to share.');
            return;
        }

        setIsSubmitting(true);
        try {
            const data = await shareCertificateData({
                citizenId,
                department,
                purpose,
                dataFields: fieldsToShare
            });
            setConsentId(data.consentId);
            setIsSuccess(true);
        } catch (error) {
            console.error(error);
            alert('Failed to record consent.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetAndClose = () => {
        setIsSuccess(false);
        setDepartment('');
        setPurpose('');
        setSelectedFields({});
        onClose();
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
                            Share Government Data
                        </h2>
                        <button onClick={resetAndClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#64748b' }}>×</button>
                    </div>

                    {isSuccess ? (
                        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                            <h3 style={{ margin: '0 0 8px 0', color: '#059669' }}>Consent Recorded Successfully</h3>
                            <p style={{ color: '#475569', fontSize: 14, marginBottom: 24 }}>
                                Your data has been securely shared with the <strong>{department}</strong>.
                            </p>
                            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 8, fontSize: 13, fontFamily: 'monospace', color: '#64748b', marginBottom: 24 }}>
                                Consent ID: {consentId}
                            </div>
                            <button onClick={resetAndClose} className="btn-primary" style={{ padding: '10px 24px' }}>
                                Close
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                            
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>Select fields to share from {certificate.certificateType}:</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                    {Object.keys(certificate.data).map(k => (
                                        <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={!!selectedFields[k]}
                                                onChange={() => handleFieldToggle(k)}
                                            />
                                            {k.replace(/([A-Z])/g, ' $1').trim()}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>Select Department / Service</label>
                                <select className="input-js" value={department} onChange={e => setDepartment(e.target.value)} required>
                                    <option value="">Select Department</option>
                                    <option value="Scholarship Department">Scholarship Department</option>
                                    <option value="Education Department">Education Department</option>
                                    <option value="Municipal Department">Municipal Department</option>
                                    <option value="Employment Department">Employment Department</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>Purpose</label>
                                <input type="text" className="input-js" value={purpose} onChange={e => setPurpose(e.target.value)} required placeholder="e.g., Scholarship eligibility verification" />
                            </div>

                            <div style={{ background: '#eff6ff', borderRadius: 8, padding: 12, marginBottom: 24, border: '1px solid #bfdbfe', fontSize: 12, color: '#1d4ed8' }}>
                                <strong>Consent Required:</strong> Your selected information will be shared only for the specified purpose and with the selected department.
                            </div>

                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '10px 16px', background: 'white', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '10px 16px' }}>
                                    {isSubmitting ? 'Processing...' : 'Give Consent & Share'}
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ShareDataModal;
