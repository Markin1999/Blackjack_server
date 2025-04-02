import { useEffect, useState } from "react";
import useFetchFunction from "../Funzioni/fetchFunction";

export default function Card({ setDynamic }) {
  const { cards, getAll } = useFetchFunction();
  const [key, setKey] = useState(null);
  const [lunghezza, setLunghezza] = useState(null);

  useEffect(() => {
    getAll();
  }, []);

  const PORT = import.meta.env.VITE_PORT;

  const deleteCard = async (id) => {
    console.log("Entrato in deleteCard con ID:", id);
    try {
      const response = await fetch(`http://localhost:${PORT}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      setLunghezza(data.cardLength);
    } catch (error) {
      console.error(error.message);
    }
  };

  const dynamicTc = async (lastValue) => {
    try {
      const response = await fetch(`http://localhost:${PORT}/dc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastValue }),
      });

      const data = await response.json();
      console.log("dynamictc3", data.dynamicTC3);

      setDynamic(Number(data.dynamicTC3).toFixed(2));
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleClick = async (e) => {
    const value = e.target.getAttribute("data-value");
    const safeValue = Number(value);

    try {
      await deleteCard(safeValue);

      setKey(safeValue);
      console.log("dynamic", dynamicTc);
      await dynamicTc(safeValue);
      console.log("terminato", dynamicTc);
    } catch (error) {
      console.error("Errore durante la gestione del click:", error);
    }
  };

  useEffect(() => {
    console.log(lunghezza);
  }, [lunghezza]);

  const reduceArr =
    cards && cards.length > 0
      ? cards.reduce((acc, item) => {
          if (!acc.some((obj) => obj.value === item.value)) {
            acc.push(item);
            acc.sort((a, b) => a.value - b.value);
          }
          return acc;
        }, [])
      : [];

  return (
    <div className="grid-container">
      {reduceArr.map((x) => {
        return (
          <div className="grid-item" key={x.id}>
            <img src={x.img} data-value={x.value} onClick={handleClick} />
          </div>
        );
      })}
    </div>
  );
}
//style={{ width: "80px", height: "120px" }}
