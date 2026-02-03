import React, { useEffect } from "react";

export default function ImageModal({ open, onClose, image, alt = "Imagen" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="image-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <img
        src={image}
        alt={alt}
      />
    </div>
  );
}
