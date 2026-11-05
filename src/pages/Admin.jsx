import {useCallback,useEffect,useState} from 'react';
import {api,img,tk,tk2,uploadFile} from '../api.js';
import {Logo} from '../components/Layout.jsx';

const STAT=['Pending','Confirmed','Designing','Printing','Ready','Delivered','Cancelled'];
const A=(p,o={})=>api(p,{...o,admin:true});
const clean=o=>{const b={...o};['_id','__v','createdAt','updatedAt'].forEach(k=>delete b[k]);return b};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- Login ---------- */
function Login({onOk}){const [f,setF]=useState({email:'',password:''}),[e,setE]=useState('');
 const go=async ev=>{ev.preventDefault();try{const r=await api('/api/auth/login',{method:'POST',body:f});localStorage.setItem('bpl_token',r.token);onOk()}catch(x){setE(x.message)}};
 return <div className="flex min-h-screen items-center justify-center p-4"><form onSubmit={go} className="w-full max-w-sm space-y-3 rounded-lg border border-ink/10 bg-white p-6"><Logo/><h1 className="text-xl font-bold">অ্যাডমিন লগইন</h1>
  <input required type="email" className="inp" placeholder="ইমেইল" value={f.email} onChange={x=>setF({...f,email:x.target.value})}/>
  <input required type="password" className="inp" placeholder="পাসওয়ার্ড" value={f.password} onChange={x=>setF({...f,password:x.target.value})}/>
  {e&&<p className="text-ma">{e}</p>}<button className="btn w-full">লগইন</button></form></div>}

/* ---------- Reusable inputs ---------- */
function Pairs({v,set,ph}){const rows=Array.isArray(v)?v:[];const ch=(i,k,x)=>set(rows.map((r,j)=>j===i?{...r,[k]:x}:r));
 return <div className="space-y-2">{rows.map((r,i)=><div key={i} className="flex gap-2">
  <input className="inp" placeholder={ph[0]} value={r.a||''} onChange={e=>ch(i,'a',e.target.value)}/>
  <input className="inp" placeholder={ph[1]} value={r.b||''} onChange={e=>ch(i,'b',e.target.value)}/>
  <button type="button" className="px-2 text-ma" onClick={()=>set(rows.filter((_,j)=>j!==i))}>✕</button></div>)}
  <button type="button" className="btn-o !py-1" onClick={()=>set([...rows,{a:'',b:''}])}>+ যোগ করুন</button></div>}

// field = [key, label, type, extra]   type: text|textarea|number|color|date|image|bool|select|pairs
function Input({f,v,set}){const [,label,type='text',extra]=f;const [busy,setBusy]=useState(false);
 const up=async e=>{const file=e.target.files[0];if(!file)return;setBusy(true);try{set(await uploadFile(file))}catch(x){alert(x.message)}setBusy(false)};
 if(type==='bool')return <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={!!v} onChange={e=>set(e.target.checked)}/>{label}</label>;
 const wide=type==='textarea'||type==='pairs';
 return <div className={'text-sm '+(wide?'md:col-span-2':'')}><span className="mb-1 block text-ink/70">{label}</span>
  {type==='textarea'?<textarea rows="3" className="inp" value={v||''} onChange={e=>set(e.target.value)}/>
  :type==='select'?<select className="inp" value={v||extra[0][0]} onChange={e=>set(e.target.value)}>{extra.map(([a,b])=><option key={a} value={a}>{b}</option>)}</select>
  :type==='image'?<div><input className="inp" placeholder="ছবির লিংক" value={v||''} onChange={e=>set(e.target.value)}/><input type="file" accept="image/*" className="mt-1" onChange={up}/>{busy&&<span className="ml-2 text-xs">আপলোড হচ্ছে…</span>}{v&&<img src={img(v)} alt="" className="mt-1 h-16 rounded object-contain"/>}</div>
  :type==='pairs'?<Pairs v={v} set={set} ph={extra}/>
  :<input type={type==='number'?'number':type==='color'?'color':type==='date'?'date':'text'} className={'inp '+(type==='color'?'!p-1':'')} value={type==='date'&&v?String(v).slice(0,10):(v??'')} onChange={e=>set(type==='number'?e.target.value:e.target.value)}/>}</div>}

/* ---------- Generic list manager (banners, faqs, testimonials, gallery, coupons, categories) ---------- */
function Crud({path,fields,blank,show,addLabel='+ নতুন'}){
 const [rows,setRows]=useState([]),[f,setF]=useState(null),[m,setM]=useState('');
 const load=useCallback(()=>A('/api/admin/'+path).then(setRows).catch(x=>setM(x.message)),[path]);
 useEffect(()=>{load()},[load]);
 const save=async e=>{e.preventDefault();setM('');
  try{f._id?await A(`/api/admin/${path}/${f._id}`,{method:'PUT',body:clean(f)}):await A('/api/admin/'+path,{method:'POST',body:clean(f)});setF(null);load()}catch(x){setM(x.message)}};
 const del=async r=>{if(!confirm('মুছে ফেলবেন?'))return;try{await A(`/api/admin/${path}/${r._id}`,{method:'DELETE'});load()}catch(x){setM(x.message)}};
 return <div>{m&&<p className="mb-3 text-ma">{m}</p>}
  {!f&&<button className="btn mb-4" onClick={()=>setF({...blank})}>{addLabel}</button>}
  {f&&<form onSubmit={save} className="mb-6 grid gap-3 rounded-lg bg-white p-4 md:grid-cols-2">
   {fields.map(x=><Input key={x[0]} f={x} v={f[x[0]]} set={v=>setF({...f,[x[0]]:v})}/>)}
   <div className="flex gap-2 md:col-span-2"><button className="btn">সংরক্ষণ</button><button type="button" className="btn-o" onClick={()=>setF(null)}>বাতিল</button></div></form>}
  <div className="rounded-lg bg-white">{rows.length===0&&<p className="p-4">কিছু নেই।</p>}
   {rows.map(r=><div key={r._id} className="flex items-center justify-between gap-3 border-b p-3 last:border-0"><div className="min-w-0">{show(r)}</div>
    <div className="shrink-0"><button className="mr-3 text-cy" onClick={()=>setF({...r})}>এডিট</button><button className="text-ma" onClick={()=>del(r)}>মুছুন</button></div></div>)}</div></div>}

/* ---------- Site settings: sob text ekhane theke change hobe ---------- */
const SECTIONS=[
 ['সাধারণ',[['siteName','সাইটের নাম'],['tagline','ট্যাগলাইন'],['logo','লোগো (ফাঁকা রাখলে ডিফল্ট)','image'],['announcementOn','উপরে ঘোষণা বার দেখান','bool'],['announcement','ঘোষণার লেখা']]],
 ['যোগাযোগ',[['phone','ফোন নম্বর'],['whatsapp','WhatsApp নম্বর (দেশের কোড সহ, যেমন 8801XXXXXXXXX)'],['email','ইমেইল'],['address','দোকানের ঠিকানা','textarea'],['hours','খোলার সময়'],['mapUrl','Google Map embed লিংক']]],
 ['সোশ্যাল মিডিয়া',[['facebook','Facebook লিংক'],['instagram','Instagram লিংক'],['youtube','YouTube লিংক'],['tiktok','TikTok লিংক']]],
 ['হোম পেজ',[['heroTitle','হিরো শিরোনাম'],['heroSubtitle','হিরো সাবটাইটেল','textarea'],['heroBtnText','বাটনের লেখা'],['heroBtnLink','বাটনের লিংক'],['heroImage','হিরো ছবি','image'],['featuresTitle','"কেন আমরা" শিরোনাম'],['features','কেন আমরা – পয়েন্ট','pairs',['শিরোনাম','বিবরণ']],['stats','পরিসংখ্যান','pairs',['সংখ্যা (৫০০০+)','লেখা']]]],
 ['আমাদের সম্পর্কে',[['aboutTitle','শিরোনাম'],['aboutText','বিস্তারিত','textarea'],['aboutImage','ছবি','image']]],
 ['ফুটার',[['footerAbout','ফুটারের ছোট বর্ণনা','textarea'],['copyright','কপিরাইট লেখা']]],
 ['অর্ডার ও পেমেন্ট',[['deliveryCharge','ডেলিভারি চার্জ (৳)','number'],['freeDeliveryAbove','এত টাকার উপরে ফ্রি ডেলিভারি (০ = বন্ধ)','number'],['paymentMethods','পেমেন্ট মেথড (প্রতি লাইনে একটি)','textarea'],['bkash','bKash নম্বর'],['nagad','Nagad নম্বর'],['paymentNote','পেমেন্ট নির্দেশনা','textarea'],['orderSuccessMsg','অর্ডার সফল হলে মেসেজ','textarea']]],
 ['SEO',[['seoTitle','ব্রাউজার ট্যাব টাইটেল'],['seoDescription','সাইটের বর্ণনা (Google এর জন্য)','textarea']]],
 ['অন্যান্য',[['whatsappFloat','WhatsApp ভাসমান বাটন দেখান','bool'],['maintenance','মেইনটেন্যান্স মোড (সাইট বন্ধ)','bool'],['maintenanceMsg','মেইনটেন্যান্স মেসেজ']]]
];
function SiteSettings({onSaved}){const [s,setS]=useState(null),[m,setM]=useState('');
 useEffect(()=>{api('/api/settings').then(setS)},[]);
 if(!s)return <p>লোড হচ্ছে...</p>;
 const save=async e=>{e.preventDefault();setM('');try{const r=await A('/api/admin/settings',{method:'PUT',body:{...s,deliveryCharge:Number(s.deliveryCharge)||0,freeDeliveryAbove:Number(s.freeDeliveryAbove)||0}});setS(r);onSaved?.(r);setM('✅ সংরক্ষণ হয়েছে')}catch(x){setM(x.message)}};
 return <form onSubmit={save} className="space-y-5">
  {SECTIONS.map(([t,fs])=><div key={t} className="rounded-lg bg-white p-4"><h3 className="mb-3 font-bold">{t}</h3><div className="grid gap-3 md:grid-cols-2">
   {fs.map(f=><Input key={f[0]} f={f} v={s[f[0]]} set={v=>setS({...s,[f[0]]:v})}/>)}</div></div>)}
  <div className="sticky bottom-0 flex items-center gap-3 border-t bg-ink/5 py-3"><button className="btn">সব সংরক্ষণ করুন</button><span>{m}</span></div></form>}

/* ---------- Dashboard ---------- */
function Dash({st}){if(!st)return <p>লোড হচ্ছে...</p>;
 const max=Math.max(1,...st.last7.map(d=>d.t));
 return <div className="space-y-4"><div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
  {[['মোট অর্ডার',st.orders],['পেন্ডিং',st.pending],['পণ্য',st.products],['নতুন মেসেজ',st.inquiries],['মোট বিক্রি',tk2(st.revenue)],['বকেয়া (পেমেন্ট হয়নি)',tk2(st.unpaid)]].map(([a,b])=>
   <div key={a} className="rounded-lg bg-white p-4"><div className="text-sm text-ink/60">{a}</div><div className="font-head text-2xl font-extrabold">{b}</div></div>)}</div>
  <div className="rounded-lg bg-white p-4"><h3 className="mb-3 font-bold">শেষ ৭ দিনের বিক্রি</h3>
   {st.last7.length===0?<p className="text-sm">ডেটা নেই।</p>:<div className="flex h-40 items-end gap-2">{st.last7.map(d=><div key={d._id} className="flex flex-1 flex-col items-center justify-end text-xs">
    <span>{tk2(d.t)}</span><div className="w-full rounded-t bg-cy" style={{height:Math.max(4,d.t/max*100)+'%'}}/><span className="mt-1 text-ink/60">{d._id.slice(5)}</span></div>)}</div>}</div>
  <div className="rounded-lg bg-white p-4"><h3 className="mb-2 font-bold">স্ট্যাটাস অনুযায়ী অর্ডার</h3><div className="flex flex-wrap gap-2 text-sm">{st.byStatus.map(b=><span key={b._id} className="rounded bg-ink/5 px-3 py-1">{b._id}: <b>{b.n}</b></span>)}</div></div></div>}

/* ---------- Orders ---------- */
const printInvoice=(o,S)=>{const w=window.open('','_blank');if(!w)return alert('Popup allow korun');
 w.document.write(`<html><head><meta charset="utf-8"><title>${esc(o.orderNo)}</title><style>body{font-family:sans-serif;padding:24px;max-width:720px;margin:auto}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #ddd;padding:6px;text-align:left}.r{text-align:right}</style></head><body>
 <h2>${esc(S.siteName)}</h2><p>${esc(S.phone)} · ${esc(S.address)}</p><hr><h3>ইনভয়েস ${esc(o.orderNo)}</h3><p>${new Date(o.createdAt).toLocaleString('bn-BD')}</p>
 <p><b>${esc(o.customer.name)}</b><br>${esc(o.customer.phone)}<br>${esc(o.customer.address)}</p>
 <table><tr><th>পণ্য</th><th>পরিমাণ</th><th class="r">মোট</th></tr>${o.items.map(i=>`<tr><td>${esc(i.title)} ${i.pricing==='area'?`(${i.width}×${i.height} ft)`:''} ${esc(Object.values(i.options||{}).join(', '))}</td><td>${i.qty}</td><td class="r">${i.lineTotal}</td></tr>`).join('')}</table>
 <p class="r">সাবটোটাল: ৳${o.subtotal??o.total}<br>${o.discount?`ছাড় (${esc(o.coupon)}): -৳${o.discount}<br>`:''}ডেলিভারি: ৳${o.delivery||0}<br><b>সর্বমোট: ৳${o.total}</b><br>${o.paid?'পরিশোধিত':'বকেয়া'} · ${esc(o.paymentMethod)}</p>
 <script>onload=()=>print()</script></body></html>`);w.document.close()};
const exportCsv=rows=>{const h=['OrderNo','Date','Name','Phone','Address','Status','Paid','Payment','Total'];
 const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
 const csv=[h,...rows.map(o=>[o.orderNo,new Date(o.createdAt).toISOString(),o.customer.name,o.customer.phone,o.customer.address,o.status,o.paid?'Yes':'No',o.paymentMethod,o.total])].map(r=>r.map(q).join(',')).join('\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'}));a.download='orders.csv';a.click()};
function Orders({S,onChange}){const [orders,setOrders]=useState([]),[fs,setFs]=useState(''),[q,setQ]=useState('');
 const load=useCallback(()=>A('/api/admin/orders').then(setOrders),[]);useEffect(()=>{load()},[load]);
 const patch=async(o,body)=>{await A('/api/admin/orders/'+o._id,{method:'PATCH',body});load();onChange?.()};
 const list=orders.filter(o=>(!fs||o.status===fs)&&(!q||(o.orderNo+o.customer.name+o.customer.phone).toLowerCase().includes(q.toLowerCase())));
 return <div><div className="mb-3 flex flex-wrap gap-2"><input className="inp !w-64" placeholder="অর্ডার নং / নাম / ফোন খুঁজুন" value={q} onChange={e=>setQ(e.target.value)}/>
  <select className="inp !w-auto" value={fs} onChange={e=>setFs(e.target.value)}><option value="">সব স্ট্যাটাস</option>{STAT.map(s=><option key={s}>{s}</option>)}</select>
  <button className="btn-o !py-1" onClick={()=>exportCsv(list)}>CSV এক্সপোর্ট</button></div>
  <div className="space-y-3">{list.length===0&&<p>কোনো অর্ডার নেই।</p>}{list.map(o=><div key={o._id} className="rounded-lg bg-white p-4">
   <div className="flex flex-wrap items-center justify-between gap-2"><div><b>{o.orderNo}</b> <span className="text-sm text-ink/60">{new Date(o.createdAt).toLocaleString('bn-BD')}</span></div>
    <select className="inp !w-auto" value={o.status} onChange={e=>patch(o,{status:e.target.value})}>{STAT.map(s=><option key={s}>{s}</option>)}</select></div>
   <div className="mt-2 text-sm"><b>{o.customer.name}</b> · <a className="text-cy" href={'tel:'+o.customer.phone}>{o.customer.phone}</a> · {o.customer.address} · {o.paymentMethod}</div>
   <ul className="mt-2 text-sm">{o.items.map((i,k)=><li key={k}>• {i.title} {i.pricing==='area'?`(${i.width}×${i.height} ft)`:''} × {i.qty} = {tk2(i.lineTotal)} {Object.values(i.options||{}).join(', ')} {i.note&&`— “${i.note}”`} {i.designFile&&<a className="text-cy underline" target="_blank" rel="noreferrer" href={img(i.designFile)}>ডিজাইন ফাইল</a>}</li>)}</ul>
   {o.note&&<p className="text-sm">কাস্টমারের নোট: {o.note}</p>}
   <div className="mt-1 text-sm text-ink/70">{o.discount>0&&<>ছাড় ({o.coupon}): -{tk2(o.discount)} · </>}ডেলিভারি: {tk2(o.delivery||0)}</div>
   <div className="mt-1 flex flex-wrap items-center gap-4"><span className="font-bold">মোট: {tk2(o.total)}</span>
    <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={!!o.paid} onChange={e=>patch(o,{paid:e.target.checked})}/> পেমেন্ট পেয়েছি</label>
    <button className="text-cy" onClick={()=>printInvoice(o,S)}>ইনভয়েস প্রিন্ট</button>
    <button className="text-ma" onClick={async()=>{if(confirm('অর্ডার মুছবেন?')){await A('/api/admin/orders/'+o._id,{method:'DELETE'});load()}}}>মুছুন</button></div>
   <input className="inp mt-2" placeholder="অ্যাডমিন নোট (শুধু আপনি দেখবেন) – লিখে বাইরে ক্লিক করুন" defaultValue={o.adminNote||''} onBlur={e=>e.target.value!==(o.adminNote||'')&&patch(o,{adminNote:e.target.value})}/></div>)}</div></div>}

/* ---------- Products ---------- */
const blank={title:'',category:'',price:'',unit:'pcs',pricing:'unit',minQty:1,description:'',image:'',optionsText:'',featured:false};
const parseOpts=t=>t.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const[n,v='']=l.split(':');return{name:n.trim(),values:v.split(',').map(s=>s.trim()).filter(Boolean)}}).filter(o=>o.values.length);
const optsText=o=>(o||[]).map(x=>x.name+': '+x.values.join(', ')).join('\n');
function Products(){const [prods,setProds]=useState([]),[cats,setCats]=useState([]),[form,setForm]=useState(null),[msg,setMsg]=useState(''),[q,setQ]=useState(''),[upl,setUpl]=useState(false);
 const load=useCallback(()=>{A('/api/admin/products').then(setProds);api('/api/categories').then(setCats)},[]);useEffect(()=>{load()},[load]);
 const fail=x=>setMsg(x.message);
 const saveP=async e=>{e.preventDefault();setMsg('');const b={...clean(form),price:Number(form.price),minQty:Number(form.minQty)||1,options:parseOpts(form.optionsText)};delete b.optionsText;delete b.slug;
  try{form._id?await A('/api/admin/products/'+form._id,{method:'PUT',body:b}):await A('/api/admin/products',{method:'POST',body:b});setForm(null);load()}catch(x){fail(x)}};
 const edit=(p,copy)=>setForm({...p,_id:copy?undefined:p._id,title:copy?p.title+' (কপি)':p.title,category:p.category?._id||p.category,optionsText:optsText(p.options)});
 const pick=async e=>{const file=e.target.files[0];if(!file)return;setUpl(true);try{const url=await uploadFile(file);setForm(f=>({...f,image:url}))}catch(x){fail(x)}setUpl(false)};
 const list=prods.filter(p=>!q||p.title.toLowerCase().includes(q.toLowerCase()));
 return <div>{msg&&<p className="mb-3 text-ma">{msg}</p>}
  {!form&&<div className="mb-4 flex gap-2"><button className="btn" onClick={()=>setForm({...blank,category:cats[0]?._id||''})}>+ নতুন পণ্য</button><input className="inp !w-56" placeholder="পণ্য খুঁজুন" value={q} onChange={e=>setQ(e.target.value)}/></div>}
  {form&&<form onSubmit={saveP} className="mb-6 grid gap-3 rounded-lg bg-white p-4 md:grid-cols-2"><input required className="inp md:col-span-2" placeholder="পণ্যের নাম" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
   <select required className="inp" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option value="">ক্যাটেগরি</option>{cats.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select>
   <select className="inp" value={form.pricing} onChange={e=>setForm({...form,pricing:e.target.value})}><option value="unit">পিস/প্যাক হিসেবে দাম</option><option value="area">বর্গফুট হিসেবে দাম</option></select>
   <input required type="number" min="0" className="inp" placeholder="দাম (৳)" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
   <input className="inp" placeholder="ইউনিট (pcs / sq ft)" value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}/>
   <input type="number" min="1" className="inp" placeholder="ন্যূনতম পরিমাণ" value={form.minQty} onChange={e=>setForm({...form,minQty:e.target.value})}/>
   <div><input className="inp" placeholder="লোগো / ছবির লিংক" value={form.image||''} onChange={e=>setForm({...form,image:e.target.value})}/><input type="file" accept="image/*" className="mt-1 text-sm" onChange={pick}/>{upl&&<span className="ml-2 text-xs">আপলোড হচ্ছে…</span>}{form.image&&<img src={img(form.image)} alt="" className="mt-1 h-16 rounded object-contain"/>}</div>
   <textarea rows="2" className="inp md:col-span-2" placeholder="বর্ণনা" value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})}/>
   <textarea rows="3" className="inp md:col-span-2" placeholder={'অপশন (প্রতি লাইনে একটি)\nসাইজ: S, M, L, XL\nরঙ: সাদা, কালো'} value={form.optionsText} onChange={e=>setForm({...form,optionsText:e.target.value})}/>
   <label className="flex items-center gap-2"><input type="checkbox" checked={!!form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> হোমপেজে দেখান</label>
   <label className="flex items-center gap-2"><input type="checkbox" checked={form.active!==false} onChange={e=>setForm({...form,active:e.target.checked})}/> সক্রিয়</label>
   <div className="flex gap-2 md:col-span-2"><button className="btn" disabled={upl}>সংরক্ষণ</button><button type="button" className="btn-o" onClick={()=>setForm(null)}>বাতিল</button></div></form>}
  <div className="overflow-x-auto rounded-lg bg-white"><table className="w-full text-left text-sm"><tbody>{list.map(p=><tr key={p._id} className="border-b last:border-0"><td className="p-3 font-medium">{p.image&&<img src={img(p.image)} alt="" className="mr-2 inline-block h-8 w-8 rounded object-cover align-middle"/>}{p.title}{!p.active&&' (বন্ধ)'}{p.featured&&' ⭐'}</td><td className="p-3">{p.category?.name}</td><td className="p-3">{tk2(p.price)}/{p.unit}</td>
   <td className="p-3 text-right"><button className="mr-3 text-cy" onClick={()=>edit(p)}>এডিট</button><button className="mr-3 text-cy" onClick={()=>edit(p,true)}>কপি</button><button className="text-ma" onClick={async()=>{if(confirm('মুছে ফেলবেন?')){await A('/api/admin/products/'+p._id,{method:'DELETE'});load()}}}>মুছুন</button></td></tr>)}</tbody></table></div></div>}

/* ---------- Messages ---------- */
function Inquiries(){const [inq,setInq]=useState([]);const load=useCallback(()=>A('/api/admin/inquiries').then(setInq),[]);useEffect(()=>{load()},[load]);
 return <div className="space-y-3">{inq.length===0&&<p>কোনো মেসেজ নেই।</p>}{inq.map(i=><div key={i._id} className={'rounded-lg bg-white p-4 '+(i.done?'opacity-60':'')}>
  <div className="flex flex-wrap justify-between gap-2"><b>{i.name} · <a className="text-cy" href={'tel:'+i.phone}>{i.phone}</a></b><span>
   <button className="mr-3 text-cy" onClick={async()=>{await A('/api/admin/inquiries/'+i._id,{method:'PATCH',body:{done:!i.done}});load()}}>{i.done?'আবার খুলুন':'সম্পন্ন'}</button>
   <button className="text-ma" onClick={async()=>{if(confirm('মুছবেন?')){await A('/api/admin/inquiries/'+i._id,{method:'DELETE'});load()}}}>মুছুন</button></span></div>
  <p className="mt-1">{i.message}</p><div className="text-xs text-ink/50">{new Date(i.createdAt).toLocaleString('bn-BD')}</div></div>)}</div>}

/* ---------- Password ---------- */
function Account(){const [f,setF]=useState({old:'',next:''}),[m,setM]=useState('');
 return <form className="max-w-sm space-y-3 rounded-lg bg-white p-4" onSubmit={async e=>{e.preventDefault();try{await A('/api/admin/password',{method:'POST',body:f});setF({old:'',next:''});setM('✅ পাসওয়ার্ড বদলেছে')}catch(x){setM(x.message)}}}>
  <h3 className="font-bold">পাসওয়ার্ড পরিবর্তন</h3><input required type="password" className="inp" placeholder="বর্তমান পাসওয়ার্ড" value={f.old} onChange={e=>setF({...f,old:e.target.value})}/>
  <input required type="password" className="inp" placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৬)" value={f.next} onChange={e=>setF({...f,next:e.target.value})}/><button className="btn">পরিবর্তন করুন</button><p>{m}</p></form>}

/* ---------- Main ---------- */
const TABS=[['dash','ড্যাশবোর্ড'],['orders','অর্ডার'],['products','পণ্য'],['cats','ক্যাটেগরি'],['site','সাইট সেটিংস'],['banners','ব্যানার/স্লাইড'],['gallery','গ্যালারি'],['reviews','রিভিউ'],['faqs','FAQ'],['coupons','কুপন'],['inq','মেসেজ'],['acct','অ্যাকাউন্ট']];
export default function Admin(){
 const [ok,setOk]=useState(!!tk()),[tab,setTab]=useState('dash'),[st,setSt]=useState(null),[S,setS]=useState({});
 const loadStats=useCallback(()=>{A('/api/admin/stats').then(setSt).catch(()=>{})},[]);
 useEffect(()=>{if(ok){loadStats();api('/api/settings').then(setS)}},[ok,loadStats]);
 if(!ok)return <Login onOk={()=>setOk(true)}/>;
 return <div className="min-h-screen bg-ink/5"><div className="border-b bg-white"><div className="wrap flex items-center justify-between py-3"><Logo/>
  <div className="flex gap-2"><a className="btn-o !py-1" href="/" target="_blank" rel="noreferrer">সাইট দেখুন</a><button className="btn-o !py-1" onClick={()=>{localStorage.removeItem('bpl_token');setOk(false)}}>লগআউট</button></div></div></div>
  <div className="wrap py-6"><div className="mb-5 flex flex-wrap gap-2">{TABS.map(([id,l])=><button key={id} onClick={()=>{setTab(id);if(id==='dash')loadStats()}} className={'rounded-md px-4 py-2 font-semibold '+(tab===id?'bg-ink text-white':'border border-ink/20 bg-white')}>{l}{id==='orders'&&st?.pending>0&&<span className="ml-1 rounded-full bg-ma px-2 text-xs text-white">{st.pending}</span>}{id==='inq'&&st?.inquiries>0&&<span className="ml-1 rounded-full bg-ma px-2 text-xs text-white">{st.inquiries}</span>}</button>)}</div>
   {tab==='dash'&&<Dash st={st}/>}
   {tab==='orders'&&<Orders S={S} onChange={loadStats}/>}
   {tab==='products'&&<Products/>}
   {tab==='cats'&&<Crud path="categories" addLabel="+ নতুন ক্যাটেগরি" blank={{name:'',image:'',description:'',order:0}}
     fields={[['name','নাম'],['image','লোগো / ছবি','image'],['order','ক্রম (ছোট আগে)','number'],['description','বর্ণনা','textarea']]}
     show={c=><span className="flex items-center gap-3">{c.image?<img src={img(c.image)} alt="" className="h-10 w-10 rounded object-cover"/>:<span className="inline-block h-10 w-10 rounded bg-ink/10"/>}{c.name}</span>}/>}
   {tab==='site'&&<SiteSettings onSaved={setS}/>}
   {tab==='banners'&&<Crud path="banners" addLabel="+ নতুন ব্যানার" blank={{title:'',subtitle:'',image:'',link:'',order:0,active:true}}
     fields={[['title','শিরোনাম'],['subtitle','সাবটাইটেল'],['image','ছবি','image'],['link','লিংক'],['order','ক্রম','number'],['active','সক্রিয়','bool']]}
     show={b=><span className="flex items-center gap-2">{b.image&&<img src={img(b.image)} alt="" className="h-10 w-14 rounded object-cover"/>}{b.title} {!b.active&&'(বন্ধ)'}</span>}/>}
   {tab==='gallery'&&<Crud path="gallery" addLabel="+ নতুন ছবি" blank={{title:'',image:'',order:0,active:true}}
     fields={[['title','ক্যাপশন'],['image','ছবি','image'],['order','ক্রম','number'],['active','সক্রিয়','bool']]}
     show={g=><span className="flex items-center gap-2">{g.image&&<img src={img(g.image)} alt="" className="h-10 w-14 rounded object-cover"/>}{g.title}</span>}/>}
   {tab==='reviews'&&<Crud path="testimonials" addLabel="+ নতুন রিভিউ" blank={{name:'',role:'',text:'',rating:5,image:'',order:0,active:true}}
     fields={[['name','কাস্টমারের নাম'],['role','পরিচয় (যেমন: ব্যবসায়ী)'],['text','রিভিউ','textarea'],['rating','রেটিং (১-৫)','number'],['image','ছবি','image'],['order','ক্রম','number'],['active','সক্রিয়','bool']]}
     show={t=><span><b>{t.name}</b> {'★'.repeat(t.rating||0)} <span className="text-sm text-ink/60">{t.text?.slice(0,60)}</span></span>}/>}
   {tab==='faqs'&&<Crud path="faqs" addLabel="+ নতুন প্রশ্ন" blank={{q:'',a:'',order:0,active:true}}
     fields={[['q','প্রশ্ন'],['a','উত্তর','textarea'],['order','ক্রম','number'],['active','সক্রিয়','bool']]} show={x=><span>{x.q}</span>}/>}
   {tab==='coupons'&&<Crud path="coupons" addLabel="+ নতুন কুপন" blank={{code:'',type:'percent',value:10,minOrder:0,expires:'',active:true}}
     fields={[['code','কুপন কোড'],['type','ধরন','select',[['percent','শতাংশ (%)'],['flat','নির্দিষ্ট টাকা (৳)']]],['value','পরিমাণ','number'],['minOrder','ন্যূনতম অর্ডার (৳)','number'],['expires','মেয়াদ শেষ','date'],['active','সক্রিয়','bool']]}
     show={c=><span><b>{c.code}</b> – {c.type==='percent'?c.value+'%':tk2(c.value)} ছাড় · ব্যবহার {c.used||0} বার {!c.active&&'(বন্ধ)'}</span>}/>}
   {tab==='inq'&&<Inquiries/>}
   {tab==='acct'&&<Account/>}
  </div></div>}