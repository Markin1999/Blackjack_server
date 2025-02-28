import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useFetchFunction from "../Funzioni/fetchFunction";

export default function Homepage() {
  const { cards, getAll, dynamicTc, dynamic } = useFetchFunction();

  const [lastValue, setLastValue] = useState(null);

  const navToDashboard = useNavigate();

  useEffect(() => {
    dynamicTc(lastValue);
  }, [lastValue]);

  useEffect(() => {
    getAll();
  }, []);

  const reduceArr =
    cards && cards.length > 0
      ? cards.reduce((acc, item) => {
          if (!acc.some((obj) => obj.value === item.value)) {
            acc.push(item);
          }
          return acc;
        }, [])
      : [];

  return (
    <>
      <div className="start-container">
        <img
          style={{ position: "relative" }}
          src="../immagini/tavolo.png"
          alt=""
        />

        <div className="start-container-option">
          <div className="homepage-option">
            <p>
              Dynamic T.C. {dynamic !== undefined ? dynamic : "Calcolando..."}
            </p>
          </div>
        </div>
        {reduceArr.map((x) => {
          return <img src={x.img} />;
        })}
      </div>
    </>
  );
}
