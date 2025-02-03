import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./Layout"; // Zaimportuj komponent Layout
import Home from "./Home";
import Edit from "./Edit";
import AddCar from "./AddCar";
import AddPart from "./AddPart";
import AddPartType from "./AddPartType";
import Components from "./Components";
import EditPartType from "./EditPartType";
import EditCar from "./EditCar";
import Parts from "./Parts";
import CarDetails from "./CarDetails";
import EditPart from "./EditPart";
import Events from "./Events";
import EditEvent from "./EditEvent";
import AddEvent from "./AddEvent";
import AddCarToEvent from "./AddCarToEvent";
import UpdateMileage from "./UpdateMileage";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Zagnieżdżona trasa z Layout */}
        <Route path="/" element={<Layout />}>
          {/* Wszystkie strony będą renderowane w <Layout /> za pomocą <Outlet /> */}
          <Route index element={<Home />} /> {/* Strona główna */}
          <Route path="/edit" element={<Edit />} />
          <Route path="/edit/add-car" element={<AddCar />} />
          <Route path="/add-part" element={<AddPart />} />
          <Route path="/edit/add-part-type" element={<AddPartType />} />
          <Route path="/components" element={<Components />} />
          <Route path="/edit-part-type/:id" element={<EditPartType />} />
          <Route path="/edit-car/:carId" element={<EditCar />} />
          <Route path="/parts" element={<Parts />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="/edit-part/:partId" element={<EditPart />} />
          <Route path="/events" element={<Events />} />
          <Route path="/add-event" element={<AddEvent />} />
          <Route path="/add-car-to-event/:eventId" element={<AddCarToEvent />} />
          <Route path="/update-mileage" element={<UpdateMileage />} />
          <Route path="/edit-event/:id" element={<EditEvent />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
