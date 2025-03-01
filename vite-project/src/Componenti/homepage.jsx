import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useFetchFunction from "../Funzioni/fetchFunction";
import Card from "./cards";

export default function Homepage() {
  const [dynamic, setDynamic] = useState(null);

  const navToDashboard = useNavigate();

  useEffect(() => {
    console.log("Dynamic", dynamic);
  }, [dynamic]);

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
            <p>Dynamic T.C. {dynamic}</p>
          </div>
        </div>
      </div>
      <Card setDynamic={setDynamic} />
    </>
  );
}
