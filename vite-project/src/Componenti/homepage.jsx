import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useFetchFunction from "../Funzioni/fetchFunction";
import Card from "./cards";
import InputCard from "./inputCard";
import InputMazziere from "./inputMazziere";

export default function Homepage() {
  const [dynamic, setDynamic] = useState(null);
  const [valueMazziere, setValueMazziere] = useState(3);
  const [value, setValue] = useState(21);
  const [move, setMove] = useState();

  const PORT = import.meta.env.VITE_PORT;

  const navToDashboard = useNavigate();

  const takeMoves = async () => {
    try {
      const response = await fetch(`http://localhost:${PORT}/moves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, valueMazziere, dynamic }),
      });

      if (!response.ok) {
        throw new Error(`Errore nella richiesta: ${response.status}`);
      }

      const data = await response.json();
      setMove(data.message);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    takeMoves();
  }, [value, valueMazziere, dynamic]);

  return (
    <>
      <div className="container-homepage">
        <div className="container-table">
          <img
            style={{ position: "relative" }}
            src="../immagini/tavolo.png"
            alt=""
          />
          <div className="homepage-option">
            <p>Dynamic T.C. {dynamic}</p>
            {move ? <p>{move}</p> : <p>Attendere...</p>}
          </div>
          <InputMazziere
            valueMazziere={valueMazziere}
            setValueMazziere={setValueMazziere}
          />
          <InputCard value={value} setValue={setValue} />
        </div>

        <div className="container-card">
          <Card setDynamic={setDynamic} />
        </div>
      </div>
    </>
  );
}
