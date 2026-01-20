import React, { useState, useMemo } from "react";
import "../assets/css/solicitar.css";
const whatsappIcon = `${import.meta.env.BASE_URL}image.png`;
export default function SolicitarModal({ product, onClose }) {
  const [name, setName] = useState("");
  const [dni, setDni] = useState("");
  const [payment, setPayment] = useState("efectivo");
  const [time, setTime] = useState("");
  const [showTimeError, setShowTimeError] = useState(false);

  // Obtener nombre del producto desde WordPress
  const productName = useMemo(() => {
    const html = product?.title?.rendered || "";
    if (!html) return "Producto";

    // Decodificar entidades HTML y eliminar tags
    const div = document.createElement("div");
    div.innerHTML = html;
    const decoded = (div.textContent || div.innerText || "").replace(/\u00A0/g, " ").trim();
    return decoded || "Producto";
  }, [product]);

  // Contar cantidad de productos en el carrito (si hay múltiples items)
  const itemCount = useMemo(() => {
    const text = productName;
    const matches = text.match(/\(x(\d+)\)/g);
    return matches ? matches.length : 1;
  }, [productName]);

  // Calcular precio total si está disponible
  const getTotalPrice = () => {
    const html = product?.content?.rendered || "";
    if (!html) return null;
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = (div.textContent || div.innerText || "").replace(/\u00A0/g, " ");
    const match = text.match(/precio\s*[:\-]?\s*\$?\s*([0-9][0-9.,]+)/i);
    return match?.[1] ? `$ ${match[1].trim()}` : null;
  };


  function parseHM(hm) {
    const [h, m] = hm.split(":").map(Number);
    return h * 60 + m;
  }

  // Horarios fijos (Gandhi)
  const todayRanges = useMemo(() => {
    const days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const today = days[new Date().getDay()];

    // 👉 horarios sincronizados con la sucursal Gandhi (09:00 - 21:00)
    const schedule = {
      Lunes: [["09:00", "21:00"]],
      Martes: [["09:00", "21:00"]],
      Miércoles: [["09:00", "21:00"]],
      Jueves: [["09:00", "21:00"]],
      Viernes: [["09:00", "21:00"]],
      Sábado: [["09:00", "21:00"]],
      Domingo: [["10:00", "14:00"], ["17:00", "21:00"]],
    };

    return schedule[today] || [];
  }, []);

  function isTimeWithinRanges(hm, ranges) {
    if (!hm) return false;
    const minutes = parseHM(hm);
    return ranges.some(([start, end]) => {
      const s = parseHM(start);
      const e = parseHM(end);
      return minutes >= s && minutes <= e;
    });
  }

  if (!product) return null;

  function handleCancel(e) {
    e.preventDefault();
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();

    const phone = "5493517517088"; // número real de la farmacia
    const clean = (s = "") => String(s).replace(/\s+/g, " ").trim();

    const nameClean = clean(name);
    const dniClean = String(dni).replace(/\D/g, "");
    const paymentClean = clean(payment);

    // Determinar saludo según la hora actual
    const currentHour = new Date().getHours();
    let greeting = "hola";
    if (currentHour >= 8 && currentHour < 12) {
      greeting = "buenos días";
    } else if (currentHour >= 12 && currentHour < 20) {
      greeting = "buenas tardes";
    } else if (currentHour >= 20 && currentHour < 24) {
      greeting = "buenas noches";
    }

    // Separar productos
    const products = productName.split(", ").filter(p => p.trim());
    const isMultiple = products.length > 1;
    const productText = isMultiple ? "los siguientes productos" : "el siguiente producto";

    // Armar lista de productos con bullets
    const productList = products.map(product => `* ${product}`).join("\n");

    let scheduleText = "Ahora";
    if (time) {
      if (!isTimeWithinRanges(time, todayRanges)) {
        setShowTimeError(true);
        return;
      }
      scheduleText = time;
    }

    const text = `Hola, ${greeting}.
Me llamo: ${nameClean} (DNI: ${dniClean})
Me gustaría solicitar ${productText}:

${productList}

Retiro: Sucursal Gandhi
Horario: ${scheduleText}
Forma de pago: ${paymentClean}

Muchísimas gracias`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    onClose();
  }

  return (
    <div className="solicitar-overlay" role="dialog" aria-modal="true">
      {showTimeError && (
        <div className="error-overlay">
          <div className="error-modal">
            <div className="error-icon">⏰</div>
            <h3>Horario no disponible</h3>
            <p>La hora seleccionada no está dentro del horario de atención.</p>
            <div className="error-actions">
              <button
                className="btn btn-primary"
                onClick={() => setShowTimeError(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="solicitar-card">
        <h2 className="solicitar-title">Resumen de Pedido</h2>

        <div className="solicitar-summary">
          <h3 className="summary-heading">Productos</h3>
          <div className="summary-items">
            {productName.split(", ").map((item, idx) => (
              <div key={idx} className="summary-item">
                <span className="summary-item-name">{item}</span>
              </div>
            ))}
          </div>
          {getTotalPrice() && (
            <div className="summary-total">
              <span className="summary-total-label">Total:</span>
              <span className="summary-total-price">{getTotalPrice()}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="solicitar-form">
          <label htmlFor="name">Nombre del cliente</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juan Pérez"
            required
          />

          <label htmlFor="dni">DNI</label>
          <input
            id="dni"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="12.345.678"
            required
          />

          <label htmlFor="branch">Punto de retiro</label>
          <input
            id="branch"
            value="Sucursal Gandhi"
            disabled
          />

          <label htmlFor="time">Horario de retiro <span className="optional">(opcional)</span></label>
          <input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            step="60"
          />

          <div className="hint">
            {todayRanges.length > 0 ? (
              <small>
                Horarios hoy: {todayRanges.map((r) => `${r[0]} - ${r[1]}`).join(", ")}
              </small>
            ) : (
              <small>La sucursal está cerrada hoy.</small>
            )}
          </div>

          <label htmlFor="payment">Forma de pago</label>
          <select
            id="payment"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
          >
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>

          <div className="solicitar-actions">
            <button className="btn btn-ghost" onClick={handleCancel}>
              Cancelar
            </button>

            <button className="btn btn-primary" type="submit">
              <img src={whatsappIcon} alt="WhatsApp" className="wh-icon-modal" />
              Confirmar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
