import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import path from "path";

const dbPath = path.resolve("db/database.sqlite");

export async function getDB() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Load schema
  const schema = fs.readFileSync("db/schema.sql", "utf-8");
  await db.exec(schema);

  // Load seed data
  const seed = fs.readFileSync("db/seed.sql", "utf-8");
  await db.exec(seed);

  return db;
}