const postgres = require('postgres');
const fs = require('fs');

async function migrate() {
  const sqlString = fs.readFileSync('/Users/francisjakeroaya/.gemini/antigravity-ide/brain/59f40978-1229-40be-bf87-de4b7a87ed84/schema.sql', 'utf8');
  
  const sql = postgres('postgresql://postgres:hUPkzW7epsqQvjrj@db.kuvdosoxaoetqaqdkjah.supabase.co:5432/postgres', {
    ssl: 'require'
  });

  try {
    console.log("Executing schema migration...");
    await sql.unsafe(sqlString);
    console.log("Migration executed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sql.end();
  }
}

migrate();
