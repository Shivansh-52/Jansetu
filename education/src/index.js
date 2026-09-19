const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4001;

let applications = [];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ONLINE', service: 'Education' });
});

// Submit a Scholarship Application
app.post('/api/scholarships', (req, res) => {
  const { studentName, category, incomeStatus, consentId, applicationData } = req.body;
  
  if (!incomeStatus || !incomeStatus.isEligible) {
     return res.status(400).json({ success: false, message: 'Eligibility not met or not verified.' });
  }

  const applicationId = `SP-EDU-${new Date().getFullYear()}-${String(applications.length + 1).padStart(6, '0')}`;
  
  const newApp = {
    applicationId,
    studentName,
    status: 'SUBMITTED',
    submittedAt: new Date().toISOString(),
    verification: {
      income: incomeStatus,
      consentId
    }
  };

  applications.push(newApp);

  res.json({
    success: true,
    applicationId,
    message: 'Scholarship Application Submitted Successfully',
    application: newApp
  });
});

app.listen(PORT, () => {
  console.log(`Education running on port ${PORT}`);
});
