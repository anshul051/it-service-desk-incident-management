import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(
    __dirname,
    "..",
    "..",
    "data",
    "servicedesk.db"
);

const schemaPath = path.join(
    __dirname,
    "..",
    "db",
    "schema.sql"
);

// Create data directory if it doesn't exist
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Create/open database
const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Initialize schema
const schema = fs.readFileSync(schemaPath, "utf-8");
db.exec(schema);

console.log("SQLite database connected");

export default db;