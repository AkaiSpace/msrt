import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditPartType() {
  const { id } = useParams(); // Pobieramy id z URL
  const navigate = useNavigate();
  const [partType, setPartType] = useState({ name: "", max_mileage: "" });

  useEffect(() => {
    axios
      .get(`http://localhost:5000/get-part-type/${id}`)
      .then((response) => {
        setPartType(response.data);
      })
      .catch((error) => console.error("Błąd przy pobieraniu danych typu części:", error));
  }, [id]);

  const handleChange = (e) => {
    setPartType({ ...partType, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`http://localhost:5000/update-part-type/${id}`, partType)
      .then(() => {
        navigate("/components"); // Przekierowanie po zapisaniu
      })
      .catch((error) => console.error("Błąd przy aktualizacji typu części:", error));
  };

  return (
    <div className="container mt-4">
      <h1>Edytuj Typ Części</h1>

      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Nazwa części</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={partType.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Max Mileage (km)</label>
          <input
            type="number"
            className="form-control"
            name="max_mileage"
            value={partType.max_mileage}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-success">
          Zapisz zmiany
        </button>
      </form>
    </div>
  );
}

export default EditPartType;
