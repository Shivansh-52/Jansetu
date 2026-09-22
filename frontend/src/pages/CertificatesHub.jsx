import React, { useState } from 'react';
import { Search, MapPin, Building2, CheckCircle2, ArrowRight, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const CertificatesHub = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedState, setSelectedState] = useState('Karnataka');

    const states = ['Andhra Pradesh', 'Delhi', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Uttar Pradesh'];

    const certificates = [
        {
            id: 1,
            category: 'VITAL STATISTICS',
            domain: 'Municipal / Health',
            name: 'Birth Certificate',
            issuingBody: 'Municipal Corporation / Town Panchayat / Village Health Sub-Centre',
            proofs: [
                'Hospital Birth Discharge Summary / Form-1',
                'Parents Aadhaar Cards',
                'Marriage Registration Certificate'
            ],
            timeline: '3 - 7 working days'
        },
        {
            id: 2,
            category: 'VITAL STATISTICS',
            domain: 'Municipal / Health',
            name: 'Death Certificate',
            issuingBody: 'Municipal Health Officer / Registrar of Births and Deaths',
            proofs: [
                'Hospital Cause of Death Medical Certificate',
                'Cremation / Burial Ground Receipt',
                'Deceased Aadhaar Card'
            ],
            timeline: '3 - 5 working days'
        },
        {
            id: 3,
            category: 'LEGAL & FAMILY',
            domain: 'State Revenue',
            name: 'Marriage Registration Certificate',
            issuingBody: 'Sub-Registrar Office / District Marriage Officer',
            proofs: [
                'Wedding Invitation Card / Temple Receipt',
                'Joint Photograph of Couple',
                'Age Proof of Bride & Groom'
            ],
            timeline: '15 - 30 working days'
        },
        {
            id: 4,
            category: 'REVENUE & FINANCE',
            domain: 'State Revenue',
            name: 'Income & Asset Certificate',
            issuingBody: 'Tehsildar / Revenue Department',
            proofs: [
                'Salary Slips / ITR / Form 16',
                'Ration Card / Address Proof',
                'Aadhaar Card'
            ],
            timeline: '10 - 15 working days'
        }
    ];

    const filteredCertificates = certificates.filter(cert => 
        cert.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        cert.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: 80 }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
                
                {/* Header Section */}
                <div style={{ marginBottom: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                        <FileText size={14} />
                        STATUTORY CERTIFICATES REGISTRY • AUTHORITATIVE DEPARTMENT ROUTING
                    </div>
                    <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
                        Government Certificates & Statutory Records
                    </h1>
                    <p style={{ fontSize: 16, color: '#64748b', margin: 0, maxWidth: 800, lineHeight: 1.5 }}>
                        Samadhan Path automatically maps your resident location to the authoritative issuing officer (Tehsildar, Municipal Registrar, District Medical Board, or Police Commissionerate) and orchestrates digital proofs.
                    </p>
                </div>

                {/* Router Card */}
                <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '20px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24, marginBottom: 32, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Issuing Jurisdiction Router</h3>
                            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Authority rules and digital fee structures adapt dynamically based on your state.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Your State:</span>
                        <select 
                            value={selectedState} 
                            onChange={(e) => setSelectedState(e.target.value)}
                            style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, fontWeight: 600, color: '#0f172a', outline: 'none', backgroundColor: '#f8fafc', cursor: 'pointer', minWidth: 160 }}
                        >
                            {states.map(state => <option key={state} value={state}>{state}</option>)}
                        </select>
                    </div>
                </div>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: 32 }}>
                    <div style={{ position: 'absolute', top: '50%', left: 20, transform: 'translateY(-50%)', color: '#94a3b8' }}>
                        <Search size={20} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search certificates (e.g. Birth, Income, Caste, Domicile, Disability, Solvency)..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '18px 24px 18px 52px', borderRadius: 16, border: '1px solid #e2e8f0', fontSize: 15, outline: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}
                    />
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 24 }}>
                    {filteredCertificates.map(cert => (
                        <motion.div 
                            key={cert.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, transition: 'box-shadow 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05)'}
                            onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {cert.category}
                                </span>
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', border: '1px solid #34d399', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: 12 }}>
                                    {cert.domain}
                                </span>
                            </div>
                            
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0' }}>{cert.name}</h2>

                            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                    AUTHORITATIVE ISSUING BODY IN {selectedState.toUpperCase()}:
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, fontWeight: 600, color: '#1e40af', lineHeight: 1.4 }}>
                                    <Building2 size={16} color="#3b82f6" style={{ flexShrink: 0, marginTop: 2 }} />
                                    {cert.issuingBody}
                                </div>
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                                    MANDATORY REQUIRED PROOFS:
                                </div>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {cert.proofs.map((proof, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#334155', lineHeight: 1.4 }}>
                                            <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
                                            {proof}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Expected Timeline:</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{cert.timeline}</div>
                                </div>
                                <button style={{ backgroundColor: '#0c66e4', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    Apply with Auto-fill <ArrowRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CertificatesHub;
