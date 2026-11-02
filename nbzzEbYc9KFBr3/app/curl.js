/* 내 판정서: 4번째 탭 말린 모서리 + 페이지 넘김 (11/3) */
(function(){
const A0=150,RM=matchMedia('(prefers-reduced-motion: reduce)');
const vl=$('#vlayer'),pk=$('#vpeek'),fx=$('#vfx'),hit=$('#vhit'),flap=$('#vflap'),rim=$('#vrim'),shade=$('#vshade'),gF=$('#vgF'),gP=$('#vgP');
let t=0,anim=null,open=false,prev=null;
const f=v=>v.toFixed(2);
function clip(poly,M,n,sg){const o=[],s=p=>sg*((p[0]-M[0])*n[0]+(p[1]-M[1])*n[1]);for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],sa=s(a),sb=s(b);if(sa<=0)o.push(a);if((sa<0&&sb>0)||(sa>0&&sb<0)){const k=sa/(sa-sb);o.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k])}}return o}
const poly=(p,dx,dy)=>p.length?'polygon('+p.map(q=>f(q[0]-dx)+'px '+f(q[1]-dy)+'px').join(',')+')':'polygon(0 0,0 0,0 0)';
const G=(g,a,b,c,d)=>{g.setAttribute('x1',a);g.setAttribute('y1',b);g.setAttribute('x2',c);g.setAttribute('y2',d)};
function geo(){const nv=$('#app nav.tab'),W=innerWidth,H=innerHeight,ar=$('#app').getBoundingClientRect();
 const R=nv?nv.getBoundingClientRect().right:Math.min(W,ar.right),L=nv?nv.getBoundingClientRect().left:ar.left;
 const sab=nv?Math.max(0,nv.offsetHeight-59):0;return {nv,W,H,R,L,B:58+sab,sab}}
function draw(tt,g){const rr=Math.min(1,tt*3),K=.5+.32*rr,A=A0,B=g.B;
 const C=[g.R,g.H],ln=Math.hypot(A,B),dd=A*B/ln,P0=[C[0]-2*dd*B/ln,C[1]-2*dd*A/ln],P1=[g.L-(g.R-g.L)*1.04,-g.H*1.04];
 const e=-(Math.cos(Math.PI*tt)-1)/2,P=[P0[0]+(P1[0]-P0[0])*e,P0[1]+(P1[1]-P0[1])*e];
 const M=[(C[0]+P[0])/2,(C[1]+P[1])/2];let n=[C[0]-P[0],C[1]-P[1]];const l=Math.hypot(n[0],n[1]);n=[n[0]/l,n[1]/l];
 const rect=[[g.L,0],[g.R,0],[g.R,g.H],[g.L,g.H]],kept=clip(rect,M,n,1),rem=clip(rect,M,n,-1);
 let path='';const dist=q=>(q[0]-M[0])*n[0]+(q[1]-M[1])*n[1];let maxd=0;
 const fl=rem.map(q=>{const d=dist(q);maxd=Math.max(maxd,d);return [q[0]-(1+K)*d*n[0],q[1]-(1+K)*d*n[1],d]});
 const bul=Math.min(10,4+maxd*.04)*rr+11*(1-rr),cv=.09*rr+.17*(1-rr);
 for(let i=0;i<fl.length;i++){const a=fl[i],b=fl[(i+1)%fl.length];if(!i)path='M'+f(a[0])+' '+f(a[1]);let cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2;
  if(a[2]<.5&&b[2]<.5){cx+=n[0]*bul*2;cy+=n[1]*bul*2}else{const len=Math.hypot(b[0]-a[0],b[1]-a[1])||1;let px=-(b[1]-a[1])/len,py=(b[0]-a[0])/len;if(px*n[0]+py*n[1]<0){px=-px;py=-py}cx+=px*len*cv;cy+=py*len*cv}
  path+='Q'+f(cx)+' '+f(cy)+' '+f(b[0])+' '+f(b[1])}
 flap.setAttribute('d',fl.length?path+'Z':'');
 const fe=fl.filter(q=>q[2]<.5);rim.setAttribute('d',fe.length==2?'M'+f(fe[0][0])+' '+f(fe[0][1])+'Q'+f((fe[0][0]+fe[1][0])/2+n[0]*bul*2)+' '+f((fe[0][1]+fe[1][1])/2+n[1]*bul*2)+' '+f(fe[1][0])+' '+f(fe[1][1]):'');
 const ext=Math.max(1,K*maxd);G(gF,M[0],M[1],M[0]-n[0]*ext,M[1]-n[1]*ext);
 shade.setAttribute('d',kept.length&&rem.length?'M'+kept.map(q=>f(q[0])+' '+f(q[1])).join('L')+'Z':'');G(gP,M[0],M[1],M[0]-n[0]*(30+ext*.5),M[1]-n[1]*(30+ext*.5));
 return {kept,rem}}
function curlRest(){const g=geo();if(open||anim)return;
 if(!g.nv||!g.nv.querySelector('.vt')){[fx,pk,hit].forEach(x=>x.style.display='none');return}
 [fx,pk,hit].forEach(x=>x.style.display='block');
 fx.setAttribute('width',g.W);fx.setAttribute('height',g.H);
 const {rem}=draw(0,g);g.nv.style.clipPath='';
 pk.style.left=(g.R-A0)+'px';pk.style.width=A0+'px';pk.style.height=g.B+'px';pk.style.bottom='0px';pk.style.top='auto';const pr={left:g.R-A0,top:g.H-g.B};pk.style.clipPath=poly(rem,pr.left,pr.top);
 pk.querySelector('svg').style.bottom=(g.sab+22)+'px';pk.querySelector('.lb').style.bottom=(g.sab+7)+'px';
 const cell=g.nv.querySelector('.vt').getBoundingClientRect();hit.style.left=cell.left+'px';hit.style.width=cell.width+'px';hit.style.top=cell.top+'px';hit.style.height='58px'}
function frame(tt,g){t=tt;const app=$('#app'),ar=app.getBoundingClientRect();
 const {kept}=draw(tt,g);app.style.clipPath=poly(kept,ar.left,ar.top);if(g.nv){const nr=g.nv.getBoundingClientRect();g.nv.style.clipPath=poly(kept,nr.left,nr.top)}
 pk.style.opacity=Math.max(0,1-tt*5);app.style.visibility=tt>=1?'hidden':'visible';fx.style.visibility=tt>=1?'hidden':'visible'}
function run(to,done){const g=geo();if(anim)cancelAnimationFrame(anim);hit.style.display='none';fx.style.display='block';
 fx.setAttribute('width',g.W);fx.setAttribute('height',g.H);
 if(RM.matches){const app=$('#app');app.style.transition='opacity .3s ease';fx.style.display='none';pk.style.opacity=0;app.style.clipPath='none';
  app.style.visibility='visible';app.style.opacity=to?0:1;setTimeout(()=>{if(to)app.style.visibility='hidden';app.style.transition='';done&&done()},320);return}
 const from=t,dur=760*Math.abs(to-from)||1;let st=null;
 const step=ts=>{if(st===null)st=ts;const k=Math.min(1,(ts-st)/dur);frame(from+(to-from)*k,g);if(k<1)anim=requestAnimationFrame(step);else{anim=null;done&&done()}};
 anim=requestAnimationFrame(step)}
window.openVerdict=function(){if(open)return;open=true;prev=nav.slice();nav=[{v:'verdict'}];vl.innerHTML=verdict();vl.scrollTop=0;vl.classList.add('on');
 document.documentElement.classList.add('vlock');run(1,()=>{vl.setAttribute('aria-hidden','false');$('#app').setAttribute('aria-hidden','true')})};
window.closeVerdict=function(){if(!open)return;vl.setAttribute('aria-hidden','true');$('#app').removeAttribute('aria-hidden');
 run(0,()=>{open=false;nav=prev&&prev.length&&prev[prev.length-1].v!='verdict'?prev:[{v:'shelf'}];vl.classList.remove('on');vl.innerHTML='';
  document.documentElement.classList.remove('vlock');const app=$('#app');app.style.clipPath='';app.style.opacity='';app.style.visibility='';t=0;render('same')})};
window.curlRest=curlRest;window.__curl=(tt)=>{if(!open){open=true;prev=nav.slice();nav=[{v:'verdict'}];vl.innerHTML=verdict();vl.classList.add('on')}frame(tt,geo())};
addEventListener('resize',()=>{if(!open)curlRest()});addEventListener('scroll',()=>{},{passive:true});
curlRest();
})();
