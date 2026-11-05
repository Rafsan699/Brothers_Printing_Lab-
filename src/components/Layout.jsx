import {Link,NavLink,Outlet,useLocation} from 'react-router-dom';
import {useEffect,useRef,useState} from 'react';
import {api} from '../api.js';
import {useCart} from '../cart.jsx';
import {useSettings,wa} from '../settings.jsx';
import '../home.css';
import '../pages.css';
import './layout-icons.css'; // <-- notun (path tomar folder structure onujayi thik koro)
import printingLogo from './printing.jpg';
import ErrorBoundary from './ErrorBoundary.jsx';

// ---------- ICONS ----------
const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 7h12l1 13H5L6 7Z" />
    <path d="M9 10V6a3 3 0 0 1 6 0v4" />
  </svg>
);

const UpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

const WaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.4A9.9 9.9 0 1 0 12.04 2Zm0 18.1c-1.5 0-2.9-.4-4.1-1.1l-.3-.2-3.1.8.8-3-.2-.3a8.1 8.1 0 1 1 6.9 3.8Zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.1 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.4c-.2 0-.4.1-.6.3-.6.6-.9 1.3-.9 2.1 0 .9.4 1.8 1 2.6 1.1 1.5 2.4 2.6 4 3.3 1.5.6 2.1.6 2.9.5.5-.1 1.4-.6 1.6-1.2.2-.6.2-1 .1-1.1l-.5-.2Z"/>
  </svg>
);

// LOGO
export const Logo = () => {
  const s = useSettings()||{};

  return (
    <span className="flex items-center gap-2.5">
      <img
        src={printingLogo}
        alt="Brothers Printing Lab"
        className="h-10 w-10 rounded-lg object-contain"
      />

      <span className="hp-grad text-xl font-extrabold">
        {s.siteName}
      </span>
    </span>
  );
};

export default function Layout(){
  const s=useSettings()||{},{items}=useCart(),{pathname}=useLocation();

  const [open,setOpen]=useState(false);
  const [cats,setCats]=useState([]);
  const [scrolled,setScrolled]=useState(false);
  const [showTop,setShowTop]=useState(false);
  const progRef=useRef(null);
  const [bump,setBump]=useState(false);

  const first=useRef(true);

  // Load categories
  useEffect(()=>{
    api('/api/categories')
      .then(d=>Array.isArray(d)&&setCats(d))
      .catch(()=>{});
  },[]);

  // Scroll progress (rAF throttle; scroll e puro Layout re-render hoy na)
  useEffect(()=>{
    let raf=0;
    const f=()=>{
      raf=0;
      const h=document.documentElement;
      const p=window.scrollY/Math.max(1,h.scrollHeight-h.clientHeight)*100;
      if(progRef.current)progRef.current.style.width=p+'%';
      setScrolled(p>1);
      setShowTop(p>12);
    };
    const on=()=>{if(!raf)raf=requestAnimationFrame(f)};
    f();
    window.addEventListener('scroll',on,{passive:true});
    window.addEventListener('resize',on);
    return ()=>{
      window.removeEventListener('scroll',on);
      window.removeEventListener('resize',on);
      if(raf)cancelAnimationFrame(raf);
    };
  },[]);

  // Route change
  useEffect(()=>{
    setOpen(false); // scroll top App.jsx er Top() kore
  },[pathname]);

  // Cart animation
  useEffect(()=>{
    if(first.current){
      first.current=false;
      return;
    }

    setBump(true);

    const t=setTimeout(()=>setBump(false),500);

    return ()=>clearTimeout(t);
  },[items.length]);

  const L=({to,children,end})=>(
    <NavLink
      to={to}
      end={end}
      className={({isActive})=>
        'hp-link'+(isActive?' on':'')
      }
    >
      {children}
    </NavLink>
  );

  const socials=[
    ['facebook','Facebook'],
    ['instagram','Instagram'],
    ['youtube','YouTube'],
    ['tiktok','TikTok']
  ].filter(([k])=>s[k]);

  const ann=s.announcementOn&&s.announcement;

  return (
    <div className="hp flex min-h-screen flex-col">

      {/* SCROLL PROGRESS */}
      <div
        className="hp-prog"
        ref={progRef}
        style={{width:'0%'}}
      />

      {/* ANNOUNCEMENT */}
      {ann&&(
        <div className="hp-ann hp-mq">
          <div className="hp-mq-in">
            {[0,1].map(k=>(
              <div
                key={k}
                className="flex gap-16 pr-16"
              >
                {Array.from({length:4},(_,j)=>(
                  <span key={j}>
                    ✨ {s.announcement}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className={'hp-head'+(scrolled?' sc':'')}>

        <div className="hp-wrap relative flex items-center justify-between py-3">

          {/* BRAND LOGO */}
          <Link to="/" aria-label="Brothers Printing Lab Home">
            <Logo/>
          </Link>

          {/* NAVIGATION */}
          <nav
            className={
              'md:flex md:flex-row md:items-center '+
              (open
                ? 'hp-navm flex flex-col'
                : 'hidden')
            }
          >
            <L to="/" end>হোম</L>
            <L to="/services">সার্ভিস</L>
            <L to="/track">অর্ডার ট্র্যাক</L>
            <L to="/about">আমাদের সম্পর্কে</L>
            <L to="/contact">যোগাযোগ</L>
          </nav>

          {/* HEADER ACTIONS */}
          <div className="flex items-center gap-3">

            {/* CART */}
            <Link
              to="/cart"
              aria-label={'কার্ট'+(items.length?` (${items.length})`:'')}
              className={'lx-cart'+(bump?' lx-bump':'')}
            >
              <CartIcon/>
              <span className="lx-cart-label">কার্ট</span>

              {items.length>0&&(
                <b className="lx-cart-badge">{items.length>99?'99+':items.length}</b>
              )}
            </Link>

            {/* MOBILE MENU */}
            <button
              type="button"
              className={'lx-menu md:hidden'+(open?' is-open':'')}
              aria-label="Menu"
              aria-expanded={open}
              onClick={()=>setOpen(!open)}
            >
              <span className="lx-burger" aria-hidden="true">
                <i/><i/><i/>
              </span>
            </button>

          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1" key={pathname}>
        {/* opacity-only animation: transform dile position:fixed (sticky order bar) bhenge jay */}
        <div className="hp-page">
          <ErrorBoundary resetKey={pathname}><Outlet/></ErrorBoundary>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="hp-foot">

        <div className="hp-wrap grid gap-8 py-12 md:grid-cols-3">

          {/* BRAND */}
          <div>

            <div className="flex items-center gap-3">

              <img
                src={printingLogo}
                alt="Brothers Printing Lab"
                className="h-10 w-10 rounded-lg object-contain"
              />

              <div className="text-2xl font-extrabold">
                {s.siteName}
              </div>

            </div>

            <p className="mt-3 text-white/70">
              {s.footerAbout||s.tagline}
            </p>

            {/* SOCIAL LINKS */}
            <div className="mt-4 flex flex-wrap gap-2">

              {socials.map(([k,l])=>(
                <a
                  key={k}
                  className="rounded-full border border-white/20 px-3 py-1 text-sm"
                  href={s[k]}
                  target="_blank"
                  rel="noreferrer"
                >
                  {l}
                </a>
              ))}

            </div>
          </div>

          {/* SERVICES */}
          <div>

            <h3 className="mb-3 font-bold">
              সার্ভিস
            </h3>

            <div className="space-y-1.5">

              {cats.map(c=>(
                <Link
                  key={c._id}
                  to={'/services/'+c.slug}
                  className="block"
                >
                  {c.icon} {c.name}
                </Link>
              ))}

            </div>
          </div>

          {/* CONTACT */}
          <div className="text-white/70">

            <h3 className="mb-3 font-bold text-white">
              যোগাযোগ
            </h3>

            <p>📍 {s.address}</p>

            <p className="mt-1">
              📞 {s.phone}
            </p>

            <p className="mt-1">
              ✉ {s.email}
            </p>

            <a
              className="hp-btn hp-btn-wa mt-4 !text-white"
              href={wa(s)}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp এ মেসেজ করুন
            </a>

          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-white/10 py-4 text-center text-sm text-white/50">

          © {new Date().getFullYear()} {s.siteName}. {s.copyright}

        </div>

      </footer>

      {/* FLOATING STACK: Back to top + WhatsApp */}
      <div className="lx-fabs">
        <button
          type="button"
          aria-label="Top"
          onClick={()=>
            window.scrollTo({
              top:0,
              behavior:'smooth'
            })
          }
          className={'lx-fab lx-top'+(showTop?'':' off')}
        >
          <UpIcon/>
        </button>

        {s.whatsappFloat&&(
          <a
            href={wa(s)}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            className="lx-fab lx-wa"
          >
            <WaIcon/>
          </a>
        )}
      </div>

    </div>
  );
}