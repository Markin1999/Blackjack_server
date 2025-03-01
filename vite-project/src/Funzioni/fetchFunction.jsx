import { useState } from "react";

export default function useFetchFunction() {
  const [cards, setCards] = useState([]);

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

  return { cards, getAll };
}
