import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { motion } from 'framer-motion';

const ROLE_ROUTES = {
    citizen: '/user-dashboard',
    worker: '/worker-dashboard',
    dept_officer: '/dept-officer-dashboard',
    contractor: '/contractor-dashboard',
    admin: '/admin-dashboard',
    governance: '/governance-dashboard'
};

const DEMO_LOGINS = [
    { role: 'contractor', title: 'Contractor', email: 'contractor@jansetu.ai', pass: 'contractor123', icon: '👷‍♂️', color: '#ea580c' },
    { role: 'governance', title: 'Governance', email: 'gov@jansetu.ai', pass: 'gov123', icon: '🏛️', color: '#4f46e5' },
    { role: 'dept_officer', title: 'Dept Officer', email: 'officer@jansetu.ai', pass: 'officer123', icon: '📋', color: '#0284c7' },
    { role: 'admin', title: 'Admin', email: 'admin@jansetu.ai', pass: 'admin123', icon: '🛡️', color: '#059669' },
    { role: 'worker', title: 'Worker', email: 'worker@jansetu.ai', pass: 'worker123', icon: '🔧', color: '#d97706' },
    { role: 'citizen', title: 'Citizen', email: 'citizen@jansetu.ai', pass: 'citizen123', icon: '🧑‍💻', color: '#2563eb' }
];

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const parsed = JSON.parse(user);
                navigate(ROLE_ROUTES[parsed.role] || '/', { replace: true });
            } catch { }
        }
    }, [navigate]);

    const performLogin = async (loginEmail, loginPass) => {
        setError('');
        setLoading(true);
        try {
            const res = await loginUser(loginEmail, loginPass, 'public');
            const role = res.user?.role;
            const targetRoute = ROLE_ROUTES[role] || '/';
            navigate(targetRoute, { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        await performLogin(email, password);
    };

    const handleQuickLogin = (demo) => {
        setEmail(demo.email);
        setPassword(demo.pass);
        performLogin(demo.email, demo.pass);
    };

    return (
        <div className="page-bg" style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px 20px', position: 'relative', overflow: 'hidden'
        }}>
            {/* Background blobs */}
            <div className="blob" style={{
                width: 400, height: 400, background: 'var(--bg-secondary)',
                top: '-10%', right: '-5%'
            }} />
            <div className="blob" style={{
                width: 300, height: 300, background: 'rgba(43,107,255,0.06)',
                bottom: '10%', left: '-5%'
            }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16
                        }}>SP</div>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 22, color: 'var(--text-primary)' }}>
                            Samadhan<span style={{ color: 'var(--accent)' }}>Path</span>
                        </span>
                    </Link>
                    <h2 style={{ fontSize: 26, marginBottom: 6 }}>Welcome back</h2>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Sign in or select a 1-click demo role</p>
                </div>

                {/* Quick 1-Click Role Login Bar */}
                <div style={{
                    marginBottom: 20, padding: 14, borderRadius: 16,
                    background: 'white', border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-card)'
                }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                        <span>⚡ 1-Click Demo Login</span>
                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Zero typing needed</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        {DEMO_LOGINS.map((demo) => (
                            <button
                                key={demo.role}
                                type="button"
                                onClick={() => handleQuickLogin(demo)}
                                style={{
                                    padding: '8px 6px', borderRadius: 10, border: '1px solid var(--border-light)',
                                    background: 'var(--bg-secondary)', cursor: 'pointer',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                                    fontSize: 11, fontWeight: 600, color: 'var(--text-primary)',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = demo.color;
                                    e.currentTarget.style.background = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border-light)';
                                    e.currentTarget.style.background = 'var(--bg-secondary)';
                                }}
                            >
                                <span style={{ fontSize: 16 }}>{demo.icon}</span>
                                <span>{demo.title}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Card */}
                <div className="card-js" style={{ padding: 32 }}>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                padding: '12px 16px', borderRadius: 12,
                                background: '#fef2f2', border: '1px solid #fecaca',
                                color: 'var(--color-danger)', fontSize: 14, fontWeight: 500,
                                marginBottom: 20
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: 18 }}>
                            <label style={{
                                display: 'block', fontSize: 13, fontWeight: 600,
                                color: 'var(--text-secondary)', marginBottom: 8
                            }}>Email Address</label>
                            <input
                                type="email"
                                className="input-js"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div style={{ marginBottom: 22 }}>
                            <label style={{
                                display: 'block', fontSize: 13, fontWeight: 600,
                                color: 'var(--text-secondary)', marginBottom: 8
                            }}>Password</label>
                            <input
                                type="password"
                                className="input-js"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{
                        textAlign: 'center', marginTop: 22, paddingTop: 18,
                        borderTop: '1px solid var(--border-light)'
                    }}>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Official link */}
                <div style={{ textAlign: 'center', marginTop: 18 }}>
                    <Link to="/up2" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                        Official Portal Access →
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
