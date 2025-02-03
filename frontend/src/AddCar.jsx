import React, { useState } from "react";
import axios from "axios";

function AddCar() {
  const [chassisNumber, setChassisNumber] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post('${import.meta.env.VITE_API_URL}/add-car', { chassis_number: chassisNumber })
      .then((response) => {
        alert(response.data.message);
      })
      .catch((error) => {
        alert("Błąd przy dodawaniu samochodu");
      });
  };

  return (
    <div className="container">
      <h1>Dodaj nowe auto</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="chassisNumber" className="form-label">
            Numer nadwozia
          </label>
          <input
            type="text"
            className="form-control"
            id="chassisNumber"
            value={chassisNumber}
            onChange={(e) => setChassisNumber(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Dodaj auto
        </button>
      </form>
    </div>
  );
}

export default AddCar;
