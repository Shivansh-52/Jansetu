import React, { useState } from 'react';
import { HeartPulse, Activity, Stethoscope, Pill, ShieldCheck, Building2, CheckCircle2, ArrowRight, ActivitySquare } from 'lucide-react';
import { motion } from 'framer-motion';

const HealthcarePortal = () => {
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Insurance', 'Health ID', 'Telemedicine', 'Pharmacy'];

    const schemes = [
        {
            id: 1,
            category: 'Insurance',
            tier: 'CENTRAL',
            status: 'Live Integration',
            name: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
            ministry: 'National Health Authority (NHA) • Ministry of Health',
            description: 'World\'s largest health insurance/assurance scheme fully financed by the government. Provides a cover of Rs. 5 lakhs per family per year for secondary and tertiary care hospitalization.',
            eligibility: 'Real-time SECC Check',
            documents: 'Aadhaar / Ration Card',
            tag: 'Insurance'
        },
        {
            id: 2,
            category: 'Digital Health',
            tier: 'CENTRAL',
            status: 'Live Integration',
            name: 'Ayushman Bharat Health Account (ABHA ID)',
            ministry: 'National Health Authority (NHA)',
            description: 'Create a 14-digit unique health identifier to securely store, manage, and share your medical records digitally with hospitals, clinics, and insurance providers.',
            eligibility: 'Instant Generation',
            documents: 'Aadhaar / Mobile',
            tag: 'Health ID'
        },
        {
            id: 3,
            category: 'Telemedicine',
            tier: 'CENTRAL',
            status: 'Active',
            name: 'eSanjeevani National Teleconsultation Service',
            ministry: 'Ministry of Health and Family Welfare',
            description: 'Free online OPD consultations with specialized doctors from the comfort of your home. Video consultation and digital prescription provided.',
            eligibility: 'All Citizens',
            documents: 'No Documents Required',
            tag: 'Telemedicine'
        },
        {
            id: 4,
            category: 'Pharmacy',
            tier: 'CENTRAL',
            status: 'Live Directory',
            name: 'Pradhan Mantri Bhartiya Janaushadhi Pariyojana',
            ministry: 'Department of Pharmaceuticals',
            description: 'Access quality generic medicines at affordable prices (50-90% cheaper than branded drugs) through dedicated Janaushadhi Kendras across the country.',
            eligibility: 'Open to All',
            documents: 'Valid Prescription',
            tag: 'Pharmacy'
        }
    ];

    const filteredSchemes = schemes.filter(s => activeFilter === 'All' || s.tag === activeFilter);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: 80 }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
                
                {/* Header */}
                <div style={{ marginBottom: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                        <HeartPulse size={16} />
                        SANJEEVANI • NATIONAL DIGITAL HEALTH MISSION
                    </div>
                    <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
                        Healthcare & Wellness Portal
                    </h1>
                    <p style={{ fontSize: 16, color: '#64748b', margin: 0, maxWidth: 800, lineHeight: 1.5 }}>
                        Comprehensive access to Ayushman Bharat (PM-JAY), ABHA Health ID generation, Tele-consultation, and Digital Clinic services. Manage your health records securely.
                    </p>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
                    
                    <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#ffe4e6', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <ShieldCheck size={20} />
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>PM-JAY INSURANCE</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#881337', marginBottom: 12 }}>₹5 Lakh / Year</div>
                        <p style={{ fontSize: 13, color: '#be123c', margin: 0, lineHeight: 1.4 }}>Cashless secondary & tertiary care hospitalization cover</p>
                    </div>

                    <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#ccfbf1', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <ActivitySquare size={20} />
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>ABHA HEALTH ID</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#134e4a', marginBottom: 12 }}>14-Digit Core ID</div>
                        <p style={{ fontSize: 13, color: '#0f766e', margin: 0, lineHeight: 1.4 }}>Unified digital health record management ecosystem</p>
                    </div>

                    <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <Stethoscope size={20} />
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>eSANJEEVANI OPD</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#1e3a8a', marginBottom: 12 }}>Free Consults</div>
                        <p style={{ fontSize: 13, color: '#1d4ed8', margin: 0, lineHeight: 1.4 }}>Live video tele-consultation with specialist doctors</p>
                    </div>

                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <Pill size={20} />
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>JAN AUSHADHI</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#14532d', marginBottom: 12 }}>50-90% Discount</div>
                        <p style={{ fontSize: 13, color: '#15803d', margin: 0, lineHeight: 1.4 }}>Affordable generic medicines via certified kendras</p>
                    </div>

                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
                    {filters.map(filter => (
                        <button 
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            style={{ 
                                padding: '10px 24px', borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                                border: '1px solid', borderColor: activeFilter === filter ? '#0d9488' : '#e2e8f0',
                                backgroundColor: activeFilter === filter ? '#0d9488' : 'white',
                                color: activeFilter === filter ? 'white' : '#64748b',
                                transition: 'all 0.2s', boxShadow: activeFilter === filter ? '0 4px 12px rgba(13, 148, 136, 0.2)' : 'none'
                            }}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
                    {filteredSchemes.map(scheme => (
                        <motion.div 
                            key={scheme.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s', cursor: 'pointer' }}
                            onMouseOver={e => { e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05)'; e.currentTarget.style.borderColor = '#5eead4'; }}
                            onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                        >
                            <div style={{ padding: 24, flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#e11d48' }}>
                                        <Activity size={14} /> {scheme.category}
                                    </span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: 12, padding: '2px 8px' }}>
                                        {scheme.tier}
                                    </span>
                                    <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#10b981', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                                        {scheme.status}
                                    </span>
                                </div>

                                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0', lineHeight: 1.3 }}>{scheme.name}</h2>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                                    <Building2 size={14} /> {scheme.ministry}
                                </div>

                                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, margin: '0 0 24px 0' }}>
                                    {scheme.description}
                                </p>

                                <div style={{ display: 'flex', gap: 12 }}>
                                    <div style={{ flex: 1, backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: '12px 16px' }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>ELIGIBILITY</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#10b981' }}>
                                            <CheckCircle2 size={16} /> {scheme.eligibility}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: '12px 16px' }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>DOCUMENTS</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                                            <ShieldCheck size={16} color="#64748b" /> {scheme.documents}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <button style={{ background: 'none', border: 'none', color: '#0d9488', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                                    Apply / Register
                                </button>
                                <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                                    Details <ArrowRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HealthcarePortal;
