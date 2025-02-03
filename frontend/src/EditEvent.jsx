import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditEvent() {
  const { id } = useParams(); // Pobieramy id z URL
  const navigate = useNavigate();
  const [event, setEvent] = useState({ event_name: "", event_date: "" });
  const [loading, setLoading] = useState(true); // Stan ładowania
  const [error, setError] = useState(""); // Stan błędu
  const [success, setSuccess] = useState(false); // Stan sukcesu

  useEffect(() => {
    // Pobieranie danych wydarzenia z serwera
    axios
      .get(`${import.meta.env.VITE_API_URL}/get-event/${id}`)
      .then((response) => {
        setEvent({
          event_name: response.data.name,
          event_date: response.data.date,
        });
      })
      .catch((error) => {
        console.error("Błąd przy pobieraniu danych wydarzenia:", error);
        setError("Nie udało się pobrać danych wydarzenia.");
      })
      .finally(() => setLoading(false)); // Po zakończeniu ładowania
  }, [id]);

  const handleChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`${import.meta.env.VITE_API_URL}/update-event/${id}`, event)
      .then(() => {
        setSuccess(true); // Ustawienie stanu sukcesu
        setTimeout(() => navigate("/events"), 2000); // Przekierowanie po 2 sekundy
      })
      .catch((error) => {
        console.error("Błąd przy aktualizacji wydarzenia:", error);
        setError("Nie udało się zaktualizować wydarzenia.");
      });
  };

  if (loading) {
    return <div>Ładowanie...</div>; // Komunikat ładowania
  }

  return (
    <div className="container mt-4">
      <h1>Edytuj Wydarzenie</h1>

      {error && <div className="alert alert-danger">{error}</div>} {/* Komunikat błędu */}
      {success && <div className="alert alert-success">Wydarzenie zostało zaktualizowane!</div>} {/* Komunikat sukcesu */}

      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Nazwa wydarzenia</label>
          <input
            type="text"
            className="form-control"
            name="event_name"
            value={event.event_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Data wydarzenia</label>
          <input
            type="date"
            className="form-control"
            name="event_date"
            value={event.event_date}
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
        onClick={() => navigate("/events")} // Zwrócenie użytkownika na stronę wydarzeń
      >
        Powrót
      </button>
    </div>
  );
}

export default EditEvent;
