
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { img, tk2 } from '../api.js';

// Product image
export const Thumb = ({ p, cls = '' }) => {
  return p.image ? (
    <img
      src={img(p.image)}
      alt={p.title}
      loading="lazy"
      className={'shop-thumb ' + cls}
    />
  ) : (
    <div
      className={'shop-thumb shop-thumb-fallback ' + cls}
      style={{
        background: `linear-gradient(135deg,${
          p.category?.color || '#6253a5'
        },#b46a9a)`
      }}
    >
      {p.category?.icon || p.title?.[0] || 'P'}
    </div>
  );
};

// Scroll reveal
export const Rv = ({ children, d = 0, className = '' }) => {
  const r = useRef(null);

  useEffect(() => {
    const el = r.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      el.classList.add('in');
      return;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('in');
          io.disconnect();
        }
      },
      { threshold: 0.08 }
    );

    io.observe(el);

    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={r}
      className={'hp-rv ' + className}
      style={{ transitionDelay: d + 'ms' }}
    >
      {children}
    </div>
  );
};

// Loading skeleton
export const Skel = ({ n = 8 }) => (
  <div className="shop-grid shop-skeleton-grid">
    {Array.from({ length: n }, (_, i) => (
      <div className="shop-skeleton-card" key={i}>
        <div className="shop-skeleton-image" />
        <div className="shop-skeleton-content">
          <div className="shop-skeleton-line short" />
          <div className="shop-skeleton-line" />
          <div className="shop-skeleton-line price" />
          <div className="shop-skeleton-button" />
        </div>
      </div>
    ))}
  </div>
);

// Product Card
export default function Card({ p, i = 0 }) {

  const tilt = e => {
    if (window.innerWidth < 768) return;

    const b = e.currentTarget.getBoundingClientRect();

    const x = (e.clientX - b.left) / b.width - 0.5;
    const y = (e.clientY - b.top) / b.height - 0.5;

    e.currentTarget.style.setProperty('--shop-ry', x * 3 + 'deg');
    e.currentTarget.style.setProperty('--shop-rx', -y * 3 + 'deg');
  };

  const reset = e => {
    e.currentTarget.style.setProperty('--shop-ry', '0deg');
    e.currentTarget.style.setProperty('--shop-rx', '0deg');
  };

  return (
    <Rv
      d={(i % 4) * 60}
      className="shop-card-reveal"
    >
      <article
        className="shop-product-card"
        onMouseMove={tilt}
        onMouseLeave={reset}
      >

        {/* IMAGE */}
        <Link
          to={'/product/' + p.slug}
          className="shop-card-image"
          aria-label={`View ${p.title}`}
        >

          <Thumb p={p} />

          {/* Featured */}
          {p.featured && (
            <span className="shop-featured">
              ★
            </span>
          )}

          {/* MOQ */}
          <span className="shop-moq">
            MOQ: {p.minQty || 1} {p.unit || 'pcs'}
          </span>

          {/* View icon */}
          <span className="shop-view">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              width="19"
              height="19"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </span>

        </Link>

        {/* PRODUCT DETAILS */}
        <div className="shop-card-body">

          {p.category?.name && (
            <span className="shop-card-category">
              {p.category.name}
            </span>
          )}

          <Link
            to={'/product/' + p.slug}
            className="shop-card-title"
          >
            {p.title}
          </Link>

          <div className="shop-card-price">

            <span className="shop-price-value">
              {tk2(p.price)}
            </span>

            <span className="shop-price-unit">
              / {p.pricing === 'area' ? 'sq ft' : p.unit || 'pcs'}
            </span>

          </div>

          {/* PRODUCT ACTION */}
          <Link
            to={'/product/' + p.slug}
            className="shop-card-action"
          >
            VIEW PRODUCT

            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>

          </Link>

        </div>

      </article>
    </Rv>
  );
}
