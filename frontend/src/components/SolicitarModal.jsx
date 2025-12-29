import React, { useState, useMemo } from "react";
import { branches } from "../services/products";
import "../assets/css/solicitar.css";

export default function SolicitarModal({ product, onClose }) {
  const [name, setName] = useState("");
  const [dni, setDni] = useState("");
  const [payment, setPayment] = useState("efectivo");
  const [branchId, setBranchId] = useState(product?.branches?.[0] || branches?.[0]?.id || "");
  const [time, setTime] = useState("");

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
    const now = new Date();
    const today = days[now.getDay()];
    const br = branches.find((b) => b.id === branchId) || branches[0];
    const dayEntry = br?.schedule?.find((d) => d.day === today);
    return dayEntry?.ranges || [];
  }, [branchId]);

  function parseHM(hm) {
    const [h, m] = hm.split(":").map(Number);
    return h * 60 + m;
  }

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
    const phone = "5493517517088"; // número de la farmacia en formato para wa.me (sin +)
    // Normalizar inputs
    const clean = (s = "") => String(s).replace(/\s+/g, " ").trim();
    const nameClean = clean(name);
    const dniClean = String(dni).replace(/\D/g, ""); // solo dígitos
    const paymentClean = clean(payment);
    const productLine = product.id ? `${clean(product.name)} (Código: ${product.id})` : clean(product.name);

    const branchName = branches.find((b) => b.id === branchId)?.name || branchId || "Sucursal no especificada";
    let scheduleText = "Ahora";
    if (time) {
      if (!isTimeWithinRanges(time, todayRanges)) {
        alert("La hora seleccionada no está dentro del horario de la sucursal para hoy.");
        return;
      }
      scheduleText = time;
    }

    const text = `Hola, quisiera solicitar:\nProducto: ${productLine}\nNombre: ${nameClean}\nDNI: ${dniClean}\nRetirar en: ${branchName}\nHorario: ${scheduleText}\nForma de pago: ${paymentClean}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    onClose();
  }

  return (
    <div className="solicitar-overlay" role="dialog" aria-modal="true">
      <div className="solicitar-card">
        <h3>Solicitar: {product.name}</h3>
        <form onSubmit={handleSubmit} className="solicitar-form">
          <label>Nombre del cliente</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />

          <label>DNI</label>
          <input value={dni} onChange={(e) => setDni(e.target.value)} required />

          <label>Sucursal para retiro</label>
          <select value={branchId} onChange={(e) => setBranchId(e.target.value)} required>
            {(product?.branches || branches.map(b => b.id)).map((id) => {
              const b = branches.find((br) => br.id === id) || { id };
              return (
                <option key={b.id} value={b.id}>
                  {b.name || b.id}
                </option>
              );
            })}
          </select>

          <label>Horario de retiro (opcional)</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            step="60"
            placeholder="HH:MM"
          />
          <div className="hint">
            {todayRanges.length > 0 ? (
              <small>Horarios disponibles hoy: {todayRanges.map(r => `${r[0]} - ${r[1]}`).join(", ")}</small>
            ) : (
              <small>La sucursal está cerrada hoy.</small>
            )}
          </div>

          <label>Forma de pago</label>
          <select value={payment} onChange={(e) => setPayment(e.target.value)}>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>

          <div className="solicitar-actions">
            <button className="btn" onClick={handleCancel}>Cancelar</button>
            <button className="btn btn-primary" type="submit">
              <img src="/whatsapp.png" alt="WhatsApp" className="wh-icon-modal" onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src='/image.png'}} />
              Solicitar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
