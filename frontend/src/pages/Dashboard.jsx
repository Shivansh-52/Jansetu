import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const navigate = useNavigate();
    const [masterId, setMasterId] = useState('');
    const [connectedServices, setConnectedServices] = useState([]);

    useEffect(() => {
        const storedMasterId = localStorage.getItem('masterId');
        if (!storedMasterId) {
            navigate('/login');
            return;
        }
        setMasterId(storedMasterId);
        
        // In a real app, fetch this from the Gateway /api/auth/me equivalent
        try {
            const services = JSON.parse(localStorage.getItem('connectedServices')) || [];
            setConnectedServices(services);
        } catch (e) {
            setConnectedServices([]);
        }
    }, [navigate]);

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: 30 }}>
                <h1 style={{ fontSize: 28, marginBottom: 8, color: 'var(--text-primary)' }}>Citizen Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage your government services and data permissions.</p>
            </div>

            <div style={{
                background: 'white', borderRadius: 12, padding: 24,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: 30,
                border: '1px solid var(--border-light)'
            }}>
                <h2 style={{ fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-secondary)', marginBottom: 20 }}>
                    My Government Identity
                </h2>
                
                <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                    <div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Master ID</p>
                        <p style={{ fontSize: 24, fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent)' }}>
                            {masterId || 'Loading...'}
                        </p>
                    </div>

                    <div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Connected Services</p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {['education', 'publicServices', 'infrastructure'].map(svc => (
                                <div key={svc} style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '6px 12px', background: connectedServices.includes(svc) ? '#ecfdf5' : '#f3f4f6',
                                    color: connectedServices.includes(svc) ? '#059669' : '#6b7280',
                                    borderRadius: 20, fontSize: 13, fontWeight: 500
                                }}>
                                    {connectedServices.includes(svc) ? '✓' : '○'} {svc.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </div>
                            ))}
                            {['healthcare', 'agriculture'].map(svc => (
                                <div key={svc} style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '6px 12px', background: '#f3f4f6', color: '#9ca3af',
                                    borderRadius: 20, fontSize: 13, fontWeight: 500
                                }}>
                                    Coming Soon
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                <div 
                    onClick={() => navigate('/education')}
                    style={{
                        background: 'white', borderRadius: 12, padding: 24, cursor: 'pointer',
                        border: '1px solid var(--accent)', boxShadow: '0 10px 15px -3px rgba(43,107,255, 0.1)',
                        transition: 'transform 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ fontSize: 32, marginBottom: 16 }}>🎓</div>
                    <h3 style={{ fontSize: 18, marginBottom: 8, color: 'var(--text-primary)' }}>Education</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                        Apply for scholarships, loans, and request academic documents.
                    </p>
                    <div style={{ marginTop: 16, fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                        Start Process →
                    </div>
                </div>

                <div 
                    onClick={() => navigate('/healthcare')}
                    style={{
                        background: 'white', borderRadius: 12, padding: 24, cursor: 'pointer',
                        border: '1px solid var(--accent)', boxShadow: '0 10px 15px -3px rgba(43,107,255, 0.1)',
                        transition: 'transform 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ fontSize: 32, marginBottom: 16 }}>🏥</div>
                    <h3 style={{ fontSize: 18, marginBottom: 8, color: 'var(--text-primary)' }}>Healthcare</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                        Government schemes, medical subsidies, and health documents.
                    </p>
                    <div style={{ marginTop: 16, fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                        Start Process →
                    </div>
                </div>

                <div 
                    onClick={() => navigate('/agriculture')}
                    style={{
                        background: 'white', borderRadius: 12, padding: 24, cursor: 'pointer',
                        border: '1px solid var(--accent)', boxShadow: '0 10px 15px -3px rgba(43,107,255, 0.1)',
                        transition: 'transform 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ fontSize: 32, marginBottom: 16 }}>🌾</div>
                    <h3 style={{ fontSize: 18, marginBottom: 8, color: 'var(--text-primary)' }}>Agriculture</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                        Crop insurance, farmer schemes, and land records.
                    </p>
                    <div style={{ marginTop: 16, fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                        Start Process →
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
