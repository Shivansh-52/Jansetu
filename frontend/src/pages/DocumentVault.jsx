import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEducationDocuments } from '../services/api';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '../services/api';

const DocumentVault = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    const getUser = () => {
        try { const s = sessionStorage.getItem('user'); return s ? JSON.parse(s) : null; }
        catch { return null; }
    };
    const user = getUser();
    if (!user) { window.location.href = '/login'; return null; }

    const [correctionModal, setCorrectionModal] = useState({ isOpen: false, doc: null, reason: '', loading: false });

    const handleCorrectionSubmit = async () => {
        if (!correctionModal.reason.trim()) return alert("Please provide a reason.");
        setCorrectionModal(prev => ({ ...prev, loading: true }));
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.post(`${API_URL}/complaints/data-correction`, {
                doc_number: correctionModal.doc.doc_number,
                doc_name: correctionModal.doc.doc_name,
                department: correctionModal.doc.issuing_dept,
                reason: correctionModal.doc.reason
            }, { headers: { Authorization: `Bearer ${token}` } });
            alert(res.data.message || "Request submitted successfully.");
            setCorrectionModal({ isOpen: false, doc: null, reason: '', loading: false });
        } catch (error) {
            alert(error.response?.data?.error || "Submission failed.");
            setCorrectionModal(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const res = await getEducationDocuments(user.master_id);
                setDocuments(res.documents || []);
            } catch (error) {
                console.error("Error fetching documents", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, [user.master_id]);

    return (
        <div className="page-bg" style={{ minHeight: '100vh', paddingBottom: 80 }}>
            <section style={{ background: 'var(--bg-secondary)', padding: '32px 0 24px', borderBottom: '1px solid var(--border-light)' }}>
                <div className="container-js" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Link to="/user-dashboard" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 8, display: 'inline-block' }}>← Back to Master Dashboard</Link>
                        <h1 style={{ fontSize: 24, margin: 0, color: '#047857', display: 'flex', alignItems: 'center', gap: 8 }}>
                            📁 Universal Document Vault
                        </h1>
                        <p style={{ fontSize: 14, margin: '4px 0 0 0' }}>Your verified certificates from various government domains.</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 12, background: '#f0fdf4', color: '#166534', padding: '4px 8px', borderRadius: 4, border: '1px solid #bbf7d0' }}>SSO Identity: {user?.master_id || 'SP-MH-000001'}</span>
                    </div>
                </div>
            </section>

            <div className="container-js" style={{ paddingTop: 32 }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading documents from Interoperability Layer...</div>
                ) : documents.length === 0 ? (
                    <div className="card-js" style={{ padding: 60, textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                        <h3 style={{ fontSize: 18, marginBottom: 8 }}>No Documents Found</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>You don't have any verified documents in your vault yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                        {documents.map((doc, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                className="card-js" style={{ padding: 24, borderTop: '4px solid #10b981' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                    <h3 style={{ margin: 0, fontSize: 16 }}>{doc.doc_name}</h3>
                                    <span style={{ fontSize: 11, background: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>{doc.verification_status}</span>
                                </div>
                                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Doc Number:</span>
                                        <strong style={{ fontSize: 12 }}>{doc.doc_number}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Source System:</span>
                                        <strong style={{ fontSize: 12, color: '#3b82f6' }}>{doc.source_system}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Issued On:</span>
                                        <strong style={{ fontSize: 12 }}>{new Date(doc.issue_date).toLocaleDateString()}</strong>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)' }}>
                                        Available for Inter-departmental Reuse
                                    </p>
                                    <button 
                                        onClick={() => setCorrectionModal({ isOpen: true, doc: doc, reason: '', loading: false })}
                                        style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                                        Report Incorrect Data
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* CORRECTION MODAL */}
            {correctionModal.isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: 24, borderRadius: 12, width: '100%', maxWidth: 400 }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#0f172a' }}>Request Data Correction</h3>
                        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                            Report incorrect information in your <strong>{correctionModal.doc.doc_name}</strong>. The <strong>{correctionModal.doc.issuing_dept}</strong> will review your request.
                        </p>
                        <textarea
                            placeholder="Please describe the incorrect data and what it should be changed to..."
                            value={correctionModal.reason}
                            onChange={(e) => setCorrectionModal(prev => ({ ...prev, reason: e.target.value }))}
                            style={{ width: '100%', height: 100, padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', marginBottom: 16, fontSize: 13, resize: 'none' }}
                        />
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button onClick={() => setCorrectionModal({ isOpen: false, doc: null, reason: '', loading: false })} style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleCorrectionSubmit} disabled={correctionModal.loading} style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: correctionModal.loading ? 'not-allowed' : 'pointer' }}>
                                {correctionModal.loading ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentVault;
