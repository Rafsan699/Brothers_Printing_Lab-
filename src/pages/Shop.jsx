
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import Card, { Rv, Skel } from '../components/Card.jsx';
import './Shop.css';

const SORTS = [
  ['new', 'নতুন'],
  ['low', 'দাম কম'],
  ['high', 'দাম বেশি'],
  ['pop', 'জনপ্রিয়']
];

export default function Shop() {
  const { cat } = useParams();

  const [cats, setCats] = useState([]);
  const [ps, setPs] = useState([]);
  const [q, setQ] = useState('');
  const [load, setLoad] = useState(true);
  const [sort, setSort] = useState('new');

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
            onChange={e => setQ(e.target.value)}
          />

          {q && (
            <button
              className="shop-clear"
              onClick={() => setQ('')}
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
            onChange={e => setSort(e.target.value)}
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
      <section className="shop-products">

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
                onClick={() => setQ('')}
                className="shop-reset"
              >
                Explore All Products
              </Link>
            )}
          </Rv>

        ) : (

          <div className="shop-grid">
            {list.map((p, i) => (
              <div
                className="shop-product"
                key={p._id}
              >
                <Card p={p} i={i} />
              </div>
            ))}
          </div>

        )}

      </section>

    </main>
  );
}
