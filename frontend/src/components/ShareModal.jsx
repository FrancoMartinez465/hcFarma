import React, { useEffect, useState, useRef } from "react";
import "../assets/css/share-modal.css";

export default function ShareModal({ open, onClose, image, title, price, url }) {
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState(null);
  const noticeTimerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
        noticeTimerRef.current = null;
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  const shareText = `${title} - ${price}\n${url}`;
  const publicImage = `https://hcfarma.com.ar/image.png`;

  // Devuelve una URL con el dominio público `www.hcfarma.com.ar` y https
  const toPublicUrl = (someUrl) => {
    try {
      // si es relativa, la comparamos contra window.location.origin
      const u = someUrl ? new URL(someUrl, window.location.origin) : new URL(publicImage);
      u.hostname = 'hcfarma.com.ar';
      // Eliminar puerto (por ejemplo cuando se está en desarrollo :5173)
      u.port = '';
      u.protocol = 'https:';
      return u.toString();
    } catch (e) {
      // fallback simple
      if (!someUrl) return publicImage;
      if (someUrl.startsWith('http')) return someUrl.replace(/^(https?:)\/\/[^/:]+(:\d+)?/, 'https://hcfarma.com.ar');
      return `https://hcfarma.com.ar${someUrl.startsWith('/') ? '' : '/'}${someUrl}`;
    }
  };

  const handleWhatsApp = async () => {
    const finalUrl = toPublicUrl(url);
    const prefix = 'Hola, te comparto este producto que me pareció excelente.\n\n';
    const text = `${prefix}${title} - ${price}\n\n${finalUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };
  const handleFacebook = async () => {
    const finalUrl = toPublicUrl(url);
    const prefix = 'Hola, te comparto este producto que me pareció excelente.\n\n';
    const text = `${prefix}${title} - ${price}\n\n${finalUrl}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      }
    } catch (e) {
      // ignore clipboard errors
    }
    // Mostrar notice en lugar de alert; autodesaparece
    setNotice({
      title: 'Compartir en Facebook',
      text: 'Por ahora no es posible compartir directamente en Facebook desde esta ventana. Copiamos el mensaje; pegalo en el cuadro de publicación.',
      actionLabel: 'Abrir Facebook',
      actionUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(finalUrl)}&quote=${encodeURIComponent(text)}`,
      tone: 'info',
    });
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(null), 5000);
  };

  const handleTwitter = () => {
    const finalUrl = toPublicUrl(url);
    const prefix = 'Hola, te comparto este producto que me pareció excelente.\n\n';
    const text = `${prefix}${title} - ${price}\n\n${finalUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };
  const handleInstagram = async () => {
    const finalUrl = toPublicUrl(url);
    const prefix = 'Hola, te comparto este producto que me pareció excelente.\n\n';
    const text = `${prefix}${title} - ${price}\n\n${finalUrl}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      }
    } catch (e) {
      // ignore
    }
    setNotice({
      title: 'Compartir en Instagram',
      text: 'Por ahora no es posible compartir directamente en Instagram desde esta ventana. Copiamos el mensaje; pegalo en un mensaje directo o en tu historia.',
      actionLabel: 'Abrir Instagram',
      actionUrl: 'https://www.instagram.com/',
      tone: 'info',
    });
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(null), 5000);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
  };

  const onOverlayClick = (e) => {
    if (e.target && e.target.classList && e.target.classList.contains("share-overlay")) onClose();
  };

  const hideNotice = () => setNotice(null);

  return (
    <div className="share-overlay" role="dialog" aria-modal="true" onClick={onOverlayClick}>
      <div className="share-modal animate-zoom" role="document">
        <header className="share-header">
          <div className="share-header-left">
            <div className="share-header-icon">🔗</div>
            <div>
              <div className="share-title">Compartir producto</div>
              <div className="share-subtitle">Envía este producto a tus contactos</div>
            </div>
          </div>
          <button className="share-close" onClick={onClose} aria-label="Cerrar">✖</button>
        </header>

        <div className="share-body">
          <div className="share-preview">
            <div className="share-image-wrap">
              <img src={image} alt={title} className="share-image" />
            </div>
            <div className="share-meta">
              <div className="share-name">{title}</div>
              <div className="share-price">{price}</div>
            </div>
          </div>

          <div className="share-link-row">
            <input className="share-link-input" readOnly value={url} aria-label="Enlace del producto" />
            <button className="share-copy-inline" onClick={handleCopy} aria-label="Copiar enlace inline" data-copied={copied}>{copied ? 'Copiado' : 'Copiar'}</button>
          </div>

          <div className="share-divider" />

          <div className="share-actions">
            <button className="share-action share-whatsapp" onClick={handleWhatsApp} aria-label="Compartir por WhatsApp">
              <span className="share-icon-wrap whatsapp-wrap">
                <img
                  src={`${window.location.origin}/image.png`}
                  alt="WhatsApp"
                  className="share-button-img"
                  onError={(e) => {
                    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#ffffff" d="M20.5 3.5A11.9 11.9 0 0 0 12 0C5.373 0 .03 5.344 0 12c0 2.117.556 4.183 1.61 6.01L0 24l6.198-1.59A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12 0-1.718-.392-3.338-1.5-4.91zM12 21.5c-1.79 0-3.54-.468-5.06-1.35l-.36-.21-3.68.95.98-3.6-.23-.37A8.5 8.5 0 1 1 20.5 12 8.49 8.49 0 0 1 12 21.5z"/></svg>`;
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
                  }}
                />
              </span>
              <span>WhatsApp</span>
            </button>

            <button className="share-action share-facebook" onClick={handleFacebook} aria-label="Compartir por Facebook">
              <span className="share-icon-wrap facebook-wrap">
                <img
                  src={`${window.location.origin}/logo_facebook.png`}
                  alt="Facebook"
                  className="share-button-img facebook-img"
                  onError={(e) => {
                    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#ffffff" d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2.2V12h2.2V9.7c0-2.2 1.3-3.4 3.2-3.4.93 0 1.9.17 1.9.17v2.1h-1.1c-1.1 0-1.5.73-1.5 1.5V12h2.6l-.4 2.9h-2.2v7A10 10 0 0 0 22 12z"/></svg>`;
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
                  }}
                />
              </span>
              <span>Facebook</span>
            </button>

            <button className="share-action share-instagram" onClick={handleInstagram} aria-label="Compartir por Instagram">
              <span className="share-icon-wrap instagram-wrap">
                <img
                  src={`${window.location.origin}/logo_instagram.png`}
                  alt="Instagram"
                  className="share-button-img instagram-img"
                  onError={(e) => {
                    // si la imagen no existe, reemplazamos por un SVG inline (fallback)
                    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#ffffff" d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 1 0 12 7.2zm6.4-1.2a1.12 1.12 0 1 0 0 2.24 1.12 1.12 0 0 0 0-2.24zM12 5.4c2.55 0 2.86.01 3.86.06 1 .05 1.55.2 1.91.33.47.17.8.37 1.15.72.35.35.55.68.72 1.15.13.36.28.9.33 1.91.05 1 .06 1.31.06 3.86s-.01 2.86-.06 3.86c-.05 1-.2 1.55-.33 1.91-.17.47-.37.8-.72 1.15-.35.35-.68.55-1.15.72-.36.13-.9.28-1.91.33-1 .05-1.31.06-3.86.06s-2.86-.01-3.86-.06c-1-.05-1.55-.2-1.91-.33a3.48 3.48 0 0 1-1.15-.72 3.48 3.48 0 0 1-.72-1.15c-.13-.36-.28-.9-.33-1.91C5.41 14.86 5.4 14.55 5.4 12s.01-2.86.06-3.86c.05-1 .2-1.55.33-1.91.17-.47.37-.8.72-1.15.35-.35.68-.55 1.15-.72.36-.13.9-.28 1.91-.33C9.14 5.41 9.45 5.4 12 5.4z"/></svg>`;
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
                  }}
                />
              </span>
              <span>Instagram</span>
            </button>

            <button className="share-action share-twitter" onClick={handleTwitter} aria-label="Compartir por Twitter">
              <span className="share-icon-wrap twitter-wrap">
                <img
                  src={`${window.location.origin}/logo_twitter.png`}
                  alt="Twitter"
                  className="share-button-img twitter-img"
                  onError={(e) => {
                    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M21 3L3 21"/></g></svg>`;
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
                  }}
                />
              </span>
              <span className="twitter-text">
                <span className="twitter-label">Twitter</span>
                <span className="twitter-sub">(X)</span>
              </span>
            </button>

            {/* botón de copiar enlace eliminado por solicitud del usuario */}
          </div>
        </div>
      </div>
      {notice && (
        <div className="share-notice" role="status" aria-live="polite" onClick={(e) => e.stopPropagation()}>
          <div className="share-notice__content">
            <div className="share-notice__text">{notice.text}</div>
            <div className="share-notice__actions">
              {notice.actionUrl && (
                <a
                  href={notice.actionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  onClick={hideNotice}
                >
                  {notice.actionLabel || 'Abrir'}
                </a>
              )}
              <button className="btn btn-secondary" onClick={hideNotice}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      <div aria-live="polite" className="sr-only">{copied ? 'Enlace copiado' : ''}</div>
    </div>
  );
}
