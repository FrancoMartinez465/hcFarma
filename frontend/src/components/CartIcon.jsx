import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartIcon() {
  const { getCartTotal } = useCart();
  const total = getCartTotal();
  const [animate, setAnimate] = useState(false);
  const [prevTotal, setPrevTotal] = useState(total);

  useEffect(() => {
    if (total !== prevTotal) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 600);
      setPrevTotal(total);
      return () => clearTimeout(timer);
    }
  }, [total, prevTotal]);

  return (
    <Link to="/carrito" className="cart-icon-link-fixed">
      <div className={`cart-icon-fixed ${animate ? 'cart-animate' : ''}`}>
        <div className="cart-icon-circle">
          🛒
        </div>
        <span className="cart-badge-fixed">{total}</span>
      </div>
    </Link>
  );
}
