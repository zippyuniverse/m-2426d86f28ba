/* yjp-v182 상하기 직전 파리. 진열대는 12×8 8자, 사람 상세는 v9 시트, 냉장고는 CSS 점. */
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
  function easeOut(t){return 1-Math.pow(1-t,3)}
  function easeInOut(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
  function flapAt(ms){return Math.floor(ms/500)%2===1}
  function ensure(host,size){
    let node=owned.get(host);
    const parent=host.offsetParent||host.parentElement;
    if(!parent)return null;
    if(!node){node=elFly(size);owned.set(host,node)}
    if(node.parentNode!==parent)parent.appendChild(node);
    return node;
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
