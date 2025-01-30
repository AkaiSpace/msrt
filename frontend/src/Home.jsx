import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Home() {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/get-cars")
      .then((response) => {
        setCars(response.data.cars);
      })
      .catch((error) => console.error("Błąd przy pobieraniu samochodów", error));
  }, []);

  return (
    <div>
      {/* Pasek nawigacyjny */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 w-100 d-flex justify-content-between">
            <li className="nav-item">
              <Link className="nav-link active" to="/">
                Lista Samochodów
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/parts">
                Lista Części
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/components">
                Podzespoły
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Wyśrodkowana zawartość */}
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="w-100">
          <h1 className="my-4 text-center">Lista samochodów</h1>
          <ul className="list-group">
            {cars.map((car) => (
              <li key={car.id} className="list-group-item">
                <Link to={`/car/${car.id}`}>{car.chassis_number}</Link>
              </li>
            ))}
          </ul>

          {/* Dodajemy przycisk do przejścia do strony edycji */}
          <div className="my-4 text-center">
            <Link to="/edit" className="btn btn-primary">
              Przejdź do edycji
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
