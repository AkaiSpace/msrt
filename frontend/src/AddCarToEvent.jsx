import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function AddCarToEvent() {
  const { eventId } = useParams(); // Pobieramy ID wydarzenia z URL
  const [event, setEvent] = useState(null); // Szczegóły wydarzenia
  const [cars, setCars] = useState([]); // Lista wszystkich samochodów
  const [assignedCars, setAssignedCars] = useState([]); // Lista samochodów przypisanych do wydarzenia
  const [selectedCarId, setSelectedCarId] = useState(""); // Wybrany samochód
  const navigate = useNavigate();

  // Pobiera szczegóły wydarzenia
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/get-event/${eventId}`)
      .then((response) => setEvent(response.data))
      .catch((error) => console.error("Błąd przy pobieraniu wydarzenia:", error));
  }, [eventId]);

  // Pobiera listę wszystkich samochodów
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/get-cars`)
      .then((response) => setCars(response.data.cars))
      .catch((error) => console.error("Błąd przy pobieraniu samochodów:", error));
  }, []);

  // Pobiera listę samochodów przypisanych do wydarzenia
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/get-cars-for-event/${eventId}`)
      .then((response) => setAssignedCars(response.data.cars))
      .catch((error) => console.error("Błąd przy pobieraniu przypisanych samochodów:", error));
  }, [eventId]);

  // Obsługuje dodanie pojazdu do wydarzenia
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedCarId) {
      alert("Wybierz pojazd, aby dodać go do wydarzenia!");
      return;
    }

    axios
      .post(`${import.meta.env.VITE_BACKEND_URL}/add-car-to-event`, {
        event_id: eventId,
        car_id: selectedCarId,
      })
      .then(() => {
        alert("Pojazd został dodany do wydarzenia!");
        // Odśwież listę przypisanych samochodów
        axios
          .get(`${import.meta.env.VITE_BACKEND_URL}/get-cars-for-event/${eventId}`)
          .then((response) => setAssignedCars(response.data.cars))
          .catch((error) => console.error("Błąd przy pobieraniu przypisanych samochodów:", error));
      })
      .catch((error) => console.error("Błąd przy dodawaniu pojazdu:", error));
  };

  // Obsługuje usunięcie pojazdu z wydarzenia
  const handleRemoveCar = (carId) => {
    const confirmRemove = window.confirm("Czy na pewno chcesz usunąć ten pojazd z wydarzenia?");
    if (confirmRemove) {
      axios
        .delete(`${import.meta.env.VITE_BACKEND_URL}/remove-car-from-event`, {
          data: { event_id: eventId, car_id: carId },
        })
        .then(() => {
          alert("Pojazd został usunięty z wydarzenia!");
          // Odśwież listę przypisanych samochodów
          setAssignedCars((prev) => prev.filter((car) => car.id !== carId));
        })
        .catch((error) => console.error("Błąd przy usuwaniu pojazdu:", error));
    }
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

      {/* Lista przypisanych samochodów */}
      <div className="mt-4">
        <h3>Przypisane pojazdy</h3>
        {assignedCars.length === 0 ? (
          <p>Brak przypisanych pojazdów.</p>
        ) : (
          <ul className="list-group">
            {assignedCars.map((car) => (
              <li key={car.id} className="list-group-item d-flex justify-content-between align-items-center">
                {car.chassis_number} - {car.model}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemoveCar(car.id)}
                >
                  Usuń
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={() => navigate("/events")} className="btn btn-secondary mt-3">
        Powrót do listy wydarzeń
      </button>
    </div>
  );
}

export default AddCarToEvent;