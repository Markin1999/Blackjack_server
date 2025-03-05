import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useFetchFunction from "../Funzioni/fetchFunction";
import Card from "./cards";
import InputCard from "./inputCard";

export default function Homepage() {
  const [dynamic, setDynamic] = useState(null);

  const navToDashboard = useNavigate();

  useEffect(() => {
    console.log("Dynamic", dynamic);
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
            <p>Dynamic T.C. {dynamic}</p>
          </div>
          <InputCard />
        </div>

        <div className="container-card">
          <Card setDynamic={setDynamic} />
        </div>
      </div>
    </>
  );
}
