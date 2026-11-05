import {createContext,useContext,useEffect,useState} from 'react';
const C=createContext();export const useCart=()=>useContext(C);
export function CartProvider({children}){
 const [items,setItems]=useState(()=>{try{return JSON.parse(localStorage.getItem('bpl_cart'))||[]}catch{return[]}});
 useEffect(()=>{try{localStorage.setItem('bpl_cart',JSON.stringify(items))}catch{}},[items]);
 const add=i=>setItems(p=>[...p,{...i,key:Date.now()+Math.random()}]);
 const remove=k=>setItems(p=>p.filter(x=>x.key!==k));
 return <C.Provider value={{items,add,remove,clear:()=>setItems([])}}>{children}</C.Provider>}