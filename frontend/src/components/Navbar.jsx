import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Globe, Accessibility, LogIn, ChevronDown, Layers, Building2, Award, Sprout } from 'lucide-react';
import AccessibilityModal from './AccessibilityModal';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [lang, setLang] = useState('English');
    const [isA11yOpen, setIsA11yOpen] = useState(false);

    const toggleAccessibility = () => {
        setIsA11yOpen(true);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    const getDashboardLink = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'citizen': return '/user-dashboard';
            case 'worker': return '/worker-dashboard';
            case 'contractor': return '/contractor-dashboard';
            case 'dept_officer': return '/dept-officer-dashboard';
            case 'admin': return '/admin-dashboard';
            case 'governance': return '/governance-dashboard';
            default: return '/';
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-sm w-full">
            <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                
                {/* Logo Area */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="flex items-center justify-center">
                        <img src="/samadhan-logo.png" alt="SamadhanPath Logo" className="h-10 object-contain" />
                    </div>
                </div>

                {/* Central Links (Desktop) */}
                {!user && (
                    <div className="hidden md:flex items-center gap-8 h-full">
                        <Link to="/" className={`text-sm font-medium h-full flex items-center ${isActive('/') ? 'text-[#1d4ed8] border-b-2 border-[#1d4ed8]' : 'text-gray-600 hover:text-gray-900'}`}>Home</Link>
                        <Link to="/services" className={`text-sm font-medium h-full flex items-center ${isActive('/services') ? 'text-[#1d4ed8] border-b-2 border-[#1d4ed8]' : 'text-gray-600 hover:text-gray-900'}`}>Services</Link>
                        
                        <div 
                            className="relative flex items-center h-full cursor-pointer"
                            onMouseEnter={() => setIsCategoriesOpen(true)}
                            onMouseLeave={() => setIsCategoriesOpen(false)}
                        >
                            <span className={`text-sm font-medium flex items-center gap-1 ${isCategoriesOpen ? 'text-[#1d4ed8]' : 'text-gray-600 hover:text-gray-900'}`}>
                                Categories <ChevronDown size={14} className={`transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                            </span>
                            
                            {/* Categories Dropdown */}
                            {isCategoriesOpen && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[380px] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 p-3 z-50 animate-fade-in-up">
                                    <div className="text-[10px] font-bold text-gray-500 tracking-widest mb-3 px-4 pt-2 flex items-center justify-between uppercase">
                                        <span>Service Directory</span>
                                        <span className="bg-blue-50 text-[#1d4ed8] px-2.5 py-1 rounded-full text-[9px] font-bold border border-blue-100 shadow-sm">280+ Services</span>
                                    </div>
                                    
                                    <div className="flex flex-col gap-1">
                                        <Link to="/services" className="group flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-all duration-200">
                                            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl mt-0.5 group-hover:scale-110 group-hover:bg-blue-100 transition-transform duration-200 shadow-sm">
                                                <Layers size={20} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-gray-900 group-hover:text-blue-700 transition-colors">All 13 Service Categories</div>
                                                <div className="text-xs text-gray-500 mt-1 leading-relaxed">Education, Housing, Healthcare, MSME & Welfare</div>
                                            </div>
                                        </Link>
                                        
                                        <Link to="/services?q=departments" className="group flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-all duration-200">
                                            <div className="bg-purple-50 text-purple-600 p-2.5 rounded-xl mt-0.5 group-hover:scale-110 group-hover:bg-purple-100 transition-transform duration-200 shadow-sm">
                                                <Building2 size={20} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-gray-900 group-hover:text-purple-700 transition-colors">Department Directory</div>
                                                <div className="text-xs text-gray-500 mt-1 leading-relaxed">35 Central, State, District & Municipal departments</div>
                                            </div>
                                        </Link>
                                        
                                        <Link to="/certificates" className="group flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-all duration-200">
                                            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl mt-0.5 group-hover:scale-110 group-hover:bg-emerald-100 transition-transform duration-200 shadow-sm">
                                                <Award size={20} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition-colors">Statutory Certificates Hub</div>
                                                <div className="text-xs text-gray-500 mt-1 leading-relaxed">10 State-authorized records: Income, Caste, Domicile</div>
                                            </div>
                                        </Link>

                                        <Link to="/agriculture" className="group flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-all duration-200">
                                            <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl mt-0.5 group-hover:scale-110 group-hover:bg-amber-100 transition-transform duration-200 shadow-sm">
                                                <Sprout size={20} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-gray-900 group-hover:text-amber-700 transition-colors">Agriculture & Farmers Hub</div>
                                                <div className="text-xs text-gray-500 mt-1 leading-relaxed">PM-KISAN, PMFBY, KCC & DBT farmer schemes</div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link to="/#how-it-works" className={`text-sm font-medium h-full flex items-center ${isActive('/#how-it-works') ? 'text-[#1d4ed8] border-b-2 border-[#1d4ed8]' : 'text-gray-600 hover:text-gray-900'}`}>How It Works</Link>
                        <Link to="/about" className={`text-sm font-medium h-full flex items-center ${isActive('/about') ? 'text-[#1d4ed8] border-b-2 border-[#1d4ed8]' : 'text-gray-600 hover:text-gray-900'}`}>About</Link>
                        <Link to="/register-complaint" className={`text-sm font-medium h-full flex items-center ${isActive('/register-complaint') ? 'text-[#1d4ed8] border-b-2 border-[#1d4ed8]' : 'text-gray-600 hover:text-gray-900'}`}>Complaint</Link>
                        <a href="#footer" className={`text-sm font-medium h-full flex items-center text-gray-600 hover:text-gray-900`}>Help & Support</a>
                    </div>
                )}

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-3">
                    <div className="relative">
                        <button 
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            <Globe size={16} className="text-[#1d4ed8]" />
                            {lang} <ChevronDown size={14} className={`text-gray-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isLangOpen && (
                            <div className="absolute top-full right-0 mt-2 w-32 bg-white border border-gray-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] rounded-xl py-2 z-50 animate-fade-in-up">
                                {['English', 'हिंदी', 'मराठी', 'తెలుగు'].map(l => (
                                    <button 
                                        key={l} 
                                        onClick={() => { setLang(l); setIsLangOpen(false); }} 
                                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${lang === l ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-gray-700 hover:bg-slate-50'}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={toggleAccessibility}
                        title="Toggle High Contrast & Large Text"
                        className="p-2 text-gray-600 hover:text-[#1d4ed8] hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 shadow-sm"
                    >
                        <Accessibility size={18} />
                    </button>

                    {!user ? (
                        <button 
                            onClick={() => navigate('/login')} 
                            style={{ 
                                backgroundColor: '#1d4ed8', 
                                color: 'white', 
                                padding: '10px 24px', 
                                borderRadius: '9999px', 
                                fontSize: '15px', 
                                fontWeight: 600, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                marginLeft: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 2px 4px rgba(29, 78, 216, 0.2)'
                            }}
                            onMouseOver={e => { e.currentTarget.style.backgroundColor = '#1e40af'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(29, 78, 216, 0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseOut={e => { e.currentTarget.style.backgroundColor = '#1d4ed8'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(29, 78, 216, 0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <LogIn size={18} color="white" />
                            Sign In
                        </button>
                    ) : (
                        <div className="flex items-center gap-4 ml-2">
                            <button onClick={() => navigate(getDashboardLink())} className="text-sm font-semibold text-[#1d4ed8] hover:underline">
                                Dashboard
                            </button>
                            {user.role === 'citizen' && (
                                <Link to="/certificates" className="text-sm font-medium text-gray-600 hover:text-[#1d4ed8]">
                                    📄 My Certificates
                                </Link>
                            )}
                            <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors font-medium text-sm border border-gray-200 px-3 py-1.5 rounded-full hover:bg-red-50">
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 p-4 flex flex-col gap-4 shadow-lg">
                    {!user && (
                        <>
                            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="font-medium text-gray-800 border-b border-gray-100 pb-2">Home</Link>
                            <Link to="/services" onClick={() => setIsMobileMenuOpen(false)} className="font-medium text-gray-800 border-b border-gray-100 pb-2">Services</Link>
                            <Link to="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="font-medium text-gray-800 border-b border-gray-100 pb-2">How It Works</Link>
                            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="font-medium text-gray-800 border-b border-gray-100 pb-2">About</Link>
                            <Link to="/register-complaint" onClick={() => setIsMobileMenuOpen(false)} className="font-medium text-gray-800 border-b border-gray-100 pb-2">Complaint</Link>
                            <a href="#footer" onClick={() => setIsMobileMenuOpen(false)} className="font-medium text-gray-800 pb-2">Help & Support</a>
                        </>
                    )}
                    <div className="h-px bg-gray-200 my-1"></div>
                    {!user ? (
                        <button 
                            onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }} 
                            style={{ 
                                backgroundColor: '#1d4ed8', 
                                color: 'white', 
                                padding: '12px', 
                                borderRadius: '9999px', 
                                fontSize: '16px', 
                                fontWeight: 600, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                gap: '8px', 
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                width: '100%'
                            }}
                        >
                            <LogIn size={20} color="white" /> Sign In
                        </button>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <button onClick={() => { setIsMobileMenuOpen(false); navigate(getDashboardLink()); }} style={{ backgroundColor: '#1d4ed8', color: 'white' }} className="py-2.5 rounded-full font-medium w-full border-0">Dashboard</button>
                            <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="text-red-600 font-medium text-left border border-gray-200 p-2.5 rounded-full flex justify-center w-full bg-red-50">Sign Out</button>
                        </div>
                    )}
                </div>
            )}

            <AccessibilityModal isOpen={isA11yOpen} onClose={() => setIsA11yOpen(false)} />
        </nav>
    );
};

export default Navbar;
