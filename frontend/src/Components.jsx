import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Components() {
  const [partTypes, setPartTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Nowy stan dla wyszukiwania
  const [showForm, setShowForm] = useState(false);
  const [newPartType, setNewPartType] = useState({ name: "", max_mileage: "" });

  // Pobieranie typów części z backendu
  useEffect(() => {
    axios
      .get('${import.meta.env.VITE_API_URL}/get-part-types')
      .then((response) => {
        setPartTypes(response.data.part_types);
      })
      .catch((error) => console.error("Błąd przy pobieraniu typów części:", error));
  }, []);

  // Obsługa zmian w formularzu
  const handleChange = (e) => {
    setNewPartType({ ...newPartType, [e.target.name]: e.target.value });
  };

  // Obsługa dodawania typu części
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post('${import.meta.env.VITE_API_URL}/add-part-type', newPartType)
      .then((response) => {
        setPartTypes([...partTypes, response.data.part_type]); // Dodanie nowego typu części do listy
        setNewPartType({ name: "", max_mileage: "" }); // Wyczyszczenie formularza
        setShowForm(false); // Ukrycie formularza
      })
      .catch((error) => console.error("Błąd przy dodawaniu typu części:", error));
  };

  // Obsługa usuwania typu części
  const handleDelete = (id) => {
    axios
      .delete(`${import.meta.env.VITE_API_URL}/delete-part-type/${id}`)
      .then(() => {
        setPartTypes(partTypes.filter((part) => part.id !== id)); // Usunięcie z listy
      })
      .catch((error) => console.error("Błąd przy usuwaniu typu części:", error));
  };

  // Filtrujemy typy części na podstawie wpisanego tekstu
  const filteredPartTypes = partTypes.filter(
    (part) =>
      part.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Katalog typów części</h1>

      {/* Pole wyszukiwania */}
      <input
        type="text"
        className="form-control my-3"
        placeholder="Szukaj po nazwie typu części..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Tabela z typami części */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nazwa typu części</th>
            <th>Max Mileage (km)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredPartTypes.length > 0 ? (
            filteredPartTypes.map((part) => (
              <tr key={part.id}>
                <td>{part.name}</td>
                <td>{part.max_mileage}</td>
                <td className="text-center">
                  <div className="btn-group">
                    <Link
                      to={`/edit-part-type/${part.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Edytuj
                    </Link>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(part.id)}
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
                Brak typów części w katalogu
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Przyciski na dole strony */}
      <div className="mt-4 d-flex justify-content-between">
        <Link to="/" className="btn btn-secondary">Powrót do strony głównej</Link>
        <button className="btn btn-success" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Anuluj" : "Dodaj typ części"}
        </button>
      </div>

      {/* Formularz dodawania nowego typu części */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="mb-3">
            <label className="form-label">Nazwa typu części</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={newPartType.name}
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
              value={newPartType.max_mileage}
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
