import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UpdateMileage() {
  const [cars, setCars] = useState([]); // Lista samochodów
  const [selectedCarId, setSelectedCarId] = useState(""); // ID wybranego samochodu
  const [mileage, setMileage] = useState(""); // Przebieg do dodania (pusty domyślnie)
  const [error, setError] = useState(""); // Błąd
  const [loading, setLoading] = useState(true); // Stan ładowania
  const navigate = useNavigate();

  // Pobierz listę samochodów z backendu
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/get-cars`)
      .then((response) => {
        setCars(response.data.cars);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Błąd przy pobieraniu samochodów:", error);
        setError("Nie udało się załadować listy samochodów.");
        setLoading(false);
      });
  }, []);

  // Obsługa wysłania formularza
  const handleSubmit = (e) => {
    e.preventDefault();

    // Walidacja danych
    if (!selectedCarId || mileage === "") {
      setError("Wybierz samochód i wprowadź przebieg.");
      return;
    }

    // Sprawdź, czy mileage jest liczbą
    const mileageNumber = Number(mileage);
    if (isNaN(mileageNumber)) {
      setError("Przebieg musi być liczbą.");
      return;
    }

    // Wyślij żądanie do backendu
    axios
      .put(`${import.meta.env.VITE_BACKEND_URL}/update-mileage/${selectedCarId}`, { mileage: mileageNumber })
      .then(() => {
        alert("Przebiegi części zaktualizowane pomyślnie!");
        navigate("/"); // Przekierowanie na stronę główną
      })
      .catch((error) => {
        console.error("Błąd przy aktualizacji przebiegów:", error);
        setError("Nie udało się zaktualizować przebiegów.");
      });
  };

  // Wyświetlanie stanu ładowania
  if (loading) {
    return <p>Ładowanie listy samochodów...</p>;
  }

  // Wyświetlanie błędów
  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <div className="container mt-4">
      <h1>Aktualizuj przebiegi części</h1>

      <form onSubmit={handleSubmit}>
        {/* Pole wyboru samochodu */}
        <div className="mb-3">
          <label className="form-label">Wybierz samochód</label>
          <select
            className="form-select"
            value={selectedCarId}
            onChange={(e) => setSelectedCarId(e.target.value)}
            required
          >
            <option value="">Wybierz samochód</option>
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.chassis_number}
              </option>
            ))}
          </select>
        </div>

        {/* Pole do wprowadzenia przebiegu */}
        <div className="mb-3">
          <label className="form-label">Przebieg do dodania (km)</label>
          <input
            type="number"
            className="form-control"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)} // Pozwól na wpisywanie wartości ujemnych
            required
          />
        </div>

        {/* Przycisk do wysłania formularza */}
        <button type="submit" className="btn btn-success">
          Zaktualizuj przebiegi
        </button>
      </form>

      {/* Przycisk powrotu do strony głównej */}
      <div className="mt-4">
        <button className="btn btn-secondary" onClick={() => navigate("/")}>
          Powrót do strony głównej
        </button>
      </div>
    </div>
  );
}

export default UpdateMileage;