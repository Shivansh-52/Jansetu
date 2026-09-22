import React, { useState } from 'react';
import { Search, Building2, ExternalLink, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Departments = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTier, setActiveTier] = useState('All');
    const [activeDomain, setActiveDomain] = useState('All');

    const tiers = ['All', 'Central', 'State', 'District', 'Municipal'];
    const domains = ['All', 'Education', 'Financial Assistance', 'Employment', 'Social Welfare', 'Healthcare', 'Agriculture', 'Housing', 'Municipal Services', 'Identity & Certificates', 'Business'];

    const departments = [
        {
            id: 1,
            tier: 'Central',
            tierLabel: 'CENTRAL GOVERNMENT',
            status: 'Live Integration',
            name: 'Department of Higher Education',
            ministry: 'Ministry of Education',
            description: 'Oversees collegiate institutions, national scholarships, student welfare grants, and higher education portals.',
            servicesCatalogued: '9 Services',
            jurisdiction: 'All-India',
            domain: 'Education',
            keyServices: [
                'PM Post-Matric Scholarship for Higher Education',
                'Central Sector Scheme of Scholarships for College &..',
                'National Means-cum-Merit Scholarship'
            ]
        },
        {
            id: 2,
            tier: 'Central',
            tierLabel: 'CENTRAL GOVERNMENT',
            status: 'Sandbox',
            name: 'Ministry of Skill Development & Entrepreneurship',
            ministry: 'Ministry of Skill Development & Entrepreneurship',
            description: 'Coordinates national skill training missions, apprenticeships, PMKVY certification, and rural youth empowerment schemes.',
            servicesCatalogued: '6 Services',
            jurisdiction: 'All-India',
            domain: 'Employment',
            keyServices: [
                'Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)',
                'National Apprenticeship Promotion Scheme (NAPS)',
                'Skill India Digital Hub Certificate Verification'
            ]
        },
        {
            id: 3,
            tier: 'Central',
            tierLabel: 'CENTRAL GOVERNMENT',
            status: 'Live Integration',
            name: 'Ministry of Labour & Employment',
            ministry: 'Ministry of Labour & Employment',
            description: 'Manages worker welfare, unorganized sector registration (e-Shram), employment exchanges, and ESIC benefits.',
            servicesCatalogued: '8 Services',
            jurisdiction: 'All-India',
            domain: 'Employment',
            keyServices: [
                'e-Shram Universal Social Security Card',
                'National Career Service (NCS) Job Seeker Registration',
                'Pradhan Mantri Shram Yogi Maandhan (PM-SYM Pension)'
            ]
        }
    ];

    const filteredDepartments = departments.filter(dept => {
        const matchesTier = activeTier === 'All' || dept.tier === activeTier;
        const matchesDomain = activeDomain === 'All' || dept.domain === activeDomain;
        const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase()) || dept.ministry.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTier && matchesDomain && matchesSearch;
    });

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: 80 }}>
            {/* Minimal Header (if not using App Navbar, but assuming we have one, we can still add a specific page header) */}
            
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
                {/* Header Section */}
                <div style={{ marginBottom: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                        <Landmark size={14} />
                        GOVERNMENT OF INDIA • UNIFIED DEPARTMENT DIRECTORY • 35 AUTHORITIES CATALOGUED
                    </div>
                    <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
                        Government Departments & Agencies
                    </h1>
                    <p style={{ fontSize: 16, color: '#64748b', margin: 0, maxWidth: 800, lineHeight: 1.5 }}>
                        Explore authoritative Central Ministries, State Secretariats, District Collectorates, and Local Municipal Corporations orchestrating digital services across India.
                    </p>
                </div>

                {/* Filters Section */}
                <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: 16, marginBottom: 32, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                    
                    {/* Search & Tier */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16, alignItems: 'center' }}>
                        <div style={{ flex: '1 1 400px', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '50%', left: 16, transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                <Search size={18} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search by department name, ministry, or service domain (e.g. Education, Finance, Agriculture)..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', backgroundColor: '#f8fafc' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Tier:</span>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {tiers.map(tier => (
                                    <button 
                                        key={tier}
                                        onClick={() => setActiveTier(tier)}
                                        style={{ 
                                            padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                                            backgroundColor: activeTier === tier ? '#0ea5e9' : '#f1f5f9',
                                            color: activeTier === tier ? 'white' : '#475569',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {tier}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ height: 1, backgroundColor: '#f1f5f9', margin: '16px 0' }} />

                    {/* Domain Pills */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b', flexShrink: 0 }}>DOMAIN:</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {domains.map(domain => (
                                <button 
                                    key={domain}
                                    onClick={() => setActiveDomain(domain)}
                                    style={{ 
                                        padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid', whiteSpace: 'nowrap',
                                        borderColor: activeDomain === domain ? '#bfdbfe' : '#e2e8f0',
                                        backgroundColor: activeDomain === domain ? '#eff6ff' : 'white',
                                        color: activeDomain === domain ? '#1d4ed8' : '#64748b',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {domain}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
                    {filteredDepartments.map(dept => (
                        <motion.div 
                            key={dept.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s', cursor: 'pointer' }}
                            onMouseOver={e => e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05)'}
                            onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                        >
                            <div style={{ padding: 24, flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: 12, border: '1px solid #bfdbfe' }}>
                                        {dept.tierLabel}
                                    </span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: dept.status === 'Live Integration' ? '#10b981' : '#0ea5e9', backgroundColor: dept.status === 'Live Integration' ? '#ecfdf5' : '#e0f2fe', padding: '4px 10px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 4, border: `1px solid ${dept.status === 'Live Integration' ? '#a7f3d0' : '#bae6fd'}` }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: dept.status === 'Live Integration' ? '#10b981' : '#0ea5e9' }}></div>
                                        {dept.status}
                                    </span>
                                </div>
                                
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.3 }}>{dept.name}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 13, marginBottom: 16 }}>
                                    <Building2 size={14} /> {dept.ministry}
                                </div>
                                
                                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 24px 0' }}>
                                    {dept.description}
                                </p>

                                <div style={{ display: 'flex', gap: 12, backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: 12, border: '1px solid #f1f5f9', marginBottom: 24 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>SERVICES CATALOGUED</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                                            <ShieldCheck size={16} color="#3b82f6" /> {dept.servicesCatalogued}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>JURISDICTION</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#10b981' }}>
                                            <CheckCircle2 size={16} /> {dept.jurisdiction}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>KEY DIGITAL SERVICES:</div>
                                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {dept.keyServices.map((svc, i) => (
                                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#334155', lineHeight: 1.4 }}>
                                                <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#3b82f6', flexShrink: 0, marginTop: 7 }}></div>
                                                {svc}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            
                            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' }}>
                                <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#2563eb', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                                    Browse {dept.keyServices.length} Services <ArrowRight size={16} />
                                </button>
                                <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 12, fontWeight: 500, textDecoration: 'none' }}>
                                    Official Portal <ExternalLink size={14} />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Departments;
