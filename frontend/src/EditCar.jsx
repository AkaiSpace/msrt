import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditCar() {
  const { carId } = useParams(); // Pobieramy ID samochodu z URL
  const navigate = useNavigate();
  const [car, setCar] = useState(null); // Stan dla danych samochodu
  const [newChassisNumber, setNewChassisNumber] = useState(""); // Nowy numer nadwozia
  const [newDriver, setNewDriver] = useState(""); // Nowy kierowca
  const [error, setError] = useState(""); // Błąd
  const [loading, setLoading] = useState(true); // Stan ładowania

  useEffect(() => {
    if (!carId) {
      setError("Brak ID samochodu!");
      setLoading(false);
      return;
    }

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/get-car/${carId}`)
      .then((response) => {
        console.log("Otrzymane dane z API:", response.data); // Debugowanie
        setCar(response.data);
        setNewChassisNumber(response.data.chassis_number || ""); 
        setNewDriver(response.data.driver || "");
        setLoading(false);
      })
      .catch((error) => {
        console.error("Błąd przy pobieraniu danych samochodu", error);
        setError(`Błąd przy ładowaniu danych samochodu: ${error.message}`);
        setLoading(false);
      });
  }, [carId]);

  const handleChassisNumberChange = (e) => {
    setNewChassisNumber(e.target.value); // Zmiana numeru nadwozia
  };

  const handleDriverChange = (e) => {
    setNewDriver(e.target.value); // Zmiana kierowcy
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newChassisNumber || !newDriver) {
      setError("Numer nadwozia i kierowca są wymagane!");
      return;
    }

    // Wysyłanie żądania PUT do API
    axios
      .put(`${import.meta.env.VITE_BACKEND_URL}/update-car/${carId}`, {
        chassis_number: newChassisNumber,
        driver: newDriver, // Dodanie kierowcy
      })
      .then((response) => {
        setCar(response.data);
        setError(""); // Czyszczenie błędu
        navigate("/edit"); // Przekierowanie do listy samochodów
      })
      .catch((error) => {
        console.error("Błąd przy edytowaniu samochodu", error);
        setError(`Wystąpił błąd przy edytowaniu samochodu: ${error.message}`);
      });
  };

  return (
    <div className="container mt-4">
      <h1>Edytuj samochód {car ? `- ${car.chassis_number}` : ""}</h1>

      {loading ? (
        <p>Ładowanie danych samochodu...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="mb-3">
            <label className="form-label">Numer nadwozia</label>
            <input
              type="text"
              className="form-control"
              name="chassis_number"
              value={newChassisNumber}
              onChange={handleChassisNumberChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Kierowca</label>
            <input
              type="text"
              className="form-control"
              name="driver"
              value={newDriver}
              onChange={handleDriverChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-success">
            Zapisz zmiany
          </button>
        </form>
      )}

      <div className="my-4">
        <button className="btn btn-secondary" onClick={() => navigate("/edit")}>
          Powrót do listy samochodów
        </button>
      </div>
    </div>
  );
}

export default EditCar;
