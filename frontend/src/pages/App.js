import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Items from "./Items";
import ItemDetail from "./ItemDetail";
import { DataProvider } from "../state/DataContext";
import ErrorBoundary from "../components/errorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <DataProvider>
        <div style={{ minHeight: "100vh", backgroundColor: "#fafafa" }}>
          <nav
            style={{
              padding: "16px",
              borderBottom: "1px solid #ddd",
              backgroundColor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: "#007bff",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              📦 Items Store
            </Link>
          </nav>

          <main>
            <Routes>
              <Route path="/" element={<Items />} />
              <Route path="/items/:id" element={<ItemDetail />} />
            </Routes>
          </main>
        </div>
      </DataProvider>
    </ErrorBoundary>
  );
}

export default App;
