import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import Card, { Skel } from '../components/Card.jsx';
import { Rv } from '../components/Reveal.jsx';
import './Shop.css';

const SORTS = [
  ['new', 'নতুন'],
  ['low', 'দাম কম'],
  ['high', 'দাম বেশি'],
  ['pop', 'জনপ্রিয়']
];

const PAGE_SIZE = 12; // 4 column x 3 row

// 1 … 4 5 6 … 20 moto page number list
const pageList = (c, t) => {
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);
  const s = new Set([1, t, c - 1, c, c + 1]);
  if (c <= 3) [2, 3, 4].forEach(n => s.add(n));
  if (c >= t - 2) [t - 1, t - 2, t - 3].forEach(n => s.add(n));
  const a = [...s].filter(n => n >= 1 && n <= t).sort((x, y) => x - y);
  const out = [];
  a.forEach((n, i) => {
    if (i && n - a[i - 1] > 1) out.push('gap' + n);
    out.push(n);
  });
  return out;
};

function Pager({ page, total, count, onChange }) {
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, count);

  return (
    <nav className="shop-pager" aria-label="Pagination">
      <p className="shop-pager-info">
        Showing <b>{from}–{to}</b> of <b>{count}</b> products
      </p>

      <div className="shop-pager-ctrl">
        <button
          type="button"
          className="shop-page-btn shop-page-nav"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          <span>Previous</span>
        </button>

        <div className="shop-page-numbers">
          {pageList(page, total).map(n =>
            typeof n === 'string' ? (
              <span key={n} className="shop-page-gap">…</span>
            ) : (
              <button
                type="button"
                key={n}
                className={'shop-page-btn' + (n === page ? ' active' : '')}
                aria-current={n === page ? 'page' : undefined}
                aria-label={`Page ${n}`}
                onClick={() => n !== page && onChange(n)}
              >
                {n}
              </button>
            )
          )}
        </div>

        <span className="shop-page-mobile">Page {page} / {total}</span>

        <button
          type="button"
          className="shop-page-btn shop-page-nav"
          disabled={page >= total}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          <span>Next</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

export default function Shop() {
  const { cat } = useParams();

  const [cats, setCats] = useState([]);
  const [ps, setPs] = useState([]);
  const [q, setQ] = useState('');
  const [load, setLoad] = useState(true);
  const [sort, setSort] = useState('new');

  // Pagination (page URL e thake: ?page=2, back button o kaj kore)
  const [sp, setSp] = useSearchParams();
  const topRef = useRef(null);
  const rawPage = Math.max(1, parseInt(sp.get('page'), 10) || 1);

  const setPage = (n, scroll = false) => {
    const x = new URLSearchParams(sp);
    if (n <= 1) x.delete('page');
    else x.set('page', String(n));
    setSp(x, { replace: !scroll });

    if (scroll) {
      requestAnimationFrame(() => {
        const el = topRef.current;
        if (el) {
          window.scrollTo({
            top: el.getBoundingClientRect().top + window.scrollY - 90,
            behavior: 'smooth'
          });
        }
      });
    }
  };

  // Dynamic categories
  useEffect(() => {
    api('/api/categories')
      .then(setCats)
      .catch(() => setCats([]));
  }, []);

  // Dynamic products
  useEffect(() => {
    let cancelled = false;

    setLoad(true);

    const timer = setTimeout(() => {
      api(
        '/api/products?' +
        new URLSearchParams({
          ...(cat ? { category: cat } : {}),
          ...(q.trim() ? { q: q.trim() } : {})
        })
      )
        .then(data => {
          if (!cancelled) setPs(data);
        })
        .catch(() => {
          if (!cancelled) setPs([]);
        })
        .finally(() => {
          if (!cancelled) setLoad(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cat, q]);

  const cur = cats.find(c => c.slug === cat);

  // Product sorting
  const list = useMemo(() => {
    const a = [...ps];

    if (sort === 'low') {
      a.sort((x, y) => x.price - y.price);
    } else if (sort === 'high') {
      a.sort((x, y) => y.price - x.price);
    } else if (sort === 'pop') {
      a.sort(
        (x, y) =>
          Number(y.featured) - Number(x.featured)
      );
    }

    return a;
  }, [ps, sort]);

  // Current page er product
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(rawPage, totalPages);
  const paged = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main className="shop-page">

      {/* HERO */}
      <section className="shop-hero">

        <div className="shop-eyebrow">
          <span className="shop-eyebrow-dot" />
          OUR COLLECTION
        </div>

        <h1 className="shop-heading">
          {cur ? (
            <>
              {cur.icon && (
                <span className="shop-category-icon">
                  {cur.icon}
                </span>
              )}
              {cur.name}
            </>
          ) : (
            <>
              Explore Our{' '}
              <span>Products</span>
            </>
          )}
        </h1>

        <p className="shop-description">
          {cur?.description ||
            'Explore our collection and find the products you need.'}
        </p>

        {/* SEARCH */}
        <div className="shop-search">
          <span className="shop-search-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 4 4" />
            </svg>
          </span>

          <input
            type="search"
            placeholder="Search products..."
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
          />

          {q && (
            <button
              className="shop-clear"
              onClick={() => { setQ(''); setPage(1); }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </section>

      {/* CATEGORY AND SORT */}
      <section className="shop-toolbar">

        <div className="shop-categories">

          <Link
            to="/services"
            className={`shop-chip ${!cat ? 'active' : ''}`}
          >
            All Products
          </Link>

          {cats.map(c => (
            <Link
              key={c._id}
              to={`/services/${c.slug}`}
              className={`shop-chip ${
                cat === c.slug ? 'active' : ''
              }`}
            >
              {c.icon && <span>{c.icon}</span>}
              {c.name}
            </Link>
          ))}

        </div>

        <div className="shop-sort">

          <span>Sort by</span>

          <select
            value={sort}
            onChange={e => { setSort(e.target.value); setPage(1); }}
          >
            {SORTS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

        </div>

      </section>

      {/* PRODUCT SECTION */}
      <section className="shop-products" ref={topRef}>

        {!load && (
          <div className="shop-result-info">
            <span>
              {cur?.name || 'All Products'}
            </span>

            <span>
              {list.length} Products
            </span>
          </div>
        )}

        {load ? (
          <Skel />
        ) : list.length === 0 ? (

          <Rv className="shop-empty">
            <div className="shop-empty-icon">⌕</div>

            <h3>No Products Found</h3>

            <p>
              Try another search or browse a different category.
            </p>

            {(q || cat) && (
              <Link
                to="/services"
                onClick={() => { setQ(''); setPage(1); }}
                className="shop-reset"
              >
                Explore All Products
              </Link>
            )}
          </Rv>

        ) : (

          <div className="shop-grid">
            {paged.map((p, i) => (
              <div
                className="shop-product"
                key={p._id}
              >
                <Card p={p} i={i} />
              </div>
            ))}
          </div>

        )}

        {!load && list.length > PAGE_SIZE && (
          <Pager
            page={page}
            total={totalPages}
            count={list.length}
            onChange={n => setPage(n, true)}
          />
        )}

      </section>

    </main>
  );
}