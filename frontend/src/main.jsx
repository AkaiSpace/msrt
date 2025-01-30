import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom"; // Tylko Router, bo Routes są w App
import App from "./App"; // Komponent główny aplikacji

import "bootstrap/dist/css/bootstrap.min.css";

// Renderowanie aplikacji z routingiem
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <App />
  </Router>
);
