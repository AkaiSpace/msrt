import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Parts() {
  const [parts, setParts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Nowy stan dla wyszukiwania

  useEffect(() => {
    axios
      .get("http://localhost:5000/get-parts")
      .then((response) => setParts(response.data.parts))
      .catch((error) => console.error("Błąd przy pobieraniu części:", error));
  }, []);

  // Filtrujemy części na podstawie wpisanego tekstu
  const filteredParts = parts.filter((part) =>
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
