import {useState} from 'react';
import {Link,useNavigate,useParams,useLocation} from 'react-router-dom';
import {api,tk2,lineTotal} from '../api.js';
import {useCart} from '../cart.jsx';
import {Thumb,Rv} from '../components/Card.jsx';

const sum=its=>its.reduce((s,i)=>s+lineTotal(i),0);
const calcDisc=(c,sub)=>!c?0:Math.min(sub,Math.round(c.type==='flat'?c.value:sub*c.value/100));
const COUPON_KEY='bpl_coupon';
const getCoupon=()=>{try{return JSON.parse(sessionStorage.getItem(COUPON_KEY))}catch{return null}};

const Flow=({at})=><div className="hp-flow">{['কার্ট','চেকআউট','সম্পন্ন'].map((t,i)=><span key={t} className="contents"><span className={'s'+(i<=at?' on':'')}><b>{i<at?'✔':i+1}</b>{t}</span>{i<2&&<i/>}</span>)}</div>;

/* coupon box (Coupon model: code, type percent|flat, value, minOrder) */
function CouponBox({sub,coupon,setCoupon}){
  const [code,setCode]=useState(''),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false);
  const apply=async()=>{if(!code.trim())return;setBusy(true);setMsg('');
    try{const c=await api('/api/coupons/apply',{method:'POST',body:{code:code.trim(),subtotal:sub}});
      if(sub<(c.minOrder||0))throw new Error(`ন্যূনতম অর্ডার ${tk2(c.minOrder)} হতে হবে`);
      setCoupon(c);sessionStorage.setItem(COUPON_KEY,JSON.stringify(c));setCode('')}catch(x){setMsg(x.message)}setBusy(false)};
  const clear=()=>{setCoupon(null);sessionStorage.removeItem(COUPON_KEY)};
  return coupon?<div className="flex items-center justify-between rounded-2xl bg-[#f0fdf4] p-3 text-sm"><span>🎟 <b>{coupon.code}</b> প্রয়োগ হয়েছে – {tk2(calcDisc(coupon,sub))} ছাড়</span><button onClick={clear} className="font-bold hp-red">বাদ দিন</button></div>
  :<div><div className="flex gap-2"><input className="hp-in !uppercase" placeholder="কুপন কোড" value={code} onChange={e=>setCode(e.target.value)}/><button type="button" className="hp-btn hp-btn-out" onClick={apply} disabled={busy}>{busy?'…':'প্রয়োগ'}</button></div>{msg&&<p className="mt-1 text-sm hp-red">{msg}</p>}</div>}

export function Cart(){
  const {items,remove}=useCart();const [gone,setGone]=useState(null),[coupon,setCoupon]=useState(getCoupon);
  const del=k=>{setGone(k);setTimeout(()=>{remove(k);setGone(null)},330)};
  if(!items.length)return <div className="hp-wrap py-20 text-center"><div className="hp-float text-7xl">🛒</div><p className="mt-3 text-xl font-bold">আপনার কার্ট খালি।</p><p className="hp-mut">পছন্দের সার্ভিস বেছে নিন।</p><Link to="/services" className="hp-btn hp-btn-pri mt-5">সার্ভিস দেখুন</Link></div>;
  const sub=sum(items),disc=calcDisc(coupon,sub);
  return <div className="hp-wrap py-10"><Flow at={0}/><h1 className="hp-h1 mb-6">আপনার <span className="hp-grad">কার্ট</span></h1>
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">{items.map((i,n)=><div key={i.key} style={{animationDelay:n*60+'ms'}} className={'hp-card hp-row flex flex-wrap items-center gap-4 !rounded-2xl p-4 '+(gone===i.key?'hp-rm':'')}>
        <Thumb p={i} cls="h-20 w-20 rounded-xl"/>
        <div className="min-w-0 flex-1"><b>{i.title}</b>
          <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
            {i.pricing==='area'&&<span className="hp-cat">{i.width}×{i.height} ft</span>}<span className="hp-cat">পরিমাণ {i.qty}</span>
            {Object.values(i.options||{}).map(v=><span key={v} className="hp-cat">{v}</span>)}{i.designFile&&<span className="hp-cat">📎 ফাইল আছে</span>}</div></div>
        <div className="flex items-center gap-4"><b className="text-lg">{tk2(lineTotal(i))}</b><button onClick={()=>del(i.key)} aria-label="মুছুন" className="rounded-full p-2 transition hover:bg-[#fff5f6] hp-red">🗑</button></div></div>)}
        <Link to="/services" className="inline-block font-bold hp-pri">← আরও সার্ভিস দেখুন</Link></div>
      <aside className="hp-card h-fit space-y-4 p-5 lg:sticky lg:top-24"><h2 className="font-extrabold">অর্ডার সারাংশ</h2>
        <CouponBox sub={sub} coupon={coupon} setCoupon={setCoupon}/>
        <div className="space-y-1 text-sm"><div className="flex justify-between"><span className="hp-mut">সাবটোটাল</span><span>{tk2(sub)}</span></div>
          {disc>0&&<div className="flex justify-between text-green-700"><span>কুপন ছাড়</span><span>− {tk2(disc)}</span></div>}</div>
        <div className="flex justify-between border-t pt-3 text-xl font-extrabold"><span>মোট</span><span className="hp-grad">{tk2(sub-disc)}</span></div>
        <Link to="/checkout" className="hp-btn hp-btn-pri w-full justify-center">চেকআউট →</Link></aside></div></div>}

const PAYS=[['COD','💵','ক্যাশ অন ডেলিভারি / দোকানে'],['bKash','📱','bKash'],['Nagad','📲','Nagad']];
export function Checkout(){
  const {items,clear}=useCart(),nav=useNavigate();
  const [c,setC]=useState({name:'',phone:'',email:'',address:''}),[pay,setPay]=useState('COD'),[note,setNote]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false);
  const coupon=getCoupon();
  if(!items.length)return <div className="hp-wrap py-20 text-center"><p>কার্ট খালি।</p><Link to="/services" className="hp-btn hp-btn-pri mt-4">সার্ভিস দেখুন</Link></div>;
  const sub=sum(items),disc=calcDisc(coupon,sub),phoneOk=/^01[0-9]{9}$/.test(c.phone);
  const submit=async e=>{e.preventDefault();setErr('');setBusy(true);
    try{const r=await api('/api/orders',{method:'POST',body:{customer:c,paymentMethod:pay,note,items,coupon:coupon?.code}});
      clear();sessionStorage.removeItem(COUPON_KEY);nav('/order-done/'+r.orderNo,{state:{phone:c.phone}})}catch(x){setErr(x.message)}setBusy(false)};
  const set=k=>e=>setC({...c,[k]:e.target.value});
  return <form onSubmit={submit} className="hp-wrap py-10"><Flow at={1}/>
    <div className="grid gap-8 lg:grid-cols-3"><div className="hp-card space-y-4 p-6 lg:col-span-2"><h1 className="hp-h1 !text-3xl">চেক<span className="hp-grad">আউট</span></h1>
      <label className="block font-bold">আপনার নাম *<input required className="hp-in mt-1 font-normal" value={c.name} onChange={set('name')}/></label>
      <label className="block font-bold">মোবাইল নম্বর *<input required pattern="01[0-9]{9}" title="১১ digit নম্বর, যেমন 01712345678" className="hp-in mt-1 font-normal" value={c.phone} onChange={set('phone')}/>
        {c.phone&&<span className={'text-xs font-normal '+(phoneOk?'text-green-700':'hp-red')}>{phoneOk?'✔ সঠিক নম্বর':'১১ digit নম্বর দিন (01XXXXXXXXX)'}</span>}</label>
      <label className="block font-bold">ইমেইল (ঐচ্ছিক)<input type="email" className="hp-in mt-1 font-normal" value={c.email} onChange={set('email')}/></label>
      <label className="block font-bold">ডেলিভারি ঠিকানা *<textarea required rows="3" className="hp-in mt-1 font-normal" value={c.address} onChange={set('address')}/></label>
      <div><div className="mb-2 font-bold">পেমেন্ট পদ্ধতি</div><div className="grid gap-3 sm:grid-cols-3">{PAYS.map(([k,ic,l])=><button type="button" key={k} onClick={()=>setPay(k)} className={'hp-pay'+(pay===k?' on':'')}><div className="text-2xl">{ic}</div><div className="mt-1 text-sm font-bold">{l}</div></button>)}</div>
        {pay!=='COD'&&<p className="hp-row mt-3 rounded-xl bg-[#fff8dd] p-3 text-sm">অর্ডার কনফার্ম হলে আমরা ফোনে {pay} পেমেন্টের নম্বর জানিয়ে দেব।</p>}</div>
      <label className="block font-bold">অতিরিক্ত নোট<textarea rows="2" className="hp-in mt-1 font-normal" value={note} onChange={e=>setNote(e.target.value)}/></label></div>
    <aside className="hp-card h-fit p-5 lg:sticky lg:top-24"><h2 className="mb-3 font-extrabold">অর্ডার সারাংশ</h2>
      {items.map(i=><div key={i.key} className="flex justify-between gap-2 py-1 text-sm"><span>{i.title} × {i.qty}</span><span>{tk2(lineTotal(i))}</span></div>)}
      {disc>0&&<div className="flex justify-between py-1 text-sm text-green-700"><span>🎟 {coupon.code}</span><span>− {tk2(disc)}</span></div>}
      <div className="mt-3 flex justify-between border-t pt-3 text-xl font-extrabold"><span>মোট</span><span className="hp-grad">{tk2(sub-disc)}</span></div>
      {err&&<p className="mt-3 text-sm hp-red">{err}</p>}
      <button className="hp-btn hp-btn-pri mt-4 w-full justify-center" disabled={busy}>{busy?'অপেক্ষা করুন…':'✔ অর্ডার কনফার্ম করুন'}</button></aside></div></form>}

export function Done(){
  const {no}=useParams(),{state}=useLocation(),[cp,setCp]=useState(false);
  const colors=['#4c3fa3','#e5484d','#f5a524','#c0457a','#22c55e'];
  const [bits]=useState(()=>Array.from({length:36},(_,i)=>({l:Math.random()*100,d:Math.random()*.8,t:2.4+Math.random()*2,c:colors[i%5]})));
  const copy=()=>{navigator.clipboard?.writeText(no);setCp(true);setTimeout(()=>setCp(false),1800)};
  return <div className="hp-wrap py-16 text-center"><Flow at={3}/>
    {bits.map((b,i)=><span key={i} className="hp-conf" style={{left:b.l+'%',background:b.c,animationDuration:b.t+'s',animationDelay:b.d+'s'}}/>)}
    <svg className="hp-ck" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46"/><path d="M30 52l14 14 27-30"/></svg>
    <h1 className="hp-h1 mt-5">অর্ডার <span className="hp-grad">সফল</span> হয়েছে!</h1>
    <Rv><div className="hp-card mx-auto mt-6 max-w-sm p-6"><div className="text-sm hp-mut">আপনার অর্ডার নম্বর</div><div className="mt-1 text-3xl font-extrabold tracking-wider hp-red">{no}</div>
      <button onClick={copy} className="hp-btn hp-btn-out mt-3 !py-2 text-sm">{cp?'✔ কপি হয়েছে':'📋 কপি করুন'}</button></div>
    <p className="mt-4 hp-mut">নম্বরটি সংরক্ষণ করুন। আমরা শীঘ্রই ফোনে কনফার্ম করব।</p>
    <Link to={'/track?no='+no+(state?.phone?'&phone='+state.phone:'')} className="hp-btn hp-btn-pri mt-5">অর্ডার ট্র্যাক করুন →</Link></Rv></div>}