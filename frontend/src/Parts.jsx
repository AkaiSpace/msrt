import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Parts() {
  const [parts, setParts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Nowy stan dla wyszukiwania
  const [sortOrder, setSortOrder] = useState("asc"); // Stan dla sortowania

  useEffect(() => {
    fetchParts();
  }, []);

  // Pobiera części z serwera
  const fetchParts = () => {
    axios
      .get('${import.meta.env.VITE_API_URL}/get-parts')
      .then((response) => setParts(response.data.parts))
      .catch((error) => console.error("Błąd przy pobieraniu części:", error));
  };

  // Usuwanie części po potwierdzeniu
  const handleDeletePart = (id) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę część?")) {
      axios
        .delete(`${import.meta.env.VITE_API_URL}/delete-part/${id}`)
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
      part.car_chassis_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.part_number.toLowerCase().includes(searchTerm.toLowerCase()) // Wyszukiwanie po numerze seryjnym
  );

  // Funkcja do sortowania części
  const sortParts = (column) => {
    const sortedParts = [...filteredParts].sort((a, b) => {
      if (column === "id" || column === "car_chassis_number" || column === "usage_percentage") {
        if (typeof a[column] === 'string') {
          return sortOrder === "asc"
            ? a[column].localeCompare(b[column])
            : b[column].localeCompare(a[column]);
        } else {
          return sortOrder === "asc"
            ? a[column] - b[column]
            : b[column] - a[column];
        }
      }
      return 0;
    });

    setParts(sortedParts);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc"); // Zmiana kolejności sortowania
  };

  return (
    <div className="container mt-4">
      <h1>Lista części</h1>

      {/* Pole wyszukiwania */}
      <input
        type="text"
        className="form-control my-3"
        placeholder="Szukaj po nazwie, numerze nadwozia lub numerze części..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table className="table table-striped">
        <thead>
          <tr>
            <th>
              ID{" "}
              <button onClick={() => sortParts("id")}>🔽/🔼</button> {/* Przycisk do sortowania */}
            </th>
            <th>
              Samochód{" "}
              <button onClick={() => sortParts("car_chassis_number")}>🔽/🔼</button> {/* Przycisk do sortowania */}
            </th>
            <th>Nazwa</th>
            <th>Numer Seryjny</th>
            <th>Przebieg (km)</th>
            <th>
              Procent zużycia{" "}
              <button onClick={() => sortParts("usage_percentage")}>🔽/🔼</button> {/* Przycisk do sortowania */}
            </th>
            <th>Notatki</th>
            <th>Akcje</th>
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
              <td>{part.usage_percentage !== null ? `${part.usage_percentage}%` : "-"}</td>
              <td>{part.notes}</td>
              <td>
                <Link to={`/edit-part/${part.id}`} className="btn btn-primary btn-sm me-2">
                  Edytuj
                </Link>
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

      <div className="mt-4 d-flex justify-content-between">
        <Link to="/" className="btn btn-secondary">Powrót do strony głównej</Link>
        <Link to="/add-part" className="btn btn-success">Dodaj część</Link>
      </div>
    </div>
  );
}

export default Parts;
