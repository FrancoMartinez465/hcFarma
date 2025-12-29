import React, { useState, useMemo } from "react";
import Encabezado from "../components/Encabezado";
import PiePagina from "../components/PiePagina";
import "../assets/css/resenas.css";

const initialReviews = [];

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
  } catch (e) {
    return iso;
  }
}

export default function Resenas() {
  const [reviews, setReviews] = useState(initialReviews);
  const [name, setName] = useState("");
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterStars, setFilterStars] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent");

  const filtered = useMemo(() => {
    return reviews
      .filter((r) => {
        if (filterStars !== "all") {
          if (r.stars !== Number(filterStars)) return false;
        }
        if (filterFrom) {
          if (new Date(r.date) < new Date(filterFrom)) return false;
        }
        if (filterTo) {
          const toDate = new Date(filterTo);
          toDate.setHours(23, 59, 59, 999);
          if (new Date(r.date) > toDate) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === "recent") return new Date(b.date) - new Date(a.date);
        return new Date(a.date) - new Date(b.date);
      });
  }, [reviews, filterFrom, filterTo, filterStars]);

  function handleAdd(e) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    const newReview = {
      id: Date.now(),
      name: name.trim(),
      stars: Number(stars),
      text: text.trim(),
      date: new Date().toISOString(),
    };
    setReviews((s) => [newReview, ...s]);
    setName("");
    setText("");
    setStars(5);
  }

  function clearFilters() {
    setFilterFrom("");
    setFilterTo("");
    setFilterStars("all");
  }

  return (
    <div className="hc-container">
      <Encabezado />
      <main className="hc-main resenas-container">
        <h2 className="resenas-title">Reseñas</h2>

        <section className="resenas-grid">
          <aside className="resenas-form">
            <h3>Dejar una reseña</h3>
            <form onSubmit={handleAdd}>
              <label>Nombre</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
              <label>Estrellas</label>
              <select value={stars} onChange={(e) => setStars(e.target.value)}>
                {[5,4,3,2,1].map((s) => (
                  <option key={s} value={s}>{s} ★</option>
                ))}
              </select>
              <label>Comentario</label>
              <textarea value={text} onChange={(e) => setText(e.target.value)} required />
              <button className="btn btn-primary" type="submit">Enviar reseña</button>
            </form>
          </aside>

          <section className="resenas-list">
            <div className="resenas-filters">
                <div>
                <label>Estrellas</label>
                <select value={filterStars} onChange={(e) => setFilterStars(e.target.value)}>
                  <option value="all">Todas</option>
                  <option value="5">5</option>
                  <option value="4">4</option>
                  <option value="3">3</option>
                  <option value="2">2</option>
                  <option value="1">1</option>
                </select>
              </div>
              <div>
                <label>Ordenar Comentarios</label>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="recent">Más recientes</option>
                  <option value="oldest">Más antiguos</option>
                </select>
              </div>
              <div style={{ alignSelf: 'end' }}>
                <button className="btn btn-clear" onClick={clearFilters}>Limpiar</button>
              </div>
            </div>

            <div className="resenas-items">
              {filtered.length === 0 && <p>No hay reseñas que coincidan.</p>}
              {filtered.map((r) => (
                <article key={r.id} className="reseña-card">
                  <div className="reseña-head">
                    <strong>{r.name}</strong>
                    <span className="reseña-stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < r.stars ? "star filled" : "star"} aria-hidden>
                          ★
                        </span>
                      ))}
                      <span className="muted"> {r.stars}</span>
                    </span>
                  </div>
                  <div className="reseña-date">{formatDate(r.date)}</div>
                  <div className="reseña-text">{r.text}</div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
      <PiePagina />
    </div>
  );
}
