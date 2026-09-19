require('dotenv').config({path: '.env'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.POSTGRES_GATEWAY_URL });
pool.query("UPDATE master_identity_mappings SET education_id='EDU-1001', healthcare_id='PAT-5001', agriculture_id='FAR-7001' WHERE master_id='SP-000001'")
    .then(() => { console.log('Updated mapping'); process.exit(0); })
    .catch(console.error);
