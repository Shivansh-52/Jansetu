import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    getComplaintDetails, 
    uploadWorkerWork, 
    citizenConfirmResolution, 
    govtFieldInspect,
    BASE_URL 
} from '../services/api';

const ComplaintDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Worker Work Upload
    const [workImage, setWorkImage] = useState(null);
    const [workImagePreview, setWorkImagePreview] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [submittingWork, setSubmittingWork] = useState(false);

    // Citizen Confirmation Modal / Form
    const [confirmFeedback, setConfirmFeedback] = useState('');
    const [confirmRating, setConfirmRating] = useState(5);
    const [submittingConfirm, setSubmittingConfirm] = useState(false);
    const [reopenReason, setReopenReason] = useState('');
    const [showReopenModal, setShowReopenModal] = useState(false);
    const [simulatedIvrPlaying, setSimulatedIvrPlaying] = useState(false);

    // Govt Field Inspection Modal / Form
    const [govtVerdict, setGovtVerdict] = useState('Passed');
    const [govtRemarks, setGovtRemarks] = useState('');
    const [govtQcScore, setGovtQcScore] = useState(95);
    const [submittingGovt, setSubmittingGovt] = useState(false);

    useEffect(() => {
        try {
            const s = sessionStorage.getItem('user');
            if (s) setUser(JSON.parse(s));
        } catch { }
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const data = await getComplaintDetails(id);
            setComplaint(data);
        } catch {
            setError('Failed to fetch complaint details.');
        } finally {
            setLoading(false);
        }
    };

    const handleWorkImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setWorkImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setWorkImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleWorkerSubmit = async (e) => {
        e.preventDefault();
        if (!workImage) return alert('Please upload completion proof image.');
        setSubmittingWork(true);
        const formData = new FormData();
        formData.append('complaint_id', complaint._id);
        formData.append('worker_id', user?.id || 'worker_01');
        formData.append('image', workImage);
        formData.append('remarks', remarks || 'Repair work executed at site.');
        try {
            await uploadWorkerWork(formData);
            alert('Work proof uploaded! AI Quality check executed.');
            fetchDetails();
        } catch {
            alert('Upload failed. Please try again.');
        } finally {
            setSubmittingWork(false);
        }
    };

    const handleCitizenConfirm = async (decision) => {
        setSubmittingConfirm(true);
        try {
            await citizenConfirmResolution({
                complaint_id: complaint._id,
                decision: decision,
                feedback: decision === 'confirm' ? confirmFeedback : reopenReason,
                rating: confirmRating,
                channel: 'Web App'
            });
            alert(decision === 'confirm' ? '🎉 Thank you for confirming! +30 Civic Karma points awarded.' : '⚠️ Complaint reopened for re-investigation.');
            setShowReopenModal(false);
            fetchDetails();
        } catch (e) {
            alert('Action failed. Please try again.');
        } finally {
            setSubmittingConfirm(false);
        }
    };

    const triggerSimulatedIVR = () => {
        setSimulatedIvrPlaying(true);
        const msg = new SpeechSynthesisUtterance(
            `Namaste Citizen. This is JanSetu Automated Governance System. Your complaint regarding ${complaint?.category} has been inspected and marked repaired. Please confirm resolution.`
        );
        msg.lang = 'en-IN';
        msg.onend = () => setSimulatedIvrPlaying(false);
        window.speechSynthesis?.speak(msg);
    };

    const handleGovtInspectSubmit = async (e) => {
        e.preventDefault();
        setSubmittingGovt(true);
        try {
            await govtFieldInspect({
                complaint_id: complaint._id,
                verdict: govtVerdict,
                remarks: govtRemarks || 'Field site inspected. Work verified according to state municipal standards.',
                qc_score: govtQcScore
            });
            alert(`Government Field Inspection recorded as: ${govtVerdict}`);
            fetchDetails();
        } catch {
            alert('Inspection submission failed.');
        } finally {
            setSubmittingGovt(false);
        }
    };

    if (loading) {
        return (
            <div className="page-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                    <p style={{ fontWeight: 600 }}>Loading Complaint Details...</p>
                </div>
            </div>
        );
    }

    if (error || !complaint) {
        return (
            <div className="page-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <p style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{error || 'Complaint not found.'}</p>
                <Link to="/" className="btn-primary" style={{ marginTop: 16 }}>Back Home</Link>
            </div>
        );
    }

    const asset = complaint.asset_accountability || {};
    const dualRouting = complaint.dual_routing || {};
    const govtInsp = complaint.govt_inspection || {};
    const citVer = complaint.citizen_verification || {};
    const isMaster = complaint.is_master_issue || false;
    const coCount = complaint.co_citizen_count || 1;

    const isResolved = complaint.status === 'Resolved' || complaint.status === 'Verified';
    const isCitizen = !user || user.role === 'citizen';
    const isOfficial = user && ['dept_officer', 'admin', 'governance'].includes(user.role);

    return (
        <div className="page-bg" style={{ minHeight: '100vh', paddingBottom: 80 }}>
            {/* Top Banner */}
            <section style={{
                background: 'var(--bg-secondary)', padding: '28px 0',
                borderBottom: '1px solid var(--border-light)'
            }}>
                <div className="container-js" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            SamadhanPath Civic Grievance Record
                        </p>
                        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Complaint Details</h1>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Reference ID</span>
                        <div style={{ fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-heading)', color: 'var(--accent)' }}>
                            {complaint.ref_id || complaint._id}
                        </div>
                    </div>
                </div>
            </section>

            <div className="container-js" style={{ paddingTop: 32, maxWidth: 960 }}>
                
                {/* Emergency Banner */}
                {complaint.is_emergency && (
                    <div style={{
                        padding: 16, borderRadius: 16, background: '#FEF2F2', border: '1px solid #FCA5A5',
                        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20
                    }}>
                        <span style={{ fontSize: 24 }}>🚨</span>
                        <div style={{ flex: 1 }}>
                            <strong style={{ color: '#B91C1C', fontSize: 14 }}>Emergency Civic Mode Activated</strong>
                            <p style={{ margin: 0, fontSize: 12, color: '#991B1B' }}>
                                Safety Hazard: {complaint.emergency_type || 'Critical Public Safety Defect'} • Fast-Track 4-Hour SLA Active
                            </p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#DC2626', color: 'white' }}>
                            High Priority
                        </span>
                    </div>
                )}

                {/* Master Complaint Banner */}
                {isMaster && (
                    <div style={{
                        padding: 16, borderRadius: 16, background: '#EEF2FF', border: '1px solid #C7D2FE',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 24 }}>🤖</span>
                            <div>
                                <strong style={{ color: '#3730A3', fontSize: 14 }}>AI Master Issue Cluster</strong>
                                <p style={{ margin: 0, fontSize: 12, color: '#4338CA' }}>
                                    AI merged <strong>{coCount} supporting citizen reports</strong> within 150m into this unified master resolution ticket.
                                </p>
                            </div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#4F46E5', color: 'white' }}>
                            {coCount} Co-Reporters
                        </span>
                    </div>
                )}

                {/* Main Summary Card */}
                <div className="card-js" style={{ padding: 28, marginBottom: 24, borderLeft: '4px solid var(--accent)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                                <span style={{
                                    fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20,
                                    background: complaint.priority === 'Emergency' ? '#FEF2F2' : (complaint.priority === 'High' ? '#FEF2F2' : '#FFF7ED'),
                                    color: complaint.priority === 'Emergency' ? '#DC2626' : (complaint.priority === 'High' ? '#DC2626' : '#D97706')
                                }}>
                                    {complaint.priority} Priority
                                </span>
                                <span className="pill-js" style={{ fontSize: 11 }}>{complaint.category} Issue</span>
                                <span className="pill-js" style={{ fontSize: 11 }}>{complaint.department}</span>
                            </div>

                            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '4px 0 8px', color: 'var(--text-primary)' }}>
                                "{complaint.complaint_text || complaint.text}"
                            </h2>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                                Reported on {new Date(complaint.created_at).toLocaleString()} • {complaint.hierarchy?.district}, UP
                            </p>

                            {complaint.location?.lat && (
                                <button
                                    onClick={() => window.open(`https://www.google.com/maps?q=${complaint.location.lat},${complaint.location.lng}`, '_blank')}
                                    className="btn-secondary"
                                    style={{ marginTop: 14, fontSize: 12, height: 34, padding: '0 14px' }}
                                >
                                    📍 View Map Location ({complaint.location.lat.toFixed(4)}, {complaint.location.lng.toFixed(4)})
                                </button>
                            )}
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Current Status</span>
                            <div style={{
                                fontSize: 18, fontWeight: 800, marginTop: 4,
                                color: complaint.status === 'Verified' ? 'var(--color-success)' : 'var(--accent)',
                                fontFamily: 'var(--font-heading)'
                            }}>
                                ● {complaint.status}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ⭐ 2. DUAL-LEVEL GOVERNMENT GOVERNANCE */}
                <div className="card-js" style={{ padding: 24, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <span style={{ fontSize: 20 }}>🏛️</span>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Dual-Level Government Governance
                        </h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                        {/* Head Department */}
                        <div style={{ background: 'var(--bg-primary)', padding: 18, borderRadius: 16, border: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>1. Head Department (Supervision)</span>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#EAF2FF', color: 'var(--accent)' }}>
                                    {dualRouting.head_status || 'Monitoring'}
                                </span>
                            </div>
                            <strong style={{ fontSize: 13, display: 'block', color: 'var(--text-primary)' }}>
                                {dualRouting.head_department || `${complaint.department} Directorate (Supervision & Monitoring)`}
                            </strong>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                                State level oversight ensuring SLA compliance and preventing departmental handover bottlenecks.
                            </p>
                        </div>

                        {/* Local Authority */}
                        <div style={{ background: 'var(--bg-primary)', padding: 18, borderRadius: 16, border: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>2. Local Authority (Action Owner)</span>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#ECFDF5', color: '#059669' }}>
                                    {dualRouting.local_status || 'Operational Owner'}
                                </span>
                            </div>
                            <strong style={{ fontSize: 13, display: 'block', color: 'var(--text-primary)' }}>
                                {dualRouting.local_authority || `${complaint.hierarchy?.district || 'Lucknow'} Municipal Corp - ${complaint.hierarchy?.zone || 'Zone 3'}`}
                            </strong>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                                Ward field engineer & assigned execution team directly accountable for resolution.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ⭐ 3. DIGITAL ASSET PASSPORT & CONTRACTOR DLP CARD */}
                <div className="card-js" style={{ padding: 24, marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 20 }}>🏗️</span>
                            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Digital Asset Passport & Contractor Accountability
                            </h3>
                        </div>
                        {asset.is_under_dlp && (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#FEF3C7', color: '#B45309' }}>
                                ⚠️ Potential Contractual Liability — Inspection Required
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                        <div style={{ background: 'var(--bg-primary)', padding: 14, borderRadius: 14, border: '1px solid var(--border-light)' }}>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Asset ID</span>
                            <strong style={{ display: 'block', fontSize: 14, fontFamily: 'var(--font-heading)', color: 'var(--accent)', marginTop: 2 }}>
                                {asset.asset_id || 'UP-LKO-RD-402'}
                            </strong>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{asset.asset_name || 'Municipal Roadway Asset'}</span>
                        </div>

                        <div style={{ background: 'var(--bg-primary)', padding: 14, borderRadius: 14, border: '1px solid var(--border-light)' }}>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Contractor</span>
                            <strong style={{ display: 'block', fontSize: 14, color: 'var(--text-primary)', marginTop: 2 }}>
                                {asset.contractor_name || 'LKO Infrastructure Corp'}
                            </strong>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>ID: {asset.contractor_id || 'CON-LKO-781'}</span>
                        </div>

                        <div style={{ background: 'var(--bg-primary)', padding: 14, borderRadius: 14, border: '1px solid var(--border-light)' }}>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Contract ID</span>
                            <span style={{ display: 'block', fontSize: 13, fontFamily: 'var(--font-heading)', fontWeight: 700, marginTop: 2 }}>
                                {asset.contract_id || 'PWD-UP-2025-C88'}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Sanctioned Public Work</span>
                        </div>

                        <div style={{ background: 'var(--bg-primary)', padding: 14, borderRadius: 14, border: '1px solid var(--border-light)' }}>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>DLP Warranty Status</span>
                            <strong style={{ display: 'block', fontSize: 13, color: asset.is_under_dlp ? '#D97706' : 'var(--color-success)', marginTop: 2 }}>
                                {asset.is_under_dlp ? 'Active Guarantee' : 'Municipal Routine'}
                            </strong>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Zero Cost to Public</span>
                        </div>
                    </div>
                </div>

                {/* ⭐ 4. TWO-TIER RESOLUTION VERIFICATION */}
                <div className="card-js" style={{ padding: 24, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <span style={{ fontSize: 20 }}>🔍</span>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Verified Resolution Pipeline (Two-Tier Architecture)
                        </h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                        {/* Tier 1: Government Field Inspection */}
                        <div style={{
                            background: govtInsp.status === 'Passed' ? '#F0FDF4' : 'var(--bg-primary)',
                            padding: 20, borderRadius: 16, border: `1px solid ${govtInsp.status === 'Passed' ? '#A7F3D0' : 'var(--border-light)'}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Tier 1: Government Field Inspection</span>
                                <span style={{
                                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                                    background: govtInsp.status === 'Passed' ? '#DCFCE7' : '#FEF3C7',
                                    color: govtInsp.status === 'Passed' ? '#059669' : '#D97706'
                                }}>
                                    {govtInsp.status || 'Pending Inspection'}
                                </span>
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                                {govtInsp.remarks || 'Municipal Field Engineer reviews physical repair & material compliance on-site.'}
                            </p>
                            {govtInsp.inspector_name && (
                                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
                                    Inspected by: <strong>{govtInsp.inspector_name}</strong> • QC Score: <strong>{govtInsp.qc_score}%</strong>
                                </p>
                            )}

                            {/* Official Action Form */}
                            {isOfficial && !isResolved && (
                                <form onSubmit={handleGovtInspectSubmit} style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                        <select
                                            value={govtVerdict}
                                            onChange={e => setGovtVerdict(e.target.value)}
                                            className="input-js"
                                            style={{ width: 120, height: 36, fontSize: 12 }}
                                        >
                                            <option value="Passed">Passed</option>
                                            <option value="Failed">Failed / Rework</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={govtRemarks}
                                            onChange={e => setGovtRemarks(e.target.value)}
                                            placeholder="Engineer field remarks..."
                                            className="input-js"
                                            style={{ height: 36, fontSize: 12 }}
                                        />
                                    </div>
                                    <button type="submit" disabled={submittingGovt} className="btn-primary" style={{ width: '100%', fontSize: 12, height: 34 }}>
                                        {submittingGovt ? 'Recording...' : 'Submit Govt Field Inspection'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Tier 2: Citizen Confirmation */}
                        <div style={{
                            background: citVer.status === 'Confirmed' ? '#F0FDF4' : 'var(--bg-primary)',
                            padding: 20, borderRadius: 16, border: `1px solid ${citVer.status === 'Confirmed' ? '#A7F3D0' : 'var(--border-light)'}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Tier 2: Citizen Confirmation</span>
                                <span style={{
                                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                                    background: citVer.status === 'Confirmed' ? '#DCFCE7' : '#FEF3C7',
                                    color: citVer.status === 'Confirmed' ? '#059669' : '#D97706'
                                }}>
                                    {citVer.status || 'Awaiting Citizen'}
                                </span>
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                                {citVer.citizen_feedback || 'Citizen confirms if work actually resolved the ground issue.'}
                            </p>

                            {/* Citizen Action Buttons */}
                            {isCitizen && complaint.status === 'Resolved' && citVer.status !== 'Confirmed' && (
                                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            onClick={() => handleCitizenConfirm('confirm')}
                                            disabled={submittingConfirm}
                                            className="btn-primary"
                                            style={{ flex: 1, fontSize: 12, height: 36 }}
                                        >
                                            ✅ Confirm (+30 Karma)
                                        </button>
                                        <button
                                            onClick={() => setShowReopenModal(true)}
                                            className="btn-secondary"
                                            style={{ fontSize: 12, height: 36, color: 'var(--color-danger)' }}
                                        >
                                            ❌ Not Resolved
                                        </button>
                                    </div>

                                    {/* Simulated IVR Call button */}
                                    <button
                                        onClick={triggerSimulatedIVR}
                                        disabled={simulatedIvrPlaying}
                                        className="btn-secondary"
                                        style={{ fontSize: 11, height: 32 }}
                                    >
                                        📞 {simulatedIvrPlaying ? 'Playing IVR Confirmation Call...' : 'Simulate Bot/IVR Call'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Evidence Comparison (Before vs After) */}
                <div className="card-js" style={{ padding: 24, marginBottom: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Before & After Repair Evidence
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                                Before Repair (Citizen Evidence)
                            </span>
                            <div style={{ height: 220, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-light)', background: 'var(--bg-primary)' }}>
                                {complaint.image_before ? (
                                    <img src={`${BASE_URL}/uploads/${complaint.image_before}`} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>No Image</div>
                                )}
                            </div>
                        </div>

                        <div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                                After Repair (Contractor / Worker Evidence)
                            </span>
                            <div style={{ height: 220, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-light)', background: 'var(--bg-primary)' }}>
                                {complaint.image_after ? (
                                    <img src={`${BASE_URL}/uploads/${complaint.image_after}`} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text-secondary)', padding: 20, textAlign: 'center' }}>
                                        <span style={{ fontSize: 32, marginBottom: 4, opacity: 0.4 }}>⏳</span>
                                        <span>Repair in progress. Completed work photo will appear here.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Field Worker Action Panel */}
                {user?.role === 'worker' && !isResolved && (
                    <div className="card-js" style={{ padding: 24, borderLeft: '4px solid var(--accent)' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', textTransform: 'uppercase' }}>
                            👷 Field Worker Action Panel
                        </h3>
                        <form onSubmit={handleWorkerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Upload Completed Work Image</label>
                                <input type="file" accept="image/*" onChange={handleWorkImageChange} style={{ fontSize: 13 }} />
                            </div>
                            {workImagePreview && (
                                <img src={workImagePreview} alt="Preview" style={{ height: 120, borderRadius: 12, objectFit: 'cover', width: 160 }} />
                            )}
                            <input
                                type="text"
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                                placeholder="Remarks on work completed..."
                                className="input-js"
                            />
                            <button type="submit" disabled={submittingWork} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                                {submittingWork ? 'Uploading...' : 'Submit Work Proof'}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Reopen Modal */}
            <AnimatePresence>
                {showReopenModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowReopenModal(false)}
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
                            style={{ width: '100%', maxWidth: 480, padding: 32, borderRadius: 24 }}
                        >
                            <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>Reopen & Appeal Complaint</h3>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>
                                Describe the ground deficiency. The complaint will be escalated for re-investigation.
                            </p>
                            <textarea
                                value={reopenReason}
                                onChange={e => setReopenReason(e.target.value)}
                                placeholder="E.g., Pothole was only partially patched and has sunken again..."
                                className="input-js"
                                style={{ minHeight: 90, marginBottom: 16 }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                <button onClick={() => setShowReopenModal(false)} className="btn-secondary">Cancel</button>
                                <button
                                    onClick={() => handleCitizenConfirm('reopen')}
                                    disabled={submittingConfirm || !reopenReason.trim()}
                                    className="btn-primary"
                                    style={{ background: 'var(--color-danger)' }}
                                >
                                    {submittingConfirm ? 'Reopening...' : 'Reopen Complaint'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ComplaintDetails;
