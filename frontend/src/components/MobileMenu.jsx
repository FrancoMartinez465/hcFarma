import React from "react";
import { Link } from "react-router-dom";
import "../assets/css/encabezado.css";

export default function MobileMenu({ open, onClose }) {
  if (!open) return null;

  // Usar las mismas opciones que en ProductoList.jsx
  const secciones = [
    { value: "todas", label: "Todas las secciones" },
    { value: "dermocosmetica", label: "Dermocosmetica" },
    { value: "bijouterie", label: "Bijouterie" },
    { value: "perfumeria", label: "Perfumeria" }
  ];

  const subcategorias = [
    { value: "todas", label: "Todas" },
    { value: "femenino", label: "Mujer" },
    { value: "masculino", label: "Hombre" }
  ];

  const sucursales = [
    { value: "todas", label: "Todas las sucursales" },
    { value: "hc farma gandhi", label: "HC Farma Gandhi" },
    { value: "hc farma ruta 20", label: "HC Farma Ruta 20" },
    { value: "hc farma san martin", label: "HC Farma San Martin" }
  ];

  return (
    <div className="mobile-menu-overlay" onClick={onClose}>
      <nav
        className="mobile-menu-panel"
        onClick={(e) => e.stopPropagation()}
        aria-hidden={!open}
      >
        <div className="mobile-menu-header">
          <button className="mobile-menu-close" onClick={onClose} aria-label="Cerrar menú">×</button>
        </div>

        <div className="mobile-menu-section">
          <h4>Sucursales</h4>
          <ul>
            {sucursales.map((s) => (
              <li key={s.value}>
                <Link to={{ pathname: "/productos", search: `?branch=${encodeURIComponent(s.value)}` }} onClick={onClose}>
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mobile-menu-section">
          <h4>Secciones</h4>
          <ul>
            {secciones.map((c) => (
              <li key={c.value}>
                <div>
                  <Link to={{ pathname: "/productos", search: `?section=${encodeURIComponent(c.value)}` }} onClick={onClose}>
                    {c.label}
                  </Link>
                  {c.value === "perfumeria" && (
                    <ul className="mobile-subcategories">
                      {subcategorias.map((s) => (
                        <li key={s.value}>
                          <Link
                            to={{ pathname: "/productos", search: `?section=perfumeria&sub=${encodeURIComponent(s.value)}` }}
                            onClick={onClose}
                          >
                            {s.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

      </nav>
    </div>
  );
}
