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

    res.status(201).json({ dynamicTC3 });
  } catch (error) {
    console.error("Errore nel recupero dei dati:", error);
    res.status(500).json({ error: "Errore del server" });
  }
}

export async function deleteFunction(req, res) {
  const { id } = req.params;
  console.log("DELETE", id);

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

export async function takeMoves(req, res) {
  const { value, valueMazziere, dynamic } = req.body;

  try {
    const tc = dynamic;
    const input1o = value;
    const inputMo = valueMazziere;

    if (
      input1o &&
      Number(input1o) <= 21 &&
      inputMo &&
      Number(inputMo) <= 21 &&
      tc
    ) {
      if (Number(tc) <= -6) {
        if (Number(input1o) <= 10) {
          return res.json({ message: "No split, no raddoppi. Chiama carta" });
        } else if (
          Number(input1o) === 11 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Raddoppia" });
        } else if (
          Number(input1o) === 11 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiama carta" });
        } else if (
          Number(input1o) === 12 &&
          Number(inputMo) >= 4 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Resta" });
        } else if (
          Number(input1o) === 12 &&
          ((Number(inputMo) >= 7 && Number(inputMo) <= 10) ||
            Number(inputMo) === 3 ||
            Number(inputMo) === 2)
        ) {
          return res.json({ message: "Chiedi carta" });
        } else if (
          Number(input1o) === 13 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Resta" });
        } else if (
          Number(input1o) === 13 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta" });
        } else if (
          Number(input1o) === 14 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Resta" });
        } else if (
          Number(input1o) === 14 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta" });
        } else if (
          (Number(input1o) === 15 || Number(input1o) === 16) &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Resta" });
        } else if (
          (Number(input1o) === 15 || Number(input1o) === 16) &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({
            message: "Se puoi arrenditi, altrimenti chiedi carta",
          });
        } else if (
          Number(input1o) === 17 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 11
        ) {
          return res.json({
            message:
              "Resta di base. Se hai un Asso in mano, raddoppia se il mazziere ha una carta tra 2 e 6; in caso contrario, chiedi un'altra carta.",
          });
        } else if (
          Number(input1o) === 18 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 11
        ) {
          return res.json({
            message:
              "Resta di base. Se hai un Asso in mano, raddoppia se il mazziere ha una carta tra 2 e 6; in caso contrario, resta.",
          });
        } else if (
          (Number(input1o) === 19 || Number(input1o) === 20) &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Resta" });
        }
      } else if (Number(tc) <= -4 && Number(tc) >= -6) {
        if (Number(input1o) <= 9) {
          return res.json({ message: "No split, no raddoppi. Chiama carta" });
        } else if (
          Number(input1o) === 10 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 9
        ) {
          return res.json({ message: "Raddoppia" });
        } else if (
          Number(input1o) === 10 &&
          Number(inputMo) >= 10 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta" });
        } else if (Number(input1o) === 11) {
          return res.json({ message: "Raddoppia, o chiedi carta" });
        } else if (
          Number(input1o) === 12 &&
          Number(inputMo) >= 4 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Resta" });
        } else if (
          Number(input1o) === 12 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 3
        ) {
          return res.json({ message: "Chiedi carta" });
        } else if (
          Number(input1o) === 12 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta" });
        } else if (
          Number(input1o) === 13 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Resta" });
        } else if (
          Number(input1o) === 13 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta" });
        } else if (
          Number(input1o) === 14 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Resta" });
        } else if (
          Number(input1o) === 14 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta" });
        } else if (
          Number(input1o) === 15 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Resta" });
        } else if (
          Number(input1o) === 15 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({
            message: "Se puoi arrenditi, altrimenti chiedi carta",
          });
        } else if (
          Number(input1o) === 16 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Resta" });
        } else if (
          Number(input1o) === 16 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({
            message: "Se puoi arrenditi, altrimenti chiedi carta",
          });
        } else if (
          Number(input1o) === 17 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({
            message: "Se hai un A chiedi carta, altrimenti resta.",
          });
        } else if (
          Number(input1o) === 17 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Resta" });
        } else if (
          (Number(input1o) === 18 ||
            Number(input1o) === 19 ||
            Number(input1o) === 20) &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Resta" });
        }
      }

      // INIZIO -2 TC
      else if (Number(tc) <= -2 && Number(tc) >= -4) {
        if (Number(input1o) <= 7) {
          return res.json({ message: "Chiama carta" });
        }

        // 8
        else if (
          Number(input1o) === 8 &&
          Number(inputMo) >= 5 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Se 4-4, split altrimenti chiedi carta" });
        } else if (
          Number(input1o) === 8 &&
          ((Number(inputMo) >= 2 && Number(inputMo) <= 4) ||
            (Number(inputMo) >= 7 && Number(inputMo) <= 11))
        ) {
          return res.json({ message: "Chiedi carta" });
        }

        //9
        else if (
          Number(input1o) === 9 &&
          Number(inputMo) >= 3 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Raddoppia" });
        } else if (
          Number(input1o) === 8 &&
          (Number(inputMo) === 2 ||
            (Number(inputMo) >= 7 && Number(inputMo) <= 11))
        ) {
          return res.json({ message: "Chiedi carta" });
        }

        //
        else if (
          (Number(input1o) === 10 || Number(input1o) === 11) &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 8
        ) {
          return res.json({ message: "Raddoppia" });
        } else if (
          (Number(input1o) === 10 || Number(input1o) === 11) &&
          Number(inputMo) >= 9 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiama carta" });
        }

        //
        else if (
          Number(input1o) === 12 &&
          Number(inputMo) >= 4 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Se 6-6 dividi, altrimenti resta." });
        } else if (
          Number(input1o) === 12 &&
          ((Number(inputMo) >= 2 && Number(inputMo) <= 3) ||
            (Number(inputMo) >= 7 && Number(inputMo) <= 11))
        ) {
          return res.json({ message: "Chiedi carta" });
        }

        //
        else if (
          Number(input1o) === 13 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 5
        ) {
          return res.json({ message: "Se A-2 chiedi carta, altrimenti resta" });
        } else if (Number(input1o) === 13 && Number(inputMo) === 6) {
          return res.json({ message: "Se A-2 raddoppia. Altrimenti resta" });
        } else if (
          Number(input1o) === 13 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta" });
        }

        //
        else if (
          Number(input1o) === 14 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 5
        ) {
          return res.json({
            message: "Se A-3, chiedi carta, se 7-7 split, altrimenti resta",
          });
        } else if (
          Number(input1o) === 14 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta" });
        } else if (Number(input1o) === 14 && Number(inputMo) === 6) {
          return res.json({
            message: "Se A-3 raddoppia, se 7-7 split, altrimenti resta",
          });
        }

        //
        //
        else if (
          (Number(input1o) === 15 || Number(input1o) === 16) &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 3
        ) {
          return res.json({ message: "Se A-4 chiedi carta, altrimenti resta" });
        } else if (
          (Number(input1o) === 15 || Number(input1o) === 16) &&
          Number(inputMo) === 4
        ) {
          return res.json({
            message: "Se A-4 chiedi carta, altrimenti resta.",
          });
        } else if (
          (Number(input1o) === 15 || Number(input1o) === 16) &&
          Number(inputMo) >= 5 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Se A-4 raddoppia, altrimenti resta" });
        } else if (
          (Number(input1o) === 15 || Number(input1o) === 16) &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({
            message: "Se puoi arrenditi, altrimenti chiedi carta",
          });
        }

        //
        //
        else if (
          (Number(input1o) === 17 &&
            Number(inputMo) >= 2 &&
            Number(inputMo) <= 3) ||
          (Number(inputMo) >= 7 && Number(inputMo) <= 11)
        ) {
          return res.json({ message: "Se A-6 chiedi carta, altrimenti resta" });
        } else if (
          Number(input1o) === 17 &&
          Number(inputMo) >= 4 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Se A-6 raddoppia, altrimenti resta" });
        }

        //
        else if (
          Number(input1o) === 18 &&
          (Number(inputMo) === 2 ||
            (Number(inputMo) >= 7 && Number(inputMo) <= 8))
        ) {
          return res.json({
            message: "Con A-7 resta, con 9-9 dividi, altrimenti resta",
          });
        } else if (Number(input1o) === 18 && Number(inputMo) === 3) {
          return res.json({
            message: "Se A-7, chiedi carta, se 9-9 split, altrimenti resta.",
          });
        } else if (
          Number(input1o) === 18 &&
          Number(inputMo) >= 4 &&
          Number(inputMo) <= 6
        ) {
          return res.json({
            message: "Se A-7, raddoppia, se 9-9 split, altrimenti resta.",
          });
        } else if (
          Number(input1o) === 18 &&
          Number(inputMo) >= 10 &&
          Number(inputMo) <= 11
        ) {
          return res.json({
            message:
              "Se A-7, chiedi carta, se 9-9 chiedi carta, altrimenti resta.",
          });
        } else if (Number(input1o) === 18 && Number(inputMo) === 9) {
          return res.json({
            message: "Se A-7, chiedi carta, se 9-9 split, altrimenti resta.",
          });
        }

        //
        else if (
          (Number(input1o) === 19 || Number(input1o) === 20) &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Resta" });
        }
      } // FINE -2 TC
      else if (
        (Number(tc) >= 0 && Number(tc) <= 2) ||
        (Number(tc) <= 0 && Number(tc) >= -2)
      ) {
        if (Number(input1o) <= 8) {
          return res.json({
            message:
              "Splitta con coppia di A.Con coppia 2 o 3 splitta (Maz: 3 a 6) Altrimenti carta",
          });
        } else if (
          Number(input1o) === 9 &&
          (Number(inputMo) === 2 ||
            (Number(inputMo) >= 7 && Number(inputMo) <= 11))
        ) {
          return res.json({ message: "Chiedi carta." });
        } else if (
          Number(input1o) === 9 &&
          Number(inputMo) >= 3 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Raddoppia" });
        } else if (
          Number(input1o) === 10 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 9
        ) {
          return res.json({ message: "Raddoppia." });
        } else if (
          Number(input1o) === 10 &&
          Number(inputMo) >= 10 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta." });
        } else if (
          Number(input1o) === 11 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 9
        ) {
          return res.json({ message: "Raddoppia" });
        } else if (
          Number(input1o) === 11 &&
          Number(inputMo) >= 10 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta." });
        } else if (
          Number(input1o) === 12 &&
          (Number(inputMo) === 2 ||
            (Number(inputMo) >= 7 && Number(inputMo) <= 11))
        ) {
          return res.json({ message: "Chiedi carta." });
        } else if (Number(input1o) === 12 && Number(inputMo) === 3) {
          return res.json({
            message: "Splitta con 6 e 6. Altrimenti chiedi carta",
          });
        } else if (
          Number(input1o) === 12 &&
          Number(inputMo) >= 4 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Splitta con 6 e 6. Altrimenti resta." });
        } else if (
          Number(input1o) === 13 &&
          Number(inputMo) >= 5 &&
          Number(inputMo) <= 6
        ) {
          return res.json({
            message: "Raddoppia con A e 2. Altrimenti resta.",
          });
        } else if (
          Number(input1o) === 13 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 4
        ) {
          return res.json({ message: "Resta." });
        } else if (
          Number(input1o) === 13 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta." });
        } else if (
          Number(input1o) === 14 &&
          Number(inputMo) >= 5 &&
          Number(inputMo) <= 6
        ) {
          return res.json({
            message:
              "Raddoppia con A e 3. Splitta con 7 e 7. Altrimenti resta.",
          });
        } else if (
          Number(input1o) === 14 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 4
        ) {
          return res.json({ message: "Se 7 e 7 splitta. Altrimenti resta." });
        } else if (
          Number(input1o) === 14 &&
          Number(inputMo) >= 8 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta." });
        } else if (Number(input1o) === 14 && Number(inputMo) === 7) {
          return res.json({
            message: "Se 7 e 7 splitta. Altrimenti chiedi carta.",
          });
        } else if (
          Number(input1o) === 15 &&
          Number(inputMo) >= 4 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Se A-4, raddoppia, altrimenti resta. " });
        } else if (
          Number(input1o) === 15 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 3
        ) {
          return res.json({ message: "Resta " });
        } else if (
          Number(input1o) === 15 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta " });
        } else if (
          Number(input1o) === 16 &&
          Number(inputMo) >= 4 &&
          Number(inputMo) <= 6
        ) {
          return res.json({
            message: "Se A-5, raddoppia. Se 8-8 splitta, altrimenti resta. ",
          });
        } else if (
          Number(input1o) === 16 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 3
        ) {
          return res.json({
            message: "Se A-5, chiedi carta. Se 8-8 splitta, altrimenti resta. ",
          });
        } else if (
          Number(input1o) === 16 &&
          ((Number(inputMo) >= 7 && Number(inputMo) <= 9) ||
            Number(input1o) === 11)
        ) {
          return res.json({
            message: "Se 8-8 splitta, altrimenti chiedi carta. ",
          });
        } else if (Number(input1o) === 16 && Number(inputMo) === 10) {
          return res.json({ message: "Chiedi carta. " });
        } else if (
          Number(input1o) === 17 &&
          Number(inputMo) >= 3 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Se A-6 raddoppia, altrimenti resta" });
        } else if (
          Number(input1o) === 17 &&
          (Number(inputMo) === 2 ||
            (Number(inputMo) <= 7 && Number(inputMo) <= 11))
        ) {
          return res.json({ message: "Se A-6 chiedi carta, altrimenti resta" });
        }

        //18
        else if (
          Number(input1o) === 18 &&
          Number(inputMo) >= 3 &&
          Number(inputMo) <= 6
        ) {
          return res.json({
            message: "Se A-7 raddoppia. Se 9-9 splitta, altrimenti resta",
          });
        } else if (
          Number(input1o) === 18 &&
          (Number(inputMo) === 7 ||
            (Number(inputMo) >= 10 && Number(inputMo) <= 11))
        ) {
          return res.json({ message: "Se A-7 chiedi carta, altrimenti resta" });
        } else if (
          Number(input1o) === 18 &&
          (Number(inputMo) === 2 ||
            (Number(inputMo) >= 8 && Number(inputMo) <= 9))
        ) {
          return res.json({
            message: "Se A-7 raddoppia, se 9-9, dividi, altrimenti resta",
          });
        } else if (
          (Number(input1o) === 19 || Number(input1o) === 20) &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Resta" });
        }
      } else if (Number(tc) >= 2 && Number(tc) <= 4) {
        if (Number(input1o) <= 7) {
          return res.json({
            message:
              "Splitta con coppia di A.Con coppia 2 o 3 splitta (Maz: 3 a 6) Altrimenti carta",
          });
        } else if (
          Number(input1o) === 8 &&
          ((Number(inputMo) >= 2 && Number(inputMo) <= 4) ||
            (Number(inputMo) >= 7 && Number(inputMo) <= 11))
        ) {
          return res.json({ message: "Chiedi carta." });
        } else if (
          Number(input1o) === 8 &&
          Number(inputMo) >= 5 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Raddoppia." });
        } else if (
          Number(input1o) === 9 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Raddoppia." });
        } else if (
          Number(input1o) === 9 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta." });
        } else if (
          (Number(input1o) === 10 || Number(input1o) === 11) &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Raddoppia" });
        } else if (
          Number(input1o) === 12 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Dividi con 6 e 6. Altrimenti resta" });
        } else if (
          Number(input1o) === 12 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta" });
        } else if (
          Number(input1o) === 12 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta" });
        } else if (
          Number(input1o) === 13 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 3
        ) {
          return res.json({
            message: "Se A-2 chiedi carta, altrimenti resta.",
          });
        } else if (
          Number(input1o) === 13 &&
          Number(inputMo) >= 4 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Raddoppia con A-2, altrimenti resta." });
        } else if (
          Number(input1o) === 13 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta." });
        } else if (
          Number(input1o) === 14 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 3
        ) {
          return res.json({
            message: "Se 7-7 dividi, altrimenti chiedi carta.",
          });
        } else if (
          Number(input1o) === 14 &&
          Number(inputMo) >= 4 &&
          Number(inputMo) <= 6
        ) {
          return res.json({
            message: "Raddoppia con A-3. Con 7-7 dividi, altrimenti resta.",
          });
        } else if (
          Number(input1o) === 14 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta." });
        } else if (
          Number(input1o) === 15 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 3
        ) {
          return res.json({ message: "Se A-4 chiedo carta, altrimenti resta" });
        } else if (
          Number(input1o) === 15 &&
          Number(inputMo) >= 4 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Raddoppia con A-4, altrimenti resta." });
        } else if (
          Number(input1o) === 15 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta." });
        } else if (
          Number(input1o) === 16 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 3
        ) {
          return res.json({
            message: "Se A-5 chiedi carta. Se 8-8 dividi, altrimenti resta",
          });
        } else if (
          Number(input1o) === 16 &&
          Number(inputMo) >= 4 &&
          Number(inputMo) <= 6
        ) {
          return res.json({
            message: "Raddoppia con A-5, se 8-8 dividi, altrimenti resta.",
          });
        } else if (
          Number(input1o) === 16 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({
            message:
              "Se puoi arrenditi, se 8-8 dividi, altrimenti chiedi carta.",
          });
        } else if (
          Number(input1o) === 17 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 3
        ) {
          return res.json({ message: "Resta" });
        } else if (
          Number(input1o) === 17 &&
          Number(inputMo) >= 4 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Raddoppia con A-6, altrimenti resta." });
        } else if (
          Number(input1o) === 17 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Resta." });
        } else if (
          Number(input1o) === 18 &&
          Number(inputMo) >= 3 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Raddoppia con A-7, altrimenti resta" });
        } else if (
          Number(input1o) === 18 &&
          (Number(inputMo) === 2 ||
            (Number(inputMo) >= 7 && Number(inputMo) <= 11))
        ) {
          return res.json({ message: "Resta." });
        } else if (
          (Number(input1o) === 19 || Number(input1o) === 20) &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Resta" });
        }
      } else if (Number(tc) >= 4) {
        if (Number(input1o) <= 7) {
          return res.json({
            message:
              "Splitta con coppia di A.Con coppia 2 o 3 splitta (Maz: 2 a 6) Altrimenti carta",
          });
        } else if (
          Number(input1o) === 8 &&
          Number(inputMo) >= 4 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Raddoppia." });
        } else if (
          Number(input1o) === 8 &&
          ((Number(inputMo) >= 2 && Number(inputMo) <= 3) ||
            (Number(inputMo) >= 7 && Number(inputMo) <= 11))
        ) {
          return res.json({ message: "Chiedi carta." });
        } else if (
          Number(input1o) === 9 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Raddoppia." });
        } else if (
          Number(input1o) === 9 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta." });
        } else if (
          (Number(input1o) === 10 || Number(input1o) === 11) &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 8
        ) {
          return res.json({ message: "Raddoppia." });
        } else if (
          (Number(input1o) === 10 || Number(input1o) === 11) &&
          Number(inputMo) >= 9 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta." });
        } else if (
          Number(input1o) === 12 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Split con 6 e 6, altrimenti resta." });
        } else if (
          Number(input1o) === 12 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta" });
        } else if (
          Number(input1o) === 13 &&
          Number(inputMo) >= 5 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Raddoppia con A-2, altrimenti resta." });
        } else if (
          Number(input1o) === 13 &&
          ((Number(inputMo) >= 2 && Number(inputMo) <= 4) ||
            (Number(inputMo) >= 7 && Number(inputMo) <= 11))
        ) {
          return res.json({
            message: "Chiedi carta con A-2, altrimenti resta.",
          });
        } else if (
          Number(input1o) === 14 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 6
        ) {
          return res.json({
            message: "Se 7-7 split, se A-3 raddoppia, altrimenti resta",
          });
        } else if (Number(input1o) === 14 && Number(inputMo) === 7) {
          return res.json({ message: "Se 7-7 split, altrimenti chiedi carta" });
        } else if (
          Number(input1o) === 14 &&
          Number(inputMo) >= 8 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta" });
        } else if (
          Number(input1o) === 15 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 3
        ) {
          return res.json({ message: "Chiedi carta" });
        } else if (
          Number(input1o) === 15 &&
          Number(inputMo) >= 4 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Se A-4 raddoppia, altrimenti stai" });
        } else if (
          Number(input1o) === 15 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Chiedi carta" });
        } else if (
          Number(input1o) === 16 &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 3
        ) {
          return res.json({
            message: "Se 8-8 split, se A-5 chiedi carta, altrimenti resta",
          });
        } else if (
          Number(input1o) === 16 &&
          Number(inputMo) >= 4 &&
          Number(inputMo) <= 6
        ) {
          return res.json({
            message: "Se 8-8 split, se A-5 raddoppia, altrimenti resta",
          });
        } else if (
          Number(input1o) === 16 &&
          Number(inputMo) >= 7 &&
          Number(inputMo) <= 11
        ) {
          return res.json({
            message: "Se 8-8 split, altrimenti arrenditi o chiedi carta",
          });
        } else if (
          Number(input1o) === 17 &&
          Number(inputMo) >= 3 &&
          Number(inputMo) <= 6
        ) {
          return res.json({ message: "Se A-6 raddoppia, altrimenti resta" });
        } else if (
          Number(input1o) === 17 &&
          (Number(inputMo) === 2 ||
            (Number(inputMo) >= 7 && Number(inputMo) <= 11))
        ) {
          return res.json({ message: "Se A-6 chiedi carta, altrimenti resta" });
        } else if (
          Number(input1o) === 18 &&
          Number(inputMo) >= 3 &&
          Number(inputMo) <= 6
        ) {
          return res.json({
            message: "Se A-7 raddoppia, se 9-9 split, altrimenti resta",
          });
        } else if (
          Number(input1o) === 18 &&
          (Number(inputMo) === 2 ||
            (Number(inputMo) >= 7 && Number(inputMo) <= 9))
        ) {
          return res.json({ message: "se 9-9 split, altrimenti resta" });
        } else if (
          Number(input1o) === 18 &&
          Number(inputMo) >= 10 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Se A-7 chiedi carta, altrimenti resta" });
        } else if (
          (Number(input1o) === 19 || Number(input1o) === 20) &&
          Number(inputMo) >= 2 &&
          Number(inputMo) <= 11
        ) {
          return res.json({ message: "Resta" });
        }
      } /*else if ("Qui modifichi il dtc a +6") {
      }*/
    } else {
      return res.json({
        message: "Inserisci la somma delle tue carte e quella del mazziere",
      });
    }
  } catch (error) {
    return res.status(500).json({ error: "Errore nel server" });
  }
}
