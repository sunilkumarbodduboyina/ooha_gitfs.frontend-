import { useEffect, useState } from 'react';
import { api } from '../services/api';

/**
 * Floating WhatsApp button.
 * Pass `product` to include its name, price and link in the message.
 */
export default function WhatsAppFab({ product }) {
  const [cfg, setCfg] = useState(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    api.settings()
      .then((d) => setCfg(d.whatsapp))
      .catch(() => {});
  }, []);

  const phone = cfg?.phone || '919885927554';
  const base = cfg?.default_message || 'Hi Ooha Gifts, I would like to know more about your gifts.';

  let message = base;
  if (product) {
    const link = `${window.location.origin}/product/${product.slug || product.id}`;
    message = `Hello Ooha Gifts, I am interested in this product:\n\n🎁 ${product.name}\n💰 ₹${Number(product.selling_price).toLocaleString('en-IN')}\n🔗 ${link}`;
  }

  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  /* admin can disable the floating button entirely */
  if (cfg && !Number(cfg.enabled)) return null;

  return (
    <>
      {hover && <div className="whatsapp-tip">Chat with us on WhatsApp 💬</div>}
      <a
        className="whatsapp-fab"
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <svg
          aria-hidden="true"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.5 3.5A11.8 11.8 0 0 0 2.1 17.7L1 23l5.4-1.1A11.9 11.9 0 0 0 12 23h.01A11.8 11.8 0 0 0 20.5 3.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M16.6 14.2c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1.1-1.1 2.7s1.1 3.1 1.3 3.3c.2.2 2.2 3.4 5.3 4.7.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.4Z"
            fill="currentColor"
          />
        </svg>
      </a>
    </>
  );
}
