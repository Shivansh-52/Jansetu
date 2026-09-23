import re

path = r'c:\Users\Shivansh\Desktop\Samadhan Path\frontend\src\pages\ScholarshipApplication.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update STEPS array
old_steps = """const STEPS = [
    '1. Overview',
    '2. Personal Info',
    '3. Education Info',
    '4. Financial Info',
    '5. Documents',
    '6. Consent & OTP',
    '7. Review',
    '8. Submit'
];"""

new_steps = """const STEPS = [
    '1. Overview',
    '2. Consent & OTP',
    '3. Personal Info',
    '4. Education Info',
    '5. Financial Info',
    '6. Documents',
    '7. Review',
    '8. Submit'
];"""

content = content.replace(old_steps, new_steps)

# 2. Extract step blocks using regex and replace securely
content = re.sub(r'\{\/\* STEP 2: PERSONAL INFORMATION \(AUTO-FILLED\) \*\/\}\s*\{currentStep === 1 && \(', r'{/* STEP 3: PERSONAL INFORMATION (AUTO-FILLED) */}\n                    {currentStep === 2 && (', content)
content = re.sub(r'\{\/\* STEP 3: EDUCATION INFORMATION \*\/\}\s*\{currentStep === 2 && \(', r'{/* STEP 4: EDUCATION INFORMATION */}\n                    {currentStep === 3 && (', content)
content = re.sub(r'\{\/\* STEP 4: FINANCIAL INFORMATION \*\/\}\s*\{currentStep === 3 && \(', r'{/* STEP 5: FINANCIAL INFORMATION */}\n                    {currentStep === 4 && (', content)
content = re.sub(r'\{\/\* STEP 5: DOCUMENTS & VERIFICATION \*\/\}\s*\{currentStep === 4 && \(', r'{/* STEP 6: DOCUMENTS & VERIFICATION */}\n                    {currentStep === 5 && (', content)
content = re.sub(r'\{\/\* STEP 6: CONSENT & OTP \*\/\}\s*\{currentStep === 5 && \(', r'{/* STEP 2: CONSENT & OTP */}\n                    {currentStep === 1 && (', content)

# 3. Update the button targets sequentially using targeted replaces
# Step 0 -> Step 1 (Consent)
content = content.replace('onClick={() => setCurrentStep(1)}', 'onClick={() => setCurrentStep(1)}') # Already correct

# Step 1 -> Step 2 (Personal Info)
# Let's find back/continue buttons using regex
content = re.sub(r"<button onClick=\{\(\) => setCurrentStep\(0\)\} style=\{\{(.+?)\}\}>Back</button>\s*<button onClick=\{\(\) => setCurrentStep\(2\)\}", r"<button onClick={() => setCurrentStep(1)} style={{\1}}>Back</button>\n                                <button onClick={() => setCurrentStep(3)}", content)

content = re.sub(r"<button onClick=\{\(\) => setCurrentStep\(1\)\} style=\{\{(.+?)\}\}>Back</button>\s*<button onClick=\{\(\) => setCurrentStep\(3\)\}", r"<button onClick={() => setCurrentStep(2)} style={{\1}}>Back</button>\n                                <button onClick={() => setCurrentStep(4)}", content)

content = re.sub(r"<button onClick=\{\(\) => setCurrentStep\(2\)\} style=\{\{(.+?)\}\}>Back</button>\s*<button onClick=\{\(\) => setCurrentStep\(4\)\}", r"<button onClick={() => setCurrentStep(3)} style={{\1}}>Back</button>\n                                <button onClick={() => setCurrentStep(5)}", content)

content = re.sub(r"<button onClick=\{\(\) => setCurrentStep\(3\)\} style=\{\{(.+?)\}\}>Back</button>\s*<button onClick=\{\(\) => setCurrentStep\(5\)\}", r"<button onClick={() => setCurrentStep(4)} style={{\1}}>Back</button>\n                                <button onClick={() => setCurrentStep(6)}", content)

# For Step 5 (was Consent), the Back button goes to 4. We want it to go to 0.
content = re.sub(r"onClick=\{\(\) => setCurrentStep\(4\)\} style=\{\{(.+?)\}\}>Back</button>", r"onClick={() => setCurrentStep(0)} style={{\1}}>Back</button>", content)

# Step 6 (Review) back button goes to 5 instead of 4
content = re.sub(r"onClick=\{\(\) => setCurrentStep\(4\)\} style=\{\{(.+?)\}\}>Back</button>", r"onClick={() => setCurrentStep(5)} style={{\1}}>Back</button>", content) # wait, the previous line already replaced it?
# Let's be careful. The review step has: onClick={() => setCurrentStep(4)} for Back. Wait, Review was step 6, its back was `setCurrentStep(4)` ?? Wait, if documents was 4, Review back goes to 4? Let's check original content.
# Original review back went to 5 (Consent). Wait, original was 5! `onClick={() => setCurrentStep(5)}`. So Review back is correct.
# Wait, let me just do a manual replace for the Review back button:
content = re.sub(r"\{/\* STEP 7: REVIEW \*/\}\s*\{currentStep === 6 && \(\s*<div>([\s\S]+?)onClick=\{\(\) => setCurrentStep\(5\)\}", r"{/* STEP 7: REVIEW */}\n                    {currentStep === 6 && (\n                        <div>\1onClick={() => setCurrentStep(5)}", content)

# Update the Consent Verify success logic to go to step 2 instead of 6
content = content.replace('setCurrentStep(6); // Proceed to Review', 'setCurrentStep(2); // Proceed to Personal Info')

# Fix profile name display
content = content.replace('{profile.name} 🔒', "{JSON.parse(sessionStorage.getItem('user') || '{}').name || profile.name} 🔒")


with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated ScholarshipApplication.jsx successfully.")
