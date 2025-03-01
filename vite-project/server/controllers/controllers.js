import db from "../initDB.js";

/*export const takecards = async (req, res) => {
  const { repeats } = req.body;
  console.log("Richiesta ricevuta per takecards");

  const apiUrl = "https://deckofcardsapi.com/api/deck/new/draw/?count=52";
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Errore: ${response.status}`);
    }
    const data = await response.json();

    const formattedData = data.cards.map((item) => ({
      card: item.code,
      value: item.value,
      img: item.image,
    }));

    formattedData.forEach((item) => {
      if (
        item.value === "QUEEN" ||
        item.value === "KING" ||
        item.value === "JACK" ||
        item.value === "10"
      ) {
        item.value = 0;
      } else if (item.value === "ACE") {
        item.value = 1;
      } else if (
        item.value === "2" ||
        item.value === "3" ||
        item.value === "4" ||
        item.value === "5" ||
        item.value === "6" ||
        item.value === "7" ||
        item.value === "8" ||
        item.value === "9"
      ) {
        item.value = parseInt(item.value);
      }
    });

    console.log("Carte ricevute:", formattedData);

    const insertQuery = `INSERT INTO card (name, value, img) VALUES ($1, $2, $3)`;

    await db.none(`DROP TABLE IF EXISTS card`);

    await db.none(
      `CREATE TABLE IF NOT EXISTS card(
      id SERIAL NOT NULL PRIMARY KEY,
      name TEXT NOT NULL,
      value INTEGER NOT NULL CHECK (value>=0 AND value <=9),
      img TEXT
      )`
    );

    console.log("✅ Tabella card creata (se non esisteva)");

    for (let i = 0; i < repeats; i++) {
      await Promise.all(
        formattedData.map((item) =>
          db.none(insertQuery, [item.card, item.value, item.img])
        )
      );
    }

    res.status(201).json({ message: "Carte inserite con successo!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Errore nel caricamento delle carte" });
  }
};*/

export const takecards = async (req, res) => {
  const { repeats } = req.body;

  try {
    // Elimina la tabella "card" se esiste
    await db.none(`DROP TABLE IF EXISTS card`);

    // Ricrea la tabella "card"
    await db.none(`
      CREATE TABLE IF NOT EXISTS card (
        id SERIAL NOT NULL PRIMARY KEY,
        name TEXT NOT NULL,
        value INTEGER NOT NULL CHECK (value>=0 AND value <=9),
        img TEXT
      );
    `);

    const allCards = await db.manyOrNone(`SELECT name, value, img FROM cards`);

    const insertQuery = `INSERT INTO card (name, value, img) VALUES ($1, $2, $3)`;
    for (let i = 0; i < repeats; i++) {
      await Promise.all(
        allCards.map((item) =>
          db.none(insertQuery, [item.name, item.value, item.img])
        )
      );
    }

    res.status(201).json({ message: "Carte inserite con successo!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Errore nel caricamento delle carte" });
  }
};

export const getAll = async (req, res) => {
  const card = await db.many(`SELECT * FROM card`);

  res.status(200).json(card);
};

export const resetCard = async (req, res) => {};
