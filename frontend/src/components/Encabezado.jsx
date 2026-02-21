import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/image.png";
import "../assets/css/encabezado.css";

export default function Encabezado() {
  return (
    <header className="encabezado">
      <div className="encabezado-inner">
        <div className="encabezado-right">
          <img src={logo} alt="HcFarma" className="encabezado-logo" />
          <div className="encabezado-info">
            <div className="encabezado-name">HcFarma</div>
            <div className="encabezado-msg">Cuidamos tu salud</div>
          </div>

          <div className="encabezado-actions">
            {/* botones movidos a TopActionButtons para control de posición */}
          </div>
        </div>
      </div>
    </header>
  );
}
