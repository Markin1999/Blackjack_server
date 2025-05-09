import { useState } from "react";

export default function InputCard({ value, setValue }) {
  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div>
      <div className="input-sum">
        <div
          style={{
            display: "flex",
            gap: "5px",
            alignItems: "center",
            whiteSpace: "nowrap",
            flexWrap: "nowrap",
          }}
        >
          <label htmlFor="somma" style={{ color: "white" }}>
            Somma carte
          </label>
          <select id="somma" name="somma" value={value} onChange={handleChange}>
            {[...Array(18)].map((_, i) => {
              const num = i + 4;
              return (
                <option key={num} value={num}>
                  {num}
                </option>
              );
            })}
          </select>
        </div>

        <img
          src={`../card/${value}.png`}
          alt={`Carta ${value}`}
          style={{ width: "80px", border: "1px solid black" }}
        />
      </div>
    </div>
  );
}
