import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddMileage() {
  const [cars, setCars] = useState([]); // Lista samochodów
  const [selectedCarId, setSelectedCarId] = useState(""); // ID wybranego samochodu
  const [mileageToAdd, setMileageToAdd] = useState(""); // Przebieg do dodania (pusty domyślnie)
  const [error, setError] = useState(""); // Błąd
  const [loading, setLoading] = useState(true); // Stan ładowania
  const [carParts, setCarParts] = useState([]); // Części samochodu
  const [selectedParts, setSelectedParts] = useState({}); // Zaznaczone części (domyślnie wszystkie)
  const [customMileage, setCustomMileage] = useState({}); // Indywidualne przebiegi dla części
  const navigate = useNavigate();

  // Pobierz listę samochodów z backendu
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/get-cars`)
      .then((response) => {
        setCars(response.data.cars);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Błąd przy pobieraniu samochodów:", error);
        setError("Nie udało się załadować listy samochodów.");
        setLoading(false);
      });
  }, []);

  // Pobierz części dla wybranego samochodu
  useEffect(() => {
    if (selectedCarId) {
      axios
        .get(`${import.meta.env.VITE_BACKEND_URL}/get-parts-for-car/${selectedCarId}`)
        .then((response) => {
          setCarParts(response.data.parts);
          // Domyślnie zaznacz wszystkie części
          const defaultSelected = response.data.parts.reduce((acc, part) => {
            acc[part.id] = true; // Zaznacz wszystkie części
            return acc;
          }, {});
          setSelectedParts(defaultSelected);
        })
        .catch((error) => {
          console.error("Błąd przy pobieraniu części samochodu:", error);
          setError("Nie udało się załadować części samochodu.");
        });
    }
  }, [selectedCarId]);

  // Obsługa zaznaczania/odznaczania części
  const handlePartSelection = (partId, isChecked) => {
    setSelectedParts((prev) => ({
      ...prev,
      [partId]: isChecked,
    }));
  };

  // Obsługa zmiany indywidualnego przebiegu dla części
  const handleCustomMileageChange = (partId, value) => {
    const mileageNumber = Number(value);
    if (!isNaN(mileageNumber)) {
      setCustomMileage((prev) => ({
        ...prev,
        [partId]: mileageNumber,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Walidacja danych
    if (!selectedCarId || mileageToAdd === "") {
      setError("Wybierz samochód i wprowadź przebieg.");
      return;
    }
  
    // Sprawdź, czy mileage jest liczbą
    const mileageNumber = Number(mileageToAdd);
    if (isNaN(mileageNumber)) {
      setError("Przebieg musi być liczbą.");
      return;
    }
  
    // Przygotuj dane do wysyłki
    const partsData = carParts.map((part) => {
      const isSelected = selectedParts[part.id];
      const customMileageValue = customMileage[part.id] || 0;
  
      return {
        part_id: part.id, // Upewnij się, że backend oczekuje `part_id`
        mileage: isSelected ? mileageNumber : customMileageValue, // Upewnij się, że backend oczekuje `mileage`
      };
    });
  
    console.log("Wysyłane dane:", { parts: partsData }); // Dodaj ten log
  
    // Wyślij żądanie do backendu
    axios
      .put(`${import.meta.env.VITE_BACKEND_URL}/add-mileage/${selectedCarId}`, {
        parts: partsData, // Upewnij się, że backend oczekuje klucza `parts`
      })
      .then(() => {
        alert("Przebiegi części zaktualizowane pomyślnie!");
        navigate("/"); // Przekierowanie na stronę główną
      })
      .catch((error) => {
        console.error("Błąd przy aktualizacji przebiegów:", error);
        setError("Nie udało się zaktualizować przebiegów.");
      });
  };

  // Wyświetlanie stanu ładowania
  if (loading) {
    return <p>Ładowanie listy samochodów...</p>;
  }

  // Wyświetlanie błędów
  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <div className="container mt-4">
      <h1>Dodaj przebieg do części</h1>

      <form onSubmit={handleSubmit}>
        {/* Pole wyboru samochodu */}
        <div className="mb-3">
          <label className="form-label">Wybierz samochód</label>
          <select
            className="form-select"
            value={selectedCarId}
            onChange={(e) => setSelectedCarId(e.target.value)}
            required
          >
            <option value="">Wybierz samochód</option>
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.chassis_number}
              </option>
            ))}
          </select>
        </div>

        {/* Pole do wprowadzenia wspólnego przebiegu */}
        <div className="mb-3">
          <label className="form-label">Przebieg do dodania (km)</label>
          <input
            type="number"
            className="form-control"
            value={mileageToAdd}
            onChange={(e) => setMileageToAdd(e.target.value)}
            required
          />
        </div>

        {/* Lista części z checkboxami i indywidualnymi przebiegami */}
        <div className="mb-3">
          <label className="form-label">Wybierz części</label>
          {carParts.map((part) => (
            <div key={part.id} className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id={`part-${part.id}`}
                checked={selectedParts[part.id] || false}
                onChange={(e) => handlePartSelection(part.id, e.target.checked)}
              />
              <label className="form-check-label" htmlFor={`part-${part.id}`}>
                {part.name}
              </label>
              {!selectedParts[part.id] && (
                <input
                  type="number"
                  className="form-control mt-2"
                  value={customMileage[part.id] || ""}
                  onChange={(e) =>
                    handleCustomMileageChange(part.id, e.target.value)
                  }
                  placeholder="Wpisz indywidualny przebieg"
                />
              )}
            </div>
          ))}
        </div>

        {/* Przycisk do wysłania formularza */}
        <button type="submit" className="btn btn-success">
          Zaktualizuj przebiegi
        </button>
      </form>

      {/* Przycisk powrotu do strony głównej */}
      <div className="mt-4">
        <button className="btn btn-secondary" onClick={() => navigate("/")}>
          Powrót do strony głównej
        </button>
      </div>
    </div>
  );
}

export default AddMileage;