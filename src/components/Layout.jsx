import {Link,NavLink,Outlet,useLocation} from 'react-router-dom';
import {useEffect,useRef,useState} from 'react';
import {api} from '../api.js';
import {useCart} from '../cart.jsx';
import {useSettings,wa} from '../settings.jsx';
import '../home.css';
import '../pages.css';
import printingLogo from './printing.jpg';

// LOGO
export const Logo = () => {
  const s = useSettings();

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
  const s=useSettings(),{items}=useCart(),{pathname}=useLocation();

  const [open,setOpen]=useState(false);
  const [cats,setCats]=useState([]);
  const [sc,setSc]=useState(0);
  const [bump,setBump]=useState(false);

  const first=useRef(true);

  // Load categories
  useEffect(()=>{
    api('/api/categories')
      .then(setCats)
      .catch(()=>{});
  },[]);

  // Scroll progress
  useEffect(()=>{
    const f=()=>{
      const h=document.documentElement;
      setSc(
        window.scrollY/
        Math.max(1,h.scrollHeight-h.clientHeight)*100
      );
    };

    f();

    window.addEventListener('scroll',f,{passive:true});

    return ()=>window.removeEventListener('scroll',f);
  },[]);

  // Route change
  useEffect(()=>{
    window.scrollTo({top:0,behavior:'smooth'});
    setOpen(false);
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
        style={{width:sc+'%'}}
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

      {/* TOP INFO */}
      <div className="hp-info">
        <div className="hp-wrap flex flex-wrap justify-between gap-2">
          <span>📞 {s.phone}</span>
          <span>🕘 {s.hours}</span>
        </div>
      </div>

      {/* HEADER */}
      <header className={'hp-head'+(sc>1?' sc':'')}>

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
              className={
                'hp-btn hp-btn-out hp-cartb !py-2'+
                (bump?' hp-bump':'')
              }
            >
              🛒 কার্ট

              {items.length>0&&(
                <b>{items.length}</b>
              )}
            </Link>

            {/* MOBILE MENU */}
            <button
              className="hp-btn hp-btn-out !p-2.5 md:hidden"
              aria-label="Menu"
              onClick={()=>setOpen(!open)}
            >
              {open?'✕':'☰'}
            </button>

          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1" key={pathname}>
        <div style={{animation:'hp-drop .5s both'}}>
          <Outlet/>
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

      {/* BACK TO TOP */}
      <button
        aria-label="Top"
        onClick={()=>
          window.scrollTo({
            top:0,
            behavior:'smooth'
          })
        }
        className={'hp-top'+(sc>12?'':' off')}
      >
        ↑
      </button>

      {/* WHATSAPP FLOAT */}
      {s.whatsappFloat&&(
        <a
          href={wa(s)}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
          className="hp-fab wa"
        >
          💬
        </a>
      )}

    </div>
  );
}