import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, GraduationCap, Building, HeartPulse, Wheat, FileText, Briefcase, Landmark, Truck, Users, Activity, CheckCircle2 } from 'lucide-react';

const CATEGORY_ICONS = {
    'Education': <GraduationCap size={16} />,
    'Identity & Certificates': <FileText size={16} />,
    'Housing': <Building size={16} />,
    'Agriculture': <Wheat size={16} />,
    'Healthcare': <HeartPulse size={16} />,
    'Employment': <Briefcase size={16} />,
    'Financial Assistance': <Landmark size={16} />,
    'Transport': <Truck size={16} />,
    'Social Welfare': <Users size={16} />
};

const ALL_SERVICES = [
    { 
        id: 'edu-01', title: 'PM Post-Matric Scholarship for Higher Education', category: 'Education', level: 'CENTRAL', 
        integration: 'Live Integration', match: 94, ministry: 'Ministry of Education • Department of Higher Education',
        desc: 'Financial assistance for meritorious students belonging to marginalized or lower-income households pursuing post-matriculation studies.',
        eligibility: 'Real-time Check', docs: '5 Proofs', path: '/education/scholarship'
    },
    { 
        id: 'edu-02', title: 'Central Sector Scheme of Scholarships for College and University Students', category: 'Education', level: 'CENTRAL', 
        integration: 'Live Integration', match: 89, ministry: 'Ministry of Education • Department of Higher Education',
        desc: 'Direct scholarship grant of ₹12,000 to ₹20,000 annually for top 20th percentile board examination rankers from lower income families.',
        eligibility: 'Real-time Check', docs: '5 Proofs', path: '/domain-education'
    },
    { 
        id: 'edu-03', title: 'Vidya Lakshmi Education Loan Scheme (Govt. Interest Subsidy CSIS)', category: 'Education', level: 'CENTRAL', 
        integration: 'Sandbox', match: 85, ministry: 'Ministry of Education • Department of Higher Education',
        desc: 'Full interest subsidy during the moratorium period (course + 1 year) on educational loans up to ₹7.5 Lakhs for students with weak economic backgrounds.',
        eligibility: 'Real-time Check', docs: '4 Proofs', path: '/education/loan'
    },
    { 
        id: 'emp-01', title: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0 Certification)', category: 'Employment', level: 'CENTRAL', 
        integration: 'Sandbox', match: 91, ministry: 'Ministry of Skill Development & Entrepreneurship • NSDC',
        desc: 'Free industry-aligned short-term skill training, assessment, and certification to help youth secure better livelihoods.',
        eligibility: 'Manual Check', docs: '3 Proofs', path: '/services'
    },
    { 
        id: 'soc-01', title: 'e-Shram National Database for Unorganised Workers (UAN Card)', category: 'Social Welfare', level: 'CENTRAL', 
        integration: 'Live Integration', match: 95, ministry: 'Ministry of Labour & Employment • Govt of India',
        desc: 'Universal digital identity card for unorganized workers with ₹2 Lakh accidental insurance cover and direct benefit transfers.',
        eligibility: 'Real-time Check', docs: '2 Proofs', path: '/services'
    },
    { 
        id: 'emp-02', title: 'National Career Service (NCS) Job Seeker Registration', category: 'Employment', level: 'CENTRAL', 
        integration: 'Live Integration', match: 92, ministry: 'Ministry of Labour & Employment • DGE',
        desc: 'Free pan-India portal connecting job seekers with verified employers, offering career counseling and skill building courses.',
        eligibility: 'Real-time Check', docs: '1 Proof', path: '/services'
    },
    { 
        id: 'hlth-01', title: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)', category: 'Healthcare', level: 'CENTRAL', 
        integration: 'Live Integration', match: 98, ministry: 'Ministry of Health & Family Welfare • NHA',
        desc: 'Health insurance cover of ₹5 lakhs per family per year for secondary and tertiary care hospitalization across public and private empaneled hospitals.',
        eligibility: 'Real-time Check', docs: '3 Proofs', path: '/healthcare/apply'
    },
    { 
        id: 'agr-01', title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)', category: 'Agriculture', level: 'CENTRAL', 
        integration: 'Live Integration', match: 96, ministry: 'Ministry of Agriculture & Farmers Welfare',
        desc: 'Income support of ₹6,000 per year in three equal installments to all land-holding farmer families.',
        eligibility: 'Real-time Check', docs: '4 Proofs', path: '/agriculture/apply'
    },
    { 
        id: 'cert-01', title: 'Standard Income Certificate Issuance', category: 'Identity & Certificates', level: 'STATE', 
        integration: 'Live Integration', match: 99, ministry: 'State Revenue Department • General Administration',
        desc: 'Official certification of annual family income from all sources, essential for EWS reservations and fee waivers.',
        eligibility: 'Real-time Check', docs: '3 Proofs', path: '/domain-public-services'
    },
];

const CATEGORIES = ['All', 'Education', 'Identity & Certificates', 'Housing', 'Agriculture', 'Healthcare', 'Employment', 'Financial Assistance', 'Business & MSME', 'Transport', 'Social Welfare'];
const LEVELS = ['All', 'Central', 'State', 'Local'];

const ServicesDirectory = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeLevel, setActiveLevel] = useState('All');
    const [onlineOnly, setOnlineOnly] = useState(false);

    const filteredServices = ALL_SERVICES.filter(srv => {
        const matchesSearch = search === '' || 
            srv.title.toLowerCase().includes(search.toLowerCase()) || 
            srv.ministry.toLowerCase().includes(search.toLowerCase());
        const matchesCat = activeCategory === 'All' || srv.category === activeCategory;
        const matchesLevel = activeLevel === 'All' || srv.level.toLowerCase() === activeLevel.toLowerCase();
        // Mocking online only logic (all in list are online for now)
        return matchesSearch && matchesCat && matchesLevel;
    });

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', paddingBottom: 80 }}>
            {/* Header Area */}
            <div style={{ backgroundColor: '#ffffff', paddingTop: 60, paddingBottom: 30 }}>
                <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Unified Service Registry
                        </span>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#cbd5e1' }}></span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            {ALL_SERVICES.length} Total Services
                        </span>
                    </div>
                    
                    <h1 style={{ fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
                        Government Digital Services
                    </h1>
                    
                    <p style={{ fontSize: 16, color: '#64748b', maxWidth: 700, margin: '0 0 40px 0', lineHeight: 1.5 }}>
                        Discover centralized, state, and local services with standardized eligibility rules and automated document orchestration.
                    </p>

                    {/* Filters Container */}
                    <div style={{ 
                        backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', 
                        padding: 24, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                    }}>
                        {/* Top Filter Row */}
                        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
                            {/* Search */}
                            <div style={{ 
                                flex: '1 1 400px', display: 'flex', alignItems: 'center', gap: 12, 
                                backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 16px'
                            }}>
                                <Search size={18} color="#94a3b8" />
                                <input 
                                    type="text" 
                                    placeholder="Search by service name, department, or keyword (e.g. scholarship, income, housing)..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 15, color: '#334155' }}
                                />
                            </div>

                            {/* Level Filters */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>Level:</span>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    {LEVELS.map(lvl => (
                                        <button 
                                            key={lvl}
                                            onClick={() => setActiveLevel(lvl)}
                                            style={{
                                                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                                backgroundColor: activeLevel === lvl ? '#1d4ed8' : '#f1f5f9',
                                                color: activeLevel === lvl ? 'white' : '#475569',
                                                border: 'none', transition: 'all 0.2s'
                                            }}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Online Only */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, borderLeft: '1px solid #e2e8f0' }}>
                                <input 
                                    type="checkbox" 
                                    id="online-only" 
                                    checked={onlineOnly}
                                    onChange={(e) => setOnlineOnly(e.target.checked)}
                                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                                />
                                <label htmlFor="online-only" style={{ fontSize: 14, color: '#475569', fontWeight: 500, cursor: 'pointer' }}>
                                    100% Online Only
                                </label>
                            </div>
                        </div>

                        {/* Bottom Filter Row (Categories) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
                            <span style={{ fontSize: 14, color: '#64748b', fontWeight: 500, flexShrink: 0 }}>Category:</span>
                            {CATEGORIES.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    style={{
                                        padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                        backgroundColor: activeCategory === cat ? '#0f172a' : 'transparent',
                                        color: activeCategory === cat ? 'white' : '#475569',
                                        border: `1px solid ${activeCategory === cat ? '#0f172a' : '#e2e8f0'}`,
                                        transition: 'all 0.2s', whiteSpace: 'nowrap',
                                        display: 'flex', alignItems: 'center', gap: 6
                                    }}
                                >
                                    {cat !== 'All' && CATEGORY_ICONS[cat]}
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Area */}
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', paddingTop: 24 }}>
                <div style={{ marginBottom: 24, fontSize: 14, color: '#64748b' }}>
                    Showing <strong style={{ color: '#0f172a' }}>{filteredServices.length}</strong> services
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 24 }}>
                    {filteredServices.map((srv, i) => (
                        <motion.div 
                            key={srv.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            style={{ 
                                backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', 
                                padding: 24, display: 'flex', flexDirection: 'column',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', transition: 'box-shadow 0.2s',
                                cursor: 'default'
                            }}
                            onMouseOver={e => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}
                            onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'}
                        >
                            {/* Card Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {CATEGORY_ICONS[srv.category]}
                                    </div>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{srv.category}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    <span style={{ fontSize: 10, fontWeight: 800, color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: 4, letterSpacing: '0.05em' }}>
                                        {srv.level}
                                    </span>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: srv.integration === 'Live Integration' ? '#059669' : '#0284c7', backgroundColor: srv.integration === 'Live Integration' ? '#d1fae5' : '#e0f2fe', padding: '4px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: srv.integration === 'Live Integration' ? '#10b981' : '#0ea5e9' }}></div>
                                        {srv.integration}
                                    </span>
                                </div>
                            </div>

                            {/* Card Match Badge */}
                            <div style={{ alignSelf: 'flex-end', marginBottom: 12 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#9a3412', backgroundColor: '#ffedd5', padding: '4px 10px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Activity size={12} /> {srv.match}% Match
                                </span>
                            </div>

                            {/* Title & Ministry */}
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                                {srv.title}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 12, marginBottom: 16 }}>
                                <Building size={14} />
                                {srv.ministry}
                            </div>

                            {/* Description */}
                            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, margin: '0 0 20px 0', flex: 1 }}>
                                {srv.desc}
                            </p>

                            {/* Metrics Row */}
                            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                                <div style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: 8, padding: '10px 12px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Eligibility</div>
                                    <div style={{ fontSize: 13, color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <CheckCircle2 size={14} /> {srv.eligibility}
                                    </div>
                                </div>
                                <div style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: 8, padding: '10px 12px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Documents</div>
                                    <div style={{ fontSize: 13, color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <FileText size={14} /> {srv.docs}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                                <button 
                                    onClick={() => navigate(srv.path)}
                                    style={{ 
                                        flex: 2, padding: '10px 0', backgroundColor: 'transparent', color: '#2563eb', 
                                        border: '1px solid #bfdbfe', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#eff6ff'}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    Check Eligibility
                                </button>
                                <button 
                                    onClick={() => navigate(srv.path)}
                                    style={{ 
                                        flex: 1, padding: '10px 0', backgroundColor: '#f1f5f9', color: '#475569', 
                                        border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                >
                                    Details <span style={{ fontSize: 16 }}>→</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    
                    {filteredServices.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                            <h3 style={{ fontSize: 18, color: '#0f172a', margin: '0 0 8px 0' }}>No services found</h3>
                            <p style={{ color: '#64748b' }}>Try adjusting your search terms or filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServicesDirectory;
