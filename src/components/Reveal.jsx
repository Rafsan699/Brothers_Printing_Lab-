import {useEffect,useRef,useState} from 'react';

/* Shob page er jonno ekta shared scroll-reveal. Druto scroll korleo kichu hide thake na. */
const REACH=500; // screen er 500px age thekei reveal shuru
const reached=el=>el.getBoundingClientRect().top<window.innerHeight+REACH;

export function Rv({children,className='',delay,d,as:T='div'}){
  const ms=Math.min(delay??d??0,150); // stagger max 150ms, jate onek item thakleo late na hoy
  // (purono code e d={..} chilo, duto-i kaj korbe)
  const r=useRef(null);const [on,setOn]=useState(false);
  useEffect(()=>{const el=r.current;if(!el)return;
    if(!('IntersectionObserver' in window)){setOn(true);return}
    let done=false;
    const show=()=>{if(done)return;done=true;setOn(true);cleanup()};
    const io=new IntersectionObserver(([e])=>{
      if(e.isIntersecting||e.boundingClientRect.top<0)show();
    },{threshold:0,rootMargin:`0px 0px ${REACH}px 0px`});
    const check=()=>{if(reached(el))show()};
    function cleanup(){io.disconnect();window.removeEventListener('scroll',check);window.removeEventListener('resize',check)}
    io.observe(el);
    window.addEventListener('scroll',check,{passive:true});
    window.addEventListener('resize',check);
    check();
    return cleanup},[]);
  return <T ref={r} className={'hp-rv '+(on?'in ':'')+className} style={{transitionDelay:on?ms+'ms':'0ms'}}>{children}</T>;
}

export function Count({to,suffix='',locale='en-IN'}){
  const r=useRef(null);const [v,setV]=useState(0);
  useEffect(()=>{const el=r.current;if(!el)return;
    let started=false,raf=0;
    const run=()=>{if(started)return;started=true;cleanup();
      const t0=performance.now(),dur=1400;
      const f=t=>{const p=Math.min((t-t0)/dur,1);setV(Math.round(to*(1-Math.pow(1-p,3))));if(p<1)raf=requestAnimationFrame(f)};
      raf=requestAnimationFrame(f)};
    const io=('IntersectionObserver' in window)?new IntersectionObserver(([e])=>{
      if(e.isIntersecting||e.boundingClientRect.top<0)run();
    },{threshold:0,rootMargin:`0px 0px ${REACH}px 0px`}):null;
    const check=()=>{
      if(el.getBoundingClientRect().top<0){started=true;cleanup();setV(to);return} // scroll kore chole gele sorasori final
      if(reached(el))run()};
    function cleanup(){io&&io.disconnect();window.removeEventListener('scroll',check);window.removeEventListener('resize',check)}
    io&&io.observe(el);
    window.addEventListener('scroll',check,{passive:true});
    window.addEventListener('resize',check);
    check();
    return()=>{cleanup();cancelAnimationFrame(raf)}},[to]);
  return <span ref={r}>{v.toLocaleString(locale)}{suffix}</span>;
}