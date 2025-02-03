import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditPartType() {
  const { id } = useParams(); // Pobieramy id z URL
  const navigate = useNavigate();
  const [partType, setPartType] = useState({ name: "", max_mileage: "" });
  const [loading, setLoading] = useState(true); // Stan ładowania
  const [error, setError] = useState(""); // Stan błędu
  const [success, setSuccess] = useState(false); // Stan sukcesu

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/get-part-type/${id}`)
      .then((response) => {
        setPartType(response.data);
      })
      .catch((error) => {
        console.error("Błąd przy pobieraniu danych typu części:", error);
        setError("Nie udało się pobrać danych typu części.");
      })
      .finally(() => setLoading(false)); // Po zakończeniu ładowania
  }, [id]);

  const handleChange = (e) => {
    setPartType({ ...partType, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`${import.meta.env.VITE_API_URL}/update-part-type/${id}`, partType)
      .then(() => {
        setSuccess(true); // Ustawienie stanu sukcesu
        setTimeout(() => navigate("/components"), 2000); // Przekierowanie po 2 sekundy
      })
      .catch((error) => {
        console.error("Błąd przy aktualizacji typu części:", error);
        setError("Nie udało się zaktualizować typu części.");
      });
  };

  if (loading) {
    return <div>Ładowanie...</div>; // Komunikat ładowania
  }

  return (
    <div className="container mt-4">
      <h1>Edytuj Typ Części</h1>

      {error && <div className="alert alert-danger">{error}</div>} {/* Komunikat błędu */}
      {success && <div className="alert alert-success">Typ części został zaktualizowany!</div>} {/* Komunikat sukcesu */}

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

      {/* Szary przycisk powrotu */}
      <button
        className="btn btn-secondary mt-3"
        onClick={() => navigate("/components")} // Zwrócenie użytkownika na stronę komponentów
      >
        Powrót
      </button>
    </div>
  );
}

export default EditPartType;
