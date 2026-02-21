import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Encabezado from "../components/Encabezado";
import PiePagina from "../components/PiePagina";
import { useCart } from "../context/CartContext";
import logo from "../assets/images/image.png";
import ShareModal from "../components/ShareModal";
import ImageModal from "../components/ImageModal";
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

// ya no extraemos descripción por separado; mostraremos el body sanitizado

const parseBranches = (html) => {
  if (!html) return [];
  const text = html.replace(/<[^>]+>/g, " ").replace(/\u00A0/g, " ").toLowerCase();
  const branches = new Set();
  if (/gandhi|ghandi|ghandi/.test(text)) branches.add("HC Farma Gandhi");
  if (/ruta\s*20|ruta20/.test(text)) branches.add("HC Farma Ruta 20");
  if (/san\s*martin|sanmartin/.test(text)) branches.add("HC Farma San Martin");
  // No marcar automáticamente como "Todas las sucursales" — devolver solo las sucursales detectadas
  return Array.from(branches);
};

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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
  const branches = useMemo(() => parseBranches(content), [content]);

  const getPresentation = (html) => {
    if (!html) return "";
    try {
      const div = document.createElement("div");
      div.innerHTML = html;
      const text = (div.textContent || div.innerText || "").replace(/\u00A0/g, " ");
      const m = text.match(/presentaci[oó]n\s*[:\-]?\s*([^\n\r]+)/i);
      return m?.[1]?.trim() || "";
    } catch (e) {
      return "";
    }
  };

  const presentation = useMemo(() => getPresentation(content), [content]);

  const sanitizeContent = (html) => {
    if (!html) return "";
    try {
      // Construir un DOM temporal para eliminar líneas tipo 'Sucursal:' y 'Precio:' del cuerpo
      const div = document.createElement("div");
      div.innerHTML = html;

      const shouldRemove = (text) => {
        const t = (text || "").replace(/\u00A0/g, " ").trim().toLowerCase();
        return /^sucursal\s*[:\-]/.test(t) || /^precio\s*[:\-]/.test(t);
      };

      div.querySelectorAll("p, div, li, span").forEach((el) => {
        const txt = el.textContent || "";
        if (shouldRemove(txt)) {
          el.remove();
        }
      });

      return div.innerHTML;
    } catch (e) {
      // Fallback por regex si el DOM temporal falla
      return html
        .replace(/Sucursal\s*[:\-]?\s*[^<\n\r]*/gi, "")
        .replace(/Precio\s*[:\-]?\s*(?:<[^>]+>\s*)*\$?\s*[0-9][0-9.,]*/gi, "");
    }
  };

  const sanitizedContent = useMemo(() => sanitizeContent(content), [content]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const handleAddToCart = () => {
    if (product) {
      const wasAdded = addToCart(product);
      
      if (wasAdded) {
        const id = Date.now();
        const newNotification = {
          id,
          message: "✓ Producto añadido al carrito"
        };
        
        setNotifications([newNotification]);
        
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }, 2500);
      } else {
        setShowLimitModal(true);
      }
    }
  };

  // Image zoom / modal behavior (desktop only)
  const imgRef = React.useRef(null);
  const originalRef = React.useRef(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [zooming, setZooming] = useState(false);

  // Zoom-aside state
  const [viewport, setViewport] = useState({ left: 0, top: 0, width: 0, height: 0, visible: false });
  const [zoomPos, setZoomPos] = useState({ xPct: 50, yPct: 50 });
  const priceRef = React.useRef(null);
  const cardRef = React.useRef(null);
  const [previewStyle, setPreviewStyle] = useState({ left: 0, top: 0, visible: false });

  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;

  const handleImgMouseMove = (e) => {
    if (!isDesktop) return;
    const orig = originalRef.current;
    if (!orig) return;
    const rect = orig.getBoundingClientRect();

    // viewport size: a bit larger so the visible rect matches preview proportion
    const vw = Math.max(100, Math.min(220, rect.width * 0.22));
    const vh = Math.max(100, Math.min(220, rect.height * 0.22));

    // Position viewport so the cursor is centered inside the viewport
    let left = e.clientX - rect.left - vw / 2;
    let top = e.clientY - rect.top - vh / 2;
    left = Math.max(0, Math.min(left, rect.width - vw));
    top = Math.max(0, Math.min(top, rect.height - vh));

    const centerX = ((left + vw / 2) / rect.width) * 100;
    const centerY = ((top + vh / 2) / rect.height) * 100;

    setViewport({ left, top, width: vw, height: vh, visible: true });
    setZoomPos({ xPct: centerX, yPct: centerY });
    setZooming(true);

    // compute preview position near the price element (to the right of price)
    const priceEl = priceRef.current;
    const cardEl = cardRef.current;
    if (priceEl && cardEl) {
      const priceR = priceEl.getBoundingClientRect();
      const cardR = cardEl.getBoundingClientRect();

      // desired preview size: increase a bit more but keep image scale
      const previewW = Math.min(760, Math.max(480, Math.round(cardR.width * 0.50)));
      const previewH = Math.min(520, Math.max(300, Math.round(previewW * 0.66)));

      // get the actual displayed image width so we can set background-size in px
      const imgEl = imgRef.current;
      const imgR = imgEl ? imgEl.getBoundingClientRect() : rect;
      const bgSizePx = Math.round(imgR.width);

      // position: move preview more to the left so it overlaps price and "Añadir al carrito"
      // place its right edge around the price right, then shift left by a factor of its width
      // shift more to the left so preview covers price/add-to-cart more
      let pxLeft = priceR.right - cardR.left - Math.round(previewW * 0.82) - 40;
      pxLeft = Math.max(8, pxLeft);
      const pxTop = priceR.top - cardR.top + priceR.height / 2 - previewH / 2;

      // We'll set background-size in pixels to match displayed image width (no extra zoom)
      setPreviewStyle({ left: pxLeft, top: Math.max(8, pxTop), visible: true, width: previewW, height: previewH, bgSizePx });
    }
  };

  const handleImgMouseLeave = () => {
    setViewport((v) => ({ ...v, visible: false }));
    setZooming(false);
    setPreviewStyle((p) => ({ ...p, visible: false }));
  };

  const handleImgClick = () => {
    setShowImageModal(true);
  };

  return (
    <div className="hc-container">
      <Encabezado />

      <div className="cart-notifications-container">
        {notifications.map((notif) => (
          <div key={notif.id} className="cart-notification">
            {notif.message}
          </div>
        ))}
      </div>

      {showLimitModal && (
        <div className="limit-modal-overlay">
          <div className="limit-modal">
            <div className="limit-modal-icon">⚠️</div>
            <h3>Cantidad máxima alcanzada</h3>
            <p>No puedes agregar más de 2 unidades por producto</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowLimitModal(false)}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <main className="hc-main">
        <section className="pd-wrapper">
          {/* TopActionButtons ahora se renderiza globalmente en App.jsx */}
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
            <article className="pd-card" ref={cardRef}>
              <div className="pd-media-wrapper">
                <div
                  className={`pd-media pd-media-original ${isDesktop ? 'zoomable' : ''}`}
                  ref={originalRef}
                  onMouseMove={isDesktop ? handleImgMouseMove : undefined}
                  onMouseLeave={isDesktop ? handleImgMouseLeave : undefined}
                >
                  <img 
                    ref={imgRef}
                    src={image} 
                    alt={title}
                    loading="eager"
                    decoding="async"
                    onClick={handleImgClick}
                  />

                  {/* viewport indicator */}
                  {isDesktop && viewport.visible && (
                    <div
                      className="zoom-viewport"
                      style={{
                        left: viewport.left,
                        top: viewport.top,
                        width: viewport.width,
                        height: viewport.height,
                      }}
                    />
                  )}
                </div>

                {/* Zoom preview pane: render only while hovering; positioned near price */}
                {isDesktop && previewStyle.visible && (
                  <div
                    className="pd-zoom-preview pd-zoom-preview-absolute overlap-controls"
                    style={{
                      left: previewStyle.left,
                      top: previewStyle.top,
                      width: previewStyle.width || 380,
                      height: previewStyle.height || 240,
                      backgroundImage: `url(${image})`,
                      backgroundPosition: `${zoomPos.xPct}% ${zoomPos.yPct}%`,
                      backgroundSize: previewStyle.bgSizePx ? `${previewStyle.bgSizePx}px auto` : previewStyle.bgSize ? `${previewStyle.bgSize}%` : undefined,
                      opacity: previewStyle.visible ? 1 : 0,
                    }}
                  />
                )}
              </div>

              <div className="pd-content">
                <button className="btn btn-link" onClick={handleBack}>
                  Volver a productos
                </button>

                <button
                  className="btn btn-link no-arrow share-btn"
                  onClick={() => setShowShareModal(true)}
                >
                  🔗 Compartir
                </button>

                <h1 className="pd-title">{title}</h1>

                {/** Mostrar solo la badge 'Todas las sucursales' si existe en la lista de branches */}
                {branches && branches.length > 0 && (
                  <div className="pd-branches">
                    {branches
                      .filter((b) => String(b).toLowerCase().trim() !== "todas las sucursales")
                      .map((b) => (
                        <span key={b} className="pd-branch">{b}</span>
                      ))}
                  </div>
                )}

                {/* Bloque de precio decorado (debajo de sucursales, arriba de botones) */}
                <div className="pd-price" ref={priceRef}>{price}</div>

                <div className="pd-actions">
                  <button className="btn" onClick={handleBack}>Volver</button>
                  <button className="btn btn-primary" onClick={handleAddToCart}>
                    🛒 Añadir al carrito
                  </button>
                </div>

                <div
                  className="pd-body"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
              </div>
            </article>
          )}
        </section>
      </main>

      <PiePagina />

      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        image={image}
        title={title}
        price={price}
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />

      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        image={image}
        alt={title}
      />
    </div>
  );
}
