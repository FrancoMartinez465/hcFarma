import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/images/image.png";
import "../assets/css/encabezado.css";
import MobileMenu from "./MobileMenu";

export default function Encabezado() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const showMobileMenuControl = location.pathname && location.pathname.startsWith("/productos");
  return (
    <header className="encabezado">
      <div className="encabezado-inner">
        <div className="encabezado-right">
          {/* Mostrar control sólo en la página de productos */}
          {showMobileMenuControl && (
            <button
              className={`mobile-hamburger bubble hamburger-btn${menuOpen ? " open" : ""}`}
              aria-label="Alternar menú"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg
                viewBox="0 0 24 24"
                width="26"
                height="26"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}

          <img src={logo} alt="HcFarma" className="encabezado-logo" />
          <div className="encabezado-info">
            <div className="encabezado-name">HcFarma</div>
            <div className="encabezado-msg">Cuidamos tu salud</div>
          </div>

          <div className="encabezado-actions">
            {/* botones movidos a TopActionButtons para control de posición */}
          </div>
        </div>
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </header>
  );
}
