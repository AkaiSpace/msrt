import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function CarDetails() {
  const { id } = useParams(); // Pobieramy ID samochodu z URL
  const [car, setCar] = useState(null);
  const [parts, setParts] = useState([]);
  const [error, setError] = useState("");

  // Pobieramy szczegóły samochodu oraz przypisane do niego części
  useEffect(() => {
    // Pobranie szczegółów samochodu
    axios
      .get(`http://localhost:5000/get-car/${id}`)
      .then((response) => {
        setCar(response.data);
      })
      .catch((error) => {
        console.error("Błąd przy pobieraniu danych samochodu", error);
        setError("Błąd przy pobieraniu danych samochodu.");
      });

    // Pobranie części przypisanych do tego samochodu
    axios
      .get(`http://localhost:5000/get-parts-for-car/${id}`)
      .then((response) => {
        setParts(response.data.parts);
      })
      .catch((error) => {
        console.error("Błąd przy pobieraniu części", error);
        setError("Błąd przy pobieraniu części.");
      });
  }, [id]);

  return (
    <div className="container mt-4">
      <h1>Szczegóły samochodu</h1>
      {error && <p className="text-danger">{error}</p>}

      {car ? (
        <div>
          <h2>{car.chassis_number}</h2>
          <h3>Lista części:</h3>
          <ul className="list-group">
            {parts.length > 0 ? (
              parts.map((part) => (
                <li key={part.id} className="list-group-item">
                  <h5>{part.name}</h5>
                  <p>Numer części: {part.part_number}</p>
                  <p>Przebieg: {part.mileage} km</p>
                  <p>Notatki: {part.notes}</p>
                </li>
              ))
            ) : (
              <p>Brak części przypisanych do tego samochodu.</p>
            )}
          </ul>
        </div>
      ) : (
        <p>Ładowanie szczegółów samochodu...</p>
      )}
    </div>
  );
}

export default CarDetails;
