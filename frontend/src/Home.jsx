import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Home() {
  const [cars, setCars] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc"); // Stan dla kierunku sortowania

  useEffect(() => {
    axios
      .get("http://localhost:5000/get-cars")
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
    <div>
      <h1 className="my-4 text-center">M-Sport DB v1.0.0</h1>
      <button 
        onClick={handleSortClick} 
        className="btn btn-secondary mb-3"
      >
        Sortuj po numerze nadwozia ({sortOrder === "asc" ? "Rosnąco" : "Malejąco"})
      </button>
      <ul className="list-group">
        {cars.map((car) => (
          <li key={car.id} className="list-group-item">
            <Link to={`/car/${car.id}`} className="fw-bold">{car.chassis_number}</Link>
            <p className="mb-1"><strong>Kierowca:</strong> {car.driver || "Brak danych"}</p>
            <p className="mb-0"><strong>Ostatnie wydarzenie:</strong> {car.last_event || "Brak danych"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
