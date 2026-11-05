import {createContext,useContext,useEffect,useState} from 'react';
import {api,API} from './api.js';
const Ctx=createContext({});
export const useSettings=()=>useContext(Ctx);
// Je kono public list (banners, faqs, testimonials, gallery) anar jonno: const faqs=useList('faqs')
export const useList=path=>{const [d,setD]=useState([]);useEffect(()=>{api('/api/'+path).then(setD).catch(()=>{})},[path]);return d};
export const wa=(s,text='')=>`https://wa.me/${(s.whatsapp||'').replace(/\D/g,'')}${text?'?text='+encodeURIComponent(text):''}`;
export function SettingsProvider({children}){
 const [s,setS]=useState(null);
 useEffect(()=>{api('/api/settings').then(setS).catch(()=>setS({}))},[]);
 useEffect(()=>{if(!s)return;if(s.seoTitle)document.title=s.seoTitle;
  let m=document.querySelector('meta[name=description]');if(!m){m=document.createElement('meta');m.name='description';document.head.appendChild(m)}m.content=s.seoDescription||''},[s]);
 if(!s)return <div className="p-10 text-center">লোড হচ্ছে...</div>;
 if(s.maintenance&&!location.pathname.startsWith('/admin'))return <div className="flex min-h-screen items-center justify-center p-6 text-center text-xl">{s.maintenanceMsg}</div>;
 return <Ctx.Provider value={s}>{children}</Ctx.Provider>}