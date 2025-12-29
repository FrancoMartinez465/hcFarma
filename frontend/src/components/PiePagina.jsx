import React from "react";
import "../assets/css/piepagina.css";

export default function PiePagina() {
  return (
    <footer className="pie-footer">
      <div className="pie-inner">
        <div className="pie-section pie-contact">
          <h4>Contactanos</h4>
          <div className="pie-line">📞 <a href="tel:+5493517517088">+54 9 3517 51-7088</a></div>
          <div className="pie-line">✉️ <a href="mailto:farmaciahcfarma@gmail.com">farmaciahcfarma@gmail.com</a></div>
          <div className="pie-line">📍 Av. Mahatma Gandhi 651, Córdoba</div>
        </div>

        <div className="pie-section pie-hours">
          <h4>Horarios</h4>
          <div>Lun - Vie: 09:00 - 21:00</div>
          <div>Sáb: 09:00 - 21:00</div>
          <div>Dom: 10:00 - 14:00 / 17:00 - 21:00</div>
        </div>

        <div className="pie-section pie-follow">
          <h4>Seguinos</h4>
          <div className="socials">
            <a className="social" href="https://www.facebook.com/hc.farma" target="_blank" rel="noreferrer">Facebook</a>
            <a className="social" href="https://www.instagram.com/hcfarma/" target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </div>

        <div className="pie-section pie-links">
          <h4>Enlaces</h4>
          <a href="/horario">Horarios</a>
          <a href="/resenas">Reseñas</a>
        </div>
      </div>

      <div className="pie-bottom">
        <div>© {new Date().getFullYear()} HcFarma — Todos los derechos reservados</div>
      </div>
    </footer>
  );
}
