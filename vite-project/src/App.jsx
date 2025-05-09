import { BrowserRouter, Routes, Route } from "react-router-dom";
import Start from "./Componenti/start";
import "./App.css";
import Homepage from "./Componenti/homepage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/homepage" element={<Homepage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

//Devo aggiungere il calcolo a un unita. la puntata mina e 5 euro, quindi un unita equivale a 5 euro.
//Poi, se: TC +2: Punta 40€ (4 unità).
//TC +3: Punta 60€ (6 unità).
//TC +4: Punta 100€ (10 unità).
