import React, { useState, useEffect } from 'react';

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('samadhan_cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('samadhan_cookie_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            maxWidth: 400,
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            gap: 16
        }}>
            <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>🍪 Cookie Preferences</h4>
                <p style={{ margin: 0, fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
                    We use cookies to ensure you get the best experience on Samadhan Path, maintaining your secure master identity session.
                </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
                <button 
                    onClick={acceptCookies}
                    style={{
                        flex: 1, backgroundColor: '#1d4ed8', color: 'white', border: 'none', 
                        padding: '10px', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#1e40af'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                >
                    Accept All
                </button>
                <button 
                    onClick={acceptCookies}
                    style={{
                        flex: 1, backgroundColor: 'white', color: '#64748b', border: '1px solid #cbd5e1', 
                        padding: '10px', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
                >
                    Essential Only
                </button>
            </div>
        </div>
    );
};

export default CookieBanner;
