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
            <Link to="/" className="btn btn-ghost">Productos</Link>
            <Link to="/horario" className="btn btn-ghost">Ver horarios</Link>
            <Link to="/resenas" className="btn btn-review">Dejar reseña</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
