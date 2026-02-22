import React, { useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../assets/css/top-action-buttons.css";

export default function TopActionButtons({ hide = false }) {
  const containerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const indicator = container.querySelector(".tab-indicator");
    const update = () => {
      const active = container.querySelector(".tab-btn--active");
      if (active && indicator) {
        const aRect = active.getBoundingClientRect();
        const cRect = container.getBoundingClientRect();
        const maxWidth = Math.max(active.offsetWidth * 0.8, 36);
        // centrar el indicador bajo el botón activo
        const left = aRect.left - cRect.left + (active.offsetWidth - maxWidth) / 2;
        const width = maxWidth;
        indicator.style.setProperty("--left", `${left}px`);
        indicator.style.setProperty("--width", `${width}px`);
        indicator.style.opacity = "1";
      } else if (indicator) {
        indicator.style.opacity = "0";
      }
    };

    update();
    window.addEventListener("resize", update);
    // update on route change (location) as effect dependency already does that

    return () => window.removeEventListener("resize", update);
  }, [location]);

  if (hide) return null;

  return (
    <div className="top-action-buttons-fixed-wrapper">
      <div className="top-action-buttons" ref={containerRef}>

        <NavLink
          to="/productos"
          end
          className={({ isActive }) =>
            `tab-btn ${isActive ? "tab-btn--active" : ""}`
          }
        >
          Productos
        </NavLink>

        <NavLink
          to="/horario"
          className={({ isActive }) =>
            `tab-btn ${isActive ? "tab-btn--active" : ""}`
          }
        >
          Ver horarios
        </NavLink>

        <span className="tab-indicator" aria-hidden="true" />
      </div>

      <div className="top-action-buttons-spacer" aria-hidden="true" />
    </div>
  );
}