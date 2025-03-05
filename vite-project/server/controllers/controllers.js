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

let wongHalves = 0;
let wongHalvesprecedente = 0;

export const getAll = async (req, res) => {
  const card = await db.many(`SELECT * FROM card`);
  wongHalves = 0;

  res.status(200).json(card);
};

export const resetCard = async (req, res) => {};

//-----------------------

const getAlls = async () => {
  return await db.many(`SELECT * FROM card`);
};
//Chiamo tutte le carte con il valore tra 2 e 6
async function lowValue() {
  return await db.manyOrNone(`SELECT * FROM card WHERE value BETWEEN 2 AND 6`);
}

//Chiamo tutte le carte con il valore = a 1 e a 10
async function highValue() {
  return await db.manyOrNone(`SELECT * FROM card WHERE value = 1 OR value = 0`);
}

//Funzione fetch
export async function value(req, res) {
  wongHalvesprecedente = wongHalves;
  try {
    const { lastValue } = req.body;

    const cards = await getAlls();
    const low = await lowValue();
    const high = await highValue();

    if (lastValue !== undefined && lastValue !== null) {
      const cardValue = parseInt(lastValue); // Converte il valore in numero

      if ([2].includes(cardValue)) {
        wongHalves += 0.5;
      } else if ([3, 6].includes(cardValue)) {
        wongHalves += 1;
      } else if ([4, 5].includes(cardValue)) {
        wongHalves += 1.5;
      } else if ([7].includes(cardValue)) {
        wongHalves += 0.5;
      } else if ([9].includes(cardValue)) {
        wongHalves -= 0.5;
      } else if ([0, 1].includes(cardValue)) {
        wongHalves -= 1;
      } else if ([8].includes(cardValue)) {
        wongHalves += 0; // Rimane invariato
      }
    }

    const mazzi = cards.length / 52;
    const dynamicTC = wongHalves / mazzi;

    const dynamicTC2 = high.length / low.length;
    const dynamicTC3 =
      high.length > 0 && low.length > 0 ? dynamicTC / dynamicTC2 : "Carte";

    console.log(
      "mazzi:",
      mazzi,
      wongHalves,
      "wongHalves",
      "synamic2:",
      dynamicTC2
    );

    res.status(201).json({ dynamicTC3 });
  } catch (error) {
    console.error("Errore nel recupero dei dati:", error);
    res.status(500).json({ error: "Errore del server" });
  }
}

export async function deleteFunction(req, res) {
  const { id } = req.params;
  try {
    const toDelete = await db.oneOrNone(
      `SELECT id FROM card WHERE value = $1 ORDER BY value ASC LIMIT 1`,
      [id]
    );

    if (!toDelete) {
      wongHalves = wongHalvesprecedente;
      return res
        .status(404)
        .json({ error: "Nessuna carta disponibile da eliminare" });
    }

    // Elimina la carta trovata
    const result = await db.oneOrNone(
      `DELETE FROM card WHERE id = $1 RETURNING *;`,
      [toDelete.id]
    );

    // Conta le carte rimanenti
    const cardLength = (await db.manyOrNone(`SELECT * FROM card`)).length;

    res.status(200).json({
      msg: "Carta eliminata con successo",
      deletedCard: result,
      cardLength,
    });
  } catch (err) {
    console.error("Errore durante l'eliminazione:", err);
    res.status(500).json({ error: "Errore durante l'eliminazione" });
  }
}
