import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function AddCarToEvent() {
  const { eventId } = useParams(); // Pobieramy ID wydarzenia z URL
  const [event, setEvent] = useState(null); // Szczegóły wydarzenia
  const [cars, setCars] = useState([]); // Lista samochodów
  const [selectedCarId, setSelectedCarId] = useState(""); // Wybrany samochód
  const navigate = useNavigate();

  // Pobiera szczegóły wydarzenia
  useEffect(() => {
    axios
      .get(`http://localhost:5000/get-event/${eventId}`)
      .then((response) => setEvent(response.data))
      .catch((error) => console.error("Błąd przy pobieraniu wydarzenia:", error));
  }, [eventId]);

  // Pobiera listę samochodów
  useEffect(() => {
    axios
      .get("http://localhost:5000/get-cars")
      .then((response) => setCars(response.data.cars))
      .catch((error) => console.error("Błąd przy pobieraniu samochodów:", error));
  }, []);

  // Obsługuje dodanie pojazdu do wydarzenia
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedCarId) {
      alert("Wybierz pojazd, aby dodać go do wydarzenia!");
      return;
    }

    axios
      .post("http://localhost:5000/add-car-to-event", {
        event_id: eventId,
        car_id: selectedCarId,
      })
      .then(() => {
        alert("Pojazd został dodany do wydarzenia!");
        navigate("/events"); // Przekierowanie po dodaniu
      })
      .catch((error) => console.error("Błąd przy dodawaniu pojazdu:", error));
  };

  return (
    <div className="container mt-4">
      <h1>Dodaj pojazd do wydarzenia</h1>

      {event ? (
        <p>
          <strong>Wydarzenie:</strong> {event.name} ({event.date})
        </p>
      ) : (
        <p>Ładowanie wydarzenia...</p>
      )}

      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Wybierz pojazd</label>
          <select
            className="form-control"
            value={selectedCarId}
            onChange={(e) => setSelectedCarId(e.target.value)}
            required
          >
            <option value="">-- Wybierz pojazd --</option>
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.chassis_number} - {car.model}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-success">
          Dodaj pojazd
        </button>
      </form>

      <button onClick={() => navigate("/events")} className="btn btn-secondary mt-3">
        Powrót do listy wydarzeń
      </button>
    </div>
  );
}

export default AddCarToEvent;
