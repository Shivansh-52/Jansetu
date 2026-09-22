import React from 'react';
import { RefreshCw, Lock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TopBanner = () => {
    const navigate = useNavigate();
    
    return (
        <div className="bg-[#111827] text-gray-300 text-[11px] md:text-xs py-1.5 px-4 flex justify-between items-center w-full z-50 overflow-x-auto whitespace-nowrap">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[#1f2937] px-3 py-1 rounded-full border border-gray-700 shadow-inner">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                    <span className="font-medium text-blue-100 tracking-wide">SamadhanPath Federated Orchestration Layer</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-gray-400 bg-[#1f2937]/50 border border-gray-700/50 px-2.5 py-1 rounded">
                    <Lock size={12} className="text-gray-500" />
                    <span>Public Visitor Mode (Unauthenticated)</span>
                </div>
                
                <span className="hidden lg:inline-block text-gray-500 ml-2">
                    Strict DPDP Act 2023 compliance • Zero hardcoded users
                </span>
            </div>
            
            <div className="flex items-center gap-3 pl-4">
                <button 
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-1.5 bg-primary hover:bg-blue-800 text-white px-3 py-1 rounded text-[11px] font-semibold transition-colors"
                >
                    <LogIn size={12} />
                    Multi-Role Sign In
                </button>
                <button className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-700">
                    <RefreshCw size={12} />
                </button>
            </div>
        </div>
    );
};

export default TopBanner;
