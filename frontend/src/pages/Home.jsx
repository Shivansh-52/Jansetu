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
            <section className="section-pinned dot-grid" style={{
                background: 'var(--bg-primary)',
                position: 'relative'
            }}>
                <div className="blob" style={{
                    width: 500, height: 500, background: 'rgba(59, 130, 246, 0.08)',
                    top: '-10%', right: '-5%'
                }} />
                <div className="blob" style={{
                    width: 300, height: 300, background: 'rgba(16, 185, 129, 0.05)',
                    bottom: '10%', left: '5%'
                }} />

                <div className="container-js" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 60, flexWrap: 'wrap', minHeight: '90vh', paddingTop: 100, paddingBottom: 60
                }}>
                    {/* Left */}
                    <div style={{ flex: '1 1 500px', maxWidth: 640 }}>
                        <Reveal>
                            <div className="pill-js pill-js--accent" style={{ marginBottom: 24, fontSize: 13, background: '#e0f2fe', color: '#0369a1' }}>
                                🏛️ The Interoperability Platform
                            </div>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <h1 style={{ marginBottom: 24, fontSize: 56, lineHeight: 1.1 }}>
                                One Digital Gateway to <br />
                                <span style={{ color: '#0284c7' }}>Government Services</span>
                            </h1>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <p style={{ fontSize: 18, maxWidth: 480, marginBottom: 40, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                                Access multiple government services through one secure identity, while SamadhanPath connects the required government systems behind the scenes.
                            </p>
                        </Reveal>
                        <Reveal delay={0.3}>
                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                <Link to="/login" className="btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
                                    Login with Master ID
                                </Link>
                                <Link to="/register" className="btn-secondary" style={{ padding: '12px 28px', fontSize: 15 }}>
                                    Create Master ID
                                </Link>
                            </div>
                        </Reveal>
                    </div>

                    {/* Right: Graphic */}
                    <Reveal delay={0.2} style={{ flex: '1 1 360px', maxWidth: 500 }}>
                        <div className="card-js" style={{ padding: 40, background: 'white', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.08)', position: 'relative' }}>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{ fontSize: 48 }}>👤</div>
                                <h3 style={{ fontSize: 18, marginTop: 8 }}>One Master ID</h3>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>SP-XXXXXX</p>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                                <div style={{ height: 40, width: 2, background: '#cbd5e1' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: 24 }}>🎓</span>
                                    <p style={{ margin: '8px 0 0 0', fontSize: 12, fontWeight: 600 }}>Education</p>
                                </div>
                                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: 24 }}>🏥</span>
                                    <p style={{ margin: '8px 0 0 0', fontSize: 12, fontWeight: 600 }}>Healthcare</p>
                                </div>
                                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: 24 }}>🌾</span>
                                    <p style={{ margin: '8px 0 0 0', fontSize: 12, fontWeight: 600 }}>Agriculture</p>
                                </div>
                                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: 24 }}>🏗️</span>
                                    <p style={{ margin: '8px 0 0 0', fontSize: 12, fontWeight: 600 }}>Civic & Public</p>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 2: DOMAINS
               ═══════════════════════════ */}
            <section className="section-pinned" style={{ background: 'var(--bg-secondary)', padding: '100px 0' }}>
                <div className="container-js">
                    <Reveal>
                        <div style={{ textAlign: 'center', marginBottom: 56 }}>
                            <span className="label-meta" style={{ color: '#0284c7', marginBottom: 12, display: 'block' }}>GOVERNMENT DOMAINS</span>
                            <h2 style={{ fontSize: 36 }}>Comprehensive Service Directory</h2>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '16px auto 0' }}>
                                Access hundreds of services across various government departments, seamlessly connected by SamadhanPath's interoperability layer.
                            </p>
                        </div>
                    </Reveal>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                        {[
                            { title: 'Education', icon: '🎓', color: '#8b5cf6', desc: 'Scholarships, Loans, Academic Verification', link: '/domain-education' },
                            { title: 'Healthcare', icon: '🏥', color: '#10b981', desc: 'Schemes, Appointments, Diagnostics', link: '/domain-healthcare' },
                            { title: 'Agriculture', icon: '🌾', color: '#f59e0b', desc: 'Farmer Services, Crop Insurance, Land', link: '/domain-agriculture' },
                            { title: 'Infrastructure', icon: '🏗️', color: '#3b82f6', desc: 'Civic Grievances, Potholes, Utilities', link: '/register-complaint' },
                            { title: 'Public Services', icon: '📄', color: '#6366f1', desc: 'Income, Domicile, Certificates', link: '/domain-public-services' },
                        ].map((domain, i) => (
                            <Reveal key={i} delay={i * 0.1}>
                                <div className="card-js" style={{ padding: 32, height: '100%', borderTop: `4px solid ${domain.color}` }}>
                                    <div style={{ fontSize: 40, marginBottom: 16 }}>{domain.icon}</div>
                                    <h3 style={{ fontSize: 20, marginBottom: 8 }}>{domain.title}</h3>
                                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>{domain.desc}</p>
                                    <Link to={domain.link} style={{ color: domain.color, fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
                                        Explore Services →
                                    </Link>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                    
                    <Reveal delay={0.4}>
                        <div style={{ textAlign: 'center', marginTop: 48 }}>
                            <Link to="/services" className="btn-secondary" style={{ padding: '12px 32px' }}>
                                View All Government Services
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════════════════════
               SECTION 3: HOW IT WORKS
               ═══════════════════════════ */}
            <section className="section-pinned" style={{ background: 'white', padding: '100px 0' }}>
                <div className="container-js">
                    <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ flex: '1 1 400px' }}>
                            <Reveal>
                                <span className="label-meta" style={{ color: '#0284c7', marginBottom: 12, display: 'block' }}>HOW IT WORKS</span>
                                <h2 style={{ fontSize: 36, marginBottom: 24 }}>The Interoperability Difference</h2>
                            </Reveal>
                            
                            <Reveal delay={0.1}>
                                <div style={{ marginBottom: 32 }}>
                                    <h4 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{fontSize: 20}}>✕</span> WITHOUT SAMADHANPATH</h4>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 15, paddingLeft: 28 }}>
                                        Citizens must create multiple accounts across different department portals, repeatedly enter the same information, upload identical documents multiple times, and track applications on separate websites.
                                    </p>
                                </div>
                            </Reveal>

                            <Reveal delay={0.2}>
                                <div>
                                    <h4 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{fontSize: 20}}>✓</span> WITH SAMADHANPATH</h4>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 15, paddingLeft: 28 }}>
                                        One Master Identity. When you apply for a service, our API Gateway connects to the relevant department system, securely reuses your existing verified documents (with your consent), and provides a single unified tracking dashboard.
                                    </p>
                                </div>
                            </Reveal>
                            
                            <Reveal delay={0.3}>
                                <Link to="/how-it-works" className="btn-primary" style={{ marginTop: 32, padding: '10px 24px', display: 'inline-block' }}>
                                    Learn About The Architecture
                                </Link>
                            </Reveal>
                        </div>

                        <div style={{ flex: '1 1 400px' }}>
                            <Reveal delay={0.2}>
                                <div className="card-js" style={{ padding: 40, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{ fontSize: 24 }}>👤</span>
                                                <span style={{ fontWeight: 600 }}>Master Identity</span>
                                            </div>
                                            <span style={{ color: '#10b981' }}>✓ Verified</span>
                                        </div>
                                        <div style={{ textAlign: 'center', color: '#94a3b8' }}>↓</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{ fontSize: 24 }}>📁</span>
                                                <span style={{ fontWeight: 600 }}>Document Vault</span>
                                            </div>
                                            <span style={{ color: '#10b981' }}>✓ Linked</span>
                                        </div>
                                        <div style={{ textAlign: 'center', color: '#94a3b8' }}>↓</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{ fontSize: 24 }}>🛡️</span>
                                                <span style={{ fontWeight: 600 }}>Consent Center</span>
                                            </div>
                                            <span style={{ color: '#10b981' }}>✓ Approved</span>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </section>
            
            <Footer />
        </div>
    );
};

export default Home;
