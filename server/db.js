import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "solarcalc.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scenarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    monthly_bill REAL NOT NULL,
    roof_area REAL NOT NULL,
    sun_hours REAL NOT NULL,
    system_kw REAL NOT NULL,
    cost REAL NOT NULL,
    annual_savings REAL NOT NULL,
    payback_years REAL NOT NULL,
    co2_tonnes REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const seeded = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
if (seeded === 0) {
  const u = db.prepare("INSERT INTO users (name,email,password_hash) VALUES (?,?,?)")
    .run("Faiz Rahman", "faiz@demo.com", bcrypt.hashSync("password123", 10));
  db.prepare(`INSERT INTO scenarios (user_id,name,monthly_bill,roof_area,sun_hours,system_kw,cost,annual_savings,payback_years,co2_tonnes)
    VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .run(u.lastInsertRowid, "My terrace house", 350, 40, 4.5, 5.0, 20000, 3201, 6.2, 3.1);
  console.log("✓ Seeded demo data (faiz@demo.com — password123)");
}

export default db;
