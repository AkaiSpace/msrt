import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function CarDetails() {
  const { id } = useParams(); // Pobieramy ID samochodu z URL
  const [car, setCar] = useState(null);
  const [parts, setParts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Pobieranie szczegółów samochodu
    axios
      .get(`http://localhost:5000/get-car/${id}`)
      .then((response) => {
        console.log("Odpowiedź API:", response.data); // Sprawdzamy strukturę odpowiedzi
        if (response.data) { // Sprawdzamy, czy odpowiedź zawiera dane
          setCar(response.data); // Ustawienie danych samochodu
        } else {
          setError("Brak danych samochodu.");
        }
      })
      .catch((error) => {
        console.error("Błąd przy pobieraniu danych samochodu", error);
        setError("Błąd przy pobieraniu danych samochodu.");
      });
  
    // Pobieranie części przypisanych do samochodu
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

  // Funkcja zwracająca klasę Bootstrap dla koloru zużycia
  const getUsageColor = (usage) => {
    if (usage === null) return "bg-secondary"; // Brak danych → szary kolor
    if (usage <= 50) return "bg-success"; // Zielony (0-50%)
    if (usage <= 75) return "bg-warning"; // Żółty (50-75%)
    return "bg-danger"; // Czerwony (>75%)
  };

  return (
    <div className="container mt-4">
      <h1>
        Szczegóły samochodu{" "}
        {car && car.chassis_number ? `(${car.chassis_number})` : ""}
      </h1>
      {error && <p className="text-danger">{error}</p>}
  
      {car ? (
        <div>
          <h3>Lista części:</h3>
          <ul className="list-group">
            {parts.length > 0 ? (
              parts.map((part) => (
                <li key={part.id} className="list-group-item">
                  <h5>{part.name}</h5> {/* Wyświetlamy typ części */}
                  <p>Numer części: {part.part_number}</p>
                  <p>Przebieg: {part.mileage} km</p>
                  <p>
                    Zużycie:{" "}
                    {part.usage_percentage !== null
                      ? `${part.usage_percentage}%`
                      : "Brak danych"}
                  </p>
  
                  {/* Pasek zużycia */}
                  <div className="progress" style={{ height: "20px" }}>
                    <div
                      className={`progress-bar ${getUsageColor(part.usage_percentage)}`}
                      role="progressbar"
                      style={{ width: `${part.usage_percentage || 0}%` }}
                      aria-valuenow={part.usage_percentage || 0}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {part.usage_percentage !== null
                        ? `${part.usage_percentage}%`
                        : "?"}
                    </div>
                  </div>
  
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
