import { useState } from "react";

export default function InputCard() {
  const [value, setValue] = useState(21);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div>
      <div className="input-sum">
        <div>
          <label htmlFor="somma">Somma carte in mano</label>
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
          style={{ width: "80px", border: "5x solid black" }}
        />
      </div>
    </div>
  );
}
