import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getContractorDashboard, uploadContractorRepair, BASE_URL } from '../services/api';
import { Link } from 'react-router-dom';

const ContractorDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [repairImage, setRepairImage] = useState(null);
    const [repairPreview, setRepairPreview] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    const user = (() => {
        try { return JSON.parse(sessionStorage.getItem('user')) || {}; }
        catch { return {}; }
    })();

    const contractorId = user.contractor_id || "CON-LKO-781";

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getContractorDashboard(contractorId);
            setData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setRepairImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setRepairPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleUploadRepair = async (e) => {
        e.preventDefault();
        if (!selectedTask || !repairImage) return;

        setSubmitting(true);
        setStatusMsg('');
        try {
            const formData = new FormData();
            formData.append('image', repairImage);
            formData.append('complaint_id', selectedTask._id);
            formData.append('remarks', remarks || 'Repair work completed under DLP warranty.');

            await uploadContractorRepair(formData);
            setStatusMsg('✅ Repair proof submitted successfully! Queued for Government Field Inspection.');
            setTimeout(() => {
                setSelectedTask(null);
                setRepairImage(null);
                setRepairPreview(null);
                setRemarks('');
                setStatusMsg('');
                fetchData();
            }, 1800);
        } catch (err) {
            setStatusMsg('❌ Failed to upload repair. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="page-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🏗️</div>
                    <p style={{ fontWeight: 600 }}>Loading Contractor Accountability Portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-bg" style={{ minHeight: '100vh', paddingBottom: 80 }}>
            {/* Header Section */}
            <section style={{
                background: 'var(--bg-secondary)', padding: '36px 0 28px',
                borderBottom: '1px solid var(--border-light)'
            }}>
                <div className="container-js" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: 20
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{
                                fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                                background: '#FEF3C7', color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}>
                                🏗️ Contractor Accountability Portal
                            </span>
                            <span style={{
                                fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                                background: '#ECFDF5', color: '#059669'
                            }}>
                                Active DLP Warranty
                            </span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(24px, 3vw, 36px)', margin: '4px 0 6px', color: 'var(--text-primary)' }}>
                            {data?.company_name || 'LKO Infrastructure & Highway Corp'}
                        </h1>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                            Contractor ID: <strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>{contractorId}</strong> • Governed by State Municipal Directorate
                        </p>
                    </div>

                    <div style={{
                        background: '#ffffff', padding: '16px 24px', borderRadius: 20,
                        border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)',
                        display: 'flex', alignItems: 'center', gap: 16
                    }}>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Warranty Health Score</span>
                            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-success)', fontFamily: 'var(--font-heading)' }}>
                                {data?.performance_score || 94.0}%
                            </div>
                        </div>
                        <div style={{
                            width: 44, height: 44, borderRadius: '50%', background: '#ECFDF5',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, color: 'var(--color-success)', fontWeight: 800
                        }}>A+</div>
                    </div>
                </div>
            </section>

            <div className="container-js" style={{ paddingTop: 32 }}>
                
                {/* Metric Summary Cards */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 16, marginBottom: 32
                }}>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-js" style={{ padding: 24 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active DLP Liabilities</span>
                        <div style={{ fontSize: 32, fontWeight: 800, color: '#D97706', fontFamily: 'var(--font-heading)', margin: '6px 0 2px' }}>
                            {data?.active_dlp_tasks || 0}
                        </div>
                        <span style={{ fontSize: 12, color: '#D97706', fontWeight: 600 }}>⚠️ Inspection Required</span>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-js" style={{ padding: 24 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Linked Defects</span>
                        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-heading)', margin: '6px 0 2px' }}>
                            {data?.total_defects || 0}
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Across Commissioned Assets</span>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-js" style={{ padding: 24 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resolved Under Warranty</span>
                        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-success)', fontFamily: 'var(--font-heading)', margin: '6px 0 2px' }}>
                            {data?.resolved_defects || 0}
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--color-success)', fontWeight: 600 }}>Zero Public Expense</span>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-js" style={{ padding: 24 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SLA Compliance Rate</span>
                        <div style={{ fontSize: 32, fontWeight: 800, color: '#6366F1', fontFamily: 'var(--font-heading)', margin: '6px 0 2px' }}>
                            {data?.warranty_compliance_rate || 96.2}%
                        </div>
                        <span style={{ fontSize: 12, color: '#6366F1' }}>Within Contractual SLA</span>
                    </motion.div>
                </div>

                {/* Assigned DLP Tasks Table */}
                <div className="card-js" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{
                        padding: '24px 28px', borderBottom: '1px solid var(--border-light)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
                    }}>
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                                Contractual Liability & Warranty Repairs Queue
                            </h2>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                                Defects identified on infrastructure assets under active Defect Liability Period (DLP).
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Link to="/asset-passport" className="btn-secondary" style={{ fontSize: 12, height: 38, padding: '0 16px' }}>
                                🏛️ View Asset Directory
                            </Link>
                            <button onClick={fetchData} className="btn-secondary" style={{ fontSize: 12, height: 38, padding: '0 16px' }}>
                                🔄 Refresh
                            </button>
                        </div>
                    </div>

                    {(!data?.complaints || data.complaints.length === 0) ? (
                        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <div style={{ fontSize: 40, marginBottom: 8, opacity: 0.5 }}>🛡️</div>
                            <h3 style={{ fontSize: 18, marginBottom: 4 }}>No active defect liabilities</h3>
                            <p style={{ fontSize: 14 }}>All commissioned public assets are currently certified in healthy condition.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-light)' }}>
                                        <th style={{ padding: '14px 24px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ref ID & Asset</th>
                                        <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category</th>
                                        <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>DLP Warranty Status</th>
                                        <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Contract ID</th>
                                        <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '14px 24px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.complaints.map((c) => {
                                        const asset = c.asset_accountability || {};
                                        const isResolved = c.status === 'Resolved' || c.status === 'Verified';

                                        return (
                                            <tr key={c._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                                                        {c.ref_id}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                                        {asset.asset_name || 'Municipal Road Asset'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <span className="pill-js" style={{ fontSize: 11 }}>{c.category}</span>
                                                </td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    {asset.is_under_dlp ? (
                                                        <span style={{
                                                            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                                            background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A'
                                                        }}>
                                                            ⚡ Active Guarantee
                                                        </span>
                                                    ) : (
                                                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Municipal Routine</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '16px 20px', fontFamily: 'var(--font-heading)', fontSize: 12, color: 'var(--text-secondary)' }}>
                                                    {asset.contract_id || 'PWD-UP-2025-C88'}
                                                </td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <span style={{
                                                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                                        background: isResolved ? '#ECFDF5' : '#FEF3C7',
                                                        color: isResolved ? '#059669' : '#D97706'
                                                    }}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => setSelectedTask(c)}
                                                        className="btn-primary"
                                                        style={{ fontSize: 12, height: 36, padding: '0 16px' }}
                                                    >
                                                        {isResolved ? 'Inspect Log' : '🛠️ Submit Repair Proof'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Repair Upload Modal */}
            <AnimatePresence>
                {selectedTask && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedTask(null)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 100, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(14,26,51,0.5)', backdropFilter: 'blur(6px)', padding: 20
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="card-js"
                            style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: 32, borderRadius: 24 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                <div>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                        background: '#FEF3C7', color: '#B45309', display: 'inline-block', marginBottom: 6
                                    }}>
                                        Potential Contractual Liability
                                    </span>
                                    <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                                        Repair Submission: {selectedTask.ref_id}
                                    </h3>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                                        Asset: {selectedTask.asset_accountability?.asset_name} ({selectedTask.asset_accountability?.asset_id})
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedTask(null)}
                                    style={{
                                        width: 32, height: 32, borderRadius: '50%', border: 'none',
                                        background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: 16,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >✕</button>
                            </div>

                            {/* Before vs After Photos */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                                        Citizen Evidence (Before)
                                    </label>
                                    <div style={{ height: 160, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border-light)', background: 'var(--bg-primary)' }}>
                                        {selectedTask.image_before ? (
                                            <img src={`${BASE_URL}/uploads/${selectedTask.image_before}`} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>No Image</div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                                        Contractor Proof (After)
                                    </label>
                                    <div style={{
                                        height: 160, borderRadius: 14, overflow: 'hidden',
                                        border: '2px dashed var(--border-light)', background: repairPreview ? '#f0fdf4' : 'var(--bg-primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                                    }}>
                                        {repairPreview ? (
                                            <img src={repairPreview} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <label style={{ cursor: 'pointer', textAlign: 'center', padding: 12 }}>
                                                <span style={{ fontSize: 24, display: 'block' }}>📷</span>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginTop: 4, display: 'block' }}>Upload Work Photo</span>
                                                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Remarks */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                                    Technical Execution Remarks & Materials Used
                                </label>
                                <textarea
                                    value={remarks}
                                    onChange={e => setRemarks(e.target.value)}
                                    placeholder="E.g. Bitumen VG-30 cold mix applied with vibratory compaction. Surface restored according to IRC standards."
                                    className="input-js"
                                    style={{ minHeight: 80 }}
                                />
                            </div>

                            {statusMsg && (
                                <div style={{
                                    padding: '12px 16px', borderRadius: 12, background: '#ECFDF5',
                                    border: '1px solid #A7F3D0', color: '#065F46', fontSize: 13, marginBottom: 16
                                }}>
                                    {statusMsg}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                <button onClick={() => setSelectedTask(null)} className="btn-secondary">Cancel</button>
                                <button
                                    onClick={handleUploadRepair}
                                    disabled={submitting || !repairImage}
                                    className="btn-primary"
                                >
                                    {submitting ? 'Submitting & Verifying...' : 'Submit Repair Proof 🚀'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContractorDashboard;
