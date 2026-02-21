import React, { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import ProductoList from "./pages/ProductoList";
import Horario from "./pages/Horario";
import ProductoDetalle from "./pages/ProductoDetalle";
import Carrito from "./pages/Carrito";
import CartIcon from "./components/CartIcon";
import TopActionButtons from "./components/TopActionButtons";

export default function App() {
  // Normaliza la URL cuando alguien llega con /inicio u otra ruta previa al hash
  useEffect(() => {
    if (window?.location?.pathname && window.location.pathname !== "/") {
      const hash = window.location.hash || "#/productos";
      window.history.replaceState(null, "", `/${hash}`);
    }
  }, []);

  return (
    <div className="app-with-header">
      <HashRouter>
        <CartIcon />
        <TopActionButtons />
        <Routes>
          <Route path="/" element={<Navigate to="/productos" replace />} />
          <Route path="/productos" element={<ProductoList />} />
          <Route path="/horario" element={<Horario />} />
          <Route path="/medicamentos" element={<Navigate to="/productos" replace />} />
          <Route path="/localizarnos" element={<Horario />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="*" element={<Navigate to="/productos" replace />} />
        </Routes>
      </HashRouter>
    </div>
  );
}
