import re

path = r'c:\Users\Shivansh\Desktop\Samadhan Path\frontend\src\pages\ScholarshipApplication.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'A"?o': '✓',
    'A,???T': '🔒',
    'A??T': '→',
    'A?A?': '←',
    'A,A': '•',
    'A?sA1': '₹',
    'A"?"': '❌',
    'AA ': '⚠️ ',
    'A,?': '🎉',
    'A"?o': '✓', # Sometimes there are variations, but these look consistent
}

for bad, good in replacements.items():
    content = content.replace(bad, good)

# Fix any stray encoding issues if they still exist
# Let's do a regex for anything that looks like "A" followed by weird chars
content = re.sub(r'A"\?o', '✓', content)
content = re.sub(r'A,\?\?\?T', '🔒', content)
content = re.sub(r'A\?\?T', '→', content)
content = re.sub(r'A\?A\?', '←', content)
content = re.sub(r'A,A', '•', content)
content = re.sub(r'A\?sA1', '₹', content)
content = re.sub(r'A"\?"', '❌', content)
content = re.sub(r'A,\?', '🎉', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed Mojibake.")
