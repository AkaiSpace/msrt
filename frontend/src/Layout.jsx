import React from "react";
import { Link, Outlet } from "react-router-dom";
import './Layout.css';  // Dodaj zaimportowanie pliku CSS

function Layout() {
    
  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      {/* Główny kontener z bocznym menu i zawartością */}
      <div className="d-flex" style={{ flex: 1 }}>
        {/* Boczne menu */}
        <div className="bg-dark border-right" style={{ width: "250px", flexShrink: 0 }}>
          {/* Logo */}
          <div className="text-center my-3">
            <img 
              src="/logo.png"
              alt="Logo"
              style={{ maxWidth: "80%", height: "auto" }} 
            />
          </div>
          <div className="list-group bg-dark text-white">
            <Link to="/" className="list-group-item list-group-item-action bg-secondary text-white">
              Strona Główna
            </Link>
            <Link to="/parts" className="list-group-item list-group-item-action bg-secondary text-white">
              Lista Części
            </Link>
            <Link to="/components" className="list-group-item list-group-item-action bg-secondary text-white">
              Definicje Części
            </Link>
            <Link to="/events" className="list-group-item list-group-item-action bg-secondary text-white">
              Eventy
            </Link>
            <Link to="/edit" className="list-group-item list-group-item-action bg-secondary text-white">
              Edycja Samochodów
            </Link>
            <Link to="/update-mileage" className="list-group-item list-group-item-action bg-secondary text-white">
              Dodaj Przebieg
            </Link>
          </div>
        </div>

        {/* Główna zawartość */}
        <div className="container-fluid p-4" style={{ flex: 1 }}>
          <Outlet /> {/* Miejsce na dynamiczną treść strony */}
        </div>
      </div>

      {/* Stopka */}
      <footer className="bg-dark text-white text-center py-1">
        <p className="mb-0">&copy; 2025 Krzysztof Papaj - ChrisP Software Development - Wszystkie prawa zastrzeżone.</p>
      </footer>
    </div>
  );
}

export default Layout;