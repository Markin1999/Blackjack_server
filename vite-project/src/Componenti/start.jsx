import { useNavigate } from "react-router-dom";

export default function Start() {
  const navToDashboard = useNavigate();
  return (
    <>
      <div>
        <button>START</button>
        <label for="scelta">Scegli quanti mazzi:</label>
        <select id="scelta" name="scelta">
          <option value="opzione1">1</option>
          <option value="opzione2">2</option>
          <option value="opzione3">3</option>
          <option value="opzione4">4</option>
          <option value="opzione5">5</option>
          <option value="opzione6">6</option>
          <option value="opzione7">7</option>
          <option value="opzione8">8</option>
          <option value="opzione9">9</option>
          <option value="opzione10">10</option>
        </select>
      </div>
    </>
  );
}
