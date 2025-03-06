import { useState } from "react";

export default function InputMazziere({ valueMazziere, setValueMazziere }) {
  const handleChange = (e) => {
    setValueMazziere(e.target.value);
  };

  return (
    <div>
      <div className="input-maz">
        <div style={{ display: "flex", gap: "5px" }}>
          <label htmlFor="somma" style={{ color: "white" }}>
            Carta mazziere
          </label>
          <select
            id="somma"
            name="somma"
            value={valueMazziere}
            onChange={handleChange}
          >
            {[...Array(10)].map((_, i) => {
              const num = i + 1;
              return (
                <option key={num} value={num}>
                  {num}
                </option>
              );
            })}
          </select>
        </div>
        <div style={{ display: "flex", gap: "2px" }}>
          <img
            src={`../card/${valueMazziere}.png`}
            alt={`Carta ${valueMazziere}`}
            style={{ width: "80px", border: "1px solid black" }}
          />
          <img
            src={`../card/0.png`}
            alt={`Carta 0`}
            style={{ width: "80px", border: "1px solid black" }}
          />
        </div>
      </div>
    </div>
  );
}
