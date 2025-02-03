import React, { useState } from "react";
import axios from "axios";

function AddPartType() {
  const [partTypeName, setPartTypeName] = useState("");
  const [maxMileage, setMaxMileage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post('${import.meta.env.VITE_API_URL}/add-part-type', {
        name: partTypeName,
        max_mileage: maxMileage,
      })
      .then((response) => {
        alert(response.data.message);
      })
      .catch((error) => {
        alert("Błąd przy dodawaniu typu części");
      });
  };

  return (
    <div className="container">
      <h1>Dodaj nowy typ części</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="partTypeName" className="form-label">
            Nazwa typu części
          </label>
          <input
            type="text"
            className="form-control"
            id="partTypeName"
            value={partTypeName}
            onChange={(e) => setPartTypeName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="maxMileage" className="form-label">
            Maksymalny przebieg
          </label>
          <input
            type="number"
            className="form-control"
            id="maxMileage"
            value={maxMileage}
            onChange={(e) => setMaxMileage(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Dodaj typ części
        </button>
      </form>
    </div>
  );
}

export default AddPartType;
