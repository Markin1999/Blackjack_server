import { useEffect, useState } from "react";

export default function useFetchFunction() {
  const [cards, setCards] = useState(null);
  const [dynamic, setDynamic] = useState("");

  const PORT = import.meta.env.VITE_PORT;

  //FUNZIONE PER RICHIAMARE TUTTE LE CARTE DEL DATABASE E CONSERVARLE IN CARDS
  const getAll = async () => {
    try {
      const response = await fetch(`http://localhost:${PORT}/`);
      if (response.ok) {
        const data = await response.json();
        setCards(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  //FUNZIONE PER RICHIAMARE IL DYNAMIC TRUE COUNT, PASSANDOGLI IL VALORE DELL'ULTIMA CARTA.
  const dynamicTc = async (lastValue) => {
    try {
      const response = await fetch(`http://localhost:${PORT}/dc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastValue }),
      });

      const data = await response.json();
      setDynamic(data.dynamicTC3);

      console.log("rrr", data.dynamicTC3);
    } catch (error) {
      console.error(error.message);
    }
  };

  return { cards, getAll, dynamicTc, dynamic };
}

//FUNZIONE PER RICHIAMARE TUTTE LE CARTE DEL DATABASE DAL 2 AL 6.
