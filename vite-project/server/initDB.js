import pgPromise from "pg-promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

const db = pgPromise()(DATABASE_URL);

const card = async () => {
  await db.none(
    `CREATE TABLE IF NOT EXISTS card(
    id SERIAL NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    value INTEGER NOT NULL CHECK (value>0 AND value <=9)
    )`
  );
};

export default db;
