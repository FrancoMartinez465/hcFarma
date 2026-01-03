import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import ProductoList from "./pages/ProductoList";
import Horario from "./pages/Horario";
import ProductoDetalle from "./pages/ProductoDetalle";

export default function App() {
  return (
    <div className="app-with-header">
      <HashRouter>
        <Routes>
          <Route path="/" element={<ProductoList />} />
          <Route path="/inicio" element={<ProductoList />} />
          <Route path="/horario" element={<Horario />} />
          <Route path="/medicamentos" element={<ProductoList />} />
          <Route path="/localizarnos" element={<Horario />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </div>
  );
}
