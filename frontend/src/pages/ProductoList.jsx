import React, { useMemo, useState } from "react";
import { products as sampleProducts, branches } from "../services/products";
import logo from "../assets/images/image.png";
import "../assets/css/producto-list.css";
import Encabezado from "../components/Encabezado";
import PiePagina from "../components/PiePagina";
import SolicitarModal from "../components/SolicitarModal";
import "../assets/css/solicitar.css";

export default function ProductoList() {
  const [branch, setBranch] = useState("all");
  const [q, setQ] = useState("");
  const [modalProduct, setModalProduct] = useState(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return sampleProducts.filter((p) => {
      const matchBranch = branch === "all" || p.branches.includes(branch);
      const matchText = !term || p.name.toLowerCase().includes(term);
      return matchBranch && matchText;
    });
  }, [branch, q]);

  return (
    <div className="hc-container">
      <Encabezado />
      {modalProduct && (
        <SolicitarModal product={modalProduct} onClose={() => setModalProduct(null)} />
      )}
      <main className="hc-main">
        <main className="producto-list">
          <div className="pl-controls">
            <div className="pl-search">
              <input
                placeholder="Buscar producto..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="pl-branch">
              <select value={branch} onChange={(e) => setBranch(e.target.value)}>
                <option value="all">Todas las sucursales</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="pl-count">{filtered.length} resultados</div>
          </div>

          <div className="pl-grid">
            {filtered.map((p) => (
              <div key={p.id} className="pl-card" role="article">
                <div className="pl-thumb">
                  <img src={p.image || logo} alt={p.name} />
                </div>
                <div className="pl-info">
                  <div className="pl-name">{p.name}</div>
                  <div className="pl-price">${p.price.toFixed(2)}</div>
                  <div className="pl-actions">
                    <button className="btn btn-primary" onClick={() => setModalProduct(p)}>
                      <img src="/whatsapp.png" alt="WhatsApp" className="wh-icon" onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src='/image.png'}} />
                      Solicitar
                    </button>
                  </div>
                  <div className="pl-branches">
                    Disponible en: {p.branches.map((id) => branches.find(b => b.id === id)?.name || id).join(", ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </main>
      <PiePagina />
    </div>
  );
}
