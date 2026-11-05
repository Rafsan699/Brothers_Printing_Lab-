export const API=import.meta.env.VITE_API_URL||'http://localhost:5000';

// Cloudinary link hole sodharon-i dekhay; bhanga "http://localhost:5000https://res.cloudinary..." hole thik kore; purono /uploads/.. hole API jure dey
// w dile Cloudinary theke chhoto + auto WebP/AVIF size ashe (phone e onek druto load hoy)
export const img=(u,w)=>{
 if(!u)return '';
 const i=u.indexOf('https://res.cloudinary.com');
 let url=i>0?u.slice(i):(u.startsWith('http')?u:API+u);
 if(url.includes('res.cloudinary.com')&&url.includes('/image/upload/')&&!/\/upload\/[a-z]{1,3}_/.test(url)){
  url=url.replace('/image/upload/','/image/upload/f_auto,q_auto'+(w?',w_'+w:'')+'/');
 }
 return url};

export const tk=()=>localStorage.getItem('bpl_token');

/* ---------- fetch helper: timeout + retry (Render free instance ghumale prothom request slow) ---------- */
async function doFetch(url,opt,{tries=0,timeout=25000}={}){
 const c=new AbortController();
 const t=setTimeout(()=>c.abort(),timeout);
 try{return await fetch(url,{...opt,signal:c.signal})}
 catch(e){
  if(tries>0)return doFetch(url,opt,{tries:tries-1,timeout});
  throw new Error(e.name==='AbortError'?'সার্ভার সাড়া দিচ্ছে না, একটু পরে আবার চেষ্টা করুন':'ইন্টারনেট বা সার্ভারে সমস্যা, আবার চেষ্টা করুন');
 }
 finally{clearTimeout(t)}}

/* ---------- GET cache (public data only) + same request ek shathe dui bar jabe na ---------- */
const TTL=2*60*1000;
const CACHEABLE=/^\/api\/(categories|products|banners|testimonials|gallery|faqs|settings)/;
const cache=new Map(),inflight=new Map();

export async function api(path,{method='GET',body,admin}={}){
 const isGet=method==='GET';
 const canCache=isGet&&!admin&&CACHEABLE.test(path);

 if(canCache){
  const hit=cache.get(path);
  if(hit&&Date.now()-hit.t<TTL)return hit.d;
  if(inflight.has(path))return inflight.get(path);
 }

 const run=(async()=>{
  const r=await doFetch(API+path,{method,
   headers:{'Content-Type':'application/json',...(admin?{Authorization:'Bearer '+tk()}:{})},
   body:body?JSON.stringify(body):undefined},
   isGet?{tries:2,timeout:25000}:{tries:0,timeout:60000});

  const txt=await r.text();
  let d={};
  if(txt){
   try{d=JSON.parse(txt)}
   // 200 ashlew JSON na hole (HTML error page etc.) {} return korbo na, tahole state e vul data boshe page crash kore
   catch{if(r.ok)throw new Error('সার্ভার ঠিকমতো উত্তর দেয়নি, আবার চেষ্টা করুন')}
  }
  if(r.status===401&&admin){localStorage.removeItem('bpl_token');location.href='/admin'}
  if(!r.ok)throw new Error(d.message||'কিছু ভুল হয়েছে');
  if(!isGet)cache.clear(); // kichu change hole purono cache muche felo
  return d})();

 if(!canCache)return run;
 inflight.set(path,run);
 try{const d=await run;cache.set(path,{d,t:Date.now()});return d}
 finally{inflight.delete(path)}
}

// Cloudinary te upload hoy; full https URL return kore (API+ lagbe na). Admin token thakle 'admin' folder e jay.
export async function uploadFile(file){const f=new FormData();f.append('file',file);
 const r=await doFetch(API+'/api/upload',{method:'POST',headers:tk()?{Authorization:'Bearer '+tk()}:{},body:f},{tries:0,timeout:120000});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.message||'আপলোড ব্যর্থ');return d.url}
export const tk2=n=>'৳ '+Number(n).toLocaleString('en-IN');
export const lineTotal=i=>Math.round(i.price*(i.pricing==='area'?i.width*i.height:1)*i.qty);