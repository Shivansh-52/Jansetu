import os

path = r'c:\Users\Shivansh\Desktop\Samadhan Path\frontend\src\components\Navbar.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """                    ) : (
                        <div className=\"flex items-center gap-4 ml-2\">
                            <button onClick={() => navigate(getDashboardLink())} className=\"text-sm font-semibold text-[#1d4ed8] hover:underline\">
                                Dashboard
                            </button>
                            {user.role === 'citizen' && (
                                <Link to=\"/certificates\" className=\"text-sm font-medium text-gray-600 hover:text-[#1d4ed8]\">
                                    dY\", My Certificates
                                </Link>
                            )}
                            <button onClick={handleLogout} className=\"text-gray-500 hover:text-red-500 transition-colors font-medium text-sm border border-gray-200 px-3 py-1.5 rounded-full hover:bg-red-50\">
                                Sign Out
                            </button>
                        </div>
                    )}"""

replacement = """                    ) : (
                        <div className=\"flex items-center gap-3 ml-2\">
                            {user.role === 'citizen' && (
                                <Link to=\"/certificates\" className=\"text-sm font-medium text-gray-600 hover:text-[#1d4ed8]\">
                                    My Certificates
                                </Link>
                            )}
                            <button 
                                onClick={() => navigate(getDashboardLink())} 
                                style={{ 
                                    backgroundColor: '#1d4ed8', 
                                    color: 'white', 
                                    padding: '8px 20px', 
                                    borderRadius: '9999px', 
                                    fontSize: '14px', 
                                    fontWeight: 600, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 2px 4px rgba(29, 78, 216, 0.2)'
                                }}
                            >
                                <div style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={14} color=\"white\" />
                                </div>
                                {user.name ? user.name.split(' ')[0] : 'Dashboard'}
                            </button>
                            <button onClick={handleLogout} className=\"text-gray-500 hover:text-red-500 transition-colors font-medium text-sm border border-gray-200 px-3 py-1.5 rounded-full hover:bg-red-50\">
                                Sign Out
                            </button>
                        </div>
                    )}"""

if target in content:
    content = content.replace(target, replacement)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Desktop navbar updated")
else:
    print("Desktop navbar string NOT found")
