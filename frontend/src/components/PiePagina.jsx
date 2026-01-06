import React from "react";
import "../assets/css/piepagina.css";

export default function PiePagina() {
  return (
    <footer className="pie-footer">
      <div className="pie-inner">
        <div className="pie-section pie-contact">
          <h4>📍 Sucursales</h4>
          <div className="pie-card">
            <div className="pie-line"><strong>Hc Farma Gandhi</strong></div>
            <div className="pie-line">📞 <a href="tel:+5493517517088">+54 9 3517 51-7088</a></div>
            <div className="pie-line">🗺️ <a href="https://www.google.com/maps?q=Av.+Mahatma+Gandhi+651,+X5003+Córdoba" target="_blank" rel="noreferrer">Av. Mahatma Gandhi 651, X5003 Córdoba</a></div>
          </div>
          
          <div className="pie-card">
            <div className="pie-line"><strong>Hc Farma Ruta 20</strong></div>
            <div className="pie-line">📞 <a href="tel:+543514666909">+54 9 351 466-6909</a></div>
            <div className="pie-line">🗺️ <a href="https://www.google.com/maps?q=Av.+Fuerza+Aérea+Argentina+2475,+X5010+Córdoba" target="_blank" rel="noreferrer">Av. Fuerza Aérea Argentina 2475, X5010 Córdoba</a></div>
          </div>
          
          <div className="pie-card">
            <div className="pie-line"><strong>HcFarma San Martin</strong></div>
            <div className="pie-line">📞 <a href="tel:+543518782427">+54 9 351 878-2427</a></div>
            <div className="pie-line">🗺️ <a href="https://www.google.com/maps?q=Federico+Brandsen+140,+X5000GMD+Córdoba" target="_blank" rel="noreferrer">Federico Brandsen 140, X5000GMD Córdoba</a></div>
          </div>
          
          <div className="pie-line pie-email" style={{marginTop: "8px"}}>✉️ <a href="mailto:farmaciahcfarma@gmail.com">farmaciahcfarma@gmail.com</a></div>
        </div>

        <div className="pie-section pie-hours">
          <h4>🕐 Horarios</h4>
          <div className="pie-card">
            <div className="pie-line"><strong>Hc Farma Gandhi</strong></div>
            <div className="pie-line">Lun - Sáb: 09:00 - 21:00</div>
            <div className="pie-line">Dom: 10:00 - 14:00 / 17:00 - 21:00</div>
          </div>
          
          <div className="pie-card">
            <div className="pie-line"><strong>Ruta 20 / San Martin</strong></div>
            <div className="pie-line">Lun - Sáb: 09:00 - 14:00</div>
            <div className="pie-line">16:00 - 21:30</div>
            <div className="pie-line pie-closed">Dom: Cerrado</div>
          </div>
        </div>

        <div className="pie-section pie-follow">
          <h4>📱 Seguinos</h4>
          <div className="socials">
            <a className="social" href="https://www.facebook.com/hc.farma" target="_blank" rel="noreferrer">Facebook</a>
            <a className="social" href="https://www.instagram.com/hcfarma/" target="_blank" rel="noreferrer">Instagram</a>
          </div>
          
          <h4 style={{marginTop: "16px"}}>🔗 Enlaces</h4>
          <div className="pie-links-section">
            <a href={`${import.meta.env.BASE_URL}#/horario`}>Ver horarios completos</a>
            <a href={`${import.meta.env.BASE_URL}#/productos`}>Productos</a>
          </div>
        </div>
      </div>

      <div className="pie-bottom">
        <div>© {new Date().getFullYear()} HcFarma — Todos los derechos reservados</div>
      </div>
    </footer>
  );
}
