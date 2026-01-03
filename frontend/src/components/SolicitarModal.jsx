import React, { useState, useMemo } from "react";
import "../assets/css/solicitar.css";
// Usar la imagen colocada en `public/` via ruta absoluta
export default function SolicitarModal({ product, onClose }) {
  const [name, setName] = useState("");
  const [dni, setDni] = useState("");
  const [payment, setPayment] = useState("efectivo");
  const [time, setTime] = useState("");

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

  // Obtener código del producto desde WordPress
  const productCode = useMemo(() => {
    // Prioridad 1: Campo personalizado ACF
    if (product?.acf?.codigo) return product.acf.codigo;
    
    // Prioridad 2: Meta campo
    if (product?.meta?.codigo) return product.meta.codigo;
    
    // Prioridad 3: SKU (si existe)
    if (product?.sku) return product.sku;
    
    // Prioridad 4: Extraer del contenido HTML (buscar patrón "Código: XXX" o similar)
    const content = product?.content?.rendered || "";
    if (content) {
      const codeMatch = content.match(/c[oó]digo[:\s]+([A-Z0-9\-]+)/i);
      if (codeMatch) return codeMatch[1];
    }
    
    // Fallback: usar el ID de WordPress
    return product?.id || "N/A";
  }, [product]);

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

    let scheduleText = "Ahora";
    if (time) {
      if (!isTimeWithinRanges(time, todayRanges)) {
        alert("La hora seleccionada no está dentro del horario de atención.");
        return;
      }
      scheduleText = time;
    }

    const text = `
Hola, quisiera solicitar:

Producto: ${productName}
Código interno: ${productCode}
Nombre: ${nameClean}
DNI: ${dniClean}
Retiro en: Sucursal Gandhi
Horario: ${scheduleText}
Forma de pago: ${paymentClean}
    `;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    onClose();
  }

  return (
    <div className="solicitar-overlay" role="dialog" aria-modal="true">
      <div className="solicitar-card">
        <h3>Solicitar: {productName}</h3>

        <form onSubmit={handleSubmit} className="solicitar-form">
          <label>Nombre del cliente</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>DNI</label>
          <input
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
          />

          <label>Retiro</label>
          <input value="Sucursal Gandhi" disabled />

          <label>Horario de retiro (opcional)</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            step="60"
          />

          <div className="hint">
            {todayRanges.length > 0 ? (
              <small>
                Horarios hoy:{" "}
                {todayRanges.map((r) => `${r[0]} - ${r[1]}`).join(", ")}
              </small>
            ) : (
              <small>La sucursal está cerrada hoy.</small>
            )}
          </div>

          <label>Forma de pago</label>
          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
          >
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>

          <div className="solicitar-actions">
            <button className="btn" onClick={handleCancel}>
              Cancelar
            </button>

            <button className="btn btn-primary" type="submit">
              <img src={`${import.meta.env.BASE_URL}image.png`} alt="WhatsApp" className="wh-icon-modal" />
              Solicitar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
