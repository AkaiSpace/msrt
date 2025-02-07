import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Parts() {
  const [parts, setParts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Nowy stan dla wyszukiwania
  const [sortOrder, setSortOrder] = useState("asc"); // Stan dla sortowania

  // Pobieranie zmiennej API URL z pliku .env
  const apiUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchParts();
  }, []);

  // Pobiera części z serwera
  const fetchParts = () => {
    axios
      .get(`${apiUrl}/get-parts`)  // Korzystamy ze zmiennej środowiskowej
      .then((response) => setParts(response.data.parts))
      .catch((error) => console.error("Błąd przy pobieraniu części:", error));
  };

  // Usuwanie części po potwierdzeniu
  const handleDeletePart = (id) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę część?")) {
      axios
        .delete(`${apiUrl}/delete-part/${id}`)  // Korzystamy ze zmiennej środowiskowej
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

      {/* Przycisk "Dodaj część" na górze */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          className="form-control w-75"
          placeholder="Szukaj po nazwie, numerze nadwozia lub numerze części..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Link to="/add-part" className="btn btn-success">
          Dodaj część
        </Link>
      </div>

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
              <td><Link to={`/part-history/${part.id}`}>{part.part_number}</Link></td>
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
      </div>
    </div>
  );
}

export default Parts;