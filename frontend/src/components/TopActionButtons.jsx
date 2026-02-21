import React from "react";
import { Link } from "react-router-dom";
import "../assets/css/top-action-buttons.css";

export default function TopActionButtons({ hide = false }) {
  if (hide) return null;

  return (
    <div className="top-action-buttons-fixed-wrapper">
      <div className="top-action-buttons">
        <Link to="/" className="tab-btn">Productos</Link>
        <Link to="/horario" className="tab-btn tab-btn--outline">Ver horarios</Link>
      </div>
      {/* Spacer keeps page content from being covered by the fixed buttons */}
      <div className="top-action-buttons-spacer" aria-hidden="true" />
    </div>
  );
}
