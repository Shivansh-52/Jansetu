import React, { useEffect, useState } from 'react';
import { getDeptOfficerDashboard, getDeptComplaints, getDeptWorkers, assignComplaint, API_URL } from '../services/api';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, FileText, CheckCircle, Clock, AlertCircle,
    XCircle, Info, RefreshCw, GraduationCap, Lock,
    User, Building2, ArrowRight, AlertTriangle
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const statusColor = (s = '') => {
    const m = {
        Approved: '#10b981', Rejected: '#ef4444',
        'Application Submitted': '#3b82f6', 'Additional Information Required': '#f59e0b',
        Pending: '#f59e0b', Resolved: '#10b981', Assigned: '#3b82f6', 'In Progress': '#f97316'
    };
    return m[s] || '#94a3b8';
};

const StatusBadge = ({ status }) => {
    const s = (status || '').toLowerCase();
    let bg, color, dot, label;
    if (s.includes('approved') || s.includes('resolved')) { bg = '#d1fae5'; color = '#065f46'; dot = '#059669'; label = status; }
    else if (s.includes('rejected')) { bg = '#fee2e2'; color = '#7f1d1d'; dot = '#dc2626'; label = status; }
    else if (s.includes('additional') || s.includes('information')) { bg = '#fef3c7'; color = '#78350f'; dot = '#f59e0b'; label = 'Info Required'; }
    else if (s.includes('submitted') || s.includes('review') || s.includes('progress')) { bg = '#dbeafe'; color = '#1e40af'; dot = '#3b82f6'; label = status; }
    else { bg = '#f1f5f9'; color = '#475569'; dot = '#94a3b8'; label = status || 'Pending'; }
    return (
        <span style={{ background: bg, color, padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block' }} />
            {label}
        </span>
    );
};

// ─── Document Matching Engine ─────────────────────────────────────────────────
const matchDocuments = (citizenData = {}, documents = [], schemeName = '') => {
    const docMap = {};
    documents.forEach(d => { docMap[d.doc_type] = d; });

    const results = [];
    const today = new Date();

    // Income match
    const citizenIncome = citizenData.family_income || 220000;
    const incomeDoc = docMap['income'];
    const incomeMatch = incomeDoc && citizenIncome <= 250000;
    results.push({
        field: 'Annual Family Income',
        citizenValue: `₹${Number(citizenIncome).toLocaleString('en-IN')}`,
        deptValue: incomeDoc ? `${incomeDoc.doc_name} (${incomeDoc.doc_number})` : 'Not fetched',
        deptSource: incomeDoc?.issuing_dept || 'Revenue Department',
        match: incomeDoc ? (citizenIncome <= 250000 ? 'ok' : 'error') : 'warning',
        issue: !incomeDoc ? 'Income Certificate not found in vault' : citizenIncome > 250000 ? `Declared ₹${Number(citizenIncome).toLocaleString('en-IN')} exceeds ₹2,50,000 limit` : null
    });

    // Academic score
    const citizenScore = citizenData.academic_performance || 85.5;
    const academicDoc = docMap['academic'];
    results.push({
        field: 'Academic Score',
        citizenValue: `${citizenScore}%`,
        deptValue: academicDoc ? `${academicDoc.doc_name} (${academicDoc.doc_number})` : 'Not fetched',
        deptSource: academicDoc?.issuing_dept || 'State Education Board',
        match: academicDoc ? (citizenScore >= 75 ? 'ok' : 'error') : 'warning',
        issue: !academicDoc ? 'Academic Marksheet not in vault' : citizenScore < 75 ? 'Score below 75% eligibility threshold' : null
    });

    // Domicile
    const domicileDoc = docMap['domicile'];
    results.push({
        field: 'Domicile Certificate',
        citizenValue: citizenData.state || 'Madhya Pradesh',
        deptValue: domicileDoc ? `${domicileDoc.doc_name} (${domicileDoc.doc_number})` : 'Not fetched',
        deptSource: domicileDoc?.issuing_dept || 'Revenue Department',
        match: domicileDoc ? (domicileDoc.verification_status === 'Verified' ? 'ok' : 'warning') : 'error',
        issue: !domicileDoc ? 'Domicile Certificate missing' : domicileDoc.verification_status !== 'Verified' ? 'Not yet verified by Revenue Dept' : null
    });

    // Caste / Category
    const casteDoc = docMap['caste'];
    results.push({
        field: 'Category Certificate',
        citizenValue: citizenData.category || 'OBC-NCL',
        deptValue: casteDoc ? `${casteDoc.doc_name} (${casteDoc.doc_number})` : 'Not fetched',
        deptSource: casteDoc?.issuing_dept || 'Revenue Department',
        match: casteDoc ? 'ok' : 'warning',
        issue: !casteDoc ? 'Category certificate not in vault' : null
    });

    // Bank account
    results.push({
        field: 'Bank Account (DBT)',
        citizenValue: citizenData.bank_account || 'XXXX-XXXX-4491 (SBI)',
        deptValue: citizenData.bank_verified ? '✓ Verified with PFMS' : '⚠ Pending PFMS verification',
        deptSource: 'Public Financial Management System',
        match: citizenData.bank_verified ? 'ok' : 'warning',
        issue: !citizenData.bank_verified ? 'Bank account not yet validated by PFMS for DBT disbursement' : null
    });

    // Expiry checks for existing docs
    ['income', 'domicile'].forEach(dtype => {
        const doc = docMap[dtype];
        if (doc && doc.expiry_date && doc.expiry_date !== 'Permanent') {
            const exp = new Date(doc.expiry_date);
            if (!isNaN(exp) && exp < today) {
                // mark existing result as error
                const r = results.find(r => r.deptValue?.includes(doc.doc_number));
                if (r) { r.match = 'error'; r.issue = `Document expired on ${doc.expiry_date}`; }
            }
        }
    });

    return results;
};

// ─── Two-Panel Detail Modal ───────────────────────────────────────────────────
const ApplicationDetailModal = ({ app, onClose, onAction, actionLoading }) => {
    const [remarks, setRemarks] = useState(app.officer_remarks || 'Verified via Gateway CDM. Documents matched.');
    const [confirmReject, setConfirmReject] = useState(false);

    const profile = app.profile_data || {};
    const documents = app.profile_documents || [];
    const formData = app.form_data || {};

    // Merge: profile takes precedence for citizen-filled data
    const citizenData = {
        name: profile.name || formData.name || '—',
        dob: profile.dob || formData.dob || '—',
        category: profile.category || formData.category || '—',
        institution: profile.institution || formData.institution || '—',
        course: profile.course || formData.course || '—',
        year_semester: profile.year_semester || formData.year_semester || '—',
        enrollment_number: profile.enrollment_number || formData.enrollment_number || '—',
        family_income: profile.family_income || formData.family_income || 220000,
        academic_performance: profile.academic_performance || formData.academic_performance || 85.5,
        state: profile.state || formData.state || '—',
        district: profile.district || formData.district || '—',
        bank_account: profile.bank_account || formData.bank_account || '—',
        bank_ifsc: profile.bank_ifsc || formData.bank_ifsc || '—',
        bank_verified: profile.bank_verified ?? false,
    };

    const matchResults = matchDocuments(citizenData, documents, app.scheme_name);
    const errors = matchResults.filter(r => r.match === 'error');
    const warnings = matchResults.filter(r => r.match === 'warning');

    const isApproved = app.status === 'Approved';
    const isRejected = app.status === 'Rejected';
    const awaitingResub = isRejected && !app.resubmitted_at;

    const DOC_ICON = { income: '💰', domicile: '🏠', caste: '📜', academic: '🎓', student_id: '🪪' };

    const MatchIcon = ({ m }) => {
        if (m === 'ok') return <CheckCircle size={16} color="#059669" />;
        if (m === 'error') return <XCircle size={16} color="#dc2626" />;
        return <AlertTriangle size={16} color="#d97706" />;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '16px', overflowY: 'auto' }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    onClick={e => e.stopPropagation()}
                    style={{ background: '#f8fafc', borderRadius: 24, width: '100%', maxWidth: 1060, boxShadow: '0 40px 80px rgba(0,0,0,0.25)', overflow: 'hidden', marginBottom: 32 }}
                >
                    {/* ── Modal Header ── */}
                    <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', padding: '22px 28px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Application Review</div>
                                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace', letterSpacing: 1 }}>{app.applicationId}</div>
                                <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4, fontWeight: 600 }}>{app.scheme_name}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 8, padding: '6px 16px', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>✕ Close</button>
                                <StatusBadge status={app.status} />
                            </div>
                        </div>
                        {/* Meta strip */}
                        <div style={{ display: 'flex', gap: 28, marginTop: 14, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                            {[
                                { l: 'MASTER ID', v: app.master_id },
                                { l: 'CONSENT', v: app.consent_id },
                                { l: 'SUBMITTED', v: app.submitted_at_formatted || 'Recently' },
                                { l: 'TYPE', v: app.scheme_type || 'SCHOLARSHIP' },
                                { l: 'DEPT', v: app.department || 'Higher Education' },
                            ].map(m => (
                                <div key={m.l}>
                                    <div style={{ fontSize: 9, opacity: 0.6, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 2 }}>{m.l}</div>
                                    <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{m.v || '—'}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Status Alert Banners ── */}
                    {(isApproved || awaitingResub) && (
                        <div style={{ padding: '14px 28px', background: isApproved ? '#d1fae5' : '#fef3c7', borderBottom: `1px solid ${isApproved ? '#a7f3d0' : '#fde68a'}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                            {isApproved ? <CheckCircle size={20} color="#059669" /> : <Clock size={20} color="#d97706" />}
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 14, color: isApproved ? '#064e3b' : '#78350f' }}>
                                    {isApproved ? 'Approved & Locked — No further changes allowed' : 'Awaiting Citizen Resubmission'}
                                </div>
                                <div style={{ fontSize: 12, color: isApproved ? '#065f46' : '#92400e', marginTop: 2 }}>
                                    {isApproved
                                        ? (app.officer_remarks ? `Remarks: "${app.officer_remarks}"` : 'This application received a final positive decision.')
                                        : 'This was rejected. The citizen must update and resubmit before approval is possible.'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Flag Summary Bar ── */}
                    {(errors.length > 0 || warnings.length > 0) && (
                        <div style={{ padding: '10px 28px', background: errors.length > 0 ? '#fef2f2' : '#fffbeb', borderBottom: `1px solid ${errors.length > 0 ? '#fca5a5' : '#fde68a'}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                            {errors.length > 0 ? <XCircle size={16} color="#dc2626" /> : <AlertTriangle size={16} color="#d97706" />}
                            <span style={{ fontSize: 13, fontWeight: 700, color: errors.length > 0 ? '#7f1d1d' : '#78350f' }}>
                                {errors.length > 0 ? `🚨 ${errors.length} critical mismatch${errors.length > 1 ? 'es' : ''} found` : ''}{errors.length > 0 && warnings.length > 0 ? ' · ' : ''}{warnings.length > 0 ? `⚠️ ${warnings.length} warning${warnings.length > 1 ? 's' : ''}` : ''}
                                <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: 8 }}>— Review the comparison panel below before taking action.</span>
                            </span>
                        </div>
                    )}

                    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* ══════════════════════════════════════════════════════
                            TWO-PANEL COMPARISON
                        ══════════════════════════════════════════════════════ */}
                        <div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
                                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px', background: '#f8fafc' }}>
                                    Citizen Submission vs Department Records
                                </span>
                                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                                {/* LEFT — Citizen Filled Info */}
                                <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #bfdbfe', overflow: 'hidden' }}>
                                    <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', padding: '14px 18px', borderBottom: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ background: '#2563eb', borderRadius: 8, padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={14} color="white" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 800, color: '#1e3a8a' }}>Citizen Submitted Information</div>
                                            <div style={{ fontSize: 11, color: '#3b82f6', marginTop: 1 }}>What the applicant declared in the form</div>
                                        </div>
                                    </div>
                                    <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                                        {[
                                            { label: 'Full Name', value: citizenData.name },
                                            { label: 'Date of Birth', value: citizenData.dob },
                                            { label: 'Category', value: citizenData.category },
                                            { label: 'State / District', value: `${citizenData.state} / ${citizenData.district}` },
                                            { label: 'Institution', value: citizenData.institution },
                                            { label: 'Course', value: citizenData.course },
                                            { label: 'Year / Semester', value: citizenData.year_semester },
                                            { label: 'Enrollment No.', value: citizenData.enrollment_number, mono: true },
                                            { label: 'Academic Score', value: `${citizenData.academic_performance}%`, highlight: citizenData.academic_performance < 75 ? 'error' : 'ok' },
                                            { label: 'Family Income', value: `₹${Number(citizenData.family_income).toLocaleString('en-IN')}`, highlight: citizenData.family_income > 250000 ? 'error' : 'ok' },
                                            { label: 'Bank Account', value: citizenData.bank_account, mono: true },
                                            { label: 'IFSC Code', value: citizenData.bank_ifsc, mono: true },
                                        ].map((row, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f1f5f9' }}>
                                                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, minWidth: 120 }}>{row.label}</span>
                                                <span style={{
                                                    fontSize: 12, fontWeight: 700, textAlign: 'right', maxWidth: 200,
                                                    fontFamily: row.mono ? 'monospace' : 'inherit',
                                                    color: row.highlight === 'error' ? '#dc2626' : row.highlight === 'ok' ? '#059669' : '#1e293b',
                                                    background: row.highlight === 'error' ? '#fee2e2' : row.highlight === 'ok' ? '#f0fdf4' : 'transparent',
                                                    padding: row.highlight ? '2px 8px' : '0',
                                                    borderRadius: row.highlight ? 6 : 0,
                                                }}>
                                                    {row.value || '—'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* RIGHT — Department Records */}
                                <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #bbf7d0', overflow: 'hidden' }}>
                                    <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', padding: '14px 18px', borderBottom: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ background: '#16a34a', borderRadius: 8, padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Building2 size={14} color="white" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 800, color: '#14532d' }}>Department Records (Interoperability Gateway)</div>
                                            <div style={{ fontSize: 11, color: '#16a34a', marginTop: 1 }}>Documents fetched via CDM from issuing departments</div>
                                        </div>
                                    </div>
                                    <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {documents.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8', fontSize: 13 }}>No documents in interoperability vault for this applicant.</div>
                                        ) : documents.map((doc, i) => {
                                            const isExpired = doc.expiry_date && doc.expiry_date !== 'Permanent' && new Date(doc.expiry_date) < new Date();
                                            const isVerified = doc.verification_status === 'Verified';
                                            return (
                                                <div key={i} style={{ borderRadius: 10, border: `1px solid ${isExpired ? '#fca5a5' : '#e2e8f0'}`, background: isExpired ? '#fef2f2' : '#f8fafc', overflow: 'hidden' }}>
                                                    <div style={{ padding: '8px 12px', borderBottom: `1px solid ${isExpired ? '#fca5a5' : '#e2e8f0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isExpired ? '#fee2e2' : 'white' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <span style={{ fontSize: 15 }}>{DOC_ICON[doc.doc_type] || '📄'}</span>
                                                            <span style={{ fontSize: 12, fontWeight: 700, color: isExpired ? '#7f1d1d' : '#0f172a' }}>{doc.doc_name}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 6 }}>
                                                            {isExpired && <span style={{ fontSize: 10, background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '1px 7px', borderRadius: 8, fontWeight: 700 }}>EXPIRED</span>}
                                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 8, background: isVerified ? '#d1fae5' : '#fef3c7', color: isVerified ? '#065f46' : '#78350f' }}>
                                                                {isVerified ? '✓ Verified' : '⚠ Unverified'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div style={{ padding: '8px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                                                        {[
                                                            { l: 'Issuing Dept', v: doc.issuing_dept },
                                                            { l: 'Doc Number', v: doc.doc_number, mono: true },
                                                            { l: 'Issued', v: doc.issue_date },
                                                            { l: 'Expiry', v: doc.expiry_date, error: isExpired },
                                                        ].map(r => (
                                                            <div key={r.l}>
                                                                <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.l}</div>
                                                                <div style={{ fontSize: 11, fontWeight: 700, color: r.error ? '#dc2626' : '#334155', fontFamily: r.mono ? 'monospace' : 'inherit' }}>{r.v || '—'}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ══════════════════════════════════════════════════════
                            MATCHING TABLE — field-by-field comparison
                        ══════════════════════════════════════════════════════ */}
                        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ArrowRight size={16} color="#3b82f6" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Field-by-Field Matching Analysis</span>
                                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b' }}>
                                    {matchResults.filter(r => r.match === 'ok').length} matched · {errors.length} critical · {warnings.length} warnings
                                </span>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                            <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Field</th>
                                            <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#2563eb', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Citizen Declared</th>
                                            <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#16a34a', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Dept. Record</th>
                                            <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Source</th>
                                            <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {matchResults.map((r, i) => {
                                            const rowBg = r.match === 'error' ? '#fef2f2' : r.match === 'warning' ? '#fffbeb' : i % 2 === 0 ? 'white' : '#fafafa';
                                            return (
                                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: rowBg }}>
                                                    <td style={{ padding: '11px 16px', fontWeight: 700, color: '#334155' }}>{r.field}</td>
                                                    <td style={{ padding: '11px 16px', color: '#1e3a8a', fontWeight: 600 }}>{r.citizenValue}</td>
                                                    <td style={{ padding: '11px 16px', color: '#14532d', fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{r.deptValue}</td>
                                                    <td style={{ padding: '11px 16px', color: '#64748b', fontSize: 11 }}>{r.deptSource}</td>
                                                    <td style={{ padding: '11px 16px' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                {r.match === 'ok'
                                                                    ? <><CheckCircle size={14} color="#059669" /><span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>Match</span></>
                                                                    : r.match === 'error'
                                                                        ? <><XCircle size={14} color="#dc2626" /><span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626' }}>Mismatch</span></>
                                                                        : <><AlertTriangle size={14} color="#d97706" /><span style={{ fontSize: 11, fontWeight: 700, color: '#d97706' }}>Warning</span></>
                                                                }
                                                            </div>
                                                            {r.issue && <div style={{ fontSize: 10, color: r.match === 'error' ? '#dc2626' : '#b45309', lineHeight: 1.4 }}>{r.issue}</div>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ── Timeline ── */}
                        {app.timeline && app.timeline.length > 0 && (
                            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '16px 20px' }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Application Timeline</div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {app.timeline.map((t, i) => {
                                        const dot = t.status === 'Completed' ? '#10b981' : t.status === 'Action Required' ? '#f59e0b' : t.status === 'In Progress' ? '#3b82f6' : '#e2e8f0';
                                        return (
                                            <div key={i} style={{ display: 'flex', gap: 12 }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 18, flexShrink: 0 }}>
                                                    <div style={{ width: 11, height: 11, borderRadius: '50%', background: dot, marginTop: 3, flexShrink: 0 }} />
                                                    {i < app.timeline.length - 1 && <div style={{ width: 2, flex: 1, background: '#e2e8f0', margin: '3px 0' }} />}
                                                </div>
                                                <div style={{ paddingBottom: 12, flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: 13, fontWeight: 700, color: t.status === 'Completed' ? '#0f172a' : '#94a3b8' }}>{t.stage}</span>
                                                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{t.timestamp}</span>
                                                    </div>
                                                    {t.details && <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{t.details}</div>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── Officer Decision Panel ── */}
                        {!isApproved && (
                            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '18px 20px' }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Lock size={13} /> Officer Decision
                                </div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Remarks / Reason</label>
                                <textarea
                                    rows={3}
                                    value={remarks}
                                    onChange={e => setRemarks(e.target.value)}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #cbd5e1', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', marginBottom: 14 }}
                                    placeholder="Enter your decision remarks…"
                                />
                                {errors.length > 0 && (
                                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#7f1d1d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <AlertCircle size={14} /> {errors.length} critical mismatch{errors.length > 1 ? 'es' : ''} flagged — review before approving.
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    {/* Approve */}
                                    <button
                                        disabled={actionLoading || awaitingResub}
                                        onClick={() => { setConfirmReject(false); onAction(app.applicationId, 'Approved', remarks); }}
                                        style={{ padding: '10px 22px', background: awaitingResub ? '#e2e8f0' : '#10b981', color: awaitingResub ? '#94a3b8' : 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: awaitingResub ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                                        title={awaitingResub ? 'Awaiting citizen resubmission' : ''}
                                    >
                                        <CheckCircle size={15} /> {awaitingResub ? 'Locked — Awaiting Resubmission' : 'Approve Application'}
                                    </button>
                                    {/* Request Info */}
                                    <button
                                        disabled={actionLoading || isRejected}
                                        onClick={() => { setConfirmReject(false); onAction(app.applicationId, 'Additional Information Required', remarks); }}
                                        style={{ padding: '10px 22px', background: isRejected ? '#e2e8f0' : '#f59e0b', color: isRejected ? '#94a3b8' : 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: isRejected ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                                    >
                                        <Info size={15} /> Request Info
                                    </button>
                                    {/* Reject */}
                                    {!isRejected && (
                                        !confirmReject
                                            ? <button disabled={actionLoading} onClick={() => setConfirmReject(true)} style={{ padding: '10px 22px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <XCircle size={15} /> Reject
                                            </button>
                                            : <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '8px 14px' }}>
                                                <span style={{ fontSize: 13, fontWeight: 700, color: '#7f1d1d' }}>Confirm?</span>
                                                <button onClick={() => { onAction(app.applicationId, 'Rejected', remarks); setConfirmReject(false); }} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, padding: '5px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Yes, Reject</button>
                                                <button onClick={() => setConfirmReject(false)} style={{ background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: 8, padding: '5px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                                            </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// doc icon map — needs to be accessible inside modal
const DOC_ICON = { income: '💰', domicile: '🏠', caste: '📜', academic: '🎓', student_id: '🪪' };

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const DeptOfficerDashboard = () => {
    const [user, setUser] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [educationApps, setEducationApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('education_apps');
    const [actionLoading, setActionLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);

    useEffect(() => {
        const u = sessionStorage.getItem('user');
        if (u) { try { setUser(JSON.parse(u)); } catch { } }
    }, []);

    useEffect(() => { fetchAll(); }, [user]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const dept = user?.department || 'Education';
            const [compData, eduRes] = await Promise.all([
                getDeptComplaints(dept).catch(() => []),
                axios.get(`${API_URL}/education/officer/applications`).catch(() => null),
            ]);
            setComplaints(compData || []);

            if (eduRes?.data?.applications) {
                const apps = eduRes.data.applications;
                // Enrich each app with profile + documents
                const enriched = await Promise.all(apps.map(async (app) => {
                    try {
                        const profRes = await axios.get(`${API_URL}/education/profile?master_id=${app.master_id}`);
                        return {
                            ...app,
                            profile_data: profRes.data || {},
                            profile_documents: profRes.data?.documents || []
                        };
                    } catch { return app; }
                }));
                setEducationApps(enriched);
            }
        } catch (err) {
            console.error('Dashboard load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (appId, newStatus, remarks) => {
        setActionLoading(true);
        try {
            const res = await axios.post(`${API_URL}/education/officer/update-status`, {
                application_id: appId, status: newStatus,
                remarks: remarks || 'Reviewed by Officer',
                officer_id: user?.name || 'Education Officer'
            });
            if (res.data.success) {
                setSuccessMsg(`${appId} → ${newStatus}`);
                setTimeout(() => setSuccessMsg(''), 3500);
                await fetchAll();
                setSelectedApp(prev => {
                    if (!prev || prev.applicationId !== appId) return prev;
                    return { ...prev, status: newStatus, officer_remarks: remarks };
                });
            }
        } catch (err) {
            const d = err.response?.data;
            if (d?.locked) setErrorMsg('⛔ This application is Approved and locked.');
            else if (d?.awaiting_resubmission) setErrorMsg('⏳ Cannot approve — awaiting citizen resubmission.');
            else setErrorMsg(d?.error || 'Failed to update status.');
            setTimeout(() => setErrorMsg(''), 5000);
        } finally {
            setActionLoading(false);
        }
    };

    const pendingCount = educationApps.filter(a => a.status === 'Application Submitted' || a.current_stage === 'Department Review').length;
    const approvedCount = educationApps.filter(a => a.status === 'Approved').length;
    const rejectedCount = educationApps.filter(a => a.status === 'Rejected').length;

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 80 }}>

            {/* ── Hero ── */}
            <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', padding: '60px 20px 100px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, background: 'rgba(255,255,255,0.08)', borderRadius: '50%', filter: 'blur(50px)' }} />
                <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: 1, display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <ShieldCheck size={15} /> EDUCATION DEPARTMENT OFFICER
                        </span>
                        <h1 style={{ fontSize: 34, fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
                            Welcome, {user?.name?.split(' ')[0] || 'Officer'}
                        </h1>
                        <p style={{ fontSize: 15, color: '#bfdbfe', margin: 0, maxWidth: 580, lineHeight: 1.6 }}>
                            Review interoperable applications · Compare citizen declarations against department records · Approve or Reject with full context.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* ── Toasts ── */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 80, right: 20, zIndex: 3000, background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle size={16} /> {successMsg}
                    </motion.div>
                )}
                {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 80, right: 20, zIndex: 3000, background: '#ef4444', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', maxWidth: 420, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <XCircle size={16} /> {errorMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Content overlapping hero ── */}
            <div style={{ maxWidth: 1200, margin: '-60px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 20, marginBottom: 36 }}>
                    {[
                        { label: 'Total Applications', value: educationApps.length, color: '#2563eb', icon: <FileText size={20} /> },
                        { label: 'Pending Review', value: pendingCount, color: '#d97706', icon: <Clock size={20} /> },
                        { label: 'Approved', value: approvedCount, color: '#059669', icon: <CheckCircle size={20} /> },
                        { label: 'Rejected', value: rejectedCount, color: '#dc2626', icon: <XCircle size={20} /> },
                        { label: 'Grievances', value: complaints.length, color: '#7c3aed', icon: <AlertCircle size={20} /> },
                    ].map((m, i) => (
                        <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                            style={{ background: 'white', borderRadius: 20, padding: '20px 24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: m.color }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: 30, fontWeight: 900, color: m.color }}>{loading ? '—' : m.value}</div>
                                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 4 }}>{m.label}</div>
                                </div>
                                <div style={{ color: m.color, background: `${m.color}18`, padding: 10, borderRadius: 12 }}>{m.icon}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main table card */}
                <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', overflow: 'hidden', marginBottom: 40 }}>
                    {/* Tab bar */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                        {[
                            { key: 'education_apps', label: 'Education Applications', icon: <GraduationCap size={16} />, count: educationApps.length },
                            { key: 'grievances', label: 'Grievances', icon: <AlertCircle size={16} />, count: complaints.length },
                        ].map(t => (
                            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                                padding: '18px 24px', background: activeTab === t.key ? 'white' : 'transparent',
                                border: 'none', borderBottom: activeTab === t.key ? '2px solid #3b82f6' : '2px solid transparent',
                                fontSize: 14, fontWeight: activeTab === t.key ? 700 : 500,
                                color: activeTab === t.key ? '#3b82f6' : '#64748b', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                                {t.icon} {t.label}
                                <span style={{ background: activeTab === t.key ? '#dbeafe' : '#f1f5f9', color: activeTab === t.key ? '#1d4ed8' : '#64748b', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                                    {t.count}
                                </span>
                            </button>
                        ))}
                        <div style={{ marginLeft: 'auto', padding: '14px 18px', display: 'flex', alignItems: 'center' }}>
                            <button onClick={fetchAll} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
                                <RefreshCw size={13} /> Refresh
                            </button>
                        </div>
                    </div>

                    <div style={{ padding: '24px 28px' }}>
                        {/* Education Apps */}
                        {activeTab === 'education_apps' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a' }}>All Education Applications</h3>
                                    <span style={{ fontSize: 13, color: '#94a3b8' }}>Click any row to open full comparison review</span>
                                </div>
                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>⏳ Loading…</div>
                                ) : educationApps.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8', fontSize: 14 }}>No education applications found.</div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                            <thead>
                                                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                                    {['Application ID', 'Scheme Name', 'Master ID', 'Flags', 'Status', 'Submitted'].map(h => (
                                                        <th key={h} style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {educationApps.map(app => {
                                                    const profile = app.profile_data || {};
                                                    const match = matchDocuments({ ...profile, ...app.form_data }, app.profile_documents || [], app.scheme_name);
                                                    const errCount = match.filter(r => r.match === 'error').length;
                                                    const warnCount = match.filter(r => r.match === 'warning').length;
                                                    const awaitResub = app.status === 'Rejected' && !app.resubmitted_at;
                                                    return (
                                                        <tr key={app.applicationId}
                                                            style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                                                            onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                                                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                                            onClick={() => setSelectedApp(app)}
                                                        >
                                                            <td style={{ padding: '14px 10px', fontWeight: 700, color: '#2563eb', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                                                                {app.applicationId}
                                                                {app.status === 'Approved' && <span style={{ marginLeft: 6, fontSize: 10, background: '#d1fae5', color: '#065f46', padding: '2px 6px', borderRadius: 6, fontFamily: 'sans-serif' }}>🔒</span>}
                                                            </td>
                                                            <td style={{ padding: '14px 10px', color: '#1e293b', maxWidth: 200 }}>{app.scheme_name}</td>
                                                            <td style={{ padding: '14px 10px', fontFamily: 'monospace', color: '#475569', fontSize: 12 }}>{app.master_id}</td>
                                                            <td style={{ padding: '14px 10px' }}>
                                                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                                    {errCount > 0 && <span style={{ fontSize: 10, background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>🚨 {errCount}</span>}
                                                                    {warnCount > 0 && <span style={{ fontSize: 10, background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>⚠ {warnCount}</span>}
                                                                    {errCount === 0 && warnCount === 0 && <span style={{ fontSize: 10, background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>✓ Clean</span>}
                                                                    {awaitResub && <span style={{ fontSize: 10, background: '#fef3c7', color: '#78350f', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>⏳ Resub</span>}
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '14px 10px' }}><StatusBadge status={app.status} /></td>
                                                            <td style={{ padding: '14px 10px', color: '#64748b', whiteSpace: 'nowrap', fontSize: 12 }}>{app.submitted_at_formatted || 'Recently'}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Grievances */}
                        {activeTab === 'grievances' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px', color: '#0f172a' }}>Department Grievances</h3>
                                {complaints.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8', fontSize: 14 }}>No grievances found.</div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                            <thead>
                                                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                                    {['Ref ID', 'Complaint', 'Category', 'Status'].map(h => (
                                                        <th key={h} style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {complaints.map(c => (
                                                    <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '12px 10px', fontFamily: 'monospace', fontWeight: 700, color: '#334155', fontSize: 12 }}>{c.ref_id || c._id}</td>
                                                        <td style={{ padding: '12px 10px', color: '#0f172a', maxWidth: 300 }}>
                                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>{c.complaint_text}</div>
                                                        </td>
                                                        <td style={{ padding: '12px 10px' }}>
                                                            <span style={{ background: c.category === 'Data Correction' ? '#ede9fe' : '#f1f5f9', color: c.category === 'Data Correction' ? '#7c3aed' : '#475569', padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                                                                {c.category || 'General'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '12px 10px' }}><StatusBadge status={c.status} /></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedApp && (
                <ApplicationDetailModal
                    app={selectedApp}
                    onClose={() => setSelectedApp(null)}
                    onAction={handleAction}
                    actionLoading={actionLoading}
                />
            )}
        </div>
    );
};

export default DeptOfficerDashboard;
