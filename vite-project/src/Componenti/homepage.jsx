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
  const [move, setMove] = useState(null);

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

  const [messaggio, setMessaggio] = useState("");

  const calcolaMessaggio = (tc) => {
    if (tc > 5) {
      setMessaggio(
        "Il mazzo è estremamente favorevole! Ottima occasione per puntare alto. (+10 unità)"
      );
    } else if (tc > 4) {
      setMessaggio(
        "Alta probabilità di carte favorevoli! Approfitta delle occasioni migliori. (+8 unità)"
      );
    } else if (tc > 3) {
      setMessaggio(
        "Ci sono molte carte alte nel mazzo. Considera di aumentare la puntata. (+6 unità)"
      );
    } else if (tc > 2) {
      setMessaggio(
        "Buone probabilità di carte alte. Gioca in modo aggressivo quando opportuno. (+4 unità)"
      );
    } else if (tc > 1) {
      setMessaggio(
        "Il mazzo è leggermente favorevole. Gioca con intelligenza e sfrutta il vantaggio. (+2 unità)"
      );
    } else if (tc === 0) {
      setMessaggio(
        "Il mazzo è bilanciato. Nessun vantaggio evidente. (+1 unità)"
      );
    } else if (tc < -5) {
      setMessaggio(
        "Il mazzo è estremamente sfavorevole! Evita rischi e riduci le puntate al minimo. (+0.5 unità)"
      );
    } else if (tc < -3) {
      setMessaggio(
        "Probabilità sfavorevoli. Gioca conservativo e non prendere rischi inutili. (+0.5 unità)"
      );
    } else if (tc < -2) {
      setMessaggio(
        "Molte carte basse nel mazzo. Sii prudente e riduci le puntate. (+1 unità)"
      );
    } else if (tc < -1) {
      setMessaggio(
        "Il mazzo non è favorevole. Valuta se ridurre la puntata o cambiare strategia. (+1 unità)"
      );
    } else {
      setMessaggio(
        "Resta attento e adatta la strategia in base alle condizioni del mazzo. (+1 unità)"
      );
    }
  };

  useEffect(() => {
    calcolaMessaggio(dynamic);
  }, [dynamic]);

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
            <InputCard value={value} setValue={setValue} />
            <div className="container-message">
              <p>Dynamic T.C. {dynamic}</p>
              {move ? <p>{move}</p> : <p>Attendere...</p>}
              <p>{messaggio}</p>
            </div>
            <InputMazziere
              valueMazziere={valueMazziere}
              setValueMazziere={setValueMazziere}
            />
          </div>
        </div>

        <div className="container-card">
          <Card setDynamic={setDynamic} />
        </div>
      </div>
    </>
  );
}
