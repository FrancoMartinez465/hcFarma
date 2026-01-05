import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Encabezado from "../components/Encabezado";
import PiePagina from "../components/PiePagina";
import SolicitarModal from "../components/SolicitarModal";
import logo from "../assets/images/image.png";
import "../assets/css/carrito.css";

export default function Carrito() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

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

  // Calcular precio total del carrito
  const getTotalPrice = () => {
    let total = 0;
    cartItems.forEach(item => {
      const priceText = getPrice(item.content?.rendered);
      const priceMatch = priceText.match(/([0-9][0-9.,]+)/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.'));
        total += price * item.quantity;
      }
    });
    return total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
          <div className="carrito-header">
            <h1>🛒 Mi Carrito</h1>
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
            <>
              <div className="carrito-items">
                {cartItems.map((item) => {
                  const image = getImage(item.content?.rendered);
                  const plainTitle = decodeToPlainText(item.title?.rendered);
                  const price = getPrice(item.content?.rendered);

                  return (
                    <article key={item.id} className="carrito-item">
                      <div className="item-image">
                        <img src={image} alt={plainTitle} />
                      </div>

                      <div className="item-details">
                        <h3 className="item-name">{plainTitle}</h3>
                        <p className="item-price">{price}</p>
                      </div>

                      <div className="item-quantity">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Disminuir cantidad"
                        >
                          −
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
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

              <div className="carrito-actions">
                <button
                  className="btn btn-danger"
                  onClick={() => setShowConfirmClear(true)}
                >
                  🗑️ Vaciar carrito
                </button>

                <button
                  className="btn btn-success btn-solicitar"
                  onClick={handleSolicitar}
                >
                  <img
                    src={`${import.meta.env.BASE_URL}image.png`}
                    alt="WhatsApp"
                    className="wh-icon-cart"
                  />
                  Solicitar pedido
                </button>
              </div>

              <div className="carrito-summary">
                <p>
                  <strong>Total de productos:</strong> {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
                <p className="carrito-total-price">
                  <strong>Precio total:</strong> $ {getTotalPrice()}
                </p>
              </div>
            </>
          )}
        </section>
      </main>

      <PiePagina />
    </div>
  );
}
