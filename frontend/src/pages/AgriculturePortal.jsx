import React, { useState } from 'react';
import { Link2, CloudRain, CreditCard, Fish, Sprout, Building2, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AgriculturePortal = () => {
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Crops', 'Insurance', 'Credit', 'Dairy & Fisheries'];

    const schemes = [
        {
            id: 1,
            category: 'Agriculture',
            tier: 'CENTRAL',
            status: 'Live Integration',
            name: 'PM-KISAN Samman Nidhi (Direct Farmer Income Support ₹6,000/yr)',
            ministry: 'Ministry of Agriculture & Farmers Welfare • Department...',
            description: 'Direct financial assistance of ₹6,000 per year transferred in three equal installments of ₹2,000 directly into the bank...',
            eligibility: 'Real-time Check',
            documents: '3 Proofs',
            tag: 'Crops'
        },
        {
            id: 2,
            category: 'Agriculture',
            tier: 'CENTRAL',
            status: 'Live Integration',
            name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY Crop Insurance)',
            ministry: 'Ministry of Agriculture & Farmers Welfare • Department...',
            description: 'Comprehensive crop insurance protection against non-preventable natural calamities, drought, floods, pest attack...',
            eligibility: 'Real-time Check',
            documents: '4 Proofs',
            tag: 'Insurance'
        },
        {
            id: 3,
            category: 'Agriculture',
            tier: 'CENTRAL',
            status: 'Live Integration',
            name: 'Kisan Credit Card (KCC) Subsidized Agricultural Credit',
            ministry: 'Ministry of Agriculture & Farmers Welfare • Department...',
            description: 'Concessional crop loans up to ₹3 Lakhs at an effective 4% interest rate (with timely repayment prompt interest...',
            eligibility: 'Real-time Check',
            documents: '4 Proofs',
            tag: 'Credit'
        }
    ];

    const filteredSchemes = schemes.filter(s => activeFilter === 'All' || s.tag === activeFilter);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: 80 }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
                
                {/* Header */}
                <div style={{ marginBottom: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                        <Sprout size={16} />
                        KISAN ORCHESTRATION HUB • INTEGRATED AGRI-DIGITAL ECOSYSTEM
                    </div>
                    <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
                        Agriculture & Farmers Service Portal
                    </h1>
                    <p style={{ fontSize: 16, color: '#64748b', margin: 0, maxWidth: 800, lineHeight: 1.5 }}>
                        Comprehensive access to national and state agricultural schemes: PM-KISAN direct income support, PMFBY crop insurance, Kisan Credit Cards, soil health testing, micro-irrigation, and dairy & fisheries grants.
                    </p>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <Link2 size={20} />
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>PM-KISAN INCOME</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#14532d', marginBottom: 12 }}>₹6,000 / Year</div>
                        <p style={{ fontSize: 13, color: '#15803d', margin: 0, lineHeight: 1.4 }}>3 equal DBT installments of ₹2,000 directly to bank account</p>
                    </div>

                    <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <CloudRain size={20} />
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>PMFBY CROP INSURANCE</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#1e3a8a', marginBottom: 12 }}>1.5% - 2% Premium</div>
                        <p style={{ fontSize: 13, color: '#1d4ed8', margin: 0, lineHeight: 1.4 }}>Subsidized comprehensive risk coverage from sowing to post-harvest</p>
                    </div>

                    <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <CreditCard size={20} />
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>KISAN CREDIT CARD (KCC)</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#78350f', marginBottom: 12 }}>4% Interest Rate</div>
                        <p style={{ fontSize: 13, color: '#b45309', margin: 0, lineHeight: 1.4 }}>Collateral-free credit up to ₹3 Lakhs with prompt repayment subvention</p>
                    </div>

                    <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <Fish size={20} />
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#9333ea', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>FISHERIES & DAIRY</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#4c1d95', marginBottom: 12 }}>Up to 60% Subsidy</div>
                        <p style={{ fontSize: 13, color: '#7e22ce', margin: 0, lineHeight: 1.4 }}>PM Matsya Sampada Yojana & National Livestock Mission grants</p>
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
                                border: '1px solid', borderColor: activeFilter === filter ? '#16a34a' : '#e2e8f0',
                                backgroundColor: activeFilter === filter ? '#16a34a' : 'white',
                                color: activeFilter === filter ? 'white' : '#64748b',
                                transition: 'all 0.2s', boxShadow: activeFilter === filter ? '0 4px 12px rgba(22, 163, 74, 0.2)' : 'none'
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
                            onMouseOver={e => { e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05)'; e.currentTarget.style.borderColor = '#93c5fd'; }}
                            onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                        >
                            <div style={{ padding: 24, flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#0ea5e9' }}>
                                        <Sprout size={14} /> {scheme.category}
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
                                            <FileText size={16} color="#64748b" /> {scheme.documents}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <button style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                                    Check Eligibility
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

export default AgriculturePortal;
