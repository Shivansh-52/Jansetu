import os

path = r'c:\Users\Shivansh\Desktop\Samadhan Path\frontend\src\App.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Home
target_home = """                    <RedirectIfAuthenticated>
                        <Home />
                    </RedirectIfAuthenticated>"""
replace_home = """                        <Home />"""

# Replace Services
target_services = """                    <RedirectIfAuthenticated>
                        <Services />
                    </RedirectIfAuthenticated>"""
replace_services = """                        <Services />"""

# Replace About
target_about = """                    <RedirectIfAuthenticated>
                        <About />
                    </RedirectIfAuthenticated>"""
replace_about = """                        <About />"""

content = content.replace(target_home, replace_home)
content = content.replace(target_services, replace_services)
content = content.replace(target_about, replace_about)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated App.jsx successfully.")
