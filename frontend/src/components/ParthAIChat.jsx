import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, User, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ParthAIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Namaste! I am Samadhan Path, your assistant. How can I help you navigate government services today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message
        const userMsg = { id: Date.now(), sender: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            let aiText = "I can definitely help you with that. However, this is currently a simulation. In the future, I'll be connected directly to the SamadhanPath Orchestration layer to fetch your documents, track your applications, and answer queries instantly!";
            
            if (userMsg.text.toLowerCase().includes('scholarship')) {
                aiText = "Looking for scholarships? You can check the 'Education' category in our Services Directory to find state and central scholarship schemes you are eligible for.";
            } else if (userMsg.text.toLowerCase().includes('complaint')) {
                aiText = "You can register civic or infrastructure complaints directly through the 'Public Grievances' section on your dashboard.";
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: aiText }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{ 
                            position: 'absolute', bottom: 80, right: 0, 
                            width: 'calc(100vw - 48px)', maxWidth: 380, height: 500, 
                            backgroundColor: '#ffffff', borderRadius: 20, 
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
                            border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', 
                            overflow: 'hidden' 
                        }}
                    >
                        {/* Header */}
                        <div style={{ 
                            background: 'linear-gradient(135deg, #1d4ed8 0%, #9333ea 100%)', 
                            padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            position: 'relative', overflow: 'hidden'
                        }}>
                            {/* Abstract background blobs for header */}
                            <div style={{ position: 'absolute', top: -30, right: -20, width: 100, height: 100, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 10 }}>
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12, boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)' }}>
                                    <Sparkles size={20} color="white" />
                                </div>
                                <div>
                                    <h3 style={{ color: 'white', margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '0.02em' }}>Samadhan Path</h3>
                                    <p style={{ color: '#dbeafe', margin: 0, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                        <span style={{ width: 8, height: 8, backgroundColor: '#4ade80', borderRadius: '50%', display: 'inline-block' }}></span> Smart Assistant
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 10 }}>
                                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Minus size={20} />
                                </button>
                                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, backgroundColor: '#f8fafc' }}>
                            {messages.map((msg) => (
                                <div key={msg.id} style={{ display: 'flex', gap: 12, flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
                                    {msg.sender === 'bot' && (
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #1d4ed8 0%, #9333ea 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                            <Bot size={16} />
                                        </div>
                                    )}
                                    <div style={{ 
                                        padding: '12px 16px', 
                                        maxWidth: '75%', 
                                        fontSize: 14, 
                                        lineHeight: 1.5,
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                        ...(msg.sender === 'bot' 
                                            ? { backgroundColor: 'white', color: '#334155', border: '1px solid #f1f5f9', borderRadius: '16px 16px 16px 4px' } 
                                            : { backgroundColor: '#1d4ed8', color: 'white', borderRadius: '16px 16px 4px 16px' })
                                    }}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #1d4ed8 0%, #9333ea 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                        <Bot size={16} />
                                    </div>
                                    <div style={{ padding: '12px 16px', backgroundColor: 'white', border: '1px solid #f1f5f9', borderRadius: '16px 16px 16px 4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: 6, height: 6, backgroundColor: '#94a3b8', borderRadius: '50%' }}></div>
                                        <div style={{ width: 6, height: 6, backgroundColor: '#94a3b8', borderRadius: '50%' }}></div>
                                        <div style={{ width: 6, height: 6, backgroundColor: '#94a3b8', borderRadius: '50%' }}></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: 16, backgroundColor: 'white', borderTop: '1px solid #f1f5f9' }}>
                            <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: 6, borderRadius: 9999 }}>
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask Samadhan Path..." 
                                    style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: 14, padding: '8px 12px', color: '#334155' }}
                                />
                                <button 
                                    type="submit" 
                                    disabled={!input.trim()}
                                    style={{ 
                                        backgroundColor: input.trim() ? '#1d4ed8' : '#94a3b8', 
                                        color: 'white', border: 'none', width: 36, height: 36, 
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: input.trim() ? 'pointer' : 'not-allowed', transition: 'background-color 0.2s'
                                    }}
                                >
                                    <Send size={16} style={{ marginLeft: 2 }} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)} 
                style={{ 
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #9333ea 100%)', 
                    color: 'white', border: 'none', width: 64, height: 64, 
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(29,78,216,0.4)',
                    position: 'relative', zIndex: 10
                }}
            >
                {isOpen ? <X size={28} /> : <Bot size={28} />}
            </motion.button>
        </div>
    );
};

export default ParthAIChat;
