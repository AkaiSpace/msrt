import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

function CarEvents() {
  const { carId } = useParams(); // Pobiera ID samochodu z URL
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/get-events-for-car/${carId}`)
      .then((response) => {
        setEvents(response.data.events);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Błąd przy pobieraniu wydarzeń dla samochodu:", error);
        setLoading(false);
      });
  }, [carId]);

  return (
    <div className="container mt-4">
      <h1>Historia wydarzeń dla samochodu {carId}</h1>

      {loading ? (
        <p>Ładowanie...</p>
      ) : events.length === 0 ? (
        <p>Brak wydarzeń dla tego samochodu.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nazwa wydarzenia</th>
              <th>Data</th>
              <th>Notatki</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.id}</td>
                <td>{event.name}</td>
                <td>{new Date(event.date).toLocaleDateString()}</td>
                <td>{event.notes || "Brak notatek"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Link to="/" className="btn btn-secondary mt-3">
        Powrót
      </Link>
    </div>
  );
}

export default CarEvents;
