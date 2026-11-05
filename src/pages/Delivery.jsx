import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Rv } from '../components/Card.jsx';
import '../home.css';

/* ================= EDIT HERE (dam / niyom change korte hole shudhu ekhane) ================= */
const AREA = 'জামালপুর পৌরসভা';
const FREE_ABOVE = 1500; // ei taka ba tar beshi hole delivery free
const tk = n => '৳' + Number(n || 0).toLocaleString('en-IN');

const RATES = [
  { ic: '📦', t: 'ছোট পার্সেল', d: 'মগ, স্টিকার, কার্ড, ছোট গিফট আইটেম', w: '৫ কেজি পর্যন্ত', p: 40 },
  { ic: '🛍️', t: 'মাঝারি পার্সেল', d: 'টি-শার্ট, ক্রেস্ট বা একাধিক আইটেম', w: '৫ – ১৫ কেজি', p: 70 },
  { ic: '🪧', t: 'বড় / ব্যানার', d: 'ব্যানার, ফেস্টুন, বড় বক্স', w: '১৫ কেজির বেশি বা বড় সাইজ', p: 120 }
];

const TIMES = [
  { ic: '⚡', t: 'তৈরি পণ্য', d: 'অর্ডার কনফার্ম হওয়ার পর অফিস সময়ে', v: '৪ – ১২ ঘণ্টা' },
  { ic: '🎨', t: 'কাস্টম প্রিন্ট', d: 'ডিজাইন অনুমোদনের পর প্রিন্ট ও ডেলিভারি', v: '১ – ৩ কার্যদিবস' },
  { ic: '🏪', t: 'বাল্ক / কর্পোরেট', d: 'পরিমাণ ও ডিজাইন অনুযায়ী কোটেশনে জানানো হবে', v: 'কোটেশনে নির্ধারিত' }
];

const FLOW = [
  { ic: '🛍️', t: 'অর্ডার দিন', d: 'পণ্য বেছে ঠিকানা সহ অর্ডার করুন।' },
  { ic: '📞', t: 'কনফার্মেশন কল', d: 'আমরা কল করে ঠিকানা ও দাম নিশ্চিত করব।' },
  { ic: '🖨️', t: 'প্রিন্ট ও প্যাকিং', d: 'অনুমোদিত ডিজাইনে প্রিন্ট করে প্যাক করা হবে।' },
  { ic: '🚚', t: 'হোম ডেলিভারি', d: 'রাইডার ফোন করে আপনার ঠিকানায় পৌঁছে দেবে।' }
];

const RULES = [
  ['📍', 'ডেলিভারি এলাকা', `শুধু ${AREA} এর সীমানার ভেতরের ঠিকানায় হোম ডেলিভারি দেওয়া হয়। পৌরসভার বাইরে ডেলিভারি নেই।`],
  ['🏪', 'দোকান থেকে সংগ্রহ', 'পৌরসভার বাইরের গ্রাহকরা চাইলে অর্ডার করে দোকান থেকে সরাসরি সংগ্রহ করতে পারবেন।'],
  ['🏠', 'পূর্ণ ও সঠিক ঠিকানা', 'বাসা/দোকান নম্বর, রাস্তা, এলাকা বা বিখ্যাত কোনো স্থানের নাম দিন। রিসিভারের চালু ফোন নম্বর আবশ্যক।'],
  ['💵', 'ক্যাশ অন ডেলিভারি', 'পৌরসভার ভেতরে ক্যাশ অন ডেলিভারি পাওয়া যায়, কোনো অতিরিক্ত COD চার্জ নেই।'],
  ['📲', 'কাস্টম প্রিন্টে অগ্রিম', 'কাস্টম ডিজাইনের অর্ডারে নিশ্চিত করতে আংশিক অগ্রিম (বিকাশ/নগদ) নেওয়া হতে পারে।'],
  ['🎁', 'ফ্রি ডেলিভারি', `${tk(FREE_ABOVE)} বা তার বেশি মূল্যের অর্ডারে ডেলিভারি চার্জ নেই।`],
  ['🔁', 'এক বারের চার্জ', 'রিসিভার ফোন না ধরলে বা ডেলিভারি নিতে অস্বীকার করলে একবারের ডেলিভারি চার্জ প্রযোজ্য হবে।'],
  ['🔍', 'রিসিভ করার সময় দেখে নিন', 'রাইডারের সামনে প্যাকেট খুলে পণ্য দেখে নিন। সমস্যা থাকলে সাথে সাথে জানান।'],
  ['🛡️', 'ত্রুটি হলে সমাধান', 'প্রিন্ট ভুল বা পণ্য নষ্ট থাকলে ২৪ ঘণ্টার মধ্যে ছবি সহ জানালে পুনঃপ্রিন্ট বা বদলে দেওয়া হবে। পছন্দ না হওয়ার কারণে কাস্টম প্রিন্ট ফেরত নেওয়া হয় না।']
];

const FAQ = [
  ['আমি পৌরসভার বাইরে থাকি, অর্ডার করা যাবে?', 'হ্যাঁ, অর্ডার করতে পারবেন, তবে হোম ডেলিভারি নেই। দোকান থেকে নিজে সংগ্রহ করতে হবে।'],
  ['জরুরি ডেলিভারি পাওয়া যাবে?', 'অফিস সময়ে কল করে জানালে সম্ভব হলে একই দিনে এক্সপ্রেস ডেলিভারি দেওয়া হয়।'],
  ['ডেলিভারি চার্জ কখন জানব?', 'চেকআউটে ও কনফার্মেশন কলে ডেলিভারি চার্জ জানিয়ে দেওয়া হবে।']
];
/* ============================================================================================ */

const Pill = ({ children }) => <span className="hp-pill"><i />{children}</span>;

export default function Delivery() {
  const [openF, setOpenF] = useState(0);

  return (
    <div className="hp">
      {/* HERO */}
      <section>
        <div className="hp-wrap grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
          <div>
            <Pill>🚚 ডেলিভারি তথ্য</Pill>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.2] md:text-6xl">
              {AREA}র ভেতরে<br />
              <span className="hp-brush hp-grad">দ্রুত হোম ডেলিভারি</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#16142b]/70">
              প্রিন্ট শেষ হলেই রাইডার আপনার ঠিকানায় পৌঁছে দেবে। চার্জ, সময় ও নিয়ম সব এক জায়গায় দেখে নিন।
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/services" className="hp-btn hp-btn-pri">অর্ডার করুন →</Link>
              <Link to="/contact" className="hp-btn hp-btn-out">কোটেশন নিন</Link>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="hp-orbit">
              <div className="hp-gift">🚚</div>
              {[['📦', '20%', '12%', ''], ['🏠', '14%', '70%', 'd1'], ['📍', '72%', '16%', 'd2'], ['⏱️', '74%', '72%', 'd3']].map(([e, t, l, d], i) => (
                <span key={i} className={'hp-ico hp-float ' + d} style={{ top: t, left: l }}>{e}</span>
              ))}
              <div className="hp-chip hp-float" style={{ top: '10%', left: '-6%' }}>
                <span>📍</span>
                <div><b className="block text-sm">{AREA}</b><small className="text-[#16142b]/55">ডেলিভারি এলাকা</small></div>
              </div>
              <div className="hp-chip hp-float d2" style={{ bottom: '6%', right: '-4%' }}>
                <span>💵</span>
                <div><b className="block text-sm">ক্যাশ অন ডেলিভারি</b><small className="text-[#16142b]/55">অতিরিক্ত চার্জ নেই</small></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHARGES */}
      <section className="py-12">
        <div className="hp-wrap">
          <Rv>
            <Pill>ডেলিভারি চার্জ</Pill>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">ওজন ও সাইজ অনুযায়ী <span className="hp-grad">চার্জ</span></h2>
            <p className="mt-2 text-[#16142b]/65">{AREA}র ভেতরে সব ঠিকানার জন্য একই চার্জ।</p>
          </Rv>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {RATES.map((r, i) => (
              <Rv key={i} delay={i * 90}>
                <div className="hp-card h-full p-7">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1ebff] text-2xl">{r.ic}</span>
                  <h3 className="mt-5 text-xl font-extrabold">{r.t}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#16142b]/60">{r.d}</p>
                  <div className="mt-4 text-4xl font-extrabold text-[#4c3fa3]">{tk(r.p)}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#16142b]/50">{r.w}</div>
                </div>
              </Rv>
            ))}
          </div>
          <Rv delay={100}>
            <div className="hp-card mt-5 flex flex-wrap items-center gap-3 !rounded-2xl p-5">
              <span className="text-2xl">🎁</span>
              <b>{tk(FREE_ABOVE)} বা তার বেশি অর্ডারে ডেলিভারি ফ্রি!</b>
            </div>
          </Rv>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-12">
        <div className="hp-wrap">
          <Rv>
            <Pill>ডেলিভারি সময়</Pill>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">কতক্ষণে <span className="hp-grad">পাবেন?</span></h2>
          </Rv>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {TIMES.map((x, i) => (
              <Rv key={i} delay={i * 90}>
                <div className="hp-card h-full p-7">
                  <div className="hp-float text-4xl">{x.ic}</div>
                  <h3 className="mt-4 text-xl font-extrabold">{x.t}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#16142b]/60">{x.d}</p>
                  <div className="mt-4 inline-block rounded-full bg-[#f1ebff] px-4 py-1.5 text-sm font-extrabold text-[#4c3fa3]">{x.v}</div>
                </div>
              </Rv>
            ))}
          </div>
        </div>
      </section>

      {/* FLOW */}
      <section className="py-12">
        <div className="hp-wrap">
          <Rv className="text-center">
            <Pill>কীভাবে হয়</Pill>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">অর্ডার থেকে <span className="hp-grad">দরজা পর্যন্ত</span></h2>
          </Rv>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((s, i) => (
              <Rv key={i} delay={i * 90}>
                <div className="hp-card h-full p-6 text-center">
                  <b className="text-xs font-bold tracking-widest text-[#16142b]/50">ধাপ ০{i + 1}</b>
                  <div className="hp-float mt-3 text-5xl">{s.ic}</div>
                  <h3 className="mt-4 text-lg font-extrabold">{s.t}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#16142b]/60">{s.d}</p>
                </div>
              </Rv>
            ))}
          </div>
        </div>
      </section>

      {/* RULES */}
      <section className="py-12">
        <div className="hp-wrap">
          <Rv>
            <Pill>নিয়ম ও শর্ত</Pill>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">ডেলিভারির <span className="hp-grad">নিয়মাবলি</span></h2>
          </Rv>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {RULES.map(([ic, t, d], i) => (
              <Rv key={i} delay={(i % 2) * 80}>
                <div className="hp-card flex h-full gap-4 !rounded-2xl p-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f1ebff] text-xl">{ic}</span>
                  <div>
                    <b className="block text-lg">{t}</b>
                    <span className="mt-1 block text-sm leading-6 text-[#16142b]/65">{d}</span>
                  </div>
                </div>
              </Rv>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ + CTA */}
      <section className="py-12">
        <div className="hp-wrap">
          <Rv className="mx-auto max-w-3xl">
            <h3 className="mb-4 text-center text-2xl font-extrabold">ডেলিভারি নিয়ে প্রশ্ন</h3>
            {FAQ.map(([q, a], i) => (
              <div key={i} className="hp-card mb-3 !transform-none px-5 py-4">
                <button className="flex w-full justify-between text-left font-bold" onClick={() => setOpenF(openF === i ? -1 : i)}>
                  {q}<span>{openF === i ? '−' : '+'}</span>
                </button>
                {openF === i && <p className="mt-2 leading-7 text-[#16142b]/70">{a}</p>}
              </div>
            ))}
          </Rv>

          <Rv delay={100}>
            <div className="hp-card mt-10 p-8 text-center md:p-10">
              <h3 className="text-2xl font-extrabold md:text-3xl">আর কিছু জানার আছে?</h3>
              <p className="mt-2 text-[#16142b]/65">আমাদের টিম অফিস সময়ে আপনার প্রশ্নের উত্তর দিতে প্রস্তুত।</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to="/contact" className="hp-btn hp-btn-pri">যোগাযোগ করুন →</Link>
                <Link to="/services" className="hp-btn hp-btn-out">পণ্য দেখুন</Link>
              </div>
            </div>
          </Rv>
        </div>
      </section>
    </div>
  );
}