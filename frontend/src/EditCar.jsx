import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditCar() {
  const { carId } = useParams(); // Pobieramy ID samochodu z URL
  const navigate = useNavigate();
  const [car, setCar] = useState({ chassis_number: "" }); // Stan dla danych samochodu
  const [newChassisNumber, setNewChassisNumber] = useState(""); // Nowy numer nadwozia
  const [error, setError] = useState(""); // Błąd
  const [loading, setLoading] = useState(true); // Stan ładowania

  console.log("carId:", carId); // Debugowanie: sprawdź wartość carId

  useEffect(() => {
    if (!carId) {
      setError("Brak ID samochodu!");
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:5000/get-car/${carId}`)
      .then((response) => {
        setCar(response.data.car); // Ustawienie danych samochodu
        setNewChassisNumber(response.data.car?.chassis_number || ""); // Ustawienie aktualnego numeru nadwozia w formularzu
        setLoading(false); // Zakończenie ładowania
      })
      .catch((error) => {
        console.error("Błąd przy pobieraniu danych samochodu", error);
        setError(`Błąd przy ładowaniu danych samochodu: ${error.message}`);
        setLoading(false); // Zakończenie ładowania, nawet jeśli wystąpił błąd
      });
  }, [carId]);

  const handleChange = (e) => {
    setNewChassisNumber(e.target.value); // Zmiana wartości w formularzu
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newChassisNumber) {
      setError("Numer nadwozia jest wymagany!");
      return;
    }

    // Wysyłanie żądania PUT do API
    axios
      .put(`http://localhost:5000/update-car/${carId}`, { chassis_number: newChassisNumber })
      .then((response) => {
        // Zaktualizowanie danych samochodu po udanej edycji
        setCar(response.data.car);
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
      <h1>Edytuj samochód</h1>

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
              onChange={handleChange}
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