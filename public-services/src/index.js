const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4005;

// Mock Database for Public Services (Income and Domicile)
const citizensDb = {
  'PS-18291': { // Maps to SP-000001
    full_name: 'John Doe',
    annual_income: 200000,
    certificate_no: 'INC-92831',
    domicile_state: 'Maharashtra',
    is_eligible_for_scholarship: true
  },
  'PS-18292': { // Maps to SP-000002
    full_name: 'Jane Smith',
    annual_income: 600000,
    certificate_no: 'INC-92832',
    domicile_state: 'Delhi',
    is_eligible_for_scholarship: false
  }
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ONLINE', service: 'Public Services' });
});

// Verify Income Eligibility
app.get('/api/income/verify/:departmentalId', (req, res) => {
  const citizen = citizensDb[req.params.departmentalId];
  if (!citizen) {
    return res.status(404).json({ error: 'Citizen record not found' });
  }

  // Selective Disclosure: Only return eligibility, not the raw income amount
  res.json({
    verificationType: 'INCOME_ELIGIBILITY',
    isEligible: citizen.is_eligible_for_scholarship,
    threshold: 250000,
    issuer: 'PublicServices',
    validUntil: '2027-03-31',
    verificationId: `VER-${Date.now()}`
  });
});

app.listen(PORT, () => {
  console.log(`Public Services running on port ${PORT}`);
});
