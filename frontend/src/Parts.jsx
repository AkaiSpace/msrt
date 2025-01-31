import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Parts() {
  const [parts, setParts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Nowy stan dla wyszukiwania

  useEffect(() => {
    fetchParts();
  }, []);

  // Pobiera części z serwera
  const fetchParts = () => {
    axios
      .get("http://localhost:5000/get-parts")
      .then((response) => setParts(response.data.parts))
      .catch((error) => console.error("Błąd przy pobieraniu części:", error));
  };

  // Usuwanie części po potwierdzeniu
  const handleDeletePart = (id) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę część?")) {
      axios
        .delete(`http://localhost:5000/delete-part/${id}`)
        .then(() => {
          alert("Część została usunięta.");
          fetchParts(); // Odświeżenie listy części po usunięciu
        })
        .catch((error) => console.error("Błąd przy usuwaniu części:", error));
    }
  };

  // Filtrujemy części na podstawie wpisanego tekstu
  const filteredParts = parts.filter(
    (part) =>
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.car_chassis_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h1>Lista części</h1>

      {/* Pole wyszukiwania */}
      <input
        type="text"
        className="form-control my-3"
        placeholder="Szukaj po nazwie lub numerze nadwozia..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Samochód</th>
            <th>Nazwa</th>
            <th>Numer Seryjny</th>
            <th>Przebieg (km)</th>
            <th>Notatki</th>
            <th>Akcje</th> {/* Nowa kolumna dla przycisków */}
          </tr>
        </thead>
        <tbody>
          {filteredParts.map((part) => (
            <tr key={part.id}>
              <td>{part.id}</td>
              <td>{part.car_chassis_number}</td>
              <td>{part.name}</td>
              <td>{part.part_number}</td>
              <td>{part.mileage}</td>
              <td>{part.notes}</td>
              <td>
                {/* Przycisk Edytuj */}
                <Link to={`/edit-part/${part.id}`} className="btn btn-primary btn-sm me-2">
                  Edytuj
                </Link>
                {/* Przycisk Usuń */}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeletePart(part.id)}
                >
                  Usuń
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Przyciski na dole strony */}
      <div className="mt-4 d-flex justify-content-between">
        <Link to="/" className="btn btn-secondary">Powrót do strony głównej</Link>
        <Link to="/add-part" className="btn btn-success">Dodaj część</Link>
      </div>
    </div>
  );
}

export default Parts;
