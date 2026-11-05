import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {api,img} from '../api.js';
import Card from '../components/Card.jsx';
import {Rv,Count} from '../components/Reveal.jsx';
import '../home.css';

/* ---------- helpers ---------- */
const tk=n=>'৳'+Number(n||0).toLocaleString('en-IN');

// chhobi load na hole fallback dekhay
function Pic({src,alt='',label='',color='#4c3fa3',fit='cover',cls=''}){
  const [bad,setBad]=useState(false);
  useEffect(()=>setBad(false),[src]);
  if(!src||bad)return <div style={{width:'100%',height:'100%',minHeight:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,fontWeight:800,color:'#fff',background:`linear-gradient(135deg,${color},#b46a9a)`}}>{label}</div>;
  // lazy loading remove kora hoyeche jate druto scroll e chhobi late na ashe
  return <img src={img(src)} alt={alt} loading="eager" decoding="async" className={cls} style={{objectFit:fit}} onError={e=>{console.warn('Image load failed:',e.currentTarget.src);setBad(true)}}/>;
}

// typing text
function Typing({text}){
  const [n,setN]=useState(0);
  useEffect(()=>{setN(0);const t=setInterval(()=>setN(x=>{if(x>=text.length){clearInterval(t);return x}return x+1}),70);return()=>clearInterval(t)},[text]);
  return <span>{text.slice(0,n)}<span className="hp-caret"/></span>;
}
const Pill=({children})=><span className="hp-pill"><i/>{children}</span>;

/* fallback content (DB te data na thakle) */
const TRUST=['পরিষ্কার ও নিখুঁত ছাপা','জামালপুর পৌরসভায় হোম ডেলিভারি','দ্রুত ডেলিভারি','ফ্রি ডিজাইন পরামর্শ','বাজেট ফ্রেন্ডলি দাম','বাল্ক অর্ডারে ছাড়','ক্যাশ অন ডেলিভারি'];
const STEPS=[
  {t:'বেছে নিন, ক্লিক করুন',d:'সার্ভিস ও পণ্য বেছে সাইজ বা পরিমাণ দিন।',ic:'🛍️',s:'অর্ডার তৈরি হচ্ছে'},
  {t:'দ্রুত যোগাযোগ',d:'অফিস সময়ে লিখলে প্রায় একই দিনে আমরা কল করব।',ic:'📞',s:'আপনার সাথে কথা হচ্ছে'},
  {t:'ডিজাইন ফাইনাল ও অনুমোদন',d:'ডিজাইন দেখে অনুমোদন দিলেই প্রিন্ট শুরু।',ic:'🖨️',s:'প্রিন্টিং চলছে'},
  {t:'ডেলিভারি বা সংগ্রহ',d:'প্রিন্ট শেষে জামালপুর পৌরসভার ভেতরে হোম ডেলিভারি বা দোকান থেকে সংগ্রহ।',ic:'🚚',s:'ডেলিভারির পথে'}];
const ADV=[
  {ic:'✨',t:'বাছাই করা কালেকশন',d:'শুধু পণ্য নয়, আপনার ব্র্যান্ডের জন্য ভালো মানের প্রিন্ট আইটেম।',to:'/services',l:'সব সার্ভিস দেখুন'},
  {ic:'🎨',t:'প্রিমিয়াম প্রিন্টিং',d:'স্ক্রিন প্রিন্ট, সাবলিমেশন, এমব্রয়ডারি – প্রতিটি লোগো থাকবে ঝকঝকে।',to:'/services',l:'প্রিন্টিং পদ্ধতি'},
  {ic:'🚚',t:'জামালপুর পৌরসভায় হোম ডেলিভারি',d:'পৌরসভার ভেতরের ঠিকানায় আমরা পৌঁছে দেব। চার্জ, সময় ও নিয়ম এক নজরে দেখে নিন।',to:'/info',l:'ডেলিভারি তথ্য'},
  {ic:'🏪',t:'বাল্ক ও কর্পোরেট অর্ডার',d:'অফিস, ইভেন্ট ও দোকানের জন্য বড় অর্ডারে আলাদা দাম ও ডেডিকেটেড সাপোর্ট।',to:'/contact',l:'কোটেশন নিন'}];

export default function Home(){
  const [cats,setCats]=useState([]),[feat,setFeat]=useState([]),[all,setAll]=useState([]);
  const [ban,setBan]=useState([]),[tms,setTms]=useState([]),[gal,setGal]=useState([]),[faq,setFaq]=useState([]);
  const [step,setStep]=useState(0),[tm,setTm]=useState(0),[openF,setOpenF]=useState(0);
  const [f,setF]=useState({name:'',phone:'',message:''}),[sent,setSent]=useState('');
  const ok=fn=>fn.catch(()=>[]);

  useEffect(()=>{
    api('/api/categories').then(d=>Array.isArray(d)&&setCats(d)).catch(()=>{});
    api('/api/products?featured=1').then(d=>Array.isArray(d)&&setFeat(d)).catch(()=>{});
    api('/api/products').then(d=>Array.isArray(d)&&setAll(d)).catch(()=>{});
    ok(api('/api/banners')).then(d=>Array.isArray(d)&&setBan(d));
    ok(api('/api/testimonials')).then(d=>Array.isArray(d)&&setTms(d));
    ok(api('/api/gallery')).then(d=>Array.isArray(d)&&setGal(d));
    ok(api('/api/faqs')).then(d=>Array.isArray(d)&&setFaq(d));
  },[]);
  // steps autoplay
  useEffect(()=>{const t=setTimeout(()=>setStep(s=>(s+1)%4),4000);return()=>clearTimeout(t)},[step]);
  // testimonial autoplay
  useEffect(()=>{if(tms.length<2)return;const t=setInterval(()=>setTm(x=>(x+1)%tms.length),5000);return()=>clearInterval(t)},[tms.length]);

  const featured=(feat.length?feat:all).slice(0,8);
  const more=all.filter(p=>!featured.find(x=>x._id===p._id)).slice(0,4);
  const festive=ban[0];
  const S=STEPS[step];
  const submit=async e=>{e.preventDefault();setSent('...');
    try{await api('/api/inquiries',{method:'POST',body:f});setSent('ধন্যবাদ! আমরা শীঘ্রই যোগাযোগ করব।');setF({name:'',phone:'',message:''})}
    catch(x){setSent(x.message||'পাঠানো যায়নি, আবার চেষ্টা করুন বা কল করুন।')}};

  return <div className="hp">

  {/* 1. HERO */}
  <section><div className="hp-wrap grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
    <div>
      <Pill>গ্রাহকদের পছন্দের প্রিন্টিং শপ</Pill>
      <h1 className="mt-6 text-5xl font-extrabold leading-[1.15] md:text-7xl">
        প্রিন্টিং হোক<br/><span className="hp-brush hp-grad">সহজ ও নিখুঁত!</span></h1>
      <p className="mt-7 text-xl font-bold md:text-2xl"><Typing text="আমরা ডিজাইন করি। প্রিন্ট করি। পৌঁছে দিই।"/></p>
      <p className="mt-5 max-w-xl text-lg leading-8 text-[#16142b]/70">
        ব্যানার, মগ, স্টিকার, টি-শার্ট ও ক্রেস্ট – ডিজাইন ফাইল দিন বা আমাদের দিয়ে ডিজাইন করান। অর্ডার করুন অনলাইনে, নিন দ্রুত। বড় অর্ডারে থাকছে বিশেষ দাম।</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/services" className="hp-btn hp-btn-pri">অর্ডার করুন →</Link>
        <Link to="/contact" className="hp-btn hp-btn-out">কোটেশন নিন</Link>
        </div>
    </div>
    <div className="flex justify-center"><div className="hp-orbit">
      <div className="hp-gift">🎁</div>
      {[['🖨️','20%','12%',''],['🏷️','12%','46%','d1'],['👕','22%','76%','d2'],['☕','72%','18%','d3'],['📛','78%','56%','d4'],['🪧','68%','80%','d2'],['🖼️','10%','78%','d3']]
        .map(([e,t,l,d],i)=><span key={i} className={'hp-ico hp-float '+d} style={{top:t,left:l}}>{e}</span>)}
      <div className="hp-chip hp-float" style={{top:'14%',left:'-6%'}}><span>👤</span><div><b className="block text-sm">ডেডিকেটেড সাপোর্ট</b><small className="text-[#16142b]/55">অর্ডার ম্যানেজার</small></div></div>
      <div className="hp-chip hp-float d2" style={{top:'8%',right:'-8%'}}><span>🎨</span><div><b className="block text-sm">ফ্রি ডিজাইন</b><small className="text-[#16142b]/55">পরামর্শ</small></div></div>
      <div className="hp-chip hp-float d3" style={{bottom:'3%',right:'6%'}}><span>🚚</span><div><b className="block text-sm">দ্রুত ডেলিভারি</b><small className="text-[#16142b]/55">জামালপুর পৌরসভা</small></div></div>
    </div></div>
  </div></section>

  {/* 2. TRUST STRIP */}
  <section className="py-10"><div className="hp-wrap">
    <Rv className="text-center"><Pill>কেন আমরা</Pill>
      <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">শত শত গ্রাহকের <span className="hp-grad">আস্থার প্রিন্টিং ল্যাব</span></h2></Rv>
    <div className="hp-mq mt-8"><div className="hp-mq-in">{[...TRUST,...TRUST].map((t,i)=><span key={i} className="hp-tag">✔ {t}</span>)}</div></div>
  </div></section>

  {/* 3. CATEGORIES (stagger column onujayi, jate onek card thakleo late na hoy) */}
  <section className="py-12"><div className="hp-wrap">
    <Rv className="flex items-end justify-between"><div><Pill>আমাদের সার্ভিস</Pill><h2 className="mt-3 text-3xl font-extrabold md:text-4xl">ক্যাটাগরি অনুযায়ী বেছে নিন</h2></div>
      <Link to="/services" className="text-sm font-bold text-[#4c3fa3]">সব দেখুন →</Link></Rv>
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cats.map((c,i)=>{const col=c.color||'#4c3fa3';return <Rv key={c._id} delay={(i%3)*50}><Link to={'/services/'+c.slug} className="hp-card flex h-full gap-4 p-6" style={{background:`linear-gradient(135deg,${col}14,#fff 70%)`}}>
        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#eee9fa] bg-white text-2xl font-extrabold text-white" style={c.image?undefined:{background:col,border:'none'}}>
          {c.image?<Pic src={c.image} alt={c.name} fit="contain" color={col} label={c.icon||c.name?.[0]}/>:(c.icon||c.name?.[0])}</span>
        <span><b className="block text-xl">{c.name}</b><span className="mt-1 block text-[#16142b]/65">{c.description}</span><span className="mt-3 inline-block text-sm font-bold" style={{color:col}}>দেখুন →</span></span></Link></Rv>})}
    </div></div></section>

  {/* 4. FESTIVE / OFFER BANNER (Banner model) */}
  <section className="py-10"><div className="hp-wrap"><Rv>
    <div className="hp-fest">
      <div className="hp-lights">{Array.from({length:22}).map((_,i)=><span key={i}/>)}</div>
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <div className="flex flex-wrap gap-2"><span className="hp-pill">🔥 বিশেষ অফার</span><span className="hp-pill">🚚 জামালপুরে দ্রুত ডেলিভারি</span></div>
          <h2 className="mt-5 text-3xl font-extrabold md:text-4xl">{festive?.title||'অফিস ও ইভেন্টের জন্য কাস্টম প্রিন্ট'}<br/><span className="text-[#e5484d]">{festive?.subtitle||'বাল্ক অর্ডারে বিশেষ ছাড়'}</span></h2>
          <p className="mt-4 leading-7 text-[#16142b]/70">আপনার লোগো দিয়ে প্রিন্ট করা মগ, টি-শার্ট, ক্রেস্ট ও গিফট আইটেম – কর্মী, ক্লায়েন্ট ও পার্টনারদের জন্য।</p>
          <ul className="mt-4 space-y-2 text-sm text-[#16142b]/75"><li>⚡ জরুরি অর্ডারে এক্সপ্রেস ডেলিভারি পাওয়া যায়</li><li>🎁 কুপন কোড ব্যবহার করে ছাড় নিন চেকআউটে</li></ul>
          <div className="mt-6 flex flex-wrap gap-3"><Link to={festive?.link||'/services'} className="hp-btn hp-btn-pri">অফার দেখুন →</Link><Link to="/contact" className="hp-btn hp-btn-out">কোটেশন নিন</Link></div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {(feat.length?feat:all).slice(0,4).map(p=><Link key={p._id} to={'/product/'+(p.slug||p._id)} className="hp-card overflow-hidden">
            <div className="hp-img" style={{borderRadius:0}}><Pic src={p.image} alt={p.title} color={p.category?.color||'#6253a5'} label={p.title?.[0]}/></div>
            <div className="p-3"><b className="line-clamp-2 text-sm">{p.title}</b><div className="mt-1 text-sm font-extrabold text-[#4c3fa3]">{tk(p.price)}<small className="font-normal text-[#16142b]/50"> /{p.unit==='pcs'?'পিস':p.unit}</small></div></div></Link>)}
        </div>
      </div></div></Rv></div></section>

  {/* 5. BEST SELLERS */}
  {featured.length>0&&<section className="py-12"><div className="hp-wrap">
    <Rv className="flex items-end justify-between"><div><Pill>সবচেয়ে বেশি অর্ডার</Pill><h2 className="mt-3 text-3xl font-extrabold md:text-4xl">জনপ্রিয় প্রিন্ট</h2>
      <p className="mt-2 text-[#16142b]/65">আমাদের সবচেয়ে বেশি অর্ডার হওয়া পণ্য। দাম প্রতি ইউনিটে।</p></div>
      <Link to="/services" className="text-sm font-bold text-[#4c3fa3]">সব পণ্য →</Link></Rv>
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {featured.map((p,i)=><Rv key={p._id} delay={(i%4)*50}><div className="hp-card h-full overflow-hidden">
        <Link to={'/product/'+(p.slug||p._id)} className="block"><div className="hp-img"><Pic src={p.image} alt={p.title} color={p.category?.color||'#6253a5'} label={p.title?.[0]}/></div></Link>
        <div className="p-4"><small className="text-[11px] font-bold uppercase tracking-wider text-[#16142b]/50">{p.category?.name||''}</small>
          <b className="mt-1 block text-lg leading-snug">{p.title}</b>
          <div className="mt-2 text-xl font-extrabold">{tk(p.price)} <small className="text-xs font-medium text-[#16142b]/50">/{p.pricing==='area'?'বর্গফুট':(p.unit==='pcs'?'পিস':p.unit)}</small></div>
          {p.minQty>1&&<small className="text-xs text-[#16142b]/55">ন্যূনতম: {p.minQty}</small>}
          <Link to={'/product/'+(p.slug||p._id)} className="hp-btn hp-btn-out mt-3 w-full justify-center !py-2.5 text-xs uppercase tracking-wider">অর্ডার করুন</Link></div></div></Rv>)}
    </div></div></section>}

  {/* 6. MORE PRODUCTS */}
  {more.length>0&&<section className="py-10"><div className="hp-wrap">
    <Rv><Pill>আরও পণ্য</Pill><h2 className="mt-3 text-3xl font-extrabold md:text-4xl">আরও যা পাবেন</h2></Rv>
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{more.map((p,i)=><Rv key={p._id} delay={i*50}><Card p={p}/></Rv>)}</div></div></section>}

  {/* 7. STATS (real data theke) */}
  <section className="py-12"><div className="hp-wrap"><Rv>
    <div className="rounded-[28px] border border-[#eee9fa] bg-[#fbfaf7] p-6 md:p-10">
      <Pill>আমাদের পরিসংখ্যান</Pill>
      <div className="mt-4 grid gap-4 md:grid-cols-2"><h2 className="text-4xl font-extrabold md:text-5xl">ব্রাদার্স প্রিন্টিং ল্যাব<br/><span className="hp-grad">সংখ্যায়</span></h2>
        <p className="self-end text-[#16142b]/65">মানসম্মত প্রিন্ট ও সময়মতো ডেলিভারিই আমাদের পরিচয়।</p></div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[['🗂️',cats.length,'+','সার্ভিস ক্যাটাগরি','বিভিন্ন ধরনের প্রিন্টিং সার্ভিস এক জায়গায়।'],
          ['🖨️',all.length,'+','প্রিন্ট পণ্য','ব্যানার থেকে ক্রেস্ট – সব আপনার হাতের কাছে।'],
          ['⭐',tms.length,'+','গ্রাহকের মতামত','গ্রাহকদের সরাসরি অভিজ্ঞতা।'],
          ['📦',100,'%','ডিজাইন ফাইল সাপোর্ট','আপলোড করুন বা আমাদের দিয়ে ডিজাইন করান।']]
          .map(([ic,n,s,l,d],i)=><div key={i} className="hp-card p-6"><span className="text-2xl">{ic}</span>
            <div className="mt-4 text-4xl font-extrabold text-[#4c3fa3]"><Count to={n} suffix={s}/></div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#16142b]/55">{l}</div>
            <p className="mt-4 text-sm leading-6 text-[#16142b]/65">{d}</p></div>)}
      </div></div></Rv></div></section>

  {/* 8. HOW IT WORKS (autoplay) */}
  <section className="py-14"><div className="hp-wrap">
    <Rv><Pill>ব্রাদার্স প্রিন্টিং ল্যাব</Pill><h2 className="mt-3 text-3xl font-extrabold md:text-5xl">অর্ডার করা, <span className="hp-grad">একদম সহজ</span></h2>
      <p className="mt-3 max-w-2xl text-[#16142b]/65">ডিজাইন, প্রিন্ট আর ডেলিভারি – সব মিলিয়ে চার ধাপের ঝামেলাহীন অভিজ্ঞতা।</p></Rv>
    <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1fr_1.15fr]">
      <div className="space-y-3">{STEPS.map((x,i)=><button key={i} onClick={()=>setStep(i)} className={'hp-step '+(i===step?'on':'')}>
        <b className="n">{i+1}</b><span><small className="text-[10px] font-bold tracking-widest text-[#16142b]/50">ধাপ ০{i+1}</small>
        <b className="block text-lg">{x.ic} {x.t}</b><span className="text-sm text-[#16142b]/60">{x.d}</span></span></button>)}</div>
      <div className="hp-card p-6 md:p-8" key={step}>
        <div className="flex items-center justify-between"><span className="hp-pill">ধাপ {step+1} : {['অর্ডার','যোগাযোগ','ডিজাইন','লজিস্টিকস'][step]}</span><small className="font-semibold text-[#e5484d]">● লাইভ ডেমো</small></div>
        <h3 className="mt-5 text-3xl font-extrabold">{S.t}</h3><p className="mt-2 text-[#16142b]/65">{S.d}</p>
        <div className="mx-auto mt-6 max-w-md rounded-2xl border border-[#eee9fa] p-4 text-center">
          <div className="hp-float text-6xl">{S.ic}</div><div className="mt-2 text-xs font-bold uppercase tracking-wider text-[#e5484d]">{S.s}</div>
          <div className="mt-4 grid grid-cols-4 gap-2">{STEPS.map((_,i)=><div key={i} className="hp-bar">{i<step&&<i style={{animation:'none',width:'100%'}}/>}{i===step&&<i/>}</div>)}</div></div>
        <div className="mt-6 flex items-center justify-between border-t border-[#eee9fa] pt-4 text-sm"><small>ধাপ {step+1} / 4 &nbsp;<span className="hp-pill !py-1 !text-[9px]">অটোপ্লে চালু</span></small>
          <div className="flex gap-2"><button className="hp-btn hp-btn-out !py-2 text-xs" onClick={()=>setStep((step+3)%4)}>আগের ধাপ</button><button className="hp-btn hp-btn-pri !py-2 text-xs" onClick={()=>setStep((step+1)%4)}>পরের ধাপ →</button></div></div>
      </div></div></div></section>

  {/* 9. TESTIMONIALS / GALLERY */}
  {tms.length>0&&<section className="py-12"><div className="hp-wrap">
    <Rv className="flex items-end justify-between"><div><Pill>গ্রাহকদের কথা</Pill><h2 className="mt-3 text-3xl font-extrabold md:text-4xl">আস্থার <span className="hp-grad">প্রমাণ</span></h2></div>
      <div className="flex gap-2"><button className="hp-btn hp-btn-out !px-4 !py-2" onClick={()=>setTm((tm+tms.length-1)%tms.length)}>‹</button><button className="hp-btn hp-btn-out !px-4 !py-2" onClick={()=>setTm((tm+1)%tms.length)}>›</button></div></Rv>
    <div className="mt-8 overflow-hidden"><div className="flex gap-5 transition-transform duration-700" style={{transform:`translateX(calc(50% - 170px - ${tm*360}px))`}}>
      {tms.map((t,i)=><div key={t._id} className={'hp-tm '+(i===tm?'on':'')}>
        <div className="flex justify-between"><span className="text-amber-400">{'★'.repeat(t.rating||5)}</span><span className="text-5xl leading-none text-amber-300/70">”</span></div>
        <p className="mt-3 min-h-[110px] leading-7 text-[#16142b]/80">“{t.text}”</p>
        <div className="mt-4 flex items-center gap-3 border-t border-[#16142b]/10 pt-4">
          {t.image?<img src={img(t.image)} alt="" decoding="async" className="h-11 w-11 rounded-full object-cover"/>:<span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9e3ff] font-bold text-[#4c3fa3]">{(t.name||'?')[0]}</span>}
          <div><b className="block">{t.name}</b><small className="text-xs font-bold uppercase tracking-wide text-[#6b4fd8]">{t.role}</small></div></div></div>)}
    </div></div>
    <div className="mx-auto mt-6 flex max-w-xs items-center gap-3 text-xs font-bold"><span>{tm+1}</span><div className="hp-bar flex-1"><i style={{animation:'none',width:((tm+1)/tms.length*100)+'%',transition:'width .6s'}}/></div><span>{tms.length}</span></div>
  </div></section>}

  {gal.length>0&&<section className="py-10"><div className="hp-wrap"><Rv><Pill>আমাদের কাজ</Pill><h2 className="mt-3 text-3xl font-extrabold md:text-4xl">সাম্প্রতিক প্রিন্টের গ্যালারি</h2></Rv>
    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">{gal.slice(0,8).map((g,i)=><Rv key={g._id} delay={(i%4)*50}><div className="hp-card overflow-hidden"><div className="hp-img" style={{borderRadius:0}}><Pic src={g.image} alt={g.title||''} label="🖼️"/></div>{g.title&&<div className="p-3 text-sm font-semibold">{g.title}</div>}</div></Rv>)}</div></div></section>}

  {/* 10. ADVANTAGE */}
  <section className="py-14"><div className="hp-wrap">
    <Rv className="text-center"><Pill>ব্রাদার্স প্রিন্টিং ল্যাবের সুবিধা</Pill><h2 className="mt-4 text-4xl font-extrabold md:text-5xl">আমরা যা <span className="hp-grad italic">করি</span></h2>
      <p className="mt-3 text-[#16142b]/60">প্রিন্টিং অভিজ্ঞতাকে আমরা নতুন করে সাজিয়েছি।</p></Rv>
    <div className="mt-10 grid gap-5 md:grid-cols-2">{ADV.map((a,i)=><Rv key={i} delay={(i%2)*60}><div className="hp-card h-full p-8">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1ebff] text-2xl">{a.ic}</span>
      <h3 className="mt-5 text-2xl font-extrabold">{a.t}</h3><p className="mt-2 leading-7 text-[#16142b]/65">{a.d}</p>
      <Link to={a.to} className="mt-4 inline-block text-sm font-bold text-[#4c3fa3]">{a.l} →</Link></div></Rv>)}</div>

    {faq.length>0&&<Rv className="mx-auto mt-14 max-w-3xl"><h3 className="mb-4 text-center text-2xl font-extrabold">সাধারণ প্রশ্ন</h3>
      {faq.map((q,i)=><div key={q._id} className="hp-card mb-3 !transform-none px-5 py-4"><button className="flex w-full justify-between text-left font-bold" onClick={()=>setOpenF(openF===i?-1:i)}>{q.q}<span>{openF===i?'−':'+'}</span></button>
        {openF===i&&<p className="mt-2 leading-7 text-[#16142b]/70">{q.a}</p>}</div>)}</Rv>}
  </div></section>

  {/* 11. CONTACT FORM */}
  <section className="py-14"><div className="hp-wrap grid items-center gap-10 lg:grid-cols-2">
    <Rv><Pill>যোগাযোগ</Pill><h2 className="mt-4 text-4xl font-extrabold md:text-5xl">বাল্ক অর্ডারের <span className="hp-grad">কোটেশন নিন</span></h2>
      <p className="mt-4 max-w-md leading-7 text-[#16142b]/65">বড় অর্ডার বা বিশেষ ডিজাইনের জন্য আপনার প্রয়োজন জানান। আমাদের টিম দাম ও সময় জানিয়ে দেবে।</p>
      <div className="mt-8 space-y-3">{[['👤','ডেডিকেটেড সাপোর্ট','আপনার অর্ডারের জন্য ব্যক্তিগত সহায়তা।'],['🎨','ফ্রি ডিজাইন পরামর্শ','ব্র্যান্ডিং নিয়ে বিশেষজ্ঞ পরামর্শ।'],['🚚','ডেলিভারি সাপোর্ট','জামালপুর পৌরসভার ভেতরে দ্রুত ও নিরাপদ ডেলিভারি।']]
        .map(([ic,t,d])=><div key={t} className="hp-card flex items-center gap-4 !rounded-2xl p-4"><span className="text-2xl">{ic}</span><div><b className="block">{t}</b><small className="text-[#16142b]/60">{d}</small></div></div>)}</div></Rv>
    <Rv delay={100}><form onSubmit={submit} className="hp-card !transform-none p-6 md:p-8">
      <h3 className="mb-5 text-xl font-extrabold">আমাদের মেসেজ পাঠান</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#16142b]/60">নাম<input required className="hp-in mt-1 normal-case" placeholder="আপনার নাম" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></label>
        <label className="text-xs font-bold uppercase tracking-wider text-[#16142b]/60">ফোন<input required className="hp-in mt-1 normal-case" placeholder="01XXXXXXXXX" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/></label></div>
      <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-[#16142b]/60">বার্তা<textarea required rows={5} className="hp-in mt-1 normal-case" placeholder="আপনার প্রয়োজন জানান..." value={f.message} onChange={e=>setF({...f,message:e.target.value})}/></label>
      <button className="hp-btn hp-btn-pri mt-5 w-full justify-center !py-4 text-base">মেসেজ পাঠান ✈</button>
      {sent&&<p className="mt-3 text-center text-sm font-semibold text-[#4c3fa3]">{sent}</p>}
      <p className="mt-4 text-center text-xs text-[#16142b]/50">আপনার তথ্য শুধু আপনার প্রশ্নের উত্তর দিতে ব্যবহার করা হবে।</p>
    </form></Rv>
  </div></section>

  </div>}