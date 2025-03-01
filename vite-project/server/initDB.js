import pgPromise from "pg-promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

const db = pgPromise()(DATABASE_URL);

const setupCards = async () => {
  await db.none(`DROP TABLE IF EXISTS cards;
    CREATE TABLE cards(
      id SERIAL NOT NULL PRIMARY KEY,
      name TEXT NOT NULL,
      value INTEGER NOT NULL CHECK (value>=0 AND value <=9),
      img TEXT)`);

  await db.none(`INSERT INTO cards (name, value, img) VALUES
('ah', 1, '../immagini/AH.png'),
('2h', 2, '../immagini/2H.png'),
('3h', 3, '../immagini/3H.png'),
('4h', 4, '../immagini/4H.png'),
('5h', 5, '../immagini/5H.png'),
('6h', 6, '../immagini/6H.png'),
('7h', 7, '../immagini/7H.png'),
('8h', 8, '../immagini/8H.png'),
('9h', 9, '../immagini/9H.png'),
('10h', 0, '../immagini/KH.png'),
('jh', 0, '../immagini/KH.png'),
('qh', 0, '../immagini/KH.png'),
('kh', 0, '../immagini/KH.png'),
('ad', 1, '../immagini/AH.png'),
('2d', 2, '../immagini/2H.png'),
('3d', 3, '../immagini/3H.png'),
('4d', 4, '../immagini/4H.png'),
('5d', 5, '../immagini/5H.png'),
('6d', 6, '../immagini/6H.png'),
('7d', 7, '../immagini/7H.png'),
('8d', 8, '../immagini/8H.png'),
('9d', 9, '../immagini/9H.png'),
('10d', 0, '../immagini/KH.png'),
('jd', 0, '../immagini/KH.png'),
('qd', 0, '../immagini/KH.png'),
('kd', 0, '../immagini/KH.png'),
('ac', 1, '../immagini/AH.png'),
('2c', 2, '../immagini/2H.png'),
('3c', 3, '../immagini/3H.png'),
('4c', 4, '../immagini/4H.png'),
('5c', 5, '../immagini/5H.png'),
('6c', 6, '../immagini/6H.png'),
('7c', 7, '../immagini/7H.png'),
('8c', 8, '../immagini/8H.png'),
('9c', 9, '../immagini/9H.png'),
('10c', 0, '../immagini/KH.png'),
('jc', 0, '../immagini/KH.png'),
('qc', 0, '../immagini/KH.png'),
('kc', 0, '../immagini/KH.png'),
('as', 1, '../immagini/AH.png'),
('2s', 2, '../immagini/2H.png'),
('3s', 3, '../immagini/3H.png'),
('4s', 4, '../immagini/4H.png'),
('5s', 5, '../immagini/5H.png'),
('6s', 6, '../immagini/6H.png'),
('7s', 7, '../immagini/7H.png'),
('8s', 8, '../immagini/8H.png'),
('9s', 9, '../immagini/9H.png'),
('10s', 0, '../immagini/KH.png'),
('js', 0, '../immagini/KH.png'),
('qs', 0, '../immagini/KH.png'),
('ks', 0, '../immagini/KH.png');
`);
};

setupCards();

export default db;
