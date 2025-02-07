import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Events() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // Stan dla sortowania

  // Pobiera wydarzenia z serwera
  const fetchEvents = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/get-events`)
      .then((response) => {
        setEvents(
          response.data.events.map((event) => ({
            ...event,
            event_name: event.name,
            event_date: event.date,
            notes: event.notes,
            cars: event.cars || [], // Domyślna pusta tablica, jeśli brak aut
          }))
        );
      })
      .catch((error) => {
        console.error("Błąd przy pobieraniu wydarzeń:", error);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Funkcja do sortowania wydarzeń po dacie
  const sortEventsByDate = () => {
    const sortedEvents = [...events].sort((a, b) => {
      const dateA = new Date(a.event_date);
      const dateB = new Date(b.event_date);

      if (sortOrder === "asc") {
        return dateA - dateB; // Sortowanie rosnąco
      } else {
        return dateB - dateA; // Sortowanie malejąco
      }
    });

    setEvents(sortedEvents);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc"); // Zmiana kolejności sortowania
  };

  return (
    <div className="container mt-4">
      <h1>Lista wydarzeń</h1>

      {/* Pole wyszukiwania */}
      <input
        type="text"
        className="form-control my-3"
        placeholder="Szukaj po nazwie wydarzenia lub numerze nadwozia..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Samochody</th>
            <th>Nazwa wydarzenia</th>
            <th>
              Data wydarzenia{" "}
              <button onClick={sortEventsByDate}>🔽/🔼</button> {/* Przycisk do sortowania */}
            </th>
            <th className="text-center">Notatki</th>
            <th className="text-center">Akcje</th>
          </tr>
        </thead>
        <tbody>
          {events.length > 0 ? (
            events
              .filter(
                (event) =>
                  event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  event.car_chassis_numbers.some((chassis) =>
                    chassis.toLowerCase().includes(searchTerm.toLowerCase())
                  )
              )
              .map((event) => (
                <tr key={event.id}>
                  <td>{event.id}</td>

                  {/* Wyświetlanie samochodów */}
                  <td>
                    {event.car_chassis_numbers && event.car_chassis_numbers.length > 0 ? (
                      event.car_chassis_numbers.join(", ")
                    ) : (
                      <span className="text-muted">Brak pojazdów</span>
                    )}
                  </td>

                  <td>{event.event_name}</td>
                  <td>{new Date(event.event_date).toLocaleDateString()}</td>
                  <td>{event.notes}</td>
                  <td className="text-end">
                    <Link
                      to={`/add-car-to-event/${event.id}`}
                      className="btn btn-warning btn-sm me-2"
                    >
                      Dodaj/Usuń Pojazdy
                    </Link>
                    <Link
                      to={`/edit-event/${event.id}`}
                      className="btn btn-primary btn-sm me-2"
                    >
                      Edytuj
                    </Link>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                Brak wydarzeń do wyświetlenia
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Przyciski na dole strony */}
      <div className="mt-4 d-flex justify-content-between">
        <Link to="/" className="btn btn-secondary">
          Powrót do strony głównej
        </Link>
        <Link to="/add-event" className="btn btn-success">
          Dodaj wydarzenie
        </Link>
      </div>
    </div>
  );
}

export default Events;
