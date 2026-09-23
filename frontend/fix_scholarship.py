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

# 2. Extract step blocks using regex
# We will just do a simple replacement for the step indices and button targets.

# STEP 0: Overview
content = content.replace('onClick={() => setCurrentStep(1)}', 'onClick={() => setCurrentStep(1)}') # Wait, actually overview goes to step 1 (Consent now)

# Fix profile name display
content = content.replace('{profile.name} 🔒', "{JSON.parse(sessionStorage.getItem('user') || '{}').name || profile.name} 🔒")

# We can manually swap the {currentStep === X} tags
content = content.replace('{/* STEP 2: PERSONAL INFORMATION (AUTO-FILLED) */}', '{/* STEP 3: PERSONAL INFORMATION (AUTO-FILLED) */}')
content = content.replace('{currentStep === 1 && (', '{currentStep === 2 && (')

content = content.replace('{/* STEP 3: EDUCATION INFORMATION */}', '{/* STEP 4: EDUCATION INFORMATION */}')
content = content.replace('{currentStep === 2 && (', '{currentStep === 3 && (')

content = content.replace('{/* STEP 4: FINANCIAL INFORMATION */}', '{/* STEP 5: FINANCIAL INFORMATION */}')
content = content.replace('{currentStep === 3 && (', '{currentStep === 4 && (')

content = content.replace('{/* STEP 5: DOCUMENTS & VERIFICATION */}', '{/* STEP 6: DOCUMENTS & VERIFICATION */}')
content = content.replace('{currentStep === 4 && (', '{currentStep === 5 && (')

content = content.replace('{/* STEP 6: CONSENT & OTP */}', '{/* STEP 2: CONSENT & OTP */}')
# Need a special placeholder to avoid double replacement
content = content.replace('{currentStep === 5 && (', '{currentStep === @@CONSENT_STEP@@ && (')


# Now we also need to update the Back/Continue buttons inside each step!
# Step 1 (Personal Info, now Step 2): Back goes to 1, Continue to 3
content = content.replace(
    "<button onClick={() => setCurrentStep(0)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8 }}>Back</button>\n                                <button onClick={() => setCurrentStep(2)}",
    "<button onClick={() => setCurrentStep(1)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8 }}>Back</button>\n                                <button onClick={() => setCurrentStep(3)}"
)

# Step 2 (Education, now Step 3): Back to 2, Continue to 4
content = content.replace(
    "<button onClick={() => setCurrentStep(1)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8 }}>Back</button>\n                                <button onClick={() => setCurrentStep(3)}",
    "<button onClick={() => setCurrentStep(2)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8 }}>Back</button>\n                                <button onClick={() => setCurrentStep(4)}"
)

# Step 3 (Financial, now Step 4): Back to 3, Continue to 5
content = content.replace(
    "<button onClick={() => setCurrentStep(2)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8 }}>Back</button>\n                                <button onClick={() => setCurrentStep(4)}",
    "<button onClick={() => setCurrentStep(3)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8 }}>Back</button>\n                                <button onClick={() => setCurrentStep(5)}"
)

# Step 4 (Documents, now Step 5): Back to 4, Continue to 6
content = content.replace(
    "<button onClick={() => setCurrentStep(3)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8 }}>Back</button>\n                                <button onClick={() => setCurrentStep(5)}",
    "<button onClick={() => setCurrentStep(4)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8 }}>Back</button>\n                                <button onClick={() => setCurrentStep(6)}"
)

# Step 5 (Consent, now Step 1): Back to 0. (Wait, it didn't have a continue button, verify triggers setCurrentStep(6))
content = content.replace(
    "onClick={() => setCurrentStep(4)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8 }}>Back</button>",
    "onClick={() => setCurrentStep(0)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8 }}>Back</button>"
)

# Update the Consent Verify success logic to go to step 2 instead of 6
content = content.replace('setCurrentStep(6); // Proceed to Review', 'setCurrentStep(2); // Proceed to Personal Info')


# Finalize placeholder
content = content.replace('@@CONSENT_STEP@@', '1')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated ScholarshipApplication.jsx successfully.")
