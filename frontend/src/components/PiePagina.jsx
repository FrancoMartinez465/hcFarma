import React, { useState } from "react";
import "../assets/css/piepagina.css";

const BRANCHES = [
  {
    id: "gandhi",
    name: "Hc Farma Gandhi",
    phoneHref: "tel:+5493517517088",
    phoneLabel: "+54 9 3517 51-7088",
    mapUrl: "https://www.google.com/maps?q=Av.+Mahatma+Gandhi+651,+X5003+Córdoba",
    address: "Av. Mahatma Gandhi 651, X5003 Córdoba",
    hours: [
      "Lun - Sáb: 09:00 - 21:00",
      "Dom: 10:00 - 14:00 / 17:00 - 21:00",
    ],
  },
  {
    id: "ruta20",
    name: "Hc Farma Ruta 20",
    phoneHref: "tel:+543514666909",
    phoneLabel: "+54 9 351 466-6909",
    mapUrl: "https://www.google.com/maps?q=Av.+Fuerza+Aérea+Argentina+2475,+X5010+Córdoba",
    address: "Av. Fuerza Aérea Argentina 2475, X5010 Córdoba",
    hours: [
      "Lun - Sáb: 09:00 - 14:00",
      "16:00 - 21:30",
      "Dom: Cerrado",
    ],
  },
  {
    id: "sanmartin",
    name: "HcFarma San Martin",
    phoneHref: "tel:+543518782427",
    phoneLabel: "+54 9 351 878-2427",
    mapUrl: "https://www.google.com/maps?q=Federico+Brandsen+140,+X5000GMD+Córdoba",
    address: "Federico Brandsen 140, X5000GMD Córdoba",
    hours: [
      "Lun - Sáb: 09:00 - 14:00",
      "16:00 - 21:30",
      "Dom: Cerrado",
    ],
  },
];

export default function PiePagina() {
  const [openId, setOpenId] = useState(null);
  const [openHoursId, setOpenHoursId] = useState(null);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <footer className="pie-footer">
      <div className="pie-inner">
        <div className="pie-section pie-contact">
          <h4>📍 Sucursales</h4>

          {BRANCHES.map((b) => {
            const isOpen = openId === b.id;
            return (
              <div className="branch" key={b.id}>
                <button
                  className="branch-header"
                  onClick={() => toggle(b.id)}
                  aria-expanded={isOpen}
                >
                  <span>{b.name}</span>
                  <span className="chev" aria-hidden>▸</span>
                </button>

                <div className={`branch-content ${isOpen ? "expanded" : ""}`}>
                  <div className="pie-card">
                    <div className="pie-line"><strong>{b.name}</strong></div>
                    <div className="pie-line">📞 <a href={b.phoneHref}>{b.phoneLabel}</a></div>
                    <div className="pie-line">🗺️ <a href={b.mapUrl} target="_blank" rel="noreferrer">{b.address}</a></div>
                  </div>
                </div>
              </div>
            );
          })}
          {/* correo suelto eliminado por solicitud del usuario */}
        </div>

        <div className="pie-section pie-hours">
          <h4>🕐 Horarios</h4>
          {BRANCHES.map((b) => {
            const open = openHoursId === b.id;
            return (
              <div className="branch" key={`hours-${b.id}`}>
                <button
                  className="branch-header"
                  onClick={() => setOpenHoursId((prev) => (prev === b.id ? null : b.id))}
                  aria-expanded={open}
                >
                  <span>{b.name}</span>
                  <span className="chev" aria-hidden>▸</span>
                </button>

                <div className={`branch-content ${open ? "expanded" : ""}`}>
                  <div className="pie-card">
                    <div className="pie-line"><strong>{b.name}</strong></div>
                    {b.hours && b.hours.map((h, i) => (
                      <div className={`pie-line ${h.toLowerCase().includes('cerrado') ? 'pie-closed' : ''}`} key={i}>{h}</div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pie-section pie-follow">
          <h4>📱 Seguinos</h4>
          <div className="socials">
            <a className="social" href="https://www.facebook.com/hc.farma" target="_blank" rel="noreferrer">Facebook</a>
            <a className="social" href="https://www.instagram.com/hcfarma/" target="_blank" rel="noreferrer">Instagram</a>
          </div>

          {/* Mejor diseño del correo: tarjeta con CTA */}
          <div style={{ marginTop: "16px" }}>
            <div className="pie-card pie-email-card">
              <div className="pie-line"><strong>Contacto por correo</strong></div>
              <div className="pie-line">✉️ <a href="mailto:farmaciahcfarma@gmail.com">farmaciahcfarma@gmail.com</a></div>
              <div style={{ marginTop: 6 }}>
                <a className="footer-cta" href="mailto:farmaciahcfarma@gmail.com">Enviar mensaje</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pie-bottom">
        <div>© {new Date().getFullYear()} HcFarma — Todos los derechos reservados</div>
      </div>
    </footer>
  );
}
