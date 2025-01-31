import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditPart() {
  const { partId } = useParams(); // Pobranie ID części z URL
  const navigate = useNavigate();

  const [part, setPart] = useState({
    name: "",
    part_number: "",
    mileage: 0,
    notes: "",
    car_id: "",
    part_type_id: "",
  });
  const [cars, setCars] = useState([]); // Lista dostępnych samochodów
  const [partTypes, setPartTypes] = useState([]); // Lista dostępnych typów części
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/get-part/${partId}`)
      .then((response) => {
        const partData = response.data.part;
        setPart({
          name: partData.name || "",
          part_number: partData.part_number || "",
          mileage: partData.mileage || 0,
          notes: partData.notes || "",
          car_id: partData.car_id || "",
          part_type_id: partData.part_type_id || "",
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Błąd przy pobieraniu części", error);
        setError("Nie udało się załadować danych części.");
        setLoading(false);
      });

    // Pobranie listy samochodów do wyboru
    axios.get("http://localhost:5000/get-cars")
      .then((response) => setCars(response.data.cars))
      .catch((error) => console.error("Błąd przy pobieraniu samochodów:", error));

    // Pobranie listy typów części do wyboru
    axios.get("http://localhost:5000/get-part-types")
      .then((response) => setPartTypes(response.data.part_types))
      .catch((error) => console.error("Błąd przy pobieraniu typów części:", error));
  }, [partId]);

  const handleChange = (e) => {
    setPart({ ...part, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .put(`http://localhost:5000/update-part/${partId}`, part)
      .then(() => {
        navigate("/edit"); // Powrót do listy części po edycji
      })
      .catch((error) => {
        console.error("Błąd przy edycji części", error);
        setError("Nie udało się zaktualizować części.");
      });
  };

  return (
    <div className="container mt-4">
      <h1>Edytuj część</h1>

      {loading ? (
        <p>Ładowanie danych części...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nazwa części</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={part.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Numer części</label>
            <input
              type="text"
              className="form-control"
              name="part_number"
              value={part.part_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Przebieg (km)</label>
            <input
              type="number"
              className="form-control"
              name="mileage"
              value={part.mileage}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Notatki</label>
            <textarea
              className="form-control"
              name="notes"
              value={part.notes}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Samochód</label>
            <select
              className="form-select"
              name="car_id"
              value={part.car_id}
              onChange={handleChange}
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

          <div className="mb-3">
            <label className="form-label">Typ części</label>
            <select
              className="form-select"
              name="part_type_id"
              value={part.part_type_id}
              onChange={handleChange}
              required
            >
              <option value="">Wybierz typ części</option>
              {partTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-success">
            Zapisz zmiany
          </button>
        </form>
      )}

      <div className="mt-4">
        <button className="btn btn-secondary" onClick={() => navigate("/edit")}>
          Powrót do listy części
        </button>
      </div>
    </div>
  );
}

export default EditPart;
