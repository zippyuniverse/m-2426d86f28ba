/* yjp-v183 상하기 직전 파리. 진열대·냉장고는 v10 시트 한 마리, 사람 상세는 v9 시트 두 마리. */
(function(){
  const reduceMq=window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduce=!!reduceMq.matches;
  reduceMq.addEventListener('change',()=>{reduce=!!reduceMq.matches});
  const owned=new Map();
  let detail={mode:'loop'};
  const FLY_V9={fps:20,frameMs:50,cycle:24,loops:4,n:96,flapEvery:3,cell:20,ax:10,ay:10,faceW:180,faceH:180,sheet:'art/fly_v9_sheet.png',
    scatter:[{x:-35,y:60},{x:235,y:88}],
    reduceCi:0,
    L:[[21,8,8],[18.70389941,8.4567228,7],[16.75735931,9.75735931,6],[15.4567228,11.70389941,5],[15,14,4],[15.4567228,16.29610059,3],[16.75735931,18.24264069,2],[18.70389941,19.5432772,1],[21,20,0],[30,20,0],[39,20,0],[48,20,0],[57,20,0],[59.29610059,19.5432772,15],[61.24264069,18.24264069,14],[62.5432772,16.29610059,13],[63,14,12],[62.5432772,11.70389941,11],[61.24264069,9.75735931,10],[59.29610059,8.4567228,9],[57,8,8],[48,8,8],[39,8,8],[30,8,8]],
    R:[[179.91176471,87.49297597,1],[188.61176471,90.27948244,1],[192.96176471,91.50554529,0],[203.36764706,92.21146026,15],[207.71764706,90.72532348,15],[213.64558824,88.27319778,15],[219.57352941,85.82107209,0],[231.25882353,86.00683919,0],[238.33823529,86.4155268,0],[249.68235294,85.82107209,0],[255.65294118,84.74362292,14],[259.23529412,79.95083179,10],[256.59117647,77.09001848,10],[249.42647059,70.43955638,10],[244.30882353,65.68391867,9],[234.41470588,59.51645102,9],[225.97058824,55.65249538,9],[210.53235294,52.01146026,8],[198.59117647,51.78853974,7],[182.47058824,55.94972274,7],[174.02647059,60.77966728,4],[175.05,67.46728281,3],[177.01176471,74.11774492,3],[178.88823529,80.80536044,4]]
  };

  const FLY_V10={frameMs:50,cycle:24,n:96,flapEvery:3,cell:14,ax:7,ay:7,faceW:60,reduceCi:0,reducePose:1,
    P:[[15,3,8],[14,3,7],[13,4,6],[12,5,5],[12,6,4],[12,7,3],[13,8,2],[14,9,1],[15,9,0],[18,9,0],[20,9,0],[22,9,0],[25,9,0],[26,9,15],[27,8,14],[28,7,13],[28,6,12],[28,5,11],[27,4,10],[26,3,9],[25,3,8],[22,3,8],[20,3,8],[18,3,8]]
  };
  function easeOut(t){return 1-Math.pow(1-t,3)}
  function easeInOut(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
  function elV10(){
    const d=document.createElement('div');
    d.className='n98-fly10';
    d.setAttribute('aria-hidden','true');
    return d;
  }
  function ensureV10(host){
    let node=owned.get(host);
    const parent=host.dataset.fly==='f'?host:(host.offsetParent||host.parentElement);
    if(!parent)return null;
    if(!node){node=elV10();owned.set(host,node)}
    if(node.parentNode!==parent)parent.appendChild(node);
    return node;
  }
  function v10Hosts(){
    const sheet=document.querySelector('#sheet-root');
    const group=(kind,root)=>{
      const all=[...document.querySelectorAll('[data-fly="'+kind+'"]')];
      const list=root?all.filter(el=>root.contains(el)):all.filter(el=>!sheet||!sheet.contains(el));
      return list.map((host,k)=>({host,kind,k}));
    };
    return group('s',null).concat(group('s',sheet)).concat(group('f',null)).concat(sheet?group('f',sheet):[]);
  }
  function placeV10(node,host,dx,dy,hi,pose){
    const inside=host.dataset.fly==='f';
    const ox=inside?0:host.offsetLeft, oy=inside?0:host.offsetTop;
    const s=(host.offsetWidth||FLY_V10.faceW)/FLY_V10.faceW;
    const x=Math.round(ox)+dx*s-FLY_V10.ax*s;
    const y=Math.round(oy)+dy*s-FLY_V10.ay*s;
    node.style.backgroundPosition=(-hi*FLY_V10.cell)+'px '+(-pose*FLY_V10.cell)+'px';
    node.style.transform='translate('+x+'px,'+y+'px)'+(s!==1?' scale('+s+')':'');
  }
  function v9At(now){
    const fi=Math.floor(now/FLY_V9.frameMs)%FLY_V9.n;
    const ci=fi%FLY_V9.cycle;
    const pose=(Math.floor(fi/FLY_V9.flapEvery)%2)===0?0:1;
    return {fi,ci,pose,L:FLY_V9.L[ci],R:FLY_V9.R[ci]};
  }
  function elV9(){
    const d=document.createElement('div');
    d.className='n98-fly';
    d.setAttribute('aria-hidden','true');
    d.style.backgroundImage='url("'+FLY_V9.sheet+'")';
    d.style.backgroundRepeat='no-repeat';
    d.style.backgroundSize='320px 40px';
    return d;
  }
  function detailNodes(face){
    const parent=face.closest('.ph-head')||face.parentElement;
    let nodes=parent._flies;
    if(!nodes){nodes=[elV9(),elV9()];parent._flies=nodes}
    nodes.forEach(n=>{if(n.parentNode!==parent)parent.appendChild(n)});
    return nodes;
  }
  function placeV9(node,faceX,faceY,hi,pose,face){
    const head=face.closest('.ph-head')||face.parentElement;
    const fr=face.getBoundingClientRect();
    const hr=head.getBoundingClientRect();
    const s=fr.width/FLY_V9.faceW;
    const ix=Math.round((fr.left-hr.left)+faceX*s);
    const iy=Math.round((fr.top-hr.top)+faceY*s);
    node.style.width=FLY_V9.cell+'px';
    node.style.height=FLY_V9.cell+'px';
    node.style.transformOrigin='0 0';
    node.style.backgroundPosition=(-hi*FLY_V9.cell)+'px '+(-pose*FLY_V9.cell)+'px';
    node.style.backgroundSize='320px 40px';
    node.style.transform='translate('+(ix-FLY_V9.ax*s)+'px,'+(iy-FLY_V9.ay*s)+'px)'+(s!==1?' scale('+s+')':'');
  }
  function paintV9(nodes,spots,pose,face){
    spots.forEach((p,i)=>placeV9(nodes[i],p[0],p[1],p[2],pose,face));
  }
  window.flyScatter=function(){
    const face=document.querySelector('[data-fly="d"]');
    if(!face||reduce)return;
    const now=performance.now();
    const cur=v9At(now);
    detail.mode='scatter';
    detail.from=[{x:cur.L[0],y:cur.L[1]},{x:cur.R[0],y:cur.R[1]}];
    detail.to=FLY_V9.scatter.map(p=>({x:p.x,y:p.y}));
    detail.scatterT0=now;
    detail.scatterUntil=now+280;
    detail.holdUntil=now+1600;
    detail.returnUntil=now+2400;
  };
  function tick(now){
    const hosts=v10Hosts();
    const seen=new Set(hosts.map(h=>h.host));
    const fi=Math.floor(now/FLY_V10.frameMs)%FLY_V10.n;
    hosts.forEach(({host,kind,k})=>{
      const node=ensureV10(host);
      if(!node)return;
      let ci,pose;
      if(reduce){ci=FLY_V10.reduceCi;pose=FLY_V10.reducePose}
      else{
        const phase=kind==='f'?(k*8)%24:(k*6)%24;
        const local=(fi+phase)%FLY_V10.n;
        ci=local%FLY_V10.cycle;
        pose=(Math.floor(local/FLY_V10.flapEvery)%2)===0?0:1;
      }
      const p=FLY_V10.P[ci];
      placeV10(node,host,p[0],p[1],p[2],pose);
    });
    owned.forEach((node,host)=>{
      if(seen.has(host)&&host.isConnected&&host.getAttribute('data-fly'))return;
      node.remove();owned.delete(host);
    });
    const face=document.querySelector('[data-fly="d"]');
    document.querySelectorAll('.ph-head').forEach(el=>{
      if((!face||el!==face.closest('.ph-head'))&&el._flies){el._flies.forEach(n=>n.remove());el._flies=null}
    });
    if(!face){detail.mode='loop';requestAnimationFrame(tick);return}
    const nodes=detailNodes(face);
    if(reduce){
      detail.mode='loop';
      const ci=FLY_V9.reduceCi;
      paintV9(nodes,[FLY_V9.L[ci],FLY_V9.R[ci]],1,face);
      requestAnimationFrame(tick);return;
    }
    const cur=v9At(now);
    if(detail.mode==='scatter'){
      let spots;
      if(now<detail.scatterUntil){
        const k=easeOut((now-detail.scatterT0)/280);
        spots=detail.from.map((p,i)=>[p.x+(detail.to[i].x-p.x)*k,p.y+(detail.to[i].y-p.y)*k,i?cur.R[2]:cur.L[2]]);
      }else if(now<detail.holdUntil){
        spots=detail.to.map((p,i)=>[p.x,p.y,i?cur.R[2]:cur.L[2]]);
      }else if(now<detail.returnUntil){
        const k=easeInOut((now-detail.holdUntil)/800);
        const tgt=[cur.L,cur.R];
        spots=detail.to.map((p,i)=>[p.x+(tgt[i][0]-p.x)*k,p.y+(tgt[i][1]-p.y)*k,tgt[i][2]]);
        if(k>=1)detail.mode='loop';
      }else detail.mode='loop';
      if(spots){paintV9(nodes,spots,cur.pose,face);requestAnimationFrame(tick);return}
    }
    paintV9(nodes,[cur.L,cur.R],cur.pose,face);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
