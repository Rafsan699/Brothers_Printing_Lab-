import {Routes,Route,useLocation} from 'react-router-dom';import {useEffect} from 'react';
import Layout from './components/Layout.jsx';import Home from './pages/Home.jsx';import Shop from './pages/Shop.jsx';import Product from './pages/Product.jsx';
import {Cart,Checkout,Done} from './pages/Cart.jsx';import {Track,About,Contact} from './pages/Info.jsx';import Admin from './pages/Admin.jsx';
function Top(){const {pathname}=useLocation();useEffect(()=>window.scrollTo(0,0),[pathname]);return null}
export default function App(){return <><Top/><Routes>
 <Route path="/admin" element={<Admin/>}/>
 <Route element={<Layout/>}>
  <Route index element={<Home/>}/><Route path="services" element={<Shop/>}/><Route path="services/:cat" element={<Shop/>}/>
  <Route path="product/:slug" element={<Product/>}/><Route path="cart" element={<Cart/>}/><Route path="checkout" element={<Checkout/>}/>
  <Route path="order-done/:no" element={<Done/>}/><Route path="track" element={<Track/>}/><Route path="about" element={<About/>}/><Route path="contact" element={<Contact/>}/>
 </Route></Routes></>}
