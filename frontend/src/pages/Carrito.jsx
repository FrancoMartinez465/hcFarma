import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Encabezado from "../components/Encabezado";
import PiePagina from "../components/PiePagina";
import SolicitarModal from "../components/SolicitarModal";
import logo from "../assets/images/image.png";
// Icono desde public para mayor nitidez
const whatsappIcon = `${import.meta.env.BASE_URL}image.png`;
import "../assets/css/carrito.css";

export default function Carrito() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getImage = (html) =>
    html?.match(/<img[^>]+src="([^">]+)"/)?.[1] || logo;

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

  // Precio numérico para cálculos
  const getNumericPrice = (html) => {
    if (!html) return 0;
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = (div.textContent || div.innerText || "").replace(/\u00A0/g, " ");
    const match = text.match(/precio\s*[:\-]?\s*\$?\s*([0-9][0-9.,]+)/i);
    if (!match) return 0;
    const value = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
    return isNaN(value) ? 0 : value;
  };

  const formatCurrency = (value) =>
    value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSolicitar = () => {
    if (cartItems.length === 0) {
      alert("El carrito está vacío");
      return;
    }
    setShowModal(true);
  };

  const handleClearCart = () => {
    clearCart();
    setShowConfirmClear(false);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    const success = updateQuantity(productId, newQuantity);
    if (!success && newQuantity > 2) {
      setShowLimitModal(true);
    }
  };

  // Calcular precio total del carrito (numérico)
  const getTotalPrice = () => {
    let total = 0;
    cartItems.forEach((item) => {
      const price = getNumericPrice(item.content?.rendered);
      total += price * item.quantity;
    });
    return total;
  };

  // Crear un producto combinado con todos los items del carrito para el modal
  const combinedProduct = {
    title: {
      rendered: cartItems.map(item => {
        const name = decodeToPlainText(item.title?.rendered);
        return `${name} (x${item.quantity})`;
      }).join(", ")
    }
  };

  return (
    <div className="hc-container">
      <Encabezado />

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

      {showModal && (
        <SolicitarModal
          product={combinedProduct}
          onClose={() => setShowModal(false)}
        />
      )}

      {showConfirmClear && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <div className="confirm-icon">🗑️</div>
            <h3>¿Vaciar carrito?</h3>
            <p>Se eliminarán todos los productos del carrito</p>
            <div className="confirm-actions">
              <button
                className="btn btn-cancel"
                onClick={() => setShowConfirmClear(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-confirm"
                onClick={handleClearCart}
              >
                Sí, vaciar
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="hc-main">
        <section className="carrito-page">
          <div className="carrito-header carrito-header-banner">
            <div className="carrito-title">
              <span className="title-icon" aria-hidden="true">🛒</span>
              <div className="title-texts">
                <h1>Mi Carrito</h1>
                <span className="title-sub">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)} {cartItems.reduce((sum, item) => sum + item.quantity, 0) === 1 ? "producto" : "productos"} • Total estimado: $ {formatCurrency(getTotalPrice())}
                </span>
              </div>
            </div>
            <Link to="/" className="btn btn-secondary">
              ← Seguir comprando
            </Link>
          </div>

          {cartItems.length === 0 ? (
            <div className="carrito-empty">
              <div className="empty-icon">🛒</div>
              <h2>Tu carrito está vacío</h2>
              <p>¡Agrega productos para comenzar tu compra!</p>
              <Link to="/" className="btn btn-primary">
                Ver productos
              </Link>
            </div>
          ) : (
            <div className="carrito-layout">
              <div className="carrito-items">
                {cartItems.map((item) => {
                  const image = getImage(item.content?.rendered);
                  const plainTitle = decodeToPlainText(item.title?.rendered);
                  const priceText = getPrice(item.content?.rendered);
                  const unitPrice = getNumericPrice(item.content?.rendered);
                  const subtotal = unitPrice * item.quantity;

                  return (
                    <article key={item.id} className="carrito-item">
                      <div className="item-image">
                        <img src={image} alt={plainTitle} />
                      </div>

                      <div className="item-details">
                        <h3 className="item-name">{plainTitle}</h3>
                        <p className="item-price">{priceText}</p>
                        <p className="item-subtotal">
                          Subtotal: $ {formatCurrency(subtotal)}
                        </p>
                      </div>

                      <div className="item-quantity" aria-label="Control de cantidad">
                        <button
                          className="qty-btn"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          aria-label="Disminuir cantidad"
                        >
                          −
                        </button>
                        <span className="qty-value" aria-live="polite">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="item-remove"
                        onClick={() => removeFromCart(item.id)}
                        aria-label="Eliminar producto"
                        title="Eliminar del carrito"
                      >
                        🗑️
                      </button>
                    </article>
                  );
                })}
              </div>

              <aside className="summary-card">
                <div className="summary-header">
                  <h3>Resumen de compra</h3>
                  <p className="summary-note">Los precios pueden variar en farmacia.</p>
                </div>
                <div className="summary-body">
                  <p>
                    <strong>Productos:</strong> {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                  <div className="summary-line"></div>
                  <p className="summary-total">
                    <span>Total estimado</span>
                    <span>$ {formatCurrency(getTotalPrice())}</span>
                  </p>
                </div>
                <div className="summary-actions">
                  <button
                    className="btn btn-danger"
                    onClick={() => setShowConfirmClear(true)}
                    aria-label="Vaciar carrito"
                  >
                    <span className="btn-icon" aria-hidden="true">🗑️</span>
                    <span className="btn-label">Vaciar</span>
                  </button>
                  <button
                    className="btn btn-success btn-solicitar"
                    onClick={handleSolicitar}
                    aria-label="Solicitar pedido por WhatsApp"
                  >
                    <span className="btn-icon" aria-hidden="true">
                      <img src={whatsappIcon} alt="" className="wh-icon-cart" />
                    </span>
                    <span className="btn-label">Solicitar pedido</span>
                  </button>
                </div>
              </aside>
            </div>
          )}
        </section>
      </main>

      <PiePagina />
    </div>
  );
}
