import { useEffect, useState } from "react";
import useFetchFunction from "../Funzioni/fetchFunction";

export default function Card({ setDynamic }) {
  const { cards, getAll } = useFetchFunction();
  const [key, setKey] = useState(null);
  const [lunghezza, setLunghezza] = useState(null);

  const PORT = import.meta.env.VITE_PORT;

  const deleteCard = async (id) => {
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

  useEffect(() => {
    getAll();
  }, []);

  const handleClick = async (e) => {
    const value = e.target.getAttribute("data-value");

    if (!value) return;

    try {
      await deleteCard(value);
      setKey(value);
      await dynamicTc(value);
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
          <div className="grid-item">
            <img
              key={x.value}
              src={x.img}
              data-value={x.value}
              onClick={handleClick}
            />
          </div>
        );
      })}
    </div>
  );
}
//style={{ width: "80px", height: "120px" }}
