import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProductoList from "./pages/ProductoList";
import Horario from "./pages/Horario";
import Resenas from "./pages/Resenas";

export default function App() {
  return (
    <div className="app-with-header">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProductoList />} />
          <Route path="/inicio" element={<ProductoList />} />
          <Route path="/horario" element={<Horario />} />
          <Route path="/medicamentos" element={<ProductoList />} />
          <Route path="/localizarnos" element={<Horario />} />
          <Route path="/resenas" element={<Resenas />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
