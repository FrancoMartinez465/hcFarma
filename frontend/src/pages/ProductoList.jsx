import React, { useEffect, useState } from "react";
import "../assets/css/producto-list.css";
import Encabezado from "../components/Encabezado";
import PiePagina from "../components/PiePagina";
import SolicitarModal from "../components/SolicitarModal";
import logo from "../assets/images/image.png";

export default function ProductoList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalProduct, setModalProduct] = useState(null);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  useEffect(() => {
    fetch(
      "https://public-api.wordpress.com/wp/v2/sites/hcfarma.wordpress.com/posts?per_page=100"
    )
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar productos");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Helpers
  const getImage = (html) =>
    html?.match(/<img[^>]+src="([^">]+)"/)?.[1] || logo;

  // Decodifica HTML entities y devuelve texto plano en minúsculas
  const decodeToText = (html) => {
    if (!html) return "";
    try {
      const div = document.createElement("div");
      div.innerHTML = html;
      return (div.textContent || div.innerText || "").replace(/\u00A0/g, " ").toLowerCase();
    } catch (e) {
      return String(html).replace(/<[^>]+>/g, "").toLowerCase();
    }
  };

  const decodeToPlainText = (html) => {
    if (!html) return "";
    try {
      const div = document.createElement("div");
      div.innerHTML = html;
      return (div.textContent || div.innerText || "").replace(/\u00A0/g, " ");
    } catch (e) {
      return String(html).replace(/<[^>]+>/g, "");
    }
  };

  const getPrice = (html) => {
    if (!html) return "Precio no disponible";
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = (div.textContent || div.innerText || "").replace(/\u00A0/g, " ");
    const match = text.match(/precio\s*[:\-]?\s*\$?\s*([0-9][0-9.,]+)/i);
    return match?.[1] ? `$ ${match[1].trim()}` : "Precio no disponible";
  };

  const filteredProducts = products.filter((p) =>
    decodeToText(p.title?.rendered).includes(activeQuery.trim().toLowerCase())
  );

  const handleSearch = () => setActiveQuery(query);
  const handleClear = () => {
    setQuery("");
    setActiveQuery("");
  };

  return (
    <div className="hc-container">
      <Encabezado />

      {modalProduct && (
        <SolicitarModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}

      <main className="hc-main">
        <section className="producto-list">

          <div className="pl-filter">
            <div className="pl-search">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <div className="pl-filter-actions">
              <button className="btn btn-primary" onClick={handleSearch}>
                Buscar
              </button>
              <button className="btn" onClick={handleClear}>
                Limpiar
              </button>
            </div>
          </div>

          {loading && <p>Cargando productos...</p>}
          {error && <p>Error: {error}</p>}

          {!loading && filteredProducts.length === 0 && (
            <p>No se encontraron productos.</p>
          )}

          <div className="pl-grid">
            {filteredProducts.map((p) => {
              const image = getImage(p.content?.rendered);
              const plainTitle = decodeToPlainText(p.title?.rendered);
              const price = getPrice(p.content?.rendered);

              return (
                <article key={p.id} className="pl-card">
                  <div className="pl-thumb">
                    <img src={image} alt={plainTitle} />
                  </div>

                  <div className="pl-info">
                    <h3 className="pl-name">{plainTitle}</h3>
                    <p className="pl-price">{price}</p>

                    <div className="pl-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => setModalProduct(p)}
                      >
                        <img
                          src={`${import.meta.env.BASE_URL}image.png`}
                          alt="WhatsApp"
                          className="wh-icon"
                        />
                        Solicitar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

        </section>
      </main>

      <PiePagina />
    </div>
  );
}
