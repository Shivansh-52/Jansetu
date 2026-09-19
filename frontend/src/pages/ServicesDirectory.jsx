import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ALL_SERVICES = [
    { id: 'edu-01', title: 'Post-Matric Scholarship', domain: 'Education', icon: '🎓', path: '/domain-education', color: '#8b5cf6' },
    { id: 'edu-02', title: 'Educational Loan Interest Subsidy', domain: 'Education', icon: '🎓', path: '/domain-education', color: '#8b5cf6' },
    { id: 'hlth-01', title: 'Ayushman Bharat Registration', domain: 'Healthcare', icon: '🏥', path: '/domain-healthcare', color: '#10b981' },
    { id: 'hlth-02', title: 'OPD Appointment Booking', domain: 'Healthcare', icon: '🏥', path: '/domain-healthcare', color: '#10b981' },
    { id: 'agr-01', title: 'Crop Insurance Claim', domain: 'Agriculture', icon: '🌾', path: '/domain-agriculture', color: '#f59e0b' },
    { id: 'agr-02', title: 'Farm Equipment Subsidy', domain: 'Agriculture', icon: '🌾', path: '/domain-agriculture', color: '#f59e0b' },
    { id: 'inf-01', title: 'Report Civic Grievance', domain: 'Infrastructure', icon: '🏗️', path: '/register-complaint', color: '#3b82f6' },
    { id: 'pub-01', title: 'Income Certificate', domain: 'Public Services', icon: '📄', path: '/domain-public-services', color: '#6366f1' },
    { id: 'pub-02', title: 'Domicile Certificate', domain: 'Public Services', icon: '📄', path: '/domain-public-services', color: '#6366f1' },
];

const ServicesDirectory = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filterDomain, setFilterDomain] = useState('All');

    const filteredServices = ALL_SERVICES.filter(srv => {
        const matchesSearch = srv.title.toLowerCase().includes(search.toLowerCase());
        const matchesDomain = filterDomain === 'All' || srv.domain === filterDomain;
        return matchesSearch && matchesDomain;
    });

    const domains = ['All', ...new Set(ALL_SERVICES.map(s => s.domain))];

    return (
        <div className="page-bg" style={{ minHeight: '100vh', paddingBottom: 80 }}>
            <section style={{ background: 'var(--bg-secondary)', padding: '40px 0 32px', borderBottom: '1px solid var(--border-light)' }}>
                <div className="container-js">
                    <h1 style={{ fontSize: 32, marginBottom: 16 }}>Government Services Directory</h1>
                    <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600 }}>
                        Search and access hundreds of government services from different departments. Apply seamlessly using your SamadhanPath Master ID.
                    </p>
                    
                    <div style={{ marginTop: 32, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <input 
                            type="text" 
                            className="input-js" 
                            placeholder="🔍 Search for a service (e.g., Scholarship, Birth Certificate)..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ flex: '1 1 300px', padding: '12px 16px', fontSize: 15 }}
                        />
                    </div>
                    
                    <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {domains.map(d => (
                            <button 
                                key={d}
                                onClick={() => setFilterDomain(d)}
                                style={{
                                    padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                    background: filterDomain === d ? 'var(--accent)' : 'white',
                                    color: filterDomain === d ? 'white' : 'var(--text-secondary)',
                                    border: `1px solid ${filterDomain === d ? 'var(--accent)' : 'var(--border-light)'}`,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <div className="container-js" style={{ paddingTop: 40 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                    {filteredServices.length > 0 ? filteredServices.map((srv, i) => (
                        <motion.div 
                            key={srv.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="card-js"
                            onClick={() => navigate(srv.path)}
                            style={{ 
                                padding: 24, cursor: 'pointer', transition: 'transform 0.2s',
                                borderLeft: `4px solid ${srv.color}`, display: 'flex', gap: 16, alignItems: 'flex-start'
                            }}
                        >
                            <div style={{ fontSize: 32, background: `${srv.color}15`, padding: 12, borderRadius: 12 }}>
                                {srv.icon}
                            </div>
                            <div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: srv.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {srv.domain}
                                </span>
                                <h3 style={{ fontSize: 16, margin: '4px 0 8px 0', lineHeight: 1.4 }}>{srv.title}</h3>
                                <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>Apply Now →</span>
                            </div>
                        </motion.div>
                    )) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
                            <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
                            <h3 style={{ fontSize: 18 }}>No services found</h3>
                            <p>Try adjusting your search terms or filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServicesDirectory;
