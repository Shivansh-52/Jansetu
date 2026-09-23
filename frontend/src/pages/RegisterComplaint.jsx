import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { submitComplaint } from '../services/api';
import { Clock, TrendingUp, HelpCircle, Send, ShieldCheck, MapPin, Camera, Mic } from 'lucide-react';
import useUnsavedChangesWarning from '../hooks/useUnsavedChangesWarning';
const RegisterComplaint = () => {
    const navigate = useNavigate();

    // Check if user is logged in
    let loggedInUser = null;
    try {
        const u = sessionStorage.getItem('user');
        if (u) loggedInUser = JSON.parse(u);
    } catch { }

    // Enforce citizen-only access: If logged in as non-citizen, block access
    useEffect(() => {
        if (loggedInUser && loggedInUser.role && loggedInUser.role !== 'citizen') {
            // Non-citizen trying to access complaint registration
            const roleName = loggedInUser.role === 'worker' ? 'Worker' :
                loggedInUser.role === 'dept_officer' ? 'Department Officer' :
                    loggedInUser.role === 'admin' ? 'Administrator' :
                        loggedInUser.role === 'governance' ? 'Governance Official' : 'Official';
            alert(`Only citizens can register complaints. You are logged in as a ${roleName}.`);
            navigate('/');
        }
    }, [loggedInUser, navigate]);

    // Form State (New fields for CPGRAMS design)
    const [fullName, setFullName] = useState(loggedInUser?.name || '');
    const [mobile, setMobile] = useState('');
    const [department, setDepartment] = useState('');
    const [category, setCategory] = useState('');
    const [subject, setSubject] = useState('');
    
    // Existing fields
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [declaration, setDeclaration] = useState(false);
    const [email, setEmail] = useState(loggedInUser?.email || '');

    // Location State
    const [location, setLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState('idle');

    // Submission State
    const [submissionStatus, setSubmissionStatus] = useState('idle');
    const [complaintId, setComplaintId] = useState(null);
    const [refId, setRefId] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [copied, setCopied] = useState(false);
    
    // Duplicate detection state
    const [duplicateInfo, setDuplicateInfo] = useState(null);

    // Apply navigation warning if form has unsaved inputs
    const isFormFilled = Boolean(
        fullName !== (loggedInUser?.name || '') || mobile || department || category || subject || description || image || location
    );
    const isDirty = isFormFilled && submissionStatus === 'idle';
    useUnsavedChangesWarning(isDirty);

    useEffect(() => {
        if (submissionStatus === 'success') {
            const handlePopState = () => {
                navigate('/user-dashboard', { replace: true });
            };
            window.addEventListener('popstate', handlePopState);
            return () => window.removeEventListener('popstate', handlePopState);
        }
    }, [submissionStatus, navigate]);

    // --- LOGIC: Voice Input ---
    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'speechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognition.onstart = () => setIsListening(true);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setDescription((prev) => prev ? `${prev} ${transcript}` : transcript);
                setIsListening(false);
            };
            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);
            recognition.start();
        } else {
            alert("Browser does not support speech recognition.");
        }
    };

    // --- LOGIC: Geolocation ---
    const getLocation = () => {
        if (!navigator.geolocation) { alert("Geolocation is not supported."); return; }
        setLocationStatus('loading');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                setLocationStatus('success');
            },
            () => { setLocationStatus('error'); alert("Unable to retrieve location."); }
        );
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
            
            // Auto-trigger geo-tagging on photo upload if not already captured
            if (!location && navigator.geolocation) {
                setLocationStatus('loading');
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                        setLocationStatus('success');
                    },
                    () => { setLocationStatus('error'); }
                );
            }
        }
    };

    const handleCopy = () => {
        const textToCopy = refId || complaintId;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic Validations
        if (!fullName.trim() || !mobile.trim() || !department || !category || !subject.trim() || !description.trim()) {
            setErrorMsg("Please fill out all required fields.");
            return;
        }
        if (!image) { setErrorMsg("Photo evidence is mandatory."); return; }
        if (!location) { setErrorMsg("Location is mandatory."); return; }
        if (!declaration) { setErrorMsg("Please accept the declaration."); return; }
        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setErrorMsg("Please enter a valid email address."); return;
        }

        setSubmissionStatus('loading');
        setErrorMsg('');

        // Block non-citizens from submitting
        if (loggedInUser && loggedInUser.role && loggedInUser.role !== 'citizen') {
            setErrorMsg("Only citizens can register complaints. Please log in as a citizen to submit a complaint.");
            setSubmissionStatus('idle');
            return;
        }

        // Combine fields into description for backward compatibility with existing backend schema
        const combinedDescription = `Subject: ${subject}
Department: ${department}
Category: ${category}
Complainant: ${fullName}
Mobile: ${mobile}

Details:
${description}`;

        const formData = new FormData();
        formData.append('user_id', loggedInUser?.id || 'Anonymous');
        formData.append('description', combinedDescription);
        formData.append('image', image);
        if (email.trim()) formData.append('email', email.trim());
        if (location) { formData.append('lat', location.lat); formData.append('lng', location.lng); }

        try {
            const response = await submitComplaint(formData);
            setSubmissionStatus('success');
            setComplaintId(response.complaint_id);
            setRefId(response.ref_id);
            window.scrollTo(0, 0);
        } catch (err) {
            // 409 = duplicate complaint detected
            if (err.response?.status === 409 && err.response?.data?.duplicate) {
                const d = err.response.data;
                setDuplicateInfo({
                    message: d.message,
                    existing_ref_id: d.existing_ref_id,
                    existing_status: d.existing_status,
                    is_resolved: d.is_resolved,
                });
                setSubmissionStatus('duplicate');
                window.scrollTo(0, 0);
            } else {
                setSubmissionStatus('error');
                const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Server error. Please try again.';
                setErrorMsg(errorMessage);
            }
        }
    };

    /* ─── Duplicate Screen ─── */
    if (submissionStatus === 'duplicate' && duplicateInfo) {
        const isResolved = duplicateInfo.is_resolved;
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ backgroundColor: 'white', maxWidth: 540, width: '100%', padding: 40, textAlign: 'center', borderRadius: 24, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}
                >
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: isResolved ? '#dcfce7' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 40 }}>
                        {isResolved ? '✅' : '📋'}
                    </div>

                    <h2 style={{ fontSize: 26, marginBottom: 10, color: '#0f172a' }}>
                        {isResolved ? 'Already Resolved!' : 'Already Registered!'}
                    </h2>

                    <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>
                        {duplicateInfo.message}
                    </p>

                    <div style={{ padding: '20px 24px', background: '#f8fafc', borderRadius: 16, marginBottom: 28, border: `1px solid ${isResolved ? '#bbf7d0' : '#bfdbfe'}` }}>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                            Existing Complaint
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 10, wordBreak: 'break-all' }}>
                            {duplicateInfo.existing_ref_id}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20, background: isResolved ? '#dcfce7' : '#dbeafe', color: isResolved ? '#16a34a' : '#2563eb' }}>
                            {duplicateInfo.existing_status}
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/track" style={{ padding: '12px 24px', backgroundColor: '#0c66e4', color: 'white', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>Track Existing Complaint</Link>
                        <button onClick={() => { setSubmissionStatus('idle'); setDuplicateInfo(null); }} style={{ padding: '12px 24px', backgroundColor: 'white', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>
                            Submit Different Issue
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    /* ─── Success Screen ─── */
    if (submissionStatus === 'success') {
        const displayId = refId || complaintId;
        const idFontSize = displayId.length > 20 ? 18 : displayId.length > 14 ? 22 : 28;

        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ backgroundColor: 'white', maxWidth: 520, width: '100%', padding: 40, textAlign: 'center', borderRadius: 24, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}
                >
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 40 }}>✅</div>
                    <h2 style={{ fontSize: 28, marginBottom: 8, color: '#0f172a' }}>Submitted Successfully</h2>
                    <p style={{ fontSize: 15, color: '#64748b', marginBottom: 32 }}>
                        Your grievance has been securely registered on the CPGRAMS portal and will be routed to the relevant authority.
                        {email && (
                            <span style={{ display: 'block', marginTop: 8, fontWeight: 600, color: '#2563eb' }}>
                                📧 Confirmation sent to {email}
                            </span>
                        )}
                    </p>

                    <div style={{ padding: '20px 24px', background: '#f8fafc', borderRadius: 16, marginBottom: 32, position: 'relative', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 8, letterSpacing: '0.08em' }}>
                            OFFICIAL TRACKING ID
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                            <div style={{ fontSize: idFontSize, fontWeight: 800, color: '#0f172a', letterSpacing: '0.03em', wordBreak: 'break-all', lineHeight: 1.3 }}>{displayId}</div>
                            <button
                                onClick={handleCopy}
                                title="Copy to clipboard"
                                style={{
                                    background: copied ? '#16a34a' : 'white', border: `1.5px solid ${copied ? '#16a34a' : '#cbd5e1'}`,
                                    borderRadius: 10, width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', flexShrink: 0
                                }}
                            >
                                {copied ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                                )}
                            </button>
                        </div>
                        {copied && <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 8 }}>Copied to clipboard!</div>}
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/track" style={{ padding: '12px 24px', backgroundColor: '#0c66e4', color: 'white', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>Track Status</Link>
                        <Link to="/" style={{ padding: '12px 24px', backgroundColor: 'white', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>Back Home</Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: 80 }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
                
                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                        <HelpCircle size={14} />
                        NATIONAL GRIEVANCE ORCHESTRATION PORTAL • CPGRAMS STANDARDIZED FRAMEWORK
                    </div>
                    <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
                        Public Grievance Redressal System
                    </h1>
                    <p style={{ fontSize: 16, color: '#64748b', margin: 0, maxWidth: 800, lineHeight: 1.5 }}>
                        Lodge citizen grievances directly with authoritative Central Ministries, State Secretariats, or Local Municipalities. Receive an official Tracking Number with 30-day statutory resolution time limits and automated nodal escalation.
                    </p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid #e2e8f0', marginBottom: 32 }}>
                    <div style={{ paddingBottom: 16, borderBottom: '3px solid #2563eb', color: '#2563eb', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        1. Lodge a New Grievance
                    </div>
                    <Link to="/track" style={{ paddingBottom: 16, color: '#64748b', fontWeight: 600, fontSize: 16, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                        2. Track Grievance Status
                    </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', gap: 32, flexWrap: 'wrap' }}>
                    
                    {/* Left Column - Form */}
                    <div style={{ flex: '1 1 60%', minWidth: 320 }}>
                        <div style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 32, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                            <form onSubmit={handleSubmit}>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 24 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Complainant Full Legal Name <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input 
                                            type="text" 
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="e.g. Aarav Sharma"
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Mobile Number (for SMS Tracking) <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input 
                                            type="text" 
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            placeholder="98765 43210"
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 24 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Target Department / Ministry <span style={{ color: '#ef4444' }}>*</span></label>
                                        <select 
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', backgroundColor: 'white' }}
                                        >
                                            <option value="">-- Select Authority --</option>
                                            <option value="Municipal Corporation">Municipal Corporation</option>
                                            <option value="Electricity Board">Electricity Board</option>
                                            <option value="Water Supply & Sanitation">Water Supply & Sanitation</option>
                                            <option value="Public Works Department (PWD)">Public Works Department (PWD)</option>
                                            <option value="Ministry of Education">Ministry of Education</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Grievance Category <span style={{ color: '#ef4444' }}>*</span></label>
                                        <select 
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', backgroundColor: 'white' }}
                                        >
                                            <option value="">-- Select Category --</option>
                                            <option value="Service Delay">Service Delay</option>
                                            <option value="Infrastructure Damage">Infrastructure Damage</option>
                                            <option value="Harassment / Misbehavior">Harassment / Misbehavior</option>
                                            <option value="Corruption / Bribe Request">Corruption / Bribe Request</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Grievance Subject / Short Summary <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input 
                                        type="text" 
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="e.g. Delay in scholarship direct benefit transfer for 2025-26 academic term"
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }}
                                    />
                                </div>

                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Detailed Grievance Description <span style={{ color: '#ef4444' }}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Provide specific details: Application acknowledgment numbers, dates of communication, and specific relief requested..."
                                            maxLength={500}
                                            style={{ width: '100%', padding: '16px', paddingRight: '50px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', minHeight: '120px', resize: 'vertical', fontFamily: 'inherit' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={startListening}
                                            title="Use Voice Input"
                                            style={{
                                                position: 'absolute', bottom: 16, right: 16,
                                                background: isListening ? '#ef4444' : '#f1f5f9',
                                                color: isListening ? 'white' : '#64748b',
                                                border: 'none', borderRadius: '50%', width: 36, height: 36,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Mic size={18} />
                                        </button>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                                        {description.length}/500
                                    </div>
                                </div>

                                {/* Maintained Existing Functional Fields (Location & Photo) */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 24, padding: 16, backgroundColor: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                                    
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Photo Evidence <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input type="file" accept="image/*" onChange={handleImageChange} id="complaint-image" style={{ display: 'none' }} />
                                        <label htmlFor="complaint-image" style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            width: '100%', height: 120, border: `2px dashed ${imagePreview ? '#10b981' : '#cbd5e1'}`,
                                            borderRadius: 10, cursor: 'pointer', background: imagePreview ? '#ecfdf5' : 'white',
                                            overflow: 'hidden', position: 'relative'
                                        }}>
                                            {imagePreview ? (
                                                <>
                                                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    {location && (
                                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0, 0, 0, 0.6)', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <MapPin size={12} color="#10b981" />
                                                            <span style={{ fontSize: 10, color: 'white', fontWeight: 600 }}>Geo-tagged: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <Camera size={24} color="#94a3b8" style={{ marginBottom: 8 }} />
                                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Click to upload photo</span>
                                                </>
                                            )}
                                        </label>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Incident Location <span style={{ color: '#ef4444' }}>*</span></label>
                                        <div style={{ height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: location ? '#ecfdf5' : 'white', border: `1px solid ${location ? '#10b981' : '#cbd5e1'}`, borderRadius: 10 }}>
                                            {location ? (
                                                <div style={{ textAlign: 'center' }}>
                                                    <MapPin size={24} color="#10b981" style={{ marginBottom: 8, margin: '0 auto' }} />
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', display: 'block' }}>Location Captured</span>
                                                </div>
                                            ) : (
                                                <button type="button" onClick={getLocation} disabled={locationStatus === 'loading'} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <MapPin size={24} color="#94a3b8" style={{ marginBottom: 8 }} />
                                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{locationStatus === 'loading' ? 'Detecting...' : 'Detect GPS Location'}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, backgroundColor: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', marginBottom: 24 }}>
                                    <ShieldCheck size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                                    <p style={{ margin: 0, fontSize: 13, color: '#15803d', lineHeight: 1.5 }}>
                                        Your grievance is protected under the <strong>DPDP Act 2023</strong> and registered on the unified CPGRAMS / State public grievance monitoring architecture.
                                    </p>
                                </div>

                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={declaration} onChange={(e) => setDeclaration(e.target.checked)} style={{ marginTop: 3, accentColor: '#2563eb' }} />
                                        <span style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                                            I declare that the information provided is accurate. Submitting false complaints is a punishable offense.
                                        </span>
                                    </label>
                                </div>

                                {errorMsg && (
                                    <div style={{ padding: '12px 16px', borderRadius: 10, backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
                                        ⚠️ {errorMsg}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submissionStatus === 'loading'}
                                    style={{
                                        width: '100%', padding: '16px', borderRadius: 12, backgroundColor: '#0c66e4', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, opacity: submissionStatus === 'loading' ? 0.7 : 1
                                    }}
                                >
                                    <Send size={18} />
                                    {submissionStatus === 'loading' ? 'Processing...' : 'Submit Grievance & Get Tracking ID'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column - Info Cards */}
                    <div style={{ flex: '1 1 30%', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 24 }}>
                        
                        {/* Statutory Time Limits Card */}
                        <div style={{ backgroundColor: '#0f172a', borderRadius: 16, padding: 24, color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <Clock size={20} color="#fde047" />
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Statutory Time Limits</h3>
                            </div>
                            <p style={{ margin: 0, fontSize: 14, color: '#cbd5e1', lineHeight: 1.6 }}>
                                Under national citizen charter guidelines, every government department must acknowledge receipt within <strong>48 hours</strong> and resolve or provide a reasoned action report within <strong style={{ color: 'white' }}>30 days</strong>.
                            </p>
                        </div>

                        {/* Escalation Protocol Card */}
                        <div style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                                <TrendingUp size={20} color="#3b82f6" />
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Escalation Protocol</h3>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', minWidth: 50 }}>Stage 1:</div>
                                    <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.5 }}>
                                        Assigned to Department Public Grievance Officer (PGO).
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', minWidth: 50 }}>Stage 2:</div>
                                    <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.5 }}>
                                        In case of non-resolution in 30 days, auto-escalates to Joint Secretary / Appellate Authority.
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', minWidth: 50 }}>Stage 3:</div>
                                    <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.5 }}>
                                        Review by DARPG / Prime Minister's Office (PMO) grievance wing.
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterComplaint;
