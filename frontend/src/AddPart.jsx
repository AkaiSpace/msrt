import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddPart() {
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const [partTypes, setPartTypes] = useState([]);
  const [cars, setCars] = useState([]);
  const [newPart, setNewPart] = useState({
    part_type_id: "",
    car_id: "",
    name: "",
    mileage: "",
    notes: "",
    part_number: "",
  });

  const navigate = useNavigate();

  // Pobranie rodzajów części i samochodów
  useEffect(() => {
    axios
      .get(`${apiUrl}/get-part-types`)
      .then((response) => setPartTypes(response.data.part_types))
      .catch((error) => console.error("Błąd przy pobieraniu rodzajów części:", error));

    axios
      .get(`${apiUrl}/get-cars`)
      .then((response) => setCars(response.data.cars))
      .catch((error) => console.error("Błąd przy pobieraniu samochodów:", error));
  }, []);

  // Obsługa zmian w formularzu
  const handleChange = (e) => {
    setNewPart({ ...newPart, [e.target.name]: e.target.value });
  };

  // Obsługa wysyłania formularza
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`${apiUrl}/add-part`, newPart)
      .then(() => navigate("/")) // Przekierowanie po zapisaniu
      .catch((error) => console.error("Błąd przy dodawaniu części:", error));
  };

  return (
    <div className="container mt-4">
      <h1>Dodaj część do samochodu</h1>
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Rodzaj części</label>
          <select className="form-select" name="part_type_id" value={newPart.part_type_id} onChange={handleChange} required>
            <option value="">Wybierz rodzaj części</option>
            {partTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Samochód</label>
          <select className="form-select" name="car_id" value={newPart.car_id} onChange={handleChange} required>
            <option value="">Wybierz samochód</option>
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.chassis_number}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Nazwa części</label>
          <input type="text" className="form-control" name="name" value={newPart.name} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Numer Części</label>
          <input type="text" className="form-control" name="part_number" value={newPart.part_number.number} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Aktualny przebieg (km)</label>
          <input type="number" className="form-control" name="mileage" value={newPart.mileage} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Notatki</label>
          <textarea className="form-control" name="notes" value={newPart.notes} onChange={handleChange}></textarea>
        </div>

        <button type="submit" className="btn btn-success">Dodaj część</button>
      </form>
      <div className="mt-4">
        <button className="btn btn-secondary" onClick={() => navigate("/parts")}>
          Powrót do listy części
        </button>
      </div>
    </div>
  );
}

export default AddPart;
