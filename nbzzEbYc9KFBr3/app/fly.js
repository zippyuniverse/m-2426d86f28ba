/* yjp-v179 #96 상하기 직전 파리. 진열대 8자, 상세 궤도, 냉장고는 CSS 점. */
(function(){
  const reduceMq=window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduce=!!reduceMq.matches;
  reduceMq.addEventListener('change',()=>{reduce=!!reduceMq.matches});
  const owned=new Map();
  let detail={mode:'orbit',t0:0,base:0};

  function anchor(size){return {ax:size*8/12,ay:size*5/8}}
  function elFly(size){
    const d=document.createElement('div');
    d.className='n96-fly'+(size>12?' is-lg':'');
    d.setAttribute('aria-hidden','true');
    const a=anchor(size);
    d.style.width=size+'px';
    d.style.height=Math.round(size*8/12)+'px';
    d.style.transformOrigin=a.ax+'px '+a.ay+'px';
    d.innerHTML='<img class="fr fr-a" alt="" src="art/fly_v2_a.svg"><img class="fr fr-b" alt="" src="art/fly_v2_b.svg">';
    return d;
  }
  function place(node,x,y,size,flip,flapB){
    const a=anchor(size);
    node.style.width=size+'px';
    node.style.height=Math.round(size*8/12)+'px';
    node.style.transformOrigin=a.ax+'px '+a.ay+'px';
    node.style.transform='translate('+(x-a.ax)+'px,'+(y-a.ay)+'px)'+(flip?' scaleX(-1)':'');
    node.classList.toggle('flap-b',!!flapB);
  }
  function fig8(t,cx,cy,ax,ay){
    return {x:cx+ax*Math.sin(t),y:cy+ay*Math.sin(t)*Math.cos(t),flip:ax*Math.cos(t)<0};
  }
  function orbit(t,cx,cy,rx,ry){
    return {x:cx+rx*Math.cos(t),y:cy+ry*Math.sin(t),flip:-rx*Math.sin(t)<0};
  }
  function wideParams(d,u){
    const bottom=d.cy+d.ry;
    const minTop=d.minTop!=null?d.minTop:70;
    const rx=d.rx*(1+0.35*u);
    let ry=d.ry*(1+0.35*u);
    const maxRy=(bottom-minTop)/2;
    if(ry>maxRy)ry=maxRy;
    return {cx:d.cx,cy:bottom-ry,rx,ry};
  }
  function easeOut(t){return 1-Math.pow(1-t,3)}
  function easeInOut(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
  function flapAt(ms){return Math.floor(ms/500)%2===1}
  function geom(face){
    const fr=face.getBoundingClientRect();
    const parent=face.closest('.gz')||face;
    const pr=parent.getBoundingClientRect();
    const ox=fr.left-pr.left, oy=fr.top-pr.top;
    const hd=document.querySelector('.phd')||document.querySelector('.hd');
    const hb=hd?hd.getBoundingClientRect().bottom:56;
    return {
      parent,cx:ox+fr.width/2,cy:oy+fr.height/2-37.5,rx:112,ry:56.5,size:24,period:8000,
      minTop:(hb+14)-pr.top,
      burst:[{x:ox-35,y:oy+60},{x:ox+fr.width+55,y:oy+88}]
    };
  }
  function ensure(host,size){
    let node=owned.get(host);
    const parent=host.offsetParent||host.parentElement;
    if(!parent)return null;
    if(!node){node=elFly(size);owned.set(host,node)}
    if(node.parentNode!==parent)parent.appendChild(node);
    return node;
  }
  function detailNodes(face){
    const parent=face.closest('.gz')||face;
    let nodes=parent._flies;
    if(!nodes){
      nodes=[elFly(24),elFly(24)];
      parent._flies=nodes;
    }
    nodes.forEach(n=>{if(n.parentNode!==parent)parent.appendChild(n)});
    return nodes;
  }
  window.flyScatter=function(){
    const face=document.querySelector('[data-fly="d"]');
    if(!face||reduce)return;
    const d=geom(face);
    const now=performance.now();
    const ang=detail.base||0;
    detail.mode='scatter';
    detail.from=[0,Math.PI].map(ph=>orbit(ang+ph,d.cx,d.cy,d.rx,d.ry));
    detail.to=d.burst;
    detail.scatterT0=now;
    detail.scatterUntil=now+280;
    detail.holdUntil=now+1600;
    detail.returnUntil=now+2400;
    detail.d=d;
  };
  function tick(now){
    const shelf=[...document.querySelectorAll('[data-fly="s"]')];
    const seen=new Set(shelf);
    shelf.forEach(face=>{
      const node=ensure(face,12);
      if(!node)return;
      const w=face.offsetWidth||60;
      const s=w/60;
      const shift=face.dataset.flyShift==='1';
      const ax=(shift?8:10)*s, ay=(shift?5:6)*s;
      const cx=face.offsetLeft+w/2+(shift?16*s:0);
      const cy=face.offsetTop-(shift?7:4)*s;
      const phase=+face.dataset.flyPhase||0;
      if(reduce){place(node,cx,cy+Math.min(2,ay*0.2),12*s,false,true);return}
      const t=((now+phase)/12000)*Math.PI*2;
      const p=fig8(t,cx,cy,ax,ay);
      place(node,p.x,p.y,12*s,p.flip,flapAt(now+phase));
    });
    owned.forEach((node,host)=>{
      if(seen.has(host)&&host.isConnected)return;
      node.remove();owned.delete(host);
    });
    const face=document.querySelector('[data-fly="d"]');
    document.querySelectorAll('.gz').forEach(el=>{
      if((!face||el!==face.closest('.gz'))&&el._flies){el._flies.forEach(n=>n.remove());el._flies=null}
    });
    if(face){
      const d=geom(face);
      const nodes=detailNodes(face);
      const period=d.period;
      let positions, flapping=!reduce;
      if(reduce){
        positions=[
          {x:d.cx-d.rx*0.9,y:d.cy,flip:true},
          {x:d.cx+d.rx*0.9,y:d.cy,flip:false}
        ];
        flapping=false;
        detail.mode='orbit';
      }else if(detail.mode==='scatter'){
        if(now<detail.scatterUntil){
          const k=easeOut((now-detail.scatterT0)/280);
          positions=detail.from.map((p,i)=>({
            x:p.x+(detail.to[i].x-p.x)*k,
            y:p.y+(detail.to[i].y-p.y)*k,
            flip:detail.to[i].x<d.cx
          }));
        }else if(now<detail.holdUntil){
          positions=detail.to.map(p=>({x:p.x,y:p.y,flip:p.x<d.cx}));
        }else if(now<detail.returnUntil){
          const k=easeInOut((now-detail.holdUntil)/800);
          const tgt=[0,Math.PI].map(ph=>orbit(detail.base+ph,d.cx,d.cy,d.rx,d.ry));
          positions=detail.to.map((p,i)=>({
            x:p.x+(tgt[i].x-p.x)*k,
            y:p.y+(tgt[i].y-p.y)*k,
            flip:tgt[i].flip
          }));
          if(k>=1)detail.mode='orbit';
        }else detail.mode='orbit';
      }
      if(!positions){
        if(!detail.t0)detail.t0=now;
        if(detail.mode==='pause'){
          if(now>=detail.pauseUntil){detail.mode='depart';detail.departUntil=now+1400;detail.departT0=now}
        }else if(detail.mode==='depart'){
          if(now>=detail.departUntil)detail.mode='orbit';
        }else{
          detail.base=((now-detail.t0)/period)*Math.PI*2;
          const revs=detail.base/(Math.PI*2);
          if(!detail._pausedRev)detail._pausedRev=0;
          if(Math.floor(revs)>=2&&Math.floor(revs)%2===0){
            const a0=(detail.base%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
            if(Math.abs(a0-0.35)<0.12&&detail._pausedRev!==Math.floor(revs)){
              detail._pausedRev=Math.floor(revs);
              detail.mode='pause';
              detail.pauseUntil=now+1200;
              detail.pauseAng=detail.base;
            }
          }
        }
        const ang=(detail.mode==='pause')?(detail.pauseAng||detail.base):detail.base;
        let o={cx:d.cx,cy:d.cy,rx:d.rx,ry:d.ry};
        if(detail.mode==='depart'){
          const k=easeInOut((now-detail.departT0)/1400);
          const u=k<.5?k*2:(1-(k-0.5)*2);
          o=wideParams(d,u);
        }
        positions=[0,Math.PI].map(ph=>orbit(ang+ph,o.cx,o.cy,o.rx,o.ry));
      }
      nodes.forEach((node,i)=>{
        const p=positions[i];
        if(!p)return;
        place(node,p.x,p.y,24,p.flip,flapping&&flapAt(now+i*180));
      });
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
