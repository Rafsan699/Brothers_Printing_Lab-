import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, tk2 } from '../api.js';
import { useSettings, wa } from '../settings.jsx';
import { Rv } from '../components/Card.jsx';

const STEPS = ['Pending', 'Confirmed', 'Designing', 'Printing', 'Ready', 'Delivered'];

const ICO = {
  Pending: '⏳',
  Confirmed: '✅',
  Designing: '🎨',
  Printing: '🖨',
  Ready: '📦',
  Delivered: '🚚'
};

const BN = {
  Pending: 'অপেক্ষমাণ',
  Confirmed: 'কনফার্মড',
  Designing: 'ডিজাইন চলছে',
  Printing: 'প্রিন্ট হচ্ছে',
  Ready: 'প্রস্তুত',
  Delivered: 'ডেলিভারড',
  Cancelled: 'বাতিল'
};

const fmt = d => d ? new Date(d).toLocaleString('bn-BD', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit'
}) : '';


// ==============================
// ORDER TRACKING
// ==============================

export function Track() {
  const [sp] = useSearchParams();

  const [no, setNo] = useState(sp.get('no') || '');
  const [ph, setPh] = useState(sp.get('phone') || '');
  const [o, setO] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [w, setW] = useState(0);

  const search = async (n = no, p = ph) => {
    setErr('');
    setO(null);
    setW(0);
    setBusy(true);

    try {
      setO(await api('/api/orders/track?' + new URLSearchParams({
        orderNo: n,
        phone: p
      })));
    } catch (x) {
      setErr(x.message);
    }

    setBusy(false);
  };

  const go = e => {
    e.preventDefault();
    search();
  };

  useEffect(() => {
    if (sp.get('no') && sp.get('phone')) {
      search(sp.get('no'), sp.get('phone'));
    }
  }, []); // eslint-disable-line

  const idx = o ? STEPS.indexOf(o.status) : 0;

  useEffect(() => {
    if (o && o.status !== 'Cancelled') {
      setTimeout(() => setW(idx / (STEPS.length - 1) * 84), 100);
    }
  }, [o]); // eslint-disable-line

  const hist = Object.fromEntries(
    (o?.statusHistory || []).map(h => [h.status, h.at])
  );

  return (
    <div className="hp-wrap max-w-3xl py-12">

      <span className="hp-pill">
        <i />লাইভ ট্র্যাকিং
      </span>

      <h1 className="hp-h1 mt-3">
        অর্ডার <span className="hp-brush hp-grad">ট্র্যাক</span> করুন
      </h1>

      <form
        onSubmit={go}
        className="hp-card mt-6 grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto]"
      >
        <input
          required
          className="hp-in"
          placeholder="অর্ডার নম্বর (BPL-XXXX)"
          value={no}
          onChange={e => setNo(e.target.value)}
        />

        <input
          required
          className="hp-in"
          placeholder="অর্ডারে দেওয়া মোবাইল নম্বর"
          value={ph}
          onChange={e => setPh(e.target.value)}
        />

        <button
          className="hp-btn hp-btn-pri justify-center"
          disabled={busy}
        >
          {busy ? 'খোঁজা হচ্ছে…' : '🔍 খুঁজুন'}
        </button>
      </form>

      {err && (
        <p className="hp-row mt-4 rounded-xl bg-[#fff5f6] p-3 hp-red">
          {err}
        </p>
      )}

      {o && (
        <Rv className="in">
          <div className="hp-card mt-6 p-6">

            <div className="flex flex-wrap items-center justify-between gap-2">

              <div>
                <b className="text-xl">{o.orderNo}</b>
                <div className="text-sm hp-mut">
                  {fmt(o.createdAt)}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-extrabold hp-grad">
                  {tk2(o.total)}
                </div>

                {o.paid !== undefined && (
                  <span className={'hp-cat ' + (
                    o.paid ? '!bg-[#f0fdf4] !text-green-700' : ''
                  )}>
                    {o.paid ? 'পেমেন্ট সম্পন্ন' : 'পেমেন্ট বাকি'}
                  </span>
                )}
              </div>

            </div>

            <ul className="mt-3 space-y-1 text-sm hp-mut">
              {o.items.map((i, k) => (
                <li key={k}>
                  - {i.title} × {i.qty}
                </li>
              ))}
            </ul>

            {(o.discount > 0 || o.delivery > 0) && (
              <p className="mt-2 text-xs hp-mut">
                {o.discount > 0 && `ছাড় ${tk2(o.discount)} `}
                {o.delivery > 0 && `· ডেলিভারি ${tk2(o.delivery)}`}
              </p>
            )}

            {o.status === 'Cancelled' ?

              <p className="mt-5 rounded-xl bg-[#fff5f6] p-4 font-bold hp-red">
                অর্ডারটি বাতিল হয়েছে।
              </p>

              :

              <div className="hp-tl mt-8">

                <div
                  className="fill"
                  style={{ width: w + '%' }}
                />

                {STEPS.map((s, i) => (
                  <div
                    key={s}
                    className={
                      'n' +
                      (i < idx ? ' done' : '') +
                      (i === idx ? ' cur done' : '')
                    }
                  >
                    <i>{ICO[s]}</i>

                    <div>
                      {BN[s]}

                      {hist[s] && (
                        <div className="text-[10px] font-normal hp-mut">
                          {fmt(hist[s])}
                        </div>
                      )}
                    </div>

                  </div>
                ))}

              </div>

            }

          </div>
        </Rv>
      )}

    </div>
  );
}


// ==============================
// COUNT UP ANIMATION
// ==============================

function Count({ to, suffix = '' }) {

  const r = useRef();
  const [v, setV] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;

      io.disconnect();

      const t0 = performance.now();

      const tick = t => {
        const k = Math.min(1, (t - t0) / 1400);

        setV(Math.round(
          to * (1 - Math.pow(1 - k, 3))
        ));

        if (k < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);

    }, { threshold: .4 });

    io.observe(r.current);

    return () => io.disconnect();

  }, [to]);

  return (
    <b ref={r} className="hp-grad">
      {v.toLocaleString('bn-BD')}{suffix}
    </b>
  );
}


// ==============================
// ABOUT / INFO PAGE
// ==============================

export function About() {
  const s = useSettings();

  const how = [
    ['১', 'ডিজাইন দিন', 'ফাইল আপলোড করুন বা আমাদের ডিজাইনারকে বলুন।'],
    ['২', 'কনফার্ম করুন', 'আমরা ফোনে দাম ও সময় নিশ্চিত করব।'],
    ['৩', 'প্রিন্ট ও কোয়ালিটি চেক', 'মানসম্মত ম্যাটেরিয়ালে যত্ন নিয়ে প্রিন্ট।'],
    ['৪', 'ডেলিভারি', 'নির্ধারিত সময়ে হাতে পৌঁছে দেব।']
  ];

  const [on, setOn] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setOn(x => (x + 1) % 4);
    }, 4000);

    return () => clearInterval(t);
  }, []);

  const stats = [
    [500, '+', 'সন্তুষ্ট ক্লায়েন্ট'],
    [2000, '+', 'সম্পন্ন অর্ডার'],
    [20, '+', 'সেবা ক্যাটেগরি'],
    [24, 'ঘণ্টা', 'দ্রুততম ডেলিভারি']
  ];

  const servicesList = [
    { no: '০১', title: 'কাপড়ের ব্যানার', desc: 'ময়মনসিংহে আমরাই প্রথম স্বল্প খরচে নিজস্ব মেশিনে কাপড়ে ব্যানার প্রিন্ট দিচ্ছি। ১০০% নিখুঁত কোয়ালিটি।' },
    { no: '০২', title: 'ডিজিটাল ব্যানার', desc: 'উন্নত প্রযুক্তির সাহায্যে নিখুঁত ও আকর্ষণীয় ডিজিটাল ব্যানার প্রিন্ট।' },
    { no: '০৩', title: 'সাইনবোর্ড', desc: 'আপনার ব্যবসা প্রতিষ্ঠান বা শোরুমের জন্য মানসম্মত ও টেকসই সাইনবোর্ড।' },
    { no: '০৪', title: 'ফেস্টুন ব্যানার', desc: 'যেকোনো প্রচার-প্রচারণা বা রাজনৈতিক ও সামাজিক ইভেন্টের জন্য ফেস্টুন।' },
    { no: '০৫', title: 'পিভিসি প্রিন্ট', desc: 'দীর্ঘস্থায়ী ও রোদ-বৃষ্টি প্রতিরোধী পিভিসি প্রিন্ট সেবা।' },
    { no: '০৬', title: 'স্টিকার / ভিনাইল', desc: 'গ্লাস ব্রান্ডিং, প্রোডাক্ট লেবেল ও কাটিং স্টিকার প্রিন্ট।' },
    { no: '০৭', title: 'প্যানাফ্লেক্স', desc: 'উজ্জ্বল রঙের আকর্ষণীয় প্যানাফ্লেক্স ব্যানার তৈরি।' },
    { no: '০৮', title: 'ভিজিটিং কার্ড', desc: 'প্রফেশনাল ও প্রিমিয়াম কোয়ালিটির ভিজিটিং কার্ড।' },
    { no: '০৯', title: 'টি-শার্ট প্রিন্ট', desc: 'কর্পোরেট ইভেন্ট, টিম বা পার্সোনাল ব্যবহারের জন্য কাস্টমাইজড টি-শার্ট প্রিন্ট।' },
    { no: '১০', title: 'ক্রেস্ট প্রিন্ট', desc: 'সম্মাননা স্মারক, ক্রেস্ট ও কাঠের বক্সসহ আকর্ষণীয় গিফট আইটেম।' },
    { no: '১১', title: 'মগ প্রিন্ট', desc: 'প্রিয়জনের ছবি বা লোগো দিয়ে আকর্ষণীয় কাস্টমাইজড মগ প্রিন্ট।' },
    { no: '১২', title: 'ম্যাজিক মগ প্রিন্ট', desc: 'গরম পানি ঢাললে ছবি ভেসে ওঠার চমৎকার ম্যাজিক মগ।' },
    { no: '১৩', title: 'ক্যাপ প্রিন্ট', desc: 'ব্র্যান্ডিং ও প্রমোশনের জন্য প্রিমিয়াম ক্যাপ প্রিন্টিং।' },
    { no: '১৪', title: 'জার্সি প্রিন্ট', desc: 'স্পোর্টস টুর্নামেন্ট ও ক্লাবের জন্য আকর্ষণীয় জার্সি প্রিন্ট।' },
    { no: '১৫', title: 'প্লাস্টিক আইডি কার্ড প্রিন্ট', desc: 'স্কুল, কলেজ ও অফিসের জন্য টেকসই পিভিসি আইডি কার্ড।' },
    { no: '১৬', title: 'কাঠ ও সিরামিক প্রিন্ট', desc: 'আধুনিক মেশিনে কাঠ ও সিরামিক পণ্যের ওপর নিখুঁত প্রিন্ট।' },
    { no: '১৭', title: 'টাইলস শো-পিস', desc: 'ইনটেরিয়র ডেকোরেশন ও শো-পিসের জন্য টাইলস প্রিন্ট।' },
    { no: '১৮', title: 'ফটোক্রোম প্রিন্ট', desc: 'উজ্জ্বল ও জীবন্ত কালারফুল ফটো প্রিন্ট।' },
    { no: '১৯', title: 'কালার পোস্টার', desc: 'বিজ্ঞাপন ও প্রচারণার জন্য আকর্ষণীয় হাই-কোয়ালিটি পোস্টার।' },
    { no: '২০', title: 'ক্যাশ মেমো', desc: 'ব্যবসা পরিচালনার জন্য কাস্টমাইজড ক্যাশ মেমো ও বিল বুক প্রিন্ট।' }
  ];

  return (
    <div className="hp-wrap py-12">

      <div className="hp-hero text-center">

        <span className="hp-pill">
          <i />আমাদের সেবা ও পরিচিতি
        </span>

        <h1 className="hp-h1 mt-4">
          <span className="hp-brush hp-grad">
            {s.siteName}
          </span> সম্পর্কে
        </h1>

        <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed hp-mut">
          <b>{s.siteName}</b> একটি আধুনিক ও নির্ভরযোগ্য প্রিন্টিং প্রতিষ্ঠান। আমরা কাপড়ের ব্যানার, ডিজিটাল ব্যানার, সাইনবোর্ড, ফেস্টুন ব্যানার, পিভিসি প্রিন্ট, স্টিকার ও ভিনাইল, প্যানাফ্লেক্স, ভিজিটিং কার্ড, টি-শার্ট, ক্রেস্ট, সাধারণ ও ম্যাজিক মগ, ক্যাপ, জার্সি, প্লাস্টিক আইডি কার্ড, কাঠ ও সিরামিক প্রিন্ট, টাইলস শো-পিস, ফটোক্রোম প্রিন্ট, কালার পোস্টার এবং ক্যাশ মেমোসহ অফসেট ও ডিজিটাল প্রিন্টিংয়ের সকল সেবা প্রদান করে থাকি। ময়মনসিংহে আমরাই প্রথম স্বল্প খরচে নিজস্ব আধুনিক মেশিনে কাপড়ে ১০০% নিখুঁত কোয়ালিটিতে ব্যানার প্রিন্ট দিচ্ছি।
        </p>

        <p className="mx-auto mt-3 max-w-2xl font-medium text-[#4c3fa3]">
          আপনার ডিজাইন ফাইল প্রস্তুত থাকলে সহজেই অর্ডার করুন; আর ডিজাইন না থাকলে আমাদের দক্ষ ডিজাইনার টিম আপনাকে পূর্ণ সহযোগিতা করবে।
        </p>

      </div>


      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">

        {stats.map(([n, sVal, l], i) => (
          <Rv key={l} d={i * 90}>
            <div className="hp-card hp-stat">
              <Count to={n} suffix={sVal} />
              <span className="text-sm hp-mut">{l}</span>
            </div>
          </Rv>
        ))}

      </div>


      {/* আমাদের সেবাসমূহ সেকশন */}
      <h2 className="mt-14 text-center text-3xl font-extrabold">
        আমাদের <span className="hp-grad">সকল সেবাসমূহ</span>
      </h2>
      <p className="text-center text-sm hp-mut mt-2 mb-8">যাবতীয় ডিজিটাল ও অফসেট প্রিন্টিং কাজ অত্যন্ত যত্নসহকারে করা হয়</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {servicesList.map((srv, i) => (
          <Rv key={srv.title} d={i * 40}>
            <div className="hp-card p-5 h-full flex flex-col justify-between border border-[#eee9fa]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#f1ebff] text-[#4c3fa3]">
                    {srv.no}
                  </span>
                  <span className="text-lg">🖨️</span>
                </div>
                <h3 className="mt-3 font-extrabold text-lg text-[#16142b]">
                  {srv.title}
                </h3>
                <p className="mt-2 text-sm hp-mut leading-relaxed">
                  {srv.desc}
                </p>
              </div>
            </div>
          </Rv>
        ))}
      </div>


      <div className="mt-12 grid gap-4 sm:grid-cols-3">

        {[
          ['🧱', 'মানসম্মত ম্যাটেরিয়াল'],
          ['⏱', 'নির্ধারিত সময়ে ডেলিভারি'],
          ['🎨', 'ডিজাইন সহায়তা']
        ].map(([ic, t], i) => (
          <Rv key={t} d={i * 100}>
            <div className="hp-card p-6 text-center">

              <div
                className="hp-float text-4xl"
                style={{ animationDelay: -i + 's' }}
              >
                {ic}
              </div>

              <div className="mt-3 font-extrabold">
                {t}
              </div>

            </div>
          </Rv>
        ))}

      </div>


      <h2 className="mt-14 text-center text-2xl font-extrabold">
        কীভাবে <span className="hp-grad">কাজ করি</span>
      </h2>

      <div className="mx-auto mt-6 grid max-w-2xl gap-3">

        {how.map(([n, t, d], i) => (
          <button
            key={n}
            onClick={() => setOn(i)}
            className={'hp-step' + (on === i ? ' on' : '')}
          >

            <b className="n">{n}</b>

            <span>
              <b className="block">{t}</b>

              <span className="text-sm hp-mut">
                {d}
              </span>

              {on === i && (
                <div className="hp-bar mt-2" key={on}>
                  <i />
                </div>
              )}

            </span>

          </button>
        ))}

      </div>

    </div>
  );
}


// ==============================
// CONTACT PAGE
// ==============================

export function Contact() {
  const s = useSettings();

  const [f, setF] = useState({
    name: '',
    phone: '',
    message: ''
  });

  const [st, setSt] = useState('');
  const [busy, setBusy] = useState(false);

  const go = async e => {
    e.preventDefault();

    setSt('');
    setBusy(true);

    try {
      await api('/api/inquiries', {
        method: 'POST',
        body: f
      });

      setSt('ok');

      setF({
        name: '',
        phone: '',
        message: ''
      });

    } catch (x) {
      setSt(x.message);
    }

    setBusy(false);
  };


  const rows = [
    ['📍', s.address],
    ['📞', s.phone],
    ['✉', s.email],
    ['🕘', s.hours]
  ];


  return (
    <div className="hp-wrap contact-page grid gap-10 py-12 md:grid-cols-2">

      {/* CONTACT INFORMATION */}

      <div>

        <span className="hp-pill">
          <i />আমরা আছি আপনার পাশে
        </span>

        <h1 className="hp-h1 mt-3">
          <span className="hp-brush hp-grad">
            যোগাযোগ
          </span>
        </h1>


        <div className="mt-6 space-y-3">

          {rows.map(([ic, t], i) => (
            <Rv key={ic} d={i * 80}>

              <div className="hp-card contact-info-card">

                <span className="hp-ico contact-info-icon">
                  {ic}
                </span>

                <span className="contact-info-text">
                  {t}
                </span>

              </div>

            </Rv>
          ))}

        </div>


        <a
          className="hp-btn hp-btn-wa mt-5"
          href={wa(s)}
          target="_blank"
          rel="noreferrer"
        >
          💬 WhatsApp এ মেসেজ
        </a>

      </div>


      {/* CONTACT FORM */}

      <Rv d={100}>

        <form
          onSubmit={go}
          className="hp-card space-y-3 p-6"
        >

          <h2 className="text-xl font-extrabold">
            মেসেজ পাঠান
          </h2>

          <input
            required
            className="hp-in"
            placeholder="আপনার নাম"
            value={f.name}
            onChange={e => setF({ ...f, name: e.target.value })}
          />

          <input
            required
            className="hp-in"
            placeholder="মোবাইল নম্বর"
            value={f.phone}
            onChange={e => setF({ ...f, phone: e.target.value })}
          />

          <textarea
            required
            rows="4"
            className="hp-in"
            placeholder="কী ধরনের প্রিন্ট করাতে চান?"
            value={f.message}
            onChange={e => setF({ ...f, message: e.target.value })}
          />

          <button
            className="hp-btn hp-btn-pri w-full justify-center"
            disabled={busy}
          >
            {busy ? 'পাঠানো হচ্ছে…' : 'মেসেজ পাঠান →'}
          </button>

          {st === 'ok' ?
            <p className="hp-row rounded-xl bg-[#f0fdf4] p-3 text-green-700">
              ✔ মেসেজ পাঠানো হয়েছে। শীঘ্রই যোগাযোগ করব।
            </p>
            :
            st && <p className="hp-red">{st}</p>
          }

        </form>

      </Rv>

    </div>
  );
}