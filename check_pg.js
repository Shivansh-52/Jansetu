const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_p4Sv6BTWQDos@ep-square-dew-b5s56kq9-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require', ssl: { rejectUnauthorized: false } });

async function check() {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log(res.rows);
    process.exit(0);
}
check();
