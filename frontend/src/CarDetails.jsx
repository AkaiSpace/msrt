import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [parts, setParts] = useState([]);
  const [error, setError] = useState("");

  const apiUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    axios
      .get(`${apiUrl}/get-car/${id}`)
      .then((response) => setCar(response.data))
      .catch(() => setError("Błąd przy pobieraniu danych samochodu."));

    axios
      .get(`${apiUrl}/get-parts-for-car/${id}`)
      .then((response) => setParts(response.data.parts))
      .catch(() => setError("Błąd przy pobieraniu części."));
  }, [id, apiUrl]);

  const getUsageColor = (usage) => {
    if (usage === null) return "bg-secondary";
    if (usage <= 50) return "bg-success";
    if (usage <= 75) return "bg-warning";
    return "bg-danger";
  };

  const deletePart = async (partId) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę część?")) {
      try {
        await axios.delete(`${apiUrl}/delete-part/${partId}`);
        setParts(parts.filter((part) => part.id !== partId));
      } catch {
        alert("Wystąpił błąd przy usuwaniu części.");
      }
    }
  };

  return (
    <div className="container mt-4">
      <h1>
        Szczegóły samochodu {car?.chassis_number ? `(${car.chassis_number})` : ""}
      </h1>
      {error && <p className="text-danger">{error}</p>}

      {car ? (
        <div>
          {/* Dodany przycisk "Dodaj część" */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Lista części:</h3>
            <Link to={`/car-history/${id}`} className="btn btn-info">
              Historia
            </Link>
            <Link to={`/add-part/${id}`} className="btn btn-success">
              Dodaj część
            </Link>
          </div>

          

          <ul className="list-group">
            {parts.length > 0 ? (
              parts.map((part) => (
                <li key={part.id} className="list-group-item">
                  <h5>
                    <Link to={`/part-history/${part.id}`} className="text-primary text-decoration-none">
                      {part.name}
                    </Link>
                  </h5>
                  <p>Numer części: {part.part_number}</p>
                  <p>Przebieg: {part.mileage} km</p>
                  <p>Zużycie: {part.usage_percentage !== null ? `${part.usage_percentage}%` : "Brak danych"}</p>

                  <div className="progress" style={{ height: "20px" }}>
                    <div
                      className={`progress-bar ${getUsageColor(part.usage_percentage)}`}
                      role="progressbar"
                      style={{ width: `${part.usage_percentage || 0}%` }}
                      aria-valuenow={part.usage_percentage || 0}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {part.usage_percentage !== null ? `${part.usage_percentage}%` : "?"}
                    </div>
                  </div>

                  <p>Notatki: {part.notes}</p>

                  <div className="mt-2">
                    <Link to={`/edit-part/${part.id}`} className="btn btn-primary me-2">
                      Edytuj
                    </Link>
                    <button onClick={() => deletePart(part.id)} className="btn btn-danger">
                      Usuń
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <p>Brak części przypisanych do tego samochodu.</p>
            )}
          </ul>
        </div>
      ) : (
        <p>Ładowanie szczegółów samochodu...</p>
      )}
    </div>
  );
}

export default CarDetails;
