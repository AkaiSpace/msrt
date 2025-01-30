import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import Edit from "./Edit";
import AddCar from "./AddCar"; // Dodajemy komponent do dodawania aut
import AddPart from "./AddPart"; // Dodajemy komponent do dodawania części
import AddPartType from "./AddPartType"; // Dodajemy komponent do dodawania typów części
import Components from "./Components"; // Dodajemy komponent do wyświetlania podzespołów
import EditPartType from "./EditPartType"; // Importujemy nowy komponent do edycji typu części
import EditCar from "./EditCar"; // Import komponentu EditCar
import Parts from "./Parts"; // Import nowej strony
import CarDetails from "./CarDetails";




function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/edit" element={<Edit />} />
        <Route path="/edit/add-car" element={<AddCar />} />
        <Route path="/add-part" element={<AddPart />} />
        <Route path="/edit/add-part-type" element={<AddPartType />} />
        <Route path="/components" element={<Components />} /> {/* Dodajemy trasę do Components */}
        <Route path="/edit-part-type/:id" element={<EditPartType />} /> {/* Dodana trasa do edytowania części */}
        <Route path="/edit-car/:carId" element={<EditCar />} />
        <Route path="/parts" element={<Parts />} /> {/* Nowa trasa */}
        <Route path="/car/:id" element={<CarDetails />} />




      </Routes>
    </div>
  );
}

export default App;
