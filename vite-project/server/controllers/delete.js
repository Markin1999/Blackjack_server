import db from "../initDB.js";

export default async function deleteFunction(req, res) {
  const { id } = req.params;
  try {
    const toDelete = await db.oneOrNone(
      `SELECT id FROM card WHERE value = $1 ORDER BY value ASC LIMIT 1`,
      [id]
    );

    if (!toDelete) {
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
