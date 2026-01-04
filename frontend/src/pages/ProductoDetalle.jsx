import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Encabezado from "../components/Encabezado";
import PiePagina from "../components/PiePagina";
import SolicitarModal from "../components/SolicitarModal";
import logo from "../assets/images/image.png";
import "../assets/css/producto-detail.css";

const API_URL = "https://public-api.wordpress.com/wp/v2/sites/hcfarma.wordpress.com/posts";

const getImage = (html) => html?.match(/<img[^>]+src="([^">]+)"/)?.[1] || logo;

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

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    window.scrollTo(0, 0);
    fetch(`${API_URL}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("No pudimos cargar el producto");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const title = useMemo(() => decodeToPlainText(product?.title?.rendered) || "Producto", [product]);
  const image = useMemo(() => getImage(product?.content?.rendered), [product]);
  const price = useMemo(() => getPrice(product?.content?.rendered), [product]);
  const content = product?.content?.rendered || "";

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  return (
    <div className="hc-container">
      <Encabezado />

      {showModal && (
        <SolicitarModal product={product} onClose={() => setShowModal(false)} />
      )}

      <main className="hc-main">
        <section className="pd-wrapper">
          {loading && (
            <article className="pd-card pd-skeleton">
              <div className="pd-media skeleton-img-detail"></div>
              <div className="pd-content">
                <div className="skeleton-back"></div>
                <div className="skeleton-title-detail"></div>
                <div className="skeleton-price-detail"></div>
                <div className="skeleton-buttons-detail"></div>
                <div className="skeleton-body-detail"></div>
              </div>
            </article>
          )}
          {!loading && error && <p>Error: {error}</p>}

          {!loading && !error && product && (
            <article className="pd-card">
              <div className="pd-media">
                <img 
                  src={image} 
                  alt={title}
                  loading="eager"
                  decoding="async"
                />
              </div>

              <div className="pd-content">
                <button className="btn btn-link" onClick={handleBack}>
                  Volver a productos
                </button>

                <h1 className="pd-title">{title}</h1>
                <p className="pd-price">{price}</p>

                <div className="pd-actions">
                  <button className="btn" onClick={handleBack}>Volver</button>
                  <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <img
                      src={`${import.meta.env.BASE_URL}image.png`}
                      alt="WhatsApp"
                      className="wh-icon"
                    />
                    Solicitar
                  </button>
                </div>

                <div
                  className="pd-body"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </article>
          )}
        </section>
      </main>

      <PiePagina />
    </div>
  );
}
