import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function CarHistory() {
  const { carId } = useParams();
  const [history, setHistory] = useState([]);
  const [carsData, setCarsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    console.log("Pobieranie historii dla samochodu ID:", carId);

    // Pobranie historii zmian samochodu
    axios
      .get(`${apiUrl}/car-history/${carId}`)
      .then((response) => {
        console.log("Historia samochodu:", response.data.history);
        setHistory(response.data.history);
      })
      .catch((error) =>
        console.error("Błąd przy pobieraniu historii samochodu:", error)
      )
      .finally(() => setLoading(false));

    // Pobranie listy wszystkich samochodów
    axios
      .get(`${apiUrl}/get-cars`)
      .then((response) => {
        console.log("Lista samochodów:", response.data.cars);
        setCarsData(response.data.cars);
      })
      .catch((error) =>
        console.error("Błąd przy pobieraniu danych samochodów:", error)
      );
  }, [carId, apiUrl]);

  // Zamiana ID na chassis_number
  const getChassisNumber = (carId) => {
    if (!carsData.length) return "Ładowanie...";
    const car = carsData.find((car) => String(car.id) === String(carId));
    return car ? car.chassis_number : `${carId}`;
  };

  // Sprawdzenie, czy `changed_field` odnosi się do zmiany ID samochodu
  const isCarIdChange = (field) => {
    return field.startsWith("part_moved") || field === "part_assigned";
  };

  if (loading) {
    return <div>Ładowanie historii...</div>;
  }

  return (
    <div className="container mt-4">
      <h1>Historia zmian dla samochodu {getChassisNumber(carId)}</h1>
      {history.length === 0 ? (
        <p>Brak historii zmian dla tego samochodu.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Data</th>
              <th>Pole</th>
              <th>Stara wartość</th>
              <th>Nowa wartość</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record) => (
              <tr key={record.id}>
                <td>{new Date(record.timestamp).toLocaleString()}</td>
                <td>{record.changed_field}</td>
                <td>
                  {isCarIdChange(record.changed_field)
                    ? getChassisNumber(record.old_value)
                    : record.old_value || "-"}
                </td>
                <td>
                  {isCarIdChange(record.changed_field)
                    ? getChassisNumber(record.new_value)
                    : record.new_value || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CarHistory;
