import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Home() {
  const [cars, setCars] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL; // Zmienna środowiskowa z VITE_
    console.log("Backend URL:", backendUrl); // Sprawdzamy zmienną

    const url = `${backendUrl}/get-cars`;
    console.log("Requesting URL:", url); // Sprawdzamy pełny URL zapytania

    axios
      .get(url)
      .then((response) => {
        setCars(response.data.cars);
      })
      .catch((error) => console.error("Błąd przy pobieraniu samochodów", error));
  }, []);

  // Funkcja do sortowania samochodów po numerze nadwozia
  const sortCars = (order) => {
    const sortedCars = [...cars].sort((a, b) => {
      if (order === "asc") {
        return a.chassis_number.localeCompare(b.chassis_number); // Sortowanie rosnąco
      } else {
        return b.chassis_number.localeCompare(a.chassis_number); // Sortowanie malejąco
      }
    });
    setCars(sortedCars); // Zaktualizuj stan po posortowaniu
  };

  // Funkcja obsługująca kliknięcie przycisku sortowania
  const handleSortClick = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    sortCars(newSortOrder);
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center">M-Sport DB v1.0.0</h1>

      {/* Przycisk sortowania */}
      <button 
        onClick={handleSortClick} 
        className="btn btn-secondary mb-3"
      >
        Sortuj po numerze nadwozia ({sortOrder === "asc" ? "Rosnąco" : "Malejąco"})
      </button>

      {/* Lista samochodów */}
      <ul className="list-group">
        {cars.map((car) => (
          <li key={car.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <Link to={`/car/${car.id}`} className="fw-bold">{car.chassis_number}</Link>
              <p className="mb-1"><strong>Kierowca:</strong> {car.driver || "Brak danych"}</p>
              <p className="mb-0"><strong>Ostatnie wydarzenie:</strong> {car.last_event || "Brak danych"}</p>
            </div>

            {/* Przyciski "Eventy" i "Historia" */}
            <div>
              <Link to={`/car-events/${car.id}`} className="btn btn-primary btn-sm me-2">
                Eventy
              </Link>
              <Link to={`/car-history/${car.id}`} className="btn btn-info btn-sm">
                Historia
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;