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

  const removeImages = (html) =>
    html?.replace(/<figure[\s\S]*?<\/figure>/gi, "");

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

          {loading && <p>Cargando productos...</p>}
          {error && <p>Error: {error}</p>}

          <div className="pl-grid">
            {products.map((p) => {
              const image = getImage(p.content?.rendered);
              const cleanContent = removeImages(p.content?.rendered);

              return (
                <article key={p.id} className="pl-card">
                  <div className="pl-thumb">
                    <img src={image} alt={p.title.rendered} />
                  </div>

                  <div className="pl-info">
                    <h3
                      className="pl-name"
                      dangerouslySetInnerHTML={{ __html: p.title.rendered }}
                    />

                    <div
                      className="pl-description"
                      dangerouslySetInnerHTML={{ __html: cleanContent }}
                    />

                    <div className="pl-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => setModalProduct(p)}
                      >
                        <img src={`${import.meta.env.BASE_URL}image.png`} alt="WhatsApp" className="wh-icon" />
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
