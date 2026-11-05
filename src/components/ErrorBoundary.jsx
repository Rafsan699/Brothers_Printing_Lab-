import {Component} from 'react';

// Page crash korle blank na hoye error dekhay. resetKey (pathname) change hole abar try kore.
export default class ErrorBoundary extends Component{
  state={e:null,k:this.props.resetKey};
  static getDerivedStateFromError(e){return {e}}
  static getDerivedStateFromProps(p,s){return p.resetKey!==s.k?{e:null,k:p.resetKey}:null}
  componentDidCatch(e,info){console.error('Page crash:',e,info?.componentStack)}
  render(){
    if(!this.state.e)return this.props.children;
    return <div className="hp-wrap py-16 text-center">
      <p className="text-lg font-bold">পেজটি লোড করতে সমস্যা হয়েছে</p>
      <p className="mt-2 text-sm opacity-60" style={{wordBreak:'break-word'}}>{String(this.state.e?.message||this.state.e)}</p>
      <button type="button" className="hp-btn hp-btn-pri mt-5" onClick={()=>location.reload()}>আবার চেষ্টা করুন</button>
    </div>}
}