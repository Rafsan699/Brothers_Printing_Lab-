export const API=import.meta.env.VITE_API_URL||'http://localhost:5000';
export const img=u=>!u?'':u.startsWith('http')?u:API+u;
export const tk=()=>localStorage.getItem('bpl_token');
export async function api(path,{method='GET',body,admin}={}){
 const r=await fetch(API+path,{method,headers:{'Content-Type':'application/json',...(admin?{Authorization:'Bearer '+tk()}:{})},body:body?JSON.stringify(body):undefined});
 const d=await r.json().catch(()=>({}));
 if(r.status===401&&admin){localStorage.removeItem('bpl_token');location.href='/admin'}
 if(!r.ok)throw new Error(d.message||'কিছু ভুল হয়েছে');return d}
export async function uploadFile(file){const f=new FormData();f.append('file',file);const r=await fetch(API+'/api/upload',{method:'POST',body:f});const d=await r.json();if(!r.ok)throw new Error(d.message);return d.url}
export const tk2=n=>'৳ '+Number(n).toLocaleString('en-IN');
export const lineTotal=i=>Math.round(i.price*(i.pricing==='area'?i.width*i.height:1)*i.qty);
