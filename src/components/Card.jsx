import { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { img, tk2 } from '../api.js';
import { Rv } from './Reveal.jsx';
import './card.css';

// Purono jaygay jeno kaj kore (import {Rv} from '../components/Card.jsx')
export { Rv };

// Product image (load fail korle gradient fallback dekhay)
export const Thumb = ({ p, cls = '', w = 600 }) => {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [p.image]);

  return p.image && !bad ? (
    <img
      src={img(p.image, w)}
      decoding="async"
      alt={p.title}
      loading="eager"
      className={'shop-thumb ' + cls}
      onError={e => {
        console.warn('Image load failed:', e.currentTarget.src);
        setBad(true);
      }}
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

// Loading skeleton (card er moto same structure)
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

const Arrow = () => (
  <svg
    viewBox="0 0 24 24"
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

// Product Card
function Card({ p, i = 0, onQuick }) {
  // Cut-off price: tomar API te field er nam onno hole ei line change koro
  const old = p.mrp || p.oldPrice || 0;
  const off = old > p.price ? Math.round(((old - p.price) / old) * 100) : 0;
  const href = '/product/' + p.slug;

  return (
    <Rv d={(i % 4) * 60} className="shop-card-reveal">
      <article className="shop-product-card">
        {/* IMAGE */}
        <div className="shop-card-image">
          <Link to={href} className="shop-card-imglink" aria-label={`${p.title} দেখুন`}>
            <Thumb p={p} />
          </Link>

          <span className="shop-card-shade" aria-hidden="true" />

          {/* Discount tag (top-left) */}
          {off > 0 && <span className="shop-off">-{off}%</span>}

          {/* Quick inquiry (top-right) */}
          <button
            type="button"
            className="shop-icon-btn shop-quick"
            aria-label="Quick inquiry"
            onClick={() => onQuick && onQuick(p)}
          >
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
              <path d="M9 11h6M9 14h4" />
            </svg>
          </button>

          {/* View (bottom-right, desktop hover only) */}
          <Link to={href} className="shop-icon-btn shop-view" aria-label="দেখুন">
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Link>
        </div>

        {/* BODY */}
        <div className="shop-card-body">
          {p.category?.name && (
            <span className="shop-card-category">{p.category.name}</span>
          )}

          <Link to={href} className="shop-card-title">
            {p.title}
          </Link>

          {/* price + MOQ row */}
          <div className="shop-card-meta">
            <div className="shop-card-price">
              <span className="shop-price-value">{tk2(p.price)}</span>
              {old > p.price && <span className="shop-price-old">{tk2(old)}</span>}
            </div>
            <span className="shop-moq">MOQ {p.minQty || 1}</span>
          </div>

          <Link to={href} className="shop-card-action">
            <span>অর্ডার করুন</span>
            <i className="shop-card-action-ic">
              <Arrow />
            </i>
          </Link>
        </div>
      </article>
    </Rv>
  );
}

// Home er autoplay timer e Card gulo bar bar re-render hobe na
export default memo(Card);