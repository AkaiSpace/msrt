import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Hook do nawigacji

function Edit() {
  const [cars, setCars] = useState([]); // Lista samochodów
  const [searchTerm, setSearchTerm] = useState(""); // Stan do wyszukiwania samochodów
  const [showCarForm, setShowCarForm] = useState(false); // Kontrolowanie widoczności formularza
  const [chassisNumber, setChassisNumber] = useState(""); // Numer nadwozia
  const [driver, setDriver] = useState(""); // Kierowca
  const [error, setError] = useState(""); // Błąd przy dodawaniu
  const navigate = useNavigate(); // Hook nawigacji

  // Pobranie listy samochodów
  useEffect(() => {
    axios
      .get("http://localhost:5000/get-cars")
      .then((response) => {
        setCars(response.data.cars);
      })
      .catch((error) => console.error("Błąd przy pobieraniu samochodów", error));
  }, []);

  // Obsługa zmiany wartości w formularzu
  const handleChange = (e) => {
    if (e.target.name === "chassisNumber") {
      setChassisNumber(e.target.value);
    } else if (e.target.name === "driver") {
      setDriver(e.target.value);
    }
  };

  // Funkcja do dodawania samochodu
  const handleAddCar = () => {
    if (!chassisNumber || !driver) {
      setError("Numer nadwozia i kierowca są wymagane!");
      return;
    }

    axios
      .post("http://localhost:5000/add-car", {
        chassis_number: chassisNumber,
        driver: driver, // Dodanie kierowcy
      })
      .then((response) => {
        setCars((prevCars) => [...prevCars, response.data.car]);
        setChassisNumber(""); // Czyszczenie formularza
        setDriver(""); // Czyszczenie pola kierowcy
        setError(""); // Czyszczenie błędów
      })
      .catch((error) => {
        console.error("Błąd przy dodawaniu samochodu", error);
        setError("Wystąpił błąd przy dodawaniu samochodu.");
      });
  };

  // Funkcja do usuwania samochodu
  const handleDeleteCar = (id) => {
    axios
      .delete(`http://localhost:5000/delete-car/${id}`)
      .then(() => {
        setCars(cars.filter((car) => car.id !== id));
      })
      .catch((error) => console.error("Błąd przy usuwaniu samochodu", error));
  };

  // Funkcja do edytowania samochodu
  const handleEditCar = (id) => {
    navigate(`/edit-car/${id}`);
  };

  // Filtrujemy samochody na podstawie wyszukiwania
  const filteredCars = cars.filter(
    (car) =>
      car.chassis_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.driver.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Edycja Samochodów</h1>

      {/* Pole wyszukiwania */}
      <input
        type="text"
        className="form-control my-3"
        placeholder="Szukaj po numerze nadwozia lub kierowcy..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Tabela z samochodami */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Numer nadwozia</th>
            <th>Kierowca</th>
            <th>Akcja</th>
          </tr>
        </thead>
        <tbody>
          {filteredCars.length > 0 ? (
            filteredCars.map((car) => (
              <tr key={car.id}>
                <td>{car.chassis_number}</td>
                <td>{car.driver || "Brak danych"}</td>
                <td className="text-center">
                  <div className="btn-group">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEditCar(car.id)}
                    >
                      Edytuj
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteCar(car.id)}
                    >
                      Usuń
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                Brak samochodów w katalogu
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Formularz dodawania samochodu */}
      <div className="mt-4">
        <button className="btn btn-success" onClick={() => setShowCarForm(!showCarForm)}>
          {showCarForm ? "Anuluj" : "Dodaj samochód"}
        </button>

        {showCarForm && (
          <form onSubmit={(e) => e.preventDefault()} className="mt-3">
            <div className="mb-3">
              <label className="form-label">Numer nadwozia</label>
              <input
                type="text"
                className="form-control"
                name="chassisNumber"
                value={chassisNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Kierowca</label>
              <input
                type="text"
                className="form-control"
                name="driver"
                value={driver}
                onChange={handleChange}
                required
              />
            </div>
            <button type="button" className="btn btn-primary" onClick={handleAddCar}>
              Dodaj samochód
            </button>
            {error && <p className="text-danger">{error}</p>}
          </form>
        )}
      </div>

      {/* Przycisk powrotu */}
      <div className="mt-4">
        <Link to="/" className="btn btn-secondary">Powrót do strony głównej</Link>
      </div>
    </div>
  );
}

export default Edit;
