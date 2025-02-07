import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function PartHistory() {
  const { partId } = useParams();
  const [history, setHistory] = useState([]);
  const [carsData, setCarsData] = useState([]);
  const [partTypesData, setPartTypesData] = useState([]); // Stan dla typów części
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    // Pobranie historii części
    axios
      .get(`${apiUrl}/part-history/${partId}`)
      .then((response) => {
        setHistory(response.data.history);
      })
      .catch((error) => console.error("Błąd przy pobieraniu historii:", error));

    // Pobranie listy samochodów
    axios
      .get(`${apiUrl}/get-cars`)
      .then((response) => {
        setCarsData(response.data.cars);
      })
      .catch((error) => console.error("Błąd przy pobieraniu samochodów:", error));

    // Pobranie listy typów części
    axios
      .get(`${apiUrl}/get-part-types`)
      .then((response) => {
        setPartTypesData(response.data.part_types);
      })
      .catch((error) => console.error("Błąd przy pobieraniu typów części:", error))
      .finally(() => setLoading(false));
  }, [partId, apiUrl]);

  // Funkcja do zamiany ID na chassis_number
  const getChassisNumber = (carId) => {
    const car = carsData.find((car) => car.id === Number(carId));
    return car ? car.chassis_number : "-";
  };

  // Funkcja do zamiany part_type_id na nazwę typu części
  const getPartTypeName = (partTypeId) => {
    const partType = partTypesData.find((type) => type.id === Number(partTypeId));
    return partType ? partType.name : "-";
  };

  // Funkcja do usunięcia historii części
  const deleteHistory = async () => {
    const confirmDelete = window.confirm("Czy na pewno chcesz usunąć historię tej części?");
    if (confirmDelete) {
      try {
        const response = await axios.delete(`${apiUrl}/delete-part-history/${partId}`);
        console.log(response.data.message);
        setHistory([]); // Czyścimy historię po udanym usunięciu
      } catch (error) {
        console.error("Błąd przy kasowaniu historii:", error.response?.data?.error || error.message);
      }
    } else {
      console.log("Usuwanie historii zostało anulowane.");
    }
  };

  if (loading) {
    return <div>Ładowanie historii...</div>;
  }

  return (
    <div className="container mt-4">
      <h1>Historia edycji części</h1>

      {history.length === 0 ? (
        <p>Brak historii dla tej części.</p>
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
                  {record.changed_field === "car_id"
                    ? getChassisNumber(record.old_value)
                    : record.changed_field === "part_type_id"
                    ? getPartTypeName(record.old_value)
                    : record.old_value}
                </td>
                <td>
                  {record.changed_field === "car_id"
                    ? getChassisNumber(record.new_value)
                    : record.changed_field === "part_type_id"
                    ? getPartTypeName(record.new_value)
                    : record.new_value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Przycisk do kasowania historii */}
      <button onClick={deleteHistory} className="btn btn-danger mt-3">
        Usuń historię
      </button>
    </div>
  );
}

export default PartHistory;