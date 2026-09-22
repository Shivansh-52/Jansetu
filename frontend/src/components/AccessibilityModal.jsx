import React, { useState, useEffect } from 'react';
import { Accessibility, X, Type, ToggleLeft, ToggleRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AccessibilityModal = ({ isOpen, onClose }) => {
    const [textSize, setTextSize] = useState('default');
    const [highContrast, setHighContrast] = useState(false);
    const [reduceAnimations, setReduceAnimations] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setHighContrast(document.documentElement.classList.contains('high-contrast'));
            setReduceAnimations(document.documentElement.classList.contains('reduce-animations'));
            if (document.documentElement.classList.contains('text-small')) setTextSize('small');
            else if (document.documentElement.classList.contains('text-large')) setTextSize('large');
            else setTextSize('default');
        }
    }, [isOpen]);

    const handleApply = () => {
        document.documentElement.classList.remove('text-small', 'text-large');
        if (textSize === 'small') document.documentElement.classList.add('text-small');
        if (textSize === 'large') document.documentElement.classList.add('text-large');

        if (highContrast) {
            document.documentElement.classList.add('high-contrast');
            if (!document.getElementById('a11y-styles-contrast')) {
                const style = document.createElement('style');
                style.id = 'a11y-styles-contrast';
                style.innerHTML = `
                    .high-contrast { filter: contrast(120%) saturate(1.1); }
                    .high-contrast * { border-color: rgba(0,0,0,0.4) !important; }
                `;
                document.head.appendChild(style);
            }
        } else {
            document.documentElement.classList.remove('high-contrast');
        }

        if (reduceAnimations) {
            document.documentElement.classList.add('reduce-animations');
            if (!document.getElementById('a11y-styles-anim')) {
                const style = document.createElement('style');
                style.id = 'a11y-styles-anim';
                style.innerHTML = `
                    .reduce-animations * {
                        animation: none !important;
                        transition: none !important;
                        scroll-behavior: auto !important;
                    }
                `;
                document.head.appendChild(style);
            }
        } else {
            document.documentElement.classList.remove('reduce-animations');
        }

        if (!document.getElementById('a11y-styles-text')) {
            const style = document.createElement('style');
            style.id = 'a11y-styles-text';
            style.innerHTML = `
                .text-small { font-size: 90% !important; }
                .text-large { font-size: 110% !important; }
            `;
            document.head.appendChild(style);
        }

        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)',
                            backdropFilter: 'blur(8px)', zIndex: 99999
                        }}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        style={{
                            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            width: '100%', maxWidth: 540, backgroundColor: '#ffffff', borderRadius: 24,
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', zIndex: 100000,
                            display: 'flex', flexDirection: 'column', overflow: 'hidden'
                        }}
                    >
                        {/* Header */}
                        <div style={{ backgroundColor: '#1e1b4b', padding: '32px 24px', position: 'relative', color: 'white' }}>
                            <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: 8, borderRadius: '50%', display: 'flex' }}>
                                <X size={20} />
                            </button>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Accessibility size={28} />
                                </div>
                                <div>
                                    <h2 style={{ margin: '0 0 4px 0', fontSize: 22, fontWeight: 700 }}>Accessibility Configuration</h2>
                                    <p style={{ margin: 0, fontSize: 14, color: '#a5b4fc', lineHeight: 1.4 }}>Customize the interface to suit your visual and interactive preferences.</p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
                            
                            {/* Text Size */}
                            <div>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Select Interface Text Size
                                </h3>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <div 
                                        onClick={() => setTextSize('small')}
                                        style={{ 
                                            flex: 1, padding: '16px', borderRadius: 16, border: `2px solid ${textSize === 'small' ? '#4f46e5' : '#e2e8f0'}`,
                                            backgroundColor: textSize === 'small' ? '#eef2ff' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: textSize === 'small' ? '#4f46e5' : '#64748b' }}>A</div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Small</div>
                                    </div>
                                    <div 
                                        onClick={() => setTextSize('default')}
                                        style={{ 
                                            flex: 1, padding: '16px', borderRadius: 16, border: `2px solid ${textSize === 'default' ? '#4f46e5' : '#e2e8f0'}`,
                                            backgroundColor: textSize === 'default' ? '#eef2ff' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: textSize === 'default' ? '#4f46e5' : '#64748b' }}>A</div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Default</div>
                                    </div>
                                    <div 
                                        onClick={() => setTextSize('large')}
                                        style={{ 
                                            flex: 1, padding: '16px', borderRadius: 16, border: `2px solid ${textSize === 'large' ? '#4f46e5' : '#e2e8f0'}`,
                                            backgroundColor: textSize === 'large' ? '#eef2ff' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: textSize === 'large' ? '#4f46e5' : '#64748b' }}>A</div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Large</div>
                                    </div>
                                </div>
                            </div>

                            {/* Contrast Level */}
                            <div>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Select Color Contrast Level
                                </h3>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <div 
                                        onClick={() => setHighContrast(false)}
                                        style={{ 
                                            flex: 1, padding: '16px', borderRadius: 16, border: `2px solid ${!highContrast ? '#4f46e5' : '#e2e8f0'}`,
                                            backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s', position: 'relative'
                                        }}
                                    >
                                        <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #94a3b8' }}></div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Standard</div>
                                            <div style={{ fontSize: 12, color: '#64748b' }}>Default theme</div>
                                        </div>
                                        {!highContrast && <div style={{ position: 'absolute', top: 12, right: 12, color: '#4f46e5' }}><Check size={16} /></div>}
                                    </div>
                                    
                                    <div 
                                        onClick={() => setHighContrast(true)}
                                        style={{ 
                                            flex: 1, padding: '16px', borderRadius: 16, border: `2px solid ${highContrast ? '#4f46e5' : '#000000'}`,
                                            backgroundColor: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s', position: 'relative'
                                        }}
                                    >
                                        <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: 'white' }}></div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>High Contrast</div>
                                            <div style={{ fontSize: 12, color: '#94a3b8' }}>Maximum visibility</div>
                                        </div>
                                        {highContrast && <div style={{ position: 'absolute', top: 12, right: 12, color: '#818cf8' }}><Check size={16} /></div>}
                                    </div>
                                </div>
                            </div>

                            {/* Motion */}
                            <div>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Motion & Animation
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', border: '1px solid #e2e8f0', borderRadius: 16 }}>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                                            Reduced Motion (Animations)
                                        </div>
                                        <div style={{ fontSize: 13, color: '#64748b' }}>Minimizes UI transitions and animations</div>
                                    </div>
                                    <button 
                                        onClick={() => setReduceAnimations(!reduceAnimations)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: reduceAnimations ? '#4f46e5' : '#cbd5e1', display: 'flex', padding: 0 }}
                                    >
                                        {reduceAnimations ? <ToggleRight size={44} strokeWidth={1.5} /> : <ToggleLeft size={44} strokeWidth={1.5} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 16 }}>
                            <button 
                                onClick={onClose}
                                style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleApply}
                                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}
                            >
                                <Check size={18} /> Apply Preferences
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AccessibilityModal;
