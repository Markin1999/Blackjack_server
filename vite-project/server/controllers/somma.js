import db from "../initDB.js";

//Chiamo tutte le carte

const getAll = async () => {
  return await db.many(`SELECT * FROM card`);
};
//Chiamo tutte le carte con il valore tra 2 e 6
async function lowValue() {
  return await db.manyOrNone(`SELECT * FROM card WHERE value BETWEEN 2 AND 6`);
}

//Chiamo tutte le carte con il valore = a 1 e a 10
async function highValue() {
  return await db.manyOrNone(
    `SELECT * FROM card WHERE value = 1 OR value = 10`
  );
}

//Funzione fetch
export default async function value(req, res) {
  try {
    const { lastValue } = req.body;

    const cards = await getAll();
    const low = await lowValue();
    const high = await highValue();

    let prevValore = 0;

    if (lastValue !== undefined || lastValue !== null) {
      const cardValue = parseInt(lastValue); // Converte il valore in numero

      if ([2].includes(cardValue)) {
        prevValore += 0.5;
      } else if ([3, 6].includes(cardValue)) {
        prevValore += 1;
      } else if ([4, 5].includes(cardValue)) {
        prevValore += 1.5;
      } else if ([7].includes(cardValue)) {
        prevValore += 0.5;
      } else if ([9].includes(cardValue)) {
        prevValore -= 0.5;
      } else if ([0, 1].includes(cardValue)) {
        prevValore -= 1;
      } else if ([8].includes(cardValue)) {
        prevValore += 0; // Rimane invariato
      }
    }

    const mazzi = cards.length / 52;
    const dynamicTC = prevValore / mazzi;
    const dynamicTC2 = high.length / low.length;
    const dynamicTC3 = dynamicTC / dynamicTC2;

    res.status(201).json({ dynamicTC3 });
  } catch (error) {
    console.error("Errore nel recupero dei dati:", error);
    res.status(500).json({ error: "Errore del server" });
  }
}
