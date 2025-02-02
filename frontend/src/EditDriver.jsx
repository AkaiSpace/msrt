import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditDriver() {
  const { carId } = useParams(); // Pobranie ID samochodu z URL
  const navigate = useNavigate();

  const [car, setCar] = useState({ chassis_number: "", driver: "" }); // Stan dla danych samochodu
  const [newDriver, setNewDriver] = useState(""); // Nowy kierowca
  const [error, setError] = useState(""); // Błąd
  const [loading, setLoading] = useState(true); // Stan ładowania

  // Pobierz dane samochodu z backendu
  useEffect(() => {
    axios
      .get(`http://localhost:5000/get-car/${carId}`)
      .then((response) => {
        const carData = response.data.car;
        setCar(carData); // Ustawienie danych samochodu
        setNewDriver(carData.driver || ""); // Ustawienie aktualnego kierowcy w formularzu
        setLoading(false); // Zakończenie ładowania
      })
      .catch((error) => {
        console.error("Błąd przy pobieraniu danych samochodu", error);
        setError("Nie udało się załadować danych samochodu.");
        setLoading(false);
      });
  }, [carId]);

  // Obsługa zmiany wartości w formularzu
  const handleChange = (e) => {
    setNewDriver(e.target.value); // Zmiana wartości w formularzu
  };

  // Obsługa wysłania formularza
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newDriver) {
      setError("Kierowca jest wymagany!");
      return;
    }

    // Wysyłanie żądania PUT do API
    axios
      .put(`http://localhost:5000/update-car/${carId}`, { driver: newDriver })
      .then((response) => {
        // Zaktualizowanie danych samochodu po udanej edycji
        setCar(response.data.car);
        setError(""); // Czyszczenie błędu
        navigate("/edit"); // Przekierowanie do strony edycji
      })
      .catch((error) => {
        console.error("Błąd przy edytowaniu kierowcy", error);
        setError("Wystąpił błąd przy edytowaniu kierowcy.");
      });
  };

  // Wyświetlanie stanu ładowania
  if (loading) {
    return <p>Ładowanie danych samochodu...</p>;
  }

  // Wyświetlanie błędów
  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <div className="container mt-4">
      <h1>Edytuj kierowcę</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Numer nadwozia</label>
          <p>{car.chassis_number}</p>
        </div>

        <div className="mb-3">
          <label className="form-label">Kierowca</label>
          <input
            type="text"
            className="form-control"
            name="driver"
            value={newDriver}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-success">
          Zapisz zmiany
        </button>
      </form>

      <div className="mt-4">
        <button className="btn btn-secondary" onClick={() => navigate("/edit")}>
          Powrót do listy samochodów
        </button>
      </div>
    </div>
  );
}

export default EditDriver;