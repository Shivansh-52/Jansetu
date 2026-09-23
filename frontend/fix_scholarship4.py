import re

path = r'c:\Users\Shivansh\Desktop\Samadhan Path\frontend\src\pages\ScholarshipApplication.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. STEPS array
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

# 2. Extract specific JSX blocks and replace their indices properly without overlapping

# STEP 2 (Personal Info) -> becomes index 2
content = content.replace('{/* STEP 2: PERSONAL INFORMATION (AUTO-FILLED) */}', '{/* STEP 3: PERSONAL INFO */}')
content = content.replace('Step 2: Personal Information', 'Step 3: Personal Information')

# STEP 3 (Education) -> becomes index 3
content = content.replace('{/* STEP 3: EDUCATION INFORMATION */}', '{/* STEP 4: EDUCATION INFO */}')
content = content.replace('Step 3: Education & Academic Information', 'Step 4: Education & Academic Information')

# STEP 4 (Financial) -> becomes index 4
content = content.replace('{/* STEP 4: FINANCIAL INFORMATION (PROMPTS ONLY MISSING INFO) */}', '{/* STEP 5: FINANCIAL INFO */}')
content = content.replace('Step 4: Financial Information & Missing Details', 'Step 5: Financial Information & Missing Details')

# STEP 5 (Documents) -> becomes index 5
content = content.replace('{/* STEP 5: DOCUMENTS CHECK */}', '{/* STEP 6: DOCUMENTS */}')
content = content.replace('Step 5: Document Vault Verification Status', 'Step 6: Document Vault Verification Status')

# STEP 6 (Consent) -> becomes index 1
content = content.replace('{/* STEP 6: DATA SHARING & CONSENT MODAL */}', '{/* STEP 2: CONSENT & OTP */}')
content = content.replace('Step 6: Data Sharing Request & Authorization', 'Step 2: Data Sharing Request & Authorization')

# Now carefully replace the step conditions. 
# We'll use a temporary marker for the ones we're shifting down
content = content.replace('{currentStep === 4 && (', '{currentStep === @@4@@ && (')
content = content.replace('{currentStep === 3 && (', '{currentStep === @@3@@ && (')
content = content.replace('{currentStep === 2 && (', '{currentStep === @@2@@ && (')
content = content.replace('{currentStep === 1 && (', '{currentStep === @@1@@ && (')

# Consent was 5, now 1
content = content.replace('{currentStep === 5 && (', '{currentStep === 1 && (')

# Restore the shifted ones (1 -> 2, 2 -> 3, 3 -> 4, 4 -> 5)
content = content.replace('{currentStep === @@4@@ && (', '{currentStep === 5 && (')
content = content.replace('{currentStep === @@3@@ && (', '{currentStep === 4 && (')
content = content.replace('{currentStep === @@2@@ && (', '{currentStep === 3 && (')
content = content.replace('{currentStep === @@1@@ && (', '{currentStep === 2 && (')


# 3. Update the button onClick handlers inside each step.
# Overview: button to step 1 (was Consent, now step 1) -> No change needed!
# Personal Info (was 1, now 2): Back to 1, Continue to 3
content = content.replace('onClick={() => setCurrentStep(0)} style={{ padding: \'10px 20px\'', 'onClick={() => setCurrentStep(1)} style={{ padding: \'10px 20px\'')
content = content.replace('onClick={() => setCurrentStep(2)} style={{ padding: \'10px 20px\'', 'onClick={() => setCurrentStep(3)} style={{ padding: \'10px 20px\'')

# Education (was 2, now 3): Back to 2, Continue to 4
content = content.replace('onClick={() => setCurrentStep(1)} style={{ padding: \'10px 20px\'', 'onClick={() => setCurrentStep(2)} style={{ padding: \'10px 20px\'')
content = content.replace('onClick={() => setCurrentStep(3)} style={{ padding: \'10px 20px\'', 'onClick={() => setCurrentStep(4)} style={{ padding: \'10px 20px\'')

# Financial (was 3, now 4): Back to 3, Continue to 5
content = content.replace('onClick={() => setCurrentStep(2)} style={{ padding: \'10px 20px\'', 'onClick={() => setCurrentStep(3)} style={{ padding: \'10px 20px\'')
content = content.replace('onClick={() => setCurrentStep(4)} style={{ padding: \'10px 20px\'', 'onClick={() => setCurrentStep(5)} style={{ padding: \'10px 20px\'')

# Documents (was 4, now 5): Back to 4, Continue to 6
content = content.replace('onClick={() => setCurrentStep(3)} style={{ padding: \'10px 20px\'', 'onClick={() => setCurrentStep(4)} style={{ padding: \'10px 20px\'')
content = content.replace('onClick={() => setCurrentStep(5)} style={{ padding: \'10px 20px\'', 'onClick={() => setCurrentStep(6)} style={{ padding: \'10px 20px\'')

# Consent (was 5, now 1): Back to 0. It originally had back to 4. We change back to 0.
content = content.replace('onClick={() => setCurrentStep(4)} style={{ padding: \'12px 24px\'', 'onClick={() => setCurrentStep(0)} style={{ padding: \'12px 24px\'')

# Update Consent success logic:
content = content.replace('setCurrentStep(6); // Proceed to Review', 'setCurrentStep(2); // Proceed to Personal Info')

# Fix profile name display
content = content.replace('{profile.name} 🔒', "{JSON.parse(sessionStorage.getItem('user') || '{}').name || profile?.name} 🔒")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated ScholarshipApplication.jsx beautifully.")
