import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Start() {
  const [repeats, setRepeats] = useState(1);

  const navToDashboard = useNavigate();

  const handleChange = (event) => {
    setRepeats(event.target.value);
  };

  const fetchCard = async () => {
    try {
      const response = await fetch(`http://localhost:4000/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repeats }),
      });

      const data = await response.json();
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleSubmit = async () => {
    await fetchCard();
    navToDashboard("/homepage");
  };

  return (
    <>
      <div className="start-container">
        <img
          style={{ position: "relative" }}
          src="../immagini/tavolo.png"
          alt=""
        />

        <div className="start-container-option">
          <button onClick={handleSubmit}>START</button>
          <div className="start-option">
            <label htmlFor="scelta">Scegli quanti mazzi:</label>
            <select
              id="scelta"
              name="scelta"
              value={repeats}
              onChange={handleChange}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
}
