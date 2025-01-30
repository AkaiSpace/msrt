import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Hook do nawigacji

function Edit() {
  const [showCarForm, setShowCarForm] = useState(false);
  const [chassisNumber, setChassisNumber] = useState(""); // Numer nadwozia
  const [cars, setCars] = useState([]); // Lista samochodów
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

  // Funkcja do usuwania samochodu
  const handleDeleteCar = (id) => {
    axios
      .delete(`http://localhost:5000/delete-car/${id}`)
      .then(() => {
        // Po usunięciu samochodu, odświeżamy listę samochodów
        setCars(cars.filter((car) => car.id !== id));
      })
      .catch((error) => console.error("Błąd przy usuwaniu samochodu", error));
  };

  // Funkcja do dodawania samochodu
  const handleAddCar = () => {
    if (!chassisNumber) {
      setError("Numer nadwozia jest wymagany!");
      return;
    }

    axios
      .post("http://localhost:5000/add-car", { chassis_number: chassisNumber })
      .then((response) => {
        // Zaktualizowanie listy samochodów po dodaniu
        setCars((prevCars) => [...prevCars, response.data.car]);
        setChassisNumber(""); // Czyszczenie formularza
        setError(""); // Czyszczenie błędów
      })
      .catch((error) => {
        console.error("Błąd przy dodawaniu samochodu", error);
        setError("Wystąpił błąd przy dodawaniu samochodu.");
      });
  };

  // Funkcja do pokazywania formularza dodania samochodu
  const toggleCarForm = () => setShowCarForm(!showCarForm);

  // Funkcja do powrotu na stronę główną
  const goBack = () => {
    navigate("/"); // Przechodzi do strony głównej
  };

  // Funkcja do edytowania numeru nadwozia
  const handleEditCar = (id) => {
    navigate(`/edit-car/${id}`); // Przekierowuje do strony edycji
  };

  return (
    <div className="container">
      <h1>Strona Edycji</h1>

      {/* Wyświetlanie listy samochodów */}
      <div className="my-4">
        <h2>Lista samochodów</h2>
        <ul>
          {cars.map((car) => (
            <li key={car.id} className="d-flex justify-content-between align-items-center">
              <span>{car.chassis_number}</span>
              
              <div className="d-flex">
                {/* Przycisk do usuwania pojazdu */}
                <button
                  className="btn btn-danger btn-sm mr-2"
                  onClick={() => handleDeleteCar(car.id)}
                >
                  Usuń
                </button>

                {/* Przycisk do edycji numeru nadwozia */}
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => handleEditCar(car.id)}
                >
                  Edytuj numer
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Wyświetlanie formularza dodawania samochodu */}
      <div className="my-4">
        <button className="btn btn-primary" onClick={toggleCarForm}>
          {showCarForm ? "Ukryj formularz dodania auta" : "Dodaj nowy samochód"}
        </button>
        {showCarForm && (
          <div>
            <input
              type="text"
              className="form-control my-2"
              value={chassisNumber}
              onChange={(e) => setChassisNumber(e.target.value)}
              placeholder="Wpisz numer nadwozia"
            />
            <button className="btn btn-primary" onClick={handleAddCar}>
              Dodaj samochód
            </button>
            {error && <p className="text-danger">{error}</p>}
          </div>
        )}
      </div>

      {/* Przycisk powrotu */}
      <div className="my-4">
        <button className="btn btn-secondary" onClick={goBack}>
          Powrót do strony głównej
        </button>
      </div>
    </div>
  );
}

export default Edit;
