import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const About = () => {
    const [activeTab, setActiveTab] = useState('citizens');

    const featuresList = [
        {
            icon: '🧠',
            title: 'AI-Assisted Classification',
            tag: 'NLP & ML',
            color: '#3B82F6',
            desc: 'Intelligent multi-lingual natural language processing categorizes complaints from text, voice, or transliterated Hinglish instantly.'
        },
        {
            icon: '⚡',
            title: 'Priority Assessment',
            tag: 'Real-time Severity',
            color: '#F59E0B',
            desc: 'Dynamic severity scoring evaluating public safety risks, sentiment urgency, and environmental hazards for rapid triage.'
        },
        {
            icon: '👁️',
            title: 'Image-Based Issue Detection',
            tag: 'Computer Vision',
            color: '#8B5CF6',
            desc: 'Deep learning visual models analyze citizen-uploaded photos to detect potholes, garbage spills, wire hazards, and structural defects.'
        },
        {
            icon: '🎯',
            title: 'Smart Department Routing',
            tag: 'Automated Dispatch',
            color: '#10B981',
            desc: 'Precision mapping engine routes grievances directly to the exact jurisdictional municipal division without manual intervention.'
        },
        {
            icon: '🔄',
            title: 'Duplicate Complaint Detection',
            tag: 'Spatial & Semantic',
            color: '#EC4899',
            desc: 'Consolidates overlapping reports from the same vicinity into single actionable work-orders, preventing redundant efforts.'
        },
        {
            icon: '👷',
            title: 'Intelligent Worker Assignment',
            tag: 'Capacity-Aware',
            color: '#6366F1',
            desc: 'Optimized dispatching algorithm matches available on-duty field workers based on proximity, workload balance, and domain skill.'
        },
        {
            icon: '⏱️',
            title: 'SLA Monitoring & Escalation',
            tag: 'Proactive Redressal',
            color: '#EF4444',
            desc: 'Automated background scanning tracks resolution deadlines, triggering multi-tier email and dashboard alerts for overdue complaints.'
        },
        {
            icon: '✅',
            title: 'Resolution Verification',
            tag: 'AI Photo Proof',
            color: '#14B8A6',
            desc: 'Compares pre-fix and post-fix ground evidence to verify genuine resolution before complaints can be formally closed.'
        },
        {
            icon: '💬',
            title: 'Citizen Feedback & Transparency',
            tag: 'Accountability',
            color: '#F97316',
            desc: 'Public tracking codes, live status timelines, and post-resolution satisfaction ratings ensure complete civic transparency.'
        },
        {
            icon: '📊',
            title: 'Governance Analytics',
            tag: 'Macro Insights',
            color: '#06B6D4',
            desc: 'Comprehensive executive heatmaps, departmental resolution velocity, and geographical hotspot intelligence for decision makers.'
        }
    ];

    const stakeholderRoles = {
        citizens: {
            title: 'Citizens',
            badge: 'Civic Empowerment',
            icon: '👥',
            points: [
                'Lodge grievances in seconds via Text, Voice, or Photo in Indian languages',
                'Real-time public tracking with unique Reference IDs — no login mandatory',
                'Direct notifications & ability to rate resolution quality',
                'Transparent status updates with photographic evidence'
            ]
        },
        workers: {
            title: 'Field Workers',
            badge: 'Ground-Level Action',
            icon: '👷',
            points: [
                'Dedicated mobile-friendly portal with task prioritisation',
                'GPS location assistance and complaint visual details',
                'One-click proof submission via before/after photo uploads',
                'Transparent tracking of daily accomplishments & performance ratings'
            ]
        },
        officers: {
            title: 'Department Officers',
            badge: 'Supervisory Control',
            icon: '🏛️',
            points: [
                'Live department queue monitoring with capacity overrides',
                'Automated escalation alerts before SLAs are breached',
                'Comprehensive worker workload distribution & re-assignment',
                'Detailed root-cause analysis and operational reporting'
            ]
        },
        authorities: {
            title: 'Governance & Authorities',
            badge: 'Executive Oversight',
            icon: '📈',
            points: [
                'Interactive city-wide GIS complaint density heatmaps',
                'Department-level efficiency comparisons and resolution turnaround rates',
                'Data-driven budget allocation and preventative infrastructure planning',
                'Public trust metrics and civic satisfaction indicators'
            ]
        }
    };

    const techStack = [
        { name: 'Computer Vision', detail: 'YOLOv8 & PyTorch Image AI', icon: '👁️' },
        { name: 'Multilingual NLP', detail: 'Text AI & Sentiment Analysis', icon: '🗣️' },
        { name: 'Backend Engine', detail: 'Python Flask & Daemon Escalation', icon: '⚙️' },
        { name: 'Document Store', detail: 'MongoDB & Geospatial Indexing', icon: '🍃' },
        { name: 'Frontend Architecture', detail: 'React 18, Vite & Tailwind CSS', icon: '⚛️' },
        { name: 'Security & Access', detail: 'Role-Based JWT Authentication', icon: '🔒' }
    ];

    return (
        <div className="page-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, #EFF6FF 100%)',
                padding: '90px 0 60px',
                position: 'relative',
                overflow: 'hidden',
                borderBottom: '1px solid rgba(43, 107, 255, 0.08)'
            }}>
                <div style={{
                    position: 'absolute',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(43, 107, 255, 0.12) 0%, rgba(255,255,255,0) 70%)',
                    top: '-20%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none'
                }} />

                <div className="container-js" style={{ position: 'relative', zIndex: 1, maxWidth: '1080px', textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#FFFFFF',
                            border: '1px solid #DBEAFE',
                            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.08)',
                            borderRadius: '9999px',
                            padding: '8px 20px',
                            marginBottom: '24px'
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>🌉</span>
                        <span style={{
                            fontWeight: 700,
                            fontSize: '14px',
                            letterSpacing: '0.04em',
                            color: 'var(--accent)',
                            textTransform: 'uppercase'
                        }}>
                            Samadhan Path
                        </span>
                        <span style={{ color: '#94A3B8' }}>•</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            AI-Powered Civic Redressal
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        style={{
                            fontSize: 'clamp(32px, 5vw, 54px)',
                            fontWeight: 700,
                            lineHeight: 1.15,
                            color: '#0E1A33',
                            marginBottom: '20px',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        AI-Powered Civic Grievance <br />
                        <span style={{
                            background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Redressal Platform
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{
                            fontSize: 'clamp(16px, 2vw, 19px)',
                            lineHeight: 1.7,
                            color: '#334155',
                            maxWidth: '820px',
                            margin: '0 auto 36px',
                            fontWeight: 400
                        }}
                    >
                        An end-to-end civic complaint management system designed to connect citizens,
                        government departments, field workers, and authorities through transparent,
                        accountable, and efficient workflows.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}
                    >
                        <Link to="/register-complaint" className="btn-primary" style={{
                            padding: '14px 28px',
                            fontSize: '15px',
                            fontWeight: 600,
                            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)'
                        }}>
                            🚀 Submit a Complaint
                        </Link>
                        <Link to="/track" className="btn-secondary" style={{
                            padding: '14px 28px',
                            fontSize: '15px',
                            fontWeight: 600,
                            background: '#FFFFFF'
                        }}>
                            🔍 Track Grievance Status
                        </Link>
                    </motion.div>

                    {/* Quick Stat Highlights */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '16px',
                        marginTop: '56px',
                        paddingTop: '32px',
                        borderTop: '1px solid rgba(203, 213, 225, 0.6)'
                    }}>
                        {[
                            { label: 'Autonomous Routing', val: '100%', sub: 'AI Dispatched' },
                            { label: 'Escalation Tracking', val: '24/7', sub: 'Daemon SLA Watch' },
                            { label: 'Input Modalities', val: 'Text • Voice • Image', sub: 'Multilingual Support' },
                            { label: 'Resolution Audit', val: 'Visual AI', sub: 'Before/After Verified' },
                        ].map((stat, i) => (
                            <div key={i} style={{
                                padding: '16px',
                                background: '#FFFFFF',
                                borderRadius: '16px',
                                border: '1px solid #E2E8F0',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                            }}>
                                <div style={{ fontSize: '20px', fontWeight: 700, color: '#1E293B', marginBottom: '2px' }}>
                                    {stat.val}
                                </div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>
                                    {stat.label}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                                    {stat.sub}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Mission & Value Pillars */}
            <section style={{ padding: '70px 0', background: '#FFFFFF' }}>
                <div className="container-js" style={{ maxWidth: '1120px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <div className="pill-js pill-js--accent" style={{ marginBottom: '12px' }}>Platform Purpose</div>
                        <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#0E1A33', marginBottom: '12px' }}>
                            Bridging Governance & Public Needs
                        </h2>
                        <p style={{ maxWidth: '640px', margin: '0 auto', fontSize: '16px', color: '#475569' }}>
                            Traditional grievance systems suffer from manual bottlenecks, duplicate logs, and lack of ground truth.
                            Samadhan Path replaces bureaucratic friction with intelligent automation.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '24px'
                    }}>
                        {[
                            {
                                icon: '🏛️',
                                title: 'Transparent Governance',
                                text: 'Every grievance has a verifiable digital trail. Citizen-facing progress trackers ensure authorities stay accountable to public timelines.'
                            },
                            {
                                icon: '⚡',
                                title: 'Accelerated Turnaround',
                                text: 'Eliminates departmental ping-pong by auto-routing directly to the appropriate municipal team with priority-based worker dispatching.'
                            },
                            {
                                icon: '🤖',
                                title: 'AI-Powered Objectivity',
                                text: 'NLP, Computer Vision, and Sentiment engines classify issues objectively, preventing priority tampering and verifying resolution truth.'
                            },
                            {
                                icon: '🤝',
                                title: 'Citizen-Centric Design',
                                text: 'Inclusive access across Indian languages with instant guest registration and frictionless voice and photo upload capabilities.'
                            }
                        ].map((pillar, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                style={{
                                    padding: '28px',
                                    borderRadius: '20px',
                                    background: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    transition: 'all 0.25s ease'
                                }}
                                whileHover={{ y: -4, borderColor: '#93C5FD', boxShadow: '0 12px 24px rgba(37,99,235,0.08)' }}
                            >
                                <div style={{
                                    fontSize: '32px',
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '14px',
                                    background: '#FFFFFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '16px',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                                    border: '1px solid #E2E8F0'
                                }}>
                                    {pillar.icon}
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
                                    {pillar.title}
                                </h3>
                                <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#64748B', margin: 0 }}>
                                    {pillar.text}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 🚀 Core Features Grid */}
            <section style={{ padding: '80px 0', background: '#F1F5F9' }}>
                <div className="container-js" style={{ maxWidth: '1200px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '52px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#DBEAFE',
                            color: '#1E40AF',
                            fontWeight: 700,
                            fontSize: '12px',
                            padding: '6px 16px',
                            borderRadius: '9999px',
                            marginBottom: '12px',
                            letterSpacing: '0.05em'
                        }}>
                            🚀 COMPREHENSIVE SUITE
                        </div>
                        <h2 style={{ fontSize: '34px', fontWeight: 700, color: '#0E1A33', marginBottom: '14px' }}>
                            Intelligent Features & Capabilities
                        </h2>
                        <p style={{ maxWidth: '680px', margin: '0 auto', fontSize: '16px', color: '#475569' }}>
                            Samadhan Path integrates cutting-edge AI technologies to transform raw civic complaints into verified resolutions.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '24px'
                    }}>
                        {featuresList.map((feat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: (idx % 3) * 0.08 }}
                                style={{
                                    background: '#FFFFFF',
                                    borderRadius: '20px',
                                    padding: '26px',
                                    border: '1px solid #E2E8F0',
                                    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                whileHover={{ y: -5, boxShadow: '0 16px 32px rgba(15, 23, 42, 0.09)', borderColor: '#CBD5E1' }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '16px'
                                }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '14px',
                                        background: `${feat.color}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px'
                                    }}>
                                        {feat.icon}
                                    </div>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        letterSpacing: '0.05em',
                                        padding: '4px 10px',
                                        borderRadius: '9999px',
                                        background: '#F8FAFC',
                                        color: feat.color,
                                        border: `1px solid ${feat.color}30`
                                    }}>
                                        {feat.tag}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
                                    {feat.title}
                                </h3>

                                <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#64748B', flex: 1, margin: 0 }}>
                                    {feat.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stakeholder Collaborative Ecosystem */}
            <section style={{ padding: '80px 0', background: '#FFFFFF' }}>
                <div className="container-js" style={{ maxWidth: '1080px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '44px' }}>
                        <div className="pill-js pill-js--accent" style={{ marginBottom: '12px' }}>Unified Ecosystem</div>
                        <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#0E1A33', marginBottom: '12px' }}>
                            Designed for All Stakeholders
                        </h2>
                        <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '16px', color: '#475569' }}>
                            Connecting all branches of civic governance in a unified, synchronized platform.
                        </p>

                        {/* Tabs */}
                        <div style={{
                            display: 'inline-flex',
                            gap: '8px',
                            background: '#F1F5F9',
                            padding: '6px',
                            borderRadius: '16px',
                            marginTop: '28px',
                            flexWrap: 'wrap',
                            justifyContent: 'center'
                        }}>
                            {Object.keys(stakeholderRoles).map((key) => {
                                const active = activeTab === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setActiveTab(key)}
                                        style={{
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '10px 22px',
                                            borderRadius: '12px',
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            transition: 'all 0.2s ease',
                                            background: active ? '#FFFFFF' : 'transparent',
                                            color: active ? 'var(--accent)' : '#64748B',
                                            boxShadow: active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                                        }}
                                    >
                                        {stakeholderRoles[key].icon} {stakeholderRoles[key].title}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active Stakeholder Card */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
                            border: '1px solid #BFDBFE',
                            borderRadius: '24px',
                            padding: '40px',
                            boxShadow: '0 12px 30px rgba(37, 99, 235, 0.06)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <span style={{ fontSize: '36px' }}>{stakeholderRoles[activeTab].icon}</span>
                                <div>
                                    <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                                        {stakeholderRoles[activeTab].title} Experience
                                    </h3>
                                    <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600 }}>
                                        {stakeholderRoles[activeTab].badge}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '18px'
                        }}>
                            {stakeholderRoles[activeTab].points.map((pt, i) => (
                                <div key={i} style={{
                                    background: '#FFFFFF',
                                    borderRadius: '16px',
                                    padding: '18px 20px',
                                    border: '1px solid #E2E8F0',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px'
                                }}>
                                    <span style={{ color: '#10B981', fontSize: '18px', lineHeight: 1 }}>✔</span>
                                    <span style={{ fontSize: '14px', color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>
                                        {pt}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Technology Stack */}
            <section style={{ padding: '70px 0', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
                <div className="container-js" style={{ maxWidth: '1080px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div className="pill-js pill-js--accent" style={{ marginBottom: '10px' }}>Tech Architecture</div>
                        <h2 style={{ fontSize: '30px', fontWeight: 700, color: '#0E1A33' }}>
                            Built on Modern & Resilient Engineering
                        </h2>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '18px'
                    }}>
                        {techStack.map((tech, i) => (
                            <div key={i} style={{
                                padding: '20px',
                                borderRadius: '16px',
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px'
                            }}>
                                <div style={{ fontSize: '28px' }}>{tech.icon}</div>
                                <div>
                                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>{tech.name}</div>
                                    <div style={{ fontSize: '12px', color: '#64748B' }}>{tech.detail}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* High-Impact CTA */}
            <section style={{
                padding: '70px 0',
                background: 'linear-gradient(135deg, #0E1A33 0%, #1E3A8A 100%)',
                color: '#FFFFFF',
                textAlign: 'center',
                position: 'relative'
            }}>
                <div className="container-js" style={{ maxWidth: '760px', position: 'relative', zIndex: 1 }}>
                    <span style={{ fontSize: '40px', display: 'block', marginBottom: '16px' }}>🌉</span>
                    <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
                        Transform Civic Engagement in Your Community
                    </h2>
                    <p style={{ fontSize: '16px', color: '#CBD5E1', lineHeight: 1.7, marginBottom: '32px' }}>
                        Lodge a civic grievance in seconds or access official dashboards to observe real-time redressing workflows.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register-complaint" className="btn-primary" style={{
                            padding: '14px 30px',
                            fontSize: '15px',
                            fontWeight: 600,
                            background: 'var(--accent)',
                            color: '#FFFFFF'
                        }}>
                            File a Complaint
                        </Link>
                        <Link to="/login" className="btn-secondary" style={{
                            padding: '14px 30px',
                            fontSize: '15px',
                            fontWeight: 600,
                            background: 'rgba(255, 255, 255, 0.12)',
                            color: '#FFFFFF',
                            borderColor: 'rgba(255, 255, 255, 0.25)'
                        }}>
                            Official Portal Login
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;
