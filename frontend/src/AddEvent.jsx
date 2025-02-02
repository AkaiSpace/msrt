import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddEvent() {
  const [newEvent, setNewEvent] = useState({
    name: "", // Nazwa wydarzenia
    date: "",
    notes: "",
  });

  const navigate = useNavigate();

  // Obsługa zmian w formularzu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  // Obsługa wysyłania formularza
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dane wysyłane do backendu:", newEvent); // Sprawdzenie danych
    axios
      .post("http://localhost:5000/add-event", newEvent)
      .then(() => navigate("/")) // Przekierowanie po zapisaniu
      .catch((error) => console.error("Błąd przy dodawaniu wydarzenia:", error));
  };

  return (
    <div className="container mt-4">
      <h1>Dodaj wydarzenie</h1>
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Nazwa wydarzenia</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={newEvent.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Data wydarzenia</label>
          <input
            type="date"
            className="form-control"
            name="date"
            value={newEvent.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Notatki</label>
          <textarea
            className="form-control"
            name="notes"
            value={newEvent.notes}
            onChange={handleChange}
          ></textarea>
        </div>

        <button type="submit" className="btn btn-success">
          Dodaj wydarzenie
        </button>
      </form>

      {/* Szary przycisk z powrotem do strony głównej */}
      <button
        className="btn btn-secondary mt-3"
        onClick={() => navigate("/")}
      >
        Powrót do strony głównej
      </button>
    </div>
  );
}

export default AddEvent;
