import os

path = r'c:\Users\Shivansh\Desktop\Samadhan Path\frontend\src\components\Navbar.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Desktop Central Links opening
target1 = """                {/* Central Links (Desktop) */}
                {!user && (
                    <div className=\"hidden md:flex items-center gap-8 h-full\">"""
replace1 = """                {/* Central Links (Desktop) */}
                <div className=\"hidden md:flex items-center gap-8 h-full\">"""

# Desktop Central Links closing
target2 = """                        <a href=\"#footer\" className={`text-sm font-medium h-full flex items-center text-gray-600 hover:text-gray-900`}>Help & Support</a>
                    </div>
                )}

                {/* Right Actions */}"""
replace2 = """                        <a href=\"#footer\" className={`text-sm font-medium h-full flex items-center text-gray-600 hover:text-gray-900`}>Help & Support</a>
                    </div>

                {/* Right Actions */}"""

# Mobile Links opening
target3 = """            {/* Mobile Dropdown */}
            {isMobileMenuOpen && (
                <div className=\"md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 p-4 flex flex-col gap-4 shadow-lg\">
                    {!user && (
                        <>
                            <Link to=\"/\" onClick={() => setIsMobileMenuOpen(false)} className=\"font-medium text-gray-800 border-b border-gray-100 pb-2\">Home</Link>"""
replace3 = """            {/* Mobile Dropdown */}
            {isMobileMenuOpen && (
                <div className=\"md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 p-4 flex flex-col gap-4 shadow-lg\">
                        <>
                            <Link to=\"/\" onClick={() => setIsMobileMenuOpen(false)} className=\"font-medium text-gray-800 border-b border-gray-100 pb-2\">Home</Link>"""

# Mobile Links closing
target4 = """                            <Link to=\"/register-complaint\" onClick={() => setIsMobileMenuOpen(false)} className=\"font-medium text-gray-800 border-b border-gray-100 pb-2\">Complaint</Link>
                            <a href=\"#footer\" onClick={() => setIsMobileMenuOpen(false)} className=\"font-medium text-gray-800 pb-2\">Help & Support</a>
                        </>
                    )}
                    <div className=\"h-px bg-gray-200 my-1\"></div>"""
replace4 = """                            <Link to=\"/register-complaint\" onClick={() => setIsMobileMenuOpen(false)} className=\"font-medium text-gray-800 border-b border-gray-100 pb-2\">Complaint</Link>
                            <a href=\"#footer\" onClick={() => setIsMobileMenuOpen(false)} className=\"font-medium text-gray-800 pb-2\">Help & Support</a>
                        </>
                    <div className=\"h-px bg-gray-200 my-1\"></div>"""


content = content.replace(target1, replace1)
content = content.replace(target2, replace2)
content = content.replace(target3, replace3)
content = content.replace(target4, replace4)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated links visibility.")
