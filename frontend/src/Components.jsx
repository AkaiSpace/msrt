import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Components() {
  const [partTypes, setPartTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newPart, setNewPart] = useState({ name: "", max_mileage: "" });

  // Pobieranie części z backendu
  useEffect(() => {
    axios
      .get("http://localhost:5000/get-part-types")
      .then((response) => {
        setPartTypes(response.data.part_types);
      })
      .catch((error) => console.error("Błąd przy pobieraniu części:", error));
  }, []);

  // Obsługa zmian w formularzu
  const handleChange = (e) => {
    setNewPart({ ...newPart, [e.target.name]: e.target.value });
  };

  // Obsługa dodawania części
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/add-part-type", newPart)
      .then((response) => {
        setPartTypes([...partTypes, response.data]); // Dodanie nowej części do listy
        setNewPart({ name: "", max_mileage: "" }); // Wyczyszczenie formularza
        setShowForm(false); // Ukrycie formularza
      })
      .catch((error) => console.error("Błąd przy dodawaniu części:", error));
  };

  // Obsługa usuwania części
  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:5000/delete-part-type/${id}`)
      .then(() => {
        setPartTypes(partTypes.filter((part) => part.id !== id)); // Usunięcie z listy
      })
      .catch((error) => console.error("Błąd przy usuwaniu części:", error));
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Components Catalog</h1>

      {/* Przycisk powrotu do Home */}
      <Link to="/" className="btn btn-secondary mb-3">Powrót do Home</Link>

      {/* Tabela z częściami */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nazwa części</th>
            <th>Max Mileage (km)</th>
            <th>Akcja</th>
          </tr>
        </thead>
        <tbody>
          {partTypes.length > 0 ? (
            partTypes.map((part) => (
              <tr key={part.id}>
                <td>{part.name}</td>
                <td>{part.max_mileage}</td>
                <td>
                  <Link to={`/edit-part-type/${part.id}`} className="btn btn-warning btn-sm mr-2">
                    Edytuj
                  </Link>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(part.id)}
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                Brak części w katalogu
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Przycisk dodawania nowej części */}
      <button className="btn btn-primary mt-3" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Anuluj" : "Dodaj element"}
      </button>

      {/* Formularz dodawania nowej części */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="mb-3">
            <label className="form-label">Nazwa części</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={newPart.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Max Mileage (km)</label>
            <input
              type="number"
              className="form-control"
              name="max_mileage"
              value={newPart.max_mileage}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-success">
            Dodaj
          </button>
        </form>
      )}
    </div>
  );
}

export default Components;
