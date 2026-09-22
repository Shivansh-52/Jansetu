import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

/* ──────────────────────────────
   HELPER: Scroll Reveal
   ────────────────────────────── */
const Reveal = ({ children, delay = 0, style = {} }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setVisible(true);
        }, { threshold: 0.15 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
            ...style
        }}>
            {children}
        </div>
    );
};

/* ══════════════════════════════
   HOME PAGE
   ══════════════════════════════ */
const Home = () => {
    return (
        <div style={{ background: 'var(--bg-primary)' }}>

            {/* ═══════════════════════════
               SECTION 1: HERO
               ═══════════════════════════ */}
            <section style={{ 
                position: 'relative', 
                width: '100%', 
                backgroundColor: '#f8fafc', 
                overflow: 'hidden', 
                minHeight: '85vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '120px 20px 80px 20px'
            }}>
                {/* Subtle grid background */}
                <div style={{ 
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
                    backgroundSize: '40px 40px',
                    opacity: 0.3
                }}></div>
                
                {/* Background blobls for depth */}
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.05)', filter: 'blur(100px)' }}></div>
                <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(20, 184, 166, 0.05)', filter: 'blur(80px)' }}></div>

                <div style={{ position: 'relative', zIndex: 10, maxWidth: 1000, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Reveal>
                        <div style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: 8, 
                            backgroundColor: 'rgba(239, 246, 255, 0.8)', 
                            backdropFilter: 'blur(4px)',
                            border: '1px solid #dbeafe', 
                            color: '#1d4ed8', 
                            padding: '6px 16px', 
                            borderRadius: 9999, 
                            fontSize: 12, 
                            fontWeight: 600, 
                            marginBottom: 32, 
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)' 
                        }}>
                            <span style={{ color: '#f97316' }}>✨</span> Powered by SamadhanPath AI • Smart Orchestration Layer
                        </div>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <h1 style={{ 
                            fontSize: 'clamp(40px, 6vw, 72px)', 
                            fontWeight: 800, 
                            color: '#0f172a', 
                            lineHeight: 1.1, 
                            letterSpacing: '-0.02em', 
                            marginBottom: 24 
                        }}>
                            Your Universal Pass. <br style={{ display: 'block' }} />
                            <span style={{ color: '#1d4ed8' }}>To Every</span> <span style={{ color: '#0d9488' }}>Government</span> <span style={{ color: '#f59e0b' }}>Program.</span>
                        </h1>
                    </Reveal>

                    <Reveal delay={0.2}>
                        <p style={{ 
                            fontSize: 'clamp(16px, 2vw, 20px)', 
                            color: '#475569', 
                            maxWidth: 680, 
                            margin: '0 auto 40px auto', 
                            lineHeight: 1.6 
                        }}>
                            Skip the red tape. Access schemes, apply for certificates, and track your progress—all from one secure dashboard.
                        </p>
                    </Reveal>

                    <Reveal delay={0.3} style={{ width: '100%' }}>
                        <div style={{ 
                            width: '100%', 
                            maxWidth: 768, 
                            margin: '0 auto 24px auto', 
                            backgroundColor: 'white', 
                            padding: '8px 8px 8px 16px', 
                            borderRadius: 16, 
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', 
                            border: '1px solid #e2e8f0', 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 12
                        }}>
                            <div style={{ color: '#1d4ed8', display: 'flex', alignItems: 'center' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                            </div>
                            <input 
                                type="text" 
                                placeholder="What are you looking for today? (e.g., 'Apply for student scholarship')" 
                                style={{
                                    flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', 
                                    color: '#334155', fontSize: 16, padding: '12px 0', width: '100%'
                                }}
                            />
                            <button style={{
                                backgroundColor: '#1d4ed8', color: 'white', padding: '14px 24px', 
                                borderRadius: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                                fontSize: 15, transition: 'background-color 0.2s'
                            }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#1e40af'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}>
                                Find Services 
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                            </button>
                        </div>
                    </Reveal>

                    <Reveal delay={0.4}>
                        <div style={{ 
                            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', 
                            gap: 12, fontSize: 13, color: '#64748b', marginBottom: 48 
                        }}>
                            <span>Frequently asked:</span>
                            {['Housing Schemes', 'Crop Insurance', 'Income Certificate', 'Pension Services'].map(query => (
                                <span key={query} style={{ 
                                    backgroundColor: 'white', border: '1px solid #e2e8f0', 
                                    padding: '4px 12px', borderRadius: 9999, color: '#475569', 
                                    cursor: 'pointer', transition: 'background-color 0.2s'
                                }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}>
                                    {query}
                                </span>
                            ))}
                        </div>
                    </Reveal>

                    <Reveal delay={0.5}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                            <Link to="/services" style={{
                                backgroundColor: '#1d4ed8', color: 'white', padding: '12px 28px', 
                                borderRadius: 8, fontWeight: 600, textDecoration: 'none',
                                display: 'flex', alignItems: 'center', gap: 8, transition: 'background-color 0.2s'
                            }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#1e40af'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}>
                                Explore Services <span>→</span>
                            </Link>
                            <Link to="/categories" style={{
                                backgroundColor: 'white', color: '#334155', border: '1px solid #cbd5e1', 
                                padding: '12px 28px', borderRadius: 8, fontWeight: 600, textDecoration: 'none',
                                display: 'flex', alignItems: 'center', gap: 8, transition: 'background-color 0.2s'
                            }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}>
                                Find Services by Category <span style={{ color: '#94a3b8' }}>{'>'}</span>
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 1.5: QUICK ACCESS CARDS
               ═══════════════════════════ */}
            <section style={{ 
                backgroundColor: '#ffffff', 
                padding: '40px 20px',
                borderBottom: '1px solid #f1f5f9'
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <Reveal delay={0.6}>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                            gap: 20 
                        }}>
                            {/* Card 1: Departments */}
                            <Link to="/departments" style={{
                                backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16,
                                padding: '24px 20px', textDecoration: 'none', display: 'flex', flexDirection: 'column',
                                transition: 'all 0.2s ease', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
                            }} onMouseOver={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)'; }} onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.02)'; }}>
                                <div style={{ backgroundColor: '#eff6ff', color: '#3b82f6', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>35+ Departments</h3>
                                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Central & State Directory</p>
                            </Link>

                            {/* Card 2: Certificates */}
                            <Link to="/certificates-hub" style={{
                                backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16,
                                padding: '24px 20px', textDecoration: 'none', display: 'flex', flexDirection: 'column',
                                transition: 'all 0.2s ease', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
                            }} onMouseOver={e => { e.currentTarget.style.borderColor = '#86efac'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)'; }} onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.02)'; }}>
                                <div style={{ backgroundColor: '#ecfdf5', color: '#10b981', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Certificates Hub</h3>
                                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>10 Statutory Records</p>
                            </Link>

                            {/* Card 3: Agriculture */}
                            <Link to="/agriculture-portal" style={{
                                backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16,
                                padding: '24px 20px', textDecoration: 'none', display: 'flex', flexDirection: 'column',
                                transition: 'all 0.2s ease', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
                            }} onMouseOver={e => { e.currentTarget.style.borderColor = '#6ee7b7'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)'; }} onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.02)'; }}>
                                <div style={{ backgroundColor: '#f0fdf4', color: '#22c55e', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Agriculture Portal</h3>
                                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>PM-KISAN, PMFBY & Credit</p>
                            </Link>

                            {/* Card 4: Grievances */}
                            <Link to="/register-complaint" style={{
                                backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16,
                                padding: '24px 20px', textDecoration: 'none', display: 'flex', flexDirection: 'column',
                                transition: 'all 0.2s ease', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
                            }} onMouseOver={e => { e.currentTarget.style.borderColor = '#d8b4fe'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)'; }} onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.02)'; }}>
                                <div style={{ backgroundColor: '#faf5ff', color: '#a855f7', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Public Grievances</h3>
                                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>CPGRAMS Redressal & Tracking</p>
                            </Link>

                            {/* Card 5: Healthcare */}
                            <Link to="/healthcare" style={{
                                backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16,
                                padding: '24px 20px', textDecoration: 'none', display: 'flex', flexDirection: 'column',
                                transition: 'all 0.2s ease', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
                            }} onMouseOver={e => { e.currentTarget.style.borderColor = '#5eead4'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)'; }} onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.02)'; }}>
                                <div style={{ backgroundColor: '#f0fdfa', color: '#14b8a6', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Healthcare Portal</h3>
                                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>ABHA & Digital Clinics</p>
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 2: CITIZEN JOURNEYS
               ═══════════════════════════ */}
            <section style={{ backgroundColor: '#f8fafc', padding: '80px 20px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <Reveal>
                        <div style={{ textAlign: 'center', marginBottom: 64 }}>
                            <span style={{ 
                                backgroundColor: '#eff6ff', color: '#2563eb', padding: '6px 16px', 
                                borderRadius: 9999, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', 
                                textTransform: 'uppercase', display: 'inline-block', marginBottom: 16 
                            }}>
                                Citizen Journeys
                            </span>
                            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
                                Tailored for Every Citizen
                            </h2>
                            <p style={{ color: '#475569', fontSize: 16, maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
                                From educational grants to agricultural subsidies and enterprise loans, discover services specifically curated for your life situation.
                            </p>
                        </div>
                    </Reveal>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
                        gap: 24 
                    }}>
                        {[
                            { title: 'Students & Scholars', category: 'Education', icon: '🎓', color: '#8b5cf6', bgColor: '#f3e8ff', desc: 'Education loans, Central Sector Scholarships, and instant marksheets.', link: '/domain-education' },
                            { title: 'Farmers & Agronomists', category: 'Agriculture', icon: '🌾', color: '#10b981', bgColor: '#ecfdf5', desc: 'PM-KISAN income support, PMFBY crop loss insurance, and subsidies.', link: '/domain-agriculture' },
                            { title: 'Job Seekers & Youth', category: 'Employment', icon: '💼', color: '#6366f1', bgColor: '#e0e7ff', desc: 'National Career Service verification, Skill India certificates, and vocational allowances.', link: '/services' },
                            { title: 'MSME Entrepreneurs', category: 'Business', icon: '🏢', color: '#3b82f6', bgColor: '#eff6ff', desc: 'PMEGP margin subsidy, instant Udyam registration, and MUDRA loans.', link: '/services' },
                            { title: 'Healthcare & Families', category: 'Healthcare', icon: '🏥', color: '#f43f5e', bgColor: '#ffe4e6', desc: 'Ayushman Bharat PM-JAY hospital cover, ABHA Health ID, and medicines.', link: '/domain-healthcare' },
                            { title: 'Housing & Families', category: 'Housing', icon: '🏠', color: '#f59e0b', bgColor: '#fef3c7', desc: 'PMAY interest subsidies, One Nation One Ration Card, and water connections.', link: '/services' },
                            { title: 'Senior Citizens', category: 'Social Welfare', icon: '🧓', color: '#d946ef', bgColor: '#fae8ff', desc: 'National pensions, Jeevan Pramaan digital life certificate, and assistive devices.', link: '/services' },
                            { title: 'Digital Citizens', category: 'Identity', icon: '🛡️', color: '#0ea5e9', bgColor: '#e0f2fe', desc: 'Aadhaar updates, PAN-Aadhaar linking, DigiLocker, and DPDP consent controls.', link: '/consent-center' },
                        ].map((domain, i) => (
                            <Reveal key={i} delay={i * 0.1}>
                                <div style={{ 
                                    backgroundColor: '#ffffff', borderRadius: 16, padding: 24, height: '100%', 
                                    display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', transition: 'transform 0.2s, box-shadow 0.2s'
                                }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; e.currentTarget.style.borderColor = domain.color; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                        <div style={{ fontSize: 28 }}>{domain.icon}</div>
                                        <span style={{ 
                                            backgroundColor: domain.bgColor, color: domain.color, 
                                            fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 9999 
                                        }}>
                                            {domain.category}
                                        </span>
                                    </div>
                                    
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>{domain.title}</h3>
                                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 24, flex: 1 }}>{domain.desc}</p>
                                    
                                    <Link to={domain.link} style={{ 
                                        color: '#1d4ed8', fontWeight: 600, textDecoration: 'none', fontSize: 14, 
                                        display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s'
                                    }} onMouseOver={e => e.currentTarget.style.color = '#1e40af'} onMouseOut={e => e.currentTarget.style.color = '#1d4ed8'}>
                                        View Schemes <span style={{ fontSize: 16 }}>→</span>
                                    </Link>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                    
                    <Reveal delay={0.4}>
                        <div style={{ textAlign: 'center', marginTop: 48 }}>
                            <Link to="/services" style={{ 
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: 'white', color: '#0f172a', border: '1px solid #cbd5e1',
                                padding: '12px 32px', borderRadius: 8, fontWeight: 600, textDecoration: 'none',
                                transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }} onMouseOver={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#cbd5e1'; }}>
                                View All Government Services
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 2.5: RECOMMENDED SCHEMES
               ═══════════════════════════ */}
            <section style={{ backgroundColor: '#ffffff', padding: '60px 20px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <Reveal>
                        <div style={{ 
                            backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 24, 
                            padding: '40px', display: 'flex', flexDirection: 'column', gap: 32
                        }}>
                            {/* Section Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                                <div>
                                    <h3 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                                        🎓 Recommended Schemes for Starting College
                                    </h3>
                                    <p style={{ color: '#64748b', fontSize: 15, margin: 0 }}>
                                        One-click discover scholarships, tuition fee subsidies, education certificates, and hostel benefits.
                                    </p>
                                </div>
                                <Link to="/services" style={{ color: '#1d4ed8', fontWeight: 600, fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    Explore All 30 Registered Services <span style={{ fontSize: 16 }}>→</span>
                                </Link>
                            </div>

                            {/* Cards Container */}
                            <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 16 }}>
                                {/* Scheme Card 1 */}
                                <div style={{ 
                                    backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, 
                                    padding: 24, minWidth: 380, width: 450, display: 'flex', flexDirection: 'column',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                }}>
                                    {/* Badges Row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontWeight: 600, fontSize: 13 }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                                            Education
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: 9999 }}>CENTRAL</span>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <span style={{ width: 6, height: 6, backgroundColor: '#10b981', borderRadius: '50%' }}></span> Live Integration
                                            </span>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: 'white', backgroundColor: '#f59e0b', padding: '2px 8px', borderRadius: 9999 }}>
                                                ✨ 94% Match
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <h4 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                                        PM Post-Matric Scholarship for Higher Education
                                    </h4>
                                    <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                                        Ministry of Education • Department of Higher Educati...
                                    </p>
                                    <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: '0 0 24px 0', flex: 1 }}>
                                        Financial assistance for meritorious students belonging to marginalized or lower-income households pursuing post...
                                    </p>

                                    {/* Info Blocks */}
                                    <div style={{ display: 'flex', gap: 12, marginBottom: 24, backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #f1f5f9' }}>
                                        <div style={{ flex: 1, borderRight: '1px solid #e2e8f0' }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', marginBottom: 4 }}>ELIGIBILITY</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                                Real-time Check
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', marginBottom: 4 }}>DOCUMENTS</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                                5 Proofs
                                            </div>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button style={{ 
                                            flex: 1, backgroundColor: '#eff6ff', color: '#1d4ed8', border: 'none', 
                                            padding: '10px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#dbeafe'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#eff6ff'}>
                                            Check Eligibility
                                        </button>
                                        <button style={{ 
                                            backgroundColor: 'transparent', color: '#475569', border: '1px solid #e2e8f0', 
                                            padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: 6, transition: 'background-color 0.2s'
                                        }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                            Details <span>→</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 2.6: COMPLETE CATALOG
               ═══════════════════════════ */}
            <section style={{ backgroundColor: '#f8fafc', padding: '80px 20px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <Reveal>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20, marginBottom: 48 }}>
                            <div>
                                <span style={{ 
                                    backgroundColor: '#eff6ff', color: '#2563eb', padding: '6px 12px', 
                                    borderRadius: 9999, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', 
                                    textTransform: 'uppercase', display: 'inline-block', marginBottom: 16 
                                }}>
                                    COMPLETE CATALOG
                                </span>
                                <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                                    What can we help you with?
                                </h2>
                                <p style={{ color: '#64748b', fontSize: 16, margin: 0 }}>
                                    Browse government services across 13 civic domains.
                                </p>
                            </div>
                            <Link to="/services" style={{ 
                                backgroundColor: '#1d4ed8', color: 'white', padding: '10px 24px', 
                                borderRadius: 9999, fontWeight: 600, fontSize: 14, textDecoration: 'none',
                                display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'background-color 0.2s'
                            }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#1e40af'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}>
                                View All Services <span>→</span>
                            </Link>
                        </div>
                    </Reveal>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
                        gap: 20 
                    }}>
                        {[
                            { title: 'Education', icon: '🎓', color: '#3b82f6', bgColor: '#eff6ff', count: 3, link: '/domain-education' },
                            { title: 'Identity & Certificates', icon: '📄', color: '#6366f1', bgColor: '#e0e7ff', count: 7, link: '/certificates' },
                            { title: 'Housing', icon: '🏠', color: '#a855f7', bgColor: '#f3e8ff', count: 3, link: '/services' },
                            { title: 'Agriculture', icon: '🌾', color: '#10b981', bgColor: '#ecfdf5', count: 5, link: '/domain-agriculture' },
                            { title: 'Healthcare', icon: '🏥', color: '#ef4444', bgColor: '#fee2e2', count: 2, link: '/domain-healthcare' },
                            { title: 'Employment', icon: '💼', color: '#f59e0b', bgColor: '#fef3c7', count: 2, link: '/services' },
                            { title: 'Financial Assistance', icon: '₹', color: '#14b8a6', bgColor: '#ccfbf1', count: 1, link: '/services' },
                            { title: 'Business & MSME', icon: '🏢', color: '#8b5cf6', bgColor: '#ede9fe', count: 3, link: '/services' },
                            { title: 'Transport', icon: '🚗', color: '#0ea5e9', bgColor: '#e0f2fe', count: 2, link: '/services' },
                            { title: 'Social Welfare', icon: '👥', color: '#f97316', bgColor: '#ffedd5', count: 1, link: '/services' },
                            { title: 'Land & Property', icon: '🗺️', color: '#64748b', bgColor: '#f1f5f9', count: 1, link: '/services' },
                            { title: 'Municipal Services', icon: '🗑️', color: '#64748b', bgColor: '#f1f5f9', count: 1, link: '/register-complaint' },
                            { title: 'Grievance & Citizen', icon: '⚖️', color: '#64748b', bgColor: '#f1f5f9', count: 2, link: '/register-complaint' },
                        ].map((cat, i) => (
                            <Reveal key={i} delay={i * 0.05}>
                                <div style={{ 
                                    backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, 
                                    padding: 24, display: 'flex', flexDirection: 'column', height: '100%',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'border-color 0.2s, box-shadow 0.2s'
                                }} onMouseOver={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)'; }} onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; }}>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                        <div style={{ 
                                            width: 40, height: 40, borderRadius: '50%', backgroundColor: cat.bgColor, 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                                        }}>
                                            {cat.icon}
                                        </div>
                                        <span style={{ 
                                            backgroundColor: '#f1f5f9', color: '#475569', fontSize: 11, 
                                            fontWeight: 600, padding: '4px 10px', borderRadius: 9999 
                                        }}>
                                            {cat.count} service{cat.count > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    
                                    <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>{cat.title}</h4>
                                    <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 20px 0', flex: 1 }}>Explore schemes & automated workflows</p>
                                    
                                    <Link to={cat.link} style={{ 
                                        color: '#1d4ed8', fontSize: 13, fontWeight: 600, textDecoration: 'none', 
                                        display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s'
                                    }} onMouseOver={e => e.currentTarget.style.color = '#1e40af'} onMouseOut={e => e.currentTarget.style.color = '#1d4ed8'}>
                                        Browse Category <span>→</span>
                                    </Link>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 3: HOW IT WORKS
               ═══════════════════════════ */}
            <section id="how-it-works" style={{ backgroundColor: '#ffffff', padding: '100px 20px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <Reveal>
                        <div style={{ textAlign: 'center', marginBottom: 64 }}>
                            <span style={{ 
                                backgroundColor: '#eff6ff', color: '#2563eb', padding: '6px 16px', 
                                borderRadius: 9999, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', 
                                textTransform: 'uppercase', display: 'inline-block', marginBottom: 16 
                            }}>
                                FOUR STEPS
                            </span>
                            <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
                                How Samadhan Path Works
                            </h2>
                            <p style={{ color: '#64748b', fontSize: 16, maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
                                Transforming a fragmented multi-portal application into a streamlined citizen flow.
                            </p>
                        </div>
                    </Reveal>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                        gap: 24 
                    }}>
                        {[
                            { 
                                num: '01', 
                                title: 'Tell Us What You Need', 
                                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, 
                                color: '#3b82f6', 
                                bgColor: '#eff6ff',
                                desc: 'Use natural everyday language. No need to understand government department boundaries or ministry titles.'
                            },
                            { 
                                num: '02', 
                                title: 'Discover Relevant Services', 
                                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>, 
                                color: '#f97316', 
                                bgColor: '#fff7ed',
                                desc: 'AI matches your needs to official central, state, and local schemes with transparent qualification reasons.'
                            },
                            { 
                                num: '03', 
                                title: 'Prepare & Auto-fill', 
                                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>, 
                                color: '#10b981', 
                                bgColor: '#ecfdf5',
                                desc: 'Evaluate preliminary eligibility, verify documents via DigiLocker, and auto-populate authorized forms.'
                            },
                            { 
                                num: '04', 
                                title: 'Track Everything', 
                                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, 
                                color: '#a855f7', 
                                bgColor: '#faf5ff',
                                desc: 'Follow status across different ministries on a unified multi-stage timeline with timely push notifications.'
                            }
                        ].map((step, i) => (
                            <Reveal key={i} delay={i * 0.1}>
                                <div style={{ 
                                    backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, 
                                    padding: 32, height: '100%', display: 'flex', flexDirection: 'column',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', transition: 'transform 0.2s, box-shadow 0.2s'
                                }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'; }}>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                                        <div style={{ 
                                            width: 44, height: 44, borderRadius: 12, backgroundColor: step.bgColor, 
                                            color: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {step.icon}
                                        </div>
                                        <div style={{ fontSize: 24, fontWeight: 800, color: '#cbd5e1' }}>
                                            {step.num}
                                        </div>
                                    </div>
                                    
                                    <h4 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
                                        {step.title}
                                    </h4>
                                    <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                                        {step.desc}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 4: COMPARISON
               ═══════════════════════════ */}
            <section style={{ backgroundColor: '#f8fafc', padding: '100px 20px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <Reveal>
                        <div style={{ textAlign: 'center', marginBottom: 64 }}>
                            <span style={{ 
                                backgroundColor: '#eff6ff', color: '#2563eb', padding: '6px 16px', 
                                borderRadius: 9999, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', 
                                textTransform: 'uppercase', display: 'inline-block', marginBottom: 16 
                            }}>
                                THE CIVIC TRANSFORMATION
                            </span>
                            <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
                                Without Samadhan Path vs With Samadhan Path
                            </h2>
                            <p style={{ color: '#64748b', fontSize: 16, maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
                                See how our unified architecture removes bureaucratic friction for Indian citizens.
                            </p>
                        </div>
                    </Reveal>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                        gap: 32 
                    }}>
                        {/* Left Card - Without */}
                        <Reveal delay={0.1}>
                            <div style={{ 
                                backgroundColor: '#fff5f5', border: '1px solid #fecaca', borderRadius: 24, 
                                padding: '40px', height: '100%', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                            }}>
                                <div style={{ marginBottom: 32 }}>
                                    <span style={{ 
                                        backgroundColor: '#fee2e2', color: '#ef4444', padding: '8px 16px', 
                                        borderRadius: 9999, fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 
                                    }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                                        Without Samadhan Path (Fragmented Reality)
                                    </span>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    {[
                                        { title: 'Fragmented Systems', desc: 'Citizens navigate a confusing maze of disconnected department websites for basic services.' },
                                        { title: 'Repetitive Paperwork', desc: 'Citizens are forced to submit the same KYC documents and physical forms for every new application.' },
                                        { title: 'Missed Opportunities', desc: 'Lack of awareness means eligible citizens miss out on crucial welfare schemes and subsidies.' },
                                        { title: 'Opaque Tracking', desc: 'Applications disappear into a black box, with zero visibility on current status or delays.' }
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                            <div style={{ color: '#ef4444', marginTop: 2 }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#450a0a', margin: '0 0 4px 0' }}>{item.title}</h4>
                                                <p style={{ fontSize: 14, color: '#7f1d1d', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Reveal>

                        {/* Right Card - With */}
                        <Reveal delay={0.2}>
                            <div style={{ 
                                backgroundColor: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 24, 
                                padding: '40px', height: '100%', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                            }}>
                                <div style={{ marginBottom: 32 }}>
                                    <span style={{ 
                                        backgroundColor: '#d1fae5', color: '#059669', padding: '8px 16px', 
                                        borderRadius: 9999, fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 
                                    }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                        With Samadhan Path (Intelligent Orchestration)
                                    </span>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    {[
                                        { title: 'One Unified Journey', desc: 'Access all government services across departments through one seamless, interoperable interface.' },
                                        { title: 'Single Source of Truth', desc: 'Securely fetch verified documents via DigiLocker once, reusing them with explicit citizen consent.' },
                                        { title: 'Smart Discovery', desc: 'Intelligent algorithms proactively match citizens with schemes they are perfectly eligible for.' },
                                        { title: 'End-to-End Transparency', desc: 'Track application progress in real-time, knowing exactly which desk it is on with audit logging.' }
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                            <div style={{ color: '#059669', marginTop: 2 }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#022c22', margin: '0 0 4px 0' }}>{item.title}</h4>
                                                <p style={{ fontSize: 14, color: '#064e3b', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 5: FINAL CTA
               ═══════════════════════════ */}
            <section style={{ backgroundColor: '#ffffff', padding: '60px 20px 100px 20px' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <Reveal>
                        <div style={{ 
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', 
                            borderRadius: 32, padding: '64px 40px', textAlign: 'center',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            position: 'relative', overflow: 'hidden'
                        }}>
                            {/* Decorative background circles */}
                            <div style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)' }}></div>
                            <div style={{ position: 'absolute', bottom: -150, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(0,0,0,0) 70%)' }}></div>
                            
                            <div style={{ position: 'relative', zIndex: 10 }}>
                                <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: '#ffffff', margin: '0 0 20px 0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                    Your Gateway to Seamless Governance.
                                </h2>
                                <p style={{ color: '#94a3b8', fontSize: 'clamp(16px, 2vw, 18px)', maxWidth: 650, margin: '0 auto 40px auto', lineHeight: 1.6 }}>
                                    Stop navigating endless department websites. Create your unified Samadhan Path profile today and access hundreds of schemes with a single click.
                                </p>
                                
                                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <Link to="/register" style={{ 
                                        backgroundColor: '#10b981', color: 'white', padding: '14px 32px', 
                                        borderRadius: 9999, fontWeight: 700, fontSize: 16, textDecoration: 'none',
                                        display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                                        boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)'
                                    }} onMouseOver={e => { e.currentTarget.style.backgroundColor = '#059669'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = '#10b981'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                        Get Started Now <span>→</span>
                                    </Link>
                                    
                                    <Link to="/services" style={{ 
                                        backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)',
                                        padding: '14px 32px', borderRadius: 9999, fontWeight: 600, fontSize: 16, textDecoration: 'none',
                                        display: 'inline-flex', alignItems: 'center', transition: 'all 0.2s'
                                    }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}>
                                        View Service Catalog
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>
            <div id="footer">
                <Footer />
            </div>
        </div>
    );
};

export default Home;
