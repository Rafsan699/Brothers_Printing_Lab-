import {useEffect,useState} from 'react';
import {Link,useNavigate,useParams} from 'react-router-dom';
import {api,uploadFile,tk2,lineTotal} from '../api.js';
import Card,{Thumb} from '../components/Card.jsx';
import {Rv} from '../components/Reveal.jsx';
import {useCart} from '../cart.jsx';

export default function Product(){
  const {slug}=useParams(),nav=useNavigate(),{add}=useCart();
  const [p,setP]=useState(null),[err,setErr]=useState(''),[rel,setRel]=useState([]),[toast,setToast]=useState(false);
  const [f,setF]=useState({qty:1,width:'',height:'',options:{},note:'',designFile:''}),[up,setUp]=useState(false),[fname,setFname]=useState(''),[over,setOver]=useState(false);

  useEffect(()=>{setP(null);setErr('');setFname('');
    api('/api/products/'+slug).then(d=>{setP(d);
      setF({qty:d.minQty||1,width:'',height:'',note:'',designFile:'',options:Object.fromEntries((d.options||[]).map(o=>[o.name,o.values[0]]))});
      if(d.category?.slug)api('/api/products?category='+d.category.slug).then(r=>setRel((Array.isArray(r)?r:[]).filter(x=>x._id!==d._id).slice(0,4))).catch(()=>{})
    }).catch(e=>setErr(e.message))},[slug]);

  if(err)return <p className="hp-wrap py-10">{err}</p>;
  if(!p)return <div className="hp-wrap grid gap-10 py-10 md:grid-cols-2"><div className="hp-sk aspect-square"/><div className="space-y-4"><div className="hp-sk h-6 w-1/3"/><div className="hp-sk h-10 w-3/4"/><div className="hp-sk h-24"/><div className="hp-sk h-40"/></div></div>;

  const min=p.minQty||1;
  const item={productId:p._id,title:p.title,price:p.price,pricing:p.pricing,unit:p.unit,image:p.image,category:p.category,qty:Number(f.qty)||0,width:Number(f.width)||0,height:Number(f.height)||0,options:f.options,note:f.note,designFile:f.designFile};
  const ok=item.qty>=min&&(p.pricing!=='area'||(item.width&&item.height));
  const total=ok?lineTotal(item):0, sqft=item.width*item.height;

  const setQty=v=>setF(x=>({...x,qty:Math.max(min,(Number(x.qty)||0)+v)}));
  const doUpload=async fl=>{if(!fl)return;setUp(true);try{const u=await uploadFile(fl);setF(x=>({...x,designFile:u}));setFname(fl.name)}catch(x){alert(x.message)}setUp(false)};
  const go=to=>{add(item);nav(to)};
  const addCart=()=>{add(item);setToast(true);setTimeout(()=>setToast(false),3000)};

  return <div className="hp-wrap py-10">
    <div className="mb-5 text-sm hp-mut"><Link to="/services" className="hover:text-[var(--hp-pri)]">সার্ভিস</Link> › {p.category&&<Link to={'/services/'+p.category.slug} className="hover:text-[var(--hp-pri)]">{p.category.name}</Link>} › <b className="text-[var(--hp-ink)]">{p.title}</b></div>

    <div className="grid gap-10 md:grid-cols-2">
      <Rv><div className="hp-card hp-img group relative !rounded-[24px] md:sticky md:top-24" style={{aspectRatio:'1/1'}}>
        <Thumb p={p} w={900} cls="h-full w-full"/>{p.featured&&<span className="hp-badge">★ জনপ্রিয়</span>}</div></Rv>

      <Rv d={100}><div>
        {p.category?.name&&<span className="hp-cat">{p.category.name}</span>}
        <h1 className="hp-h1 mt-2">{p.title}</h1>
        <div className="mt-2 text-3xl font-extrabold hp-red">{tk2(p.price)} <span className="text-base font-normal hp-mut">/ {p.pricing==='area'?'sq ft':p.unit}</span></div>
        <p className="mt-3 leading-relaxed hp-mut">{p.description}</p>

        <div className="mt-6 space-y-5">
          {p.pricing==='area'&&<div className="hp-card !rounded-2xl p-4"><b>📐 সাইজ (ফুট)</b>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <label className="text-sm">প্রস্থ<input type="number" min="0" step="0.1" className="hp-in" value={f.width} onChange={e=>setF({...f,width:e.target.value})}/></label>
              <label className="text-sm">উচ্চতা<input type="number" min="0" step="0.1" className="hp-in" value={f.height} onChange={e=>setF({...f,height:e.target.value})}/></label></div>
            {sqft>0&&<p className="mt-2 text-sm hp-pri">মোট এরিয়া: <b>{sqft.toFixed(2)} sq ft</b></p>}</div>}

          {(p.options||[]).map(o=><div key={o.name}><div className="mb-2 font-bold">{o.name}</div>
            <div className="flex flex-wrap gap-2">{o.values.map(v=><button type="button" key={v} className={'hp-opt'+(f.options[o.name]===v?' on':'')} onClick={()=>setF({...f,options:{...f.options,[o.name]:v}})}>{v}</button>)}</div></div>)}

          <div><div className="mb-2 font-bold">পরিমাণ {min>1&&<span className="text-sm font-normal hp-mut">(ন্যূনতম {min})</span>}</div>
            <div className="hp-qty"><button type="button" onClick={()=>setQty(-1)}>−</button>
              <input type="number" min={min} value={f.qty} onChange={e=>setF({...f,qty:e.target.value})}/><button type="button" onClick={()=>setQty(1)}>+</button></div></div>

          <label className={'hp-drop'+(over?' over':'')} onDragOver={e=>{e.preventDefault();setOver(true)}} onDragLeave={()=>setOver(false)} onDrop={e=>{e.preventDefault();setOver(false);doUpload(e.dataTransfer.files[0])}}>
            <input type="file" className="hidden" onChange={e=>doUpload(e.target.files[0])}/>
            <div className="text-3xl hp-float">{f.designFile?'✅':'📁'}</div>
            <div className="mt-1 font-bold">{up?'আপলোড হচ্ছে…':f.designFile?fname||'ফাইল আপলোড হয়েছে':'ডিজাইন ফাইল ড্রপ করুন বা ক্লিক করুন'}</div>
            <div className="text-xs hp-mut">JPG, PNG, PDF, AI, PSD</div></label>

          <label className="block font-bold">নির্দেশনা / ডিজাইন করাতে চাইলে লিখুন
            <textarea rows="3" className="hp-in mt-2 font-normal" value={f.note} onChange={e=>setF({...f,note:e.target.value})}/></label>
        </div>

        <div className="hp-total mt-6 flex items-center justify-between">
          <div><div className="text-sm hp-mut">সর্বমোট</div>{ok&&<div className="text-xs hp-mut">{item.qty} × {p.pricing==='area'?`${sqft.toFixed(1)} sq ft`:tk2(p.price)}</div>}</div>
          <div key={total} className="hp-pop text-3xl font-extrabold hp-grad">{ok?tk2(total):'—'}</div></div>

        <div className="mt-4 hidden flex-wrap gap-3 md:flex">
          <button className="hp-btn hp-btn-pri" disabled={!ok} onClick={()=>go('/checkout')}>⚡ এখনই অর্ডার করুন</button>
          <button className="hp-btn hp-btn-out" disabled={!ok} onClick={addCart}>🛒 কার্টে যোগ করুন</button></div>
        {!ok&&<p className="mt-2 text-sm hp-mut">{p.pricing==='area'?'সাইজ ও পরিমাণ দিন।':`পরিমাণ ন্যূনতম ${min} হতে হবে।`}</p>}
      </div></Rv>
    </div>

    {rel.length>0&&<section className="mt-16"><h2 className="text-2xl font-extrabold">আরও <span className="hp-grad">দেখুন</span></h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{rel.map((x,i)=><Card key={x._id} p={x} i={i}/>)}</div></section>}

    {/* mobile sticky bar */}
    <div className="hp-sticky md:hidden"><div><div className="text-xs hp-mut">মোট</div><b className="text-lg">{ok?tk2(total):'—'}</b></div>
      <div className="flex gap-2"><button className="hp-btn hp-btn-out !px-4" disabled={!ok} onClick={addCart}>🛒</button><button className="hp-btn hp-btn-pri" disabled={!ok} onClick={()=>go('/checkout')}>অর্ডার করুন</button></div></div>
    {toast&&<div className="hp-toast">✔ কার্টে যোগ হয়েছে <Link to="/cart" className="underline">কার্ট দেখুন</Link></div>}
  </div>}