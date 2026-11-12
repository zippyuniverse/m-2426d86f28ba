'use strict';
const KEY='yjp-app-v1';
const PERS=['무던무던','친절한','믿을만한','능글능글','소심이','똑부러지는','심한허세','멍충이','고집불통','불같은','꼰대','DOG'];
const GR={5:['1++','투뿔 마블링'],4:['1+','원뿔 등심'],3:['1','무난한 1등급'],2:['2','국거리용'],1:['반품','촉수엄금']};
const DEFC={5:7,4:30,3:90,2:180,1:0};
const CYC=[['auto','등급 따라 자동'],[7,'1주'],[30,'1개월'],[90,'3개월'],[180,'6개월'],[0,'연락 안 함']];
const AGAIN=['무조건','상황 봐서','절대 안 함'];
const REL=['같은 회사','거래처·고객','경쟁사','기타'];
const REP_POS=['숫자에 강함','약속 칼같음','인맥왕','말발 좋음','디테일 장인'];
const REP_NEG=['답장 냉동 보관','약속 해동 중','말만 투뿔','뒷심 부족','생색 마블링','숟가락 얹기','밀당 장인','회식 전용','핑계 양념','읽고 숙성'];
const GROUPS=[['사는 곳','#834AF4',['여의도','마포']],['가족 구성','#75C895',['1남1녀','무자녀']],['생년','#88CBF0',['50년대','60년대','70년대','80년대','90년대','00년대']],['취미·관심사','#89D16F',['골프','등산']],['고향','#F4A259',['서울','부산','대구']],['출신 대학','#3F89F6',['연세대','고려대','서울대']]];
const BASE=new Date(2026,9,27);
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let S,nav=[{v:'shelf'}],ui={},lastN=null;

function blank(){return {day:0,people:[],seq:1,customTags:{},notifs:[],readBell:false,accepted:false,verdictN:7,seenInfo:{},firstWrite:true}}
function load(){try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}if(!S)S=blank()}
function kstDay(){return Math.floor((Date.now()+9*3600e3)/864e5)+S.day}
function earnPt(id){S.ptLog=S.ptLog||{};const d=kstDay();if(S.ptLog[id]===d)return false;S.ptLog[id]=d;S.pts=(S.pts||0)+1;return true}
function save(){localStorage.setItem(KEY,JSON.stringify(S))}
function dateOf(d){const x=new Date(BASE);x.setDate(x.getDate()+d);return x}
function md(d){const x=dateOf(d);return (x.getMonth()+1)+'월 '+x.getDate()+'일'}
function mdw(d){return md(d)+' ('+'일월화수목금토'[dateOf(d).getDay()]+')'}
function P(id){return S.people.find(p=>p.id==id)}
function rated(p){return p.grade!=null}
function cycleDays(p){if(p.hold)return p.cycle==='auto'?30:p.cycle;return p.cycle==='auto'?DEFC[p.grade]:p.cycle}
function lastC(p){return p.contacts.length?p.contacts[p.contacts.length-1].day:p.ratedDay}
function stage(p){const c=cycleDays(p);if(!c)return {k:'none',t:'연락 안 함',o:99};const diff=S.day-(lastC(p)+c);
 if(diff<0)return {k:'fresh',t:'신선 D-'+(-diff),o:3,d:diff};if(diff==0)return {k:'today',t:'오늘 손질',o:2,d:0};
 if(diff<14)return {k:'aging',t:'숙성 중 D+'+diff,o:1,d:diff};return {k:'spoil',t:'상하기 직전 D+'+diff,o:0,d:diff}}
function cycLabel(p){const c=cycleDays(p);const x=CYC.find(z=>z[0]===c);return x?x[1]:'등급 따라 자동'}
function fbn(id){return id==='p1'||id==='o1'?'fbn-p1':id==='p2'||id==='o2'?'fbn-p2':id==='p9'||id==='o9'?'fbn-p9':''}
function emo(p,cls='em'){const id=p.hold||p.persona==null?'hold':'p'+p.persona;const src=id==='hold'?'emoji/hold.svg':'emoji/'+id+'.svg';const c=[cls,fbn(id)].filter(Boolean).join(' ');return `<img class="${c}" src="${src}" alt="">`}
function stamp(g,big){if(g==null)return `<span class="stamp hold ${big?'big':''}"></span>`;return `<span class="stamp g${g} ${big?'big':''}"><i class="ink">${GR[g][0]}</i></span>`}
function organic(p){const wk=d=>Math.floor((d-S.day%7+70000)/7);if(!p.pats||!p.pats.length)return false;const w=new Set(p.pats.map(d=>Math.floor(d/7)));const cw=Math.floor(S.day/7);return (w.has(cw)&&w.has(cw-1))||(w.has(cw-1)&&w.has(cw-2))}
function visible(){return S.people.filter(p=>!p.hidden)}
function personTags(p){return [...new Set([].concat(p.memo||[],p.rep||[]).map(String))]}
function matchPerson(p,q){const s=String(q||'').trim().toLowerCase();if(!s)return true;return p.name.toLowerCase().includes(s)||personTags(p).some(t=>t.toLowerCase().includes(s))}
function searchPeople(){return visible().filter(p=>rated(p)||p.hold)}
function searchAll(q){return S.people.filter(p=>matchPerson(p,q))}
function searchAct(p){return p.hidden?'open':(!rated(p)&&!p.hold)?'write':'open'}
function searchFlags(p){let h='';if(!rated(p)&&!p.hold)h+='<span class="pill st-none">평가 전</span>';if(p.hidden)h+='<span class="pill st-none">숨김</span>';return h}
/* v22: 앱 설치 후 저장한 연락처만, 7일, 최근 저장 순 */function newOnes(){const ins=S.installDay??-Infinity;return visible().filter(p=>p.isNew&&!rated(p)&&!p.hold&&p.addedDay>=ins&&S.day-p.addedDay<7).sort((a,b)=>b.addedDay-a.addedDay||b.id-a.id)}
function todayList(){return visible().filter(p=>rated(p)&&!p.hold&&['today','aging','spoil'].includes(stage(p).k)).sort(sortFn)}
function holdList(){return visible().filter(p=>p.hold).sort((a,b)=>(a.ratedDay??0)-(b.ratedDay??0)||a.id-b.id)}
function byStage(k){return visible().filter(p=>rated(p)&&!p.hold&&stage(p).k==k).sort((a,b)=>(stage(b).d||0)-(stage(a).d||0))}
function sortFn(a,b){const x=stage(a),y=stage(b);if(x.o!=y.o)return x.o-y.o;return x.o<=1?y.d-x.d:(x.d||0)-(y.d||0)}
function countN(){return todayList().length}

function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2000)}
function go(v,dir){nav.push(v);render(dir||'fwd')}
function back(){if(nav.length>1)nav.pop();render('back')}
function tab(v){if(v=='verdict'){openVerdict();return}nav=[{v}];render('fade')}

/* seed */
function mk(o){return Object.assign({id:S.seq++,name:'',phone:'',isNew:false,addedDay:S.day,grade:null,persona:null,hold:false,cycle:'auto',again:null,rel:null,memo:[],rep:[],priv:false,contacts:[],ratedDay:S.day,hidden:false,kkul:[],pats:[]},o)}
function seed(){S=blank();const d=0;
 const add=o=>S.people.push(mk(o));
 add({name:'박철호 부장',phone:'010-****-1234',grade:5,persona:2,ratedDay:-60,contacts:[{day:-7,t:'전화'}],rep:['숫자에 강함','약속 칼같음'],memo:['여의도','골프'],pats:[-8,-2],pub:true});
 add({name:'김형준 대표',phone:'010-****-2231',grade:4,persona:5,ratedDay:-120,contacts:[{day:-51,t:'문자'}]});
 add({name:'이서연 과장',phone:'010-****-3412',grade:3,persona:0,ratedDay:-100,contacts:[{day:-93,t:'연락했어요'}],memo:['80년대']});
 add({name:'윤지현 팀장',phone:'010-****-5520',grade:4,persona:1,cycle:7,ratedDay:-40,contacts:[{day:-9,t:'전화'}],pats:[-9,-3]});
 add({name:'최영수 상무',phone:'010-****-6604',grade:2,persona:3,ratedDay:-30,contacts:[{day:-10,t:'전화'}],rep:['말만 투뿔']});
 add({name:'정은주 차장',phone:'010-****-7781',grade:1,persona:6,ratedDay:-20,rep:['답장 냉동 보관','핑계 양념']});
 add({name:'최은정 이사',phone:'010-****-8890',grade:4,persona:5,ratedDay:-15,contacts:[{day:-5,t:'문자'}]});
 add({name:'서준호 대리',phone:'010-****-9012',grade:2,persona:4,ratedDay:-25,contacts:[{day:-20,t:'전화'}]});
 add({name:'한동욱 이사',phone:'010-****-1150',hold:true,cycle:180,ratedDay:-127});
 add({name:'김민준 과장',phone:'010-****-2267',hold:true,ratedDay:-3});
 add({name:'윤기석 대표',phone:'010-****-3378',isNew:true,addedDay:0,ratedDay:null});
 add({name:'강태현 차장',phone:'010-****-4489',isNew:true,addedDay:-3,ratedDay:null});
 /* v22 예시: 설치 후 새로 저장 6명 더(총 8명) */
 [['문지호 과장','6120',0],['배수아 대리','6231',-1],['홍재민 차장','6342',-2],['안소희 팀장','6453',-4],['류건우 부장','6564',-5],['임채원 대리','6675',-6]].forEach(x=>add({name:x[0],phone:'010-****-'+x[1],isNew:true,addedDay:x[2],ratedDay:null}));
 /* v22 예시: 설치 전부터 있던 연락처(새로 들어온 고기 아님, 진열대 검색으로 찾음) */
 [['송민호 상무','7011'],['장예린 과장','7122']].forEach(x=>add({name:x[0],phone:'010-****-'+x[1],isNew:false,addedDay:-400,ratedDay:null}));
 /* v30: 손질할 고기·판정 보류·상하기 직전 칸이 넘치도록 */
 add({name:'고명수 전무',phone:'010-****-8801',grade:5,persona:8,ratedDay:-40,contacts:[{day:-30,t:'전화'}]});
 add({name:'남기철 이사',phone:'010-****-8802',grade:3,persona:9,ratedDay:-200,contacts:[{day:-120,t:'문자'}]});
 add({name:'오나라 팀장',phone:'010-****-8803',hold:true,ratedDay:-10});
 add({name:'백승우 대리',phone:'010-****-8804',hold:true,ratedDay:-1});
 add({name:'오승민 대리',phone:'010-****-5591',grade:3,persona:0,ratedDay:-50,hidden:true});
 S.installDay=-30;S.firstWrite=true;morning();save()}
function morning(){const t=todayList(),sp=t.filter(p=>stage(p).k=='spoil').length;let s='오늘 손질할 고기 '+t.length+'개';if(sp)s+=' · 상하기 직전 '+sp+'개';const n=newOnes().length;if(n)s+=' · 새로 들어온 고기 '+n+'개';const h=holdList().length;if(h)s+=' · 판단 보류 '+h+'개';
 const re=visible().filter(p=>(rated(p)||p.hold)&&p.ratedDay!=null&&S.day-p.ratedDay>=90).length;if(re)s+=' · 다시 맛볼 고기 '+re+'개';
 S.notifs.unshift({day:S.day,kind:'아침 장보기',text:s,read:false});
 if(dateOf(S.day).getDay()==6){S.notifs.unshift({day:S.day,kind:'주간 조회',text:'이번 주 내가 평가한 사람들의 판정서가 4번 열렸어요.',read:false,test:true});S.notifs.unshift({day:S.day,kind:'쓰다듬기',text:'이번 주 당신을 쓰담쓰담 한 사람이 있어요.',read:false,test:true})}
 S.notifs=S.notifs.filter(n=>S.day-n.day<=30).slice(0,100);S.readBell=false}

/* render */
function render(dir){const v=nav[nav.length-1];if(v.v=='verdict'){$('#vlayer').innerHTML=verdict();return}const app=$('#app');let h='';
 const f={shelf,fridge,tags,verdict,person,write,notifs,settings,tagPeople,pubVerdict,addContact}[v.v];h=f(v);
 const tabs=['shelf','fridge','tags','verdict'];
 if(tabs.includes(v.v))h+=navBar(v.v);
 app.innerHTML=h;const sc=app.querySelector('.scr');if(sc&&dir){sc.classList.add('enter');if(dir=='back')sc.classList.add('back');if(dir=='fade')sc.classList.add('fade')}
 if(dir&&dir!=='same')window.scrollTo(0,0);
 if(v.v=='shelf')fitStall();
 if(window.curlRest)curlRest();
 const n=countN();const ne=app.querySelector('#nnum');if(ne&&lastN!=null&&lastN!==n){ne.classList.add('bump')}lastN=n}
function fitStall(){if(!nav[nav.length-1]||nav[nav.length-1].v!='shelf')return;const w=$('.stallwrap'),app=$('#app');if(!w||!app)return;w.style.setProperty('--s',String(Math.min(1,app.clientWidth/376)))}
function navBar(c){const t=[['shelf','진열대','🥩'],['fridge','냉장고','🧊'],['tags','태그','🏷️'],['verdict','내 판정서','📋']];
 return `<nav class="tab">${t.map(x=>x[0]=='verdict'?`<button class="vt" tabindex="-1" aria-hidden="true"><b>${x[2]}</b>${x[1]}</button>`:`<button data-a="tab" data-v="${x[0]}" class="${c==x[0]?'on':''}"><b data-ic="${x[0]}">${x[2]}</b>${x[1]}</button>`).join('')}</nav>`}
function info(k){return `<button class="info" data-a="info" data-k="${k}">i</button>`}

function shelf(){const nw=newOnes(),td=todayList(),hd=holdList(),fr=byStage('fresh'),ag=byStage('aging'),sp=byStage('spoil');const q=ui.q||'';
 const unread=S.notifs.some(x=>!x.read)&&!S.readBell;
 let h=`<div class="scr"><div class="hd"><h1 data-a="secret">진열대</h1>${info('shelf')}<span class="sp"></span><button class="ib" data-a="bell"><span class="bic">🔔</span>${unread?'<span class="dot"></span>':''}</button></div>
 <div class="search"><span class="sic">🔍</span><input id="q" type="search" placeholder="이름 / 태그 로 검색" value="${esc(q)}" autocomplete="off" enterkeyhint="search"></div>`;
 if(q.trim()){const r=searchAll(q);
  h+=`<div class="card" style="margin-top:10px">${r.map(p=>`<div class="row tap" data-a="${searchAct(p)}" data-id="${p.id}">${stamp(p.grade)}<div class="grow"><div class="nm">${esc(p.name)}</div>${searchFlags(p)?`<div class="sflags">${searchFlags(p)}</div>`:''}<div class="meta">${p.phone}</div></div><span class="go">${rated(p)||p.hold?'›':'평가 쓰기 →'}</span></div>`).join('')}
  <div class="row tap" data-a="add"><div class="grow"><div class="nm">＋ 새 연락처로 추가</div><div class="meta">테스트용: 폰 연락처 대신 여기서 넣어요</div></div></div></div>`;
  return h+'</div>'}
 if(!nw.length&&!td.length&&!hd.length&&!fr.length&&!ag.length&&!sp.length)h+=`<div class="empty">오늘은 손질할 고기가 없어요.<br>이름이나 번호로 찾아 평가를 써 보세요.</div>`;
 /* sprite positions from build_base_c2.py / build_n1e.py (390 canvas, crop origin 8,136) */
 const FB={hold:[9,26,211,192],p0:[11,30,208,189],p1:[10,33,209,190],p2:[9,33,210,187],p3:[11,27,211,193],p4:[12,31,210,189],p5:[11,29,209,192],p6:[11,29,209,190],p7:[12,16,211,203],p8:[11,29,209,191],p9:[10,22,210,199],p10:[11,12,211,206],p11:[11,23,209,196]};
 const SLOT={trim:{cx:[66,130,194,258],bottom:172,width:52},hold:{cx:[238,297],bottom:322,width:50},fresh:{cx:[82],bottom:466,width:50},aging:{cx:[186],bottom:466,width:50},spoil:{cx:[290],bottom:466,width:50}};
 const LAB={trim:{ax:36,ay:10,paperW:72,cx:187,cy:217,w:74,h:23},nw:{ax:43,ay:9,paperW:86,cx:108,cy:361,w:88,h:21},hold:{ax:29,ay:9.5,paperW:58,cx:266,cy:361,w:60,h:22},fresh:{ax:17,ay:9,paperW:34,cx:82,cy:505,w:36,h:21},aging:{ax:24,ay:9,paperW:48,cx:186,cy:505,w:50,h:21},spoil:{ax:30,ay:9,paperW:60,cx:290,cy:505,w:62,h:21}};
 const CW=[0,26,29,30,30,29,30,30,30,29,37,33,36,37,37,36,37,36,37,36,40,35,39,40,40];
 const BOX={trim:[0,96,376,150],nw:[0,255,188,125],hold:[188,255,188,125],fresh:[0,378,124,152],aging:[124,378,126,152],spoil:[250,378,126,152]};
 const art=(name,w,ht,style,alt,cls)=>`<img class="${cls||'px'}" src="art/${name}.png" srcset="art/${name}.png 1x, art/${name}@2x.png 2x, art/${name}@3x.png 3x" width="${w}" height="${ht}" alt="${alt||''}" draggable="false" style="${style}">`;
 const FM={p1:{m:1.0625,ax:104,ay:190},p2:{m:1.1047,ax:110,ay:187},p9:{m:1.1771,ax:111.5,ay:199}};
 const face=(p,slot,i,box)=>{const id=p.hold||p.persona==null?'hold':'p'+p.persona;const b=FB[id];const n=FM[id];const m=n?n.m:1;const ax=n?n.ax:(b[0]+b[2])/2;const ay=n?n.ay:b[3];const cssW=slot.width*220/(b[2]-b[0])*m;const left=slot.cx[i]-box[0]-cssW*ax/220;const top=slot.bottom-box[1]-cssW*ay/220;const src=id==='hold'?'emoji/hold.svg':'emoji/'+id+'.svg';const st=`left:${left.toFixed(1)}px;top:${top.toFixed(1)}px;width:${cssW.toFixed(1)}px;height:${cssW.toFixed(1)}px`;const ols=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]].map(([x,y])=>`<img alt="" draggable="false" style="transform:translate(${x}px,${y}px)" src="${src}">`).join('');return `<span class="fc-ol" style="${st}">${ols}</span><img class="fc" src="${src}" alt="" draggable="false" style="${st}">`};
 const sec=(k,title,list,n,inner)=>{const over=Math.max(0,list.length-n);const aria=over?`${title}, ${over}명 더 보기`:`${title}, ${list.length}명`;const m=LAB[k],box=BOX[k];
  let lcx=m.cx,chip='';
  if(over){const wc=CW[over]||CW[24];const gl=m.cx-Math.floor((m.paperW+2+wc+2)/2);lcx=gl+Math.floor(m.paperW/2);const cL=gl+m.paperW+2+1-box[0];const cT=m.cy-10-box[1];chip=art('chip-'+Math.min(over,24), (CW[Math.min(over,24)]||40)+1, 24, `left:${cL}px;top:${cT}px`, '', 'ch px')}
  const stk=art('lab-'+k, m.w, m.h, `left:${(lcx-m.ax-box[0]).toFixed(1)}px;top:${(m.cy-m.ay-box[1]).toFixed(1)}px`, '', 'stk px');
  return `<button type="button" class="sec" data-a="sec" data-k="${k}" aria-label="${esc(aria)}" style="left:${box[0]}px;top:${box[1]}px;width:${box[2]}px;height:${box[3]}px"><span class="pan">${inner}</span><span class="labg">${stk}${chip}</span></button>`};
 const packs=nw.slice(0,2).map((_,i)=>{const p=[{x:44,y:280},{x:112,y:280}][i];const b=BOX.nw;return art('pack',56,46,`left:${p.x-b[0]}px;top:${p.y-b[1]}px`,'새로 들어온 사람, 아직 판정 없음','pk px')}).join('');
 h+=`<div class="stallwrap"><div class="stall">${art('stall',376,530,'','','stallbg') }
 ${sec('trim','손질할 고기',td,4,td.slice(0,4).map((p,i)=>face(p,SLOT.trim,i,BOX.trim)).join(''))}
 ${sec('nw','새로 들어온 고기',nw,2,packs)}
 ${sec('hold','판정 보류',hd,2,hd.slice(0,2).map((p,i)=>face(p,SLOT.hold,i,BOX.hold)).join(''))}
 ${sec('fresh','신선',fr,1,fr.slice(0,1).map((p,i)=>face(p,SLOT.fresh,i,BOX.fresh)).join(''))}
 ${sec('aging','숙성 중',ag,1,ag.slice(0,1).map((p,i)=>face(p,SLOT.aging,i,BOX.aging)).join(''))}
 ${sec('spoil','상하기 직전',sp,1,sp.slice(0,1).map((p,i)=>face(p,SLOT.spoil,i,BOX.spoil)).join(''))}
 </div></div>`;
 return h+'</div>'}

function fridge(){const f=ui.ff||{st:[],gr:[],tg:[]};f.tg=[];/* v18: 냉장고 태그 필터 없앰(태그 탭이 따로 있음) */const sq=(ui.fs||'').trim().toLowerCase();let L=sq?searchAll(sq):searchPeople();
 if(f.st.length)L=L.filter(p=>f.st.includes(stage(p).k));
 if(f.gr.length)L=L.filter(p=>f.gr.includes(p.hold?'hold':String(p.grade)));
 if(f.tg.length)L=L.filter(p=>f.tg.every(t=>p.memo.includes(t)||p.rep.includes(t)||(t.endsWith('년대')&&p.memo.some(m=>/^\d{4}$/.test(m)&&(m.slice(2,3)+'0년대'==t)))));
 L.sort(sortFn);const all=visible().filter(p=>rated(p)||p.hold).length;
 let h=`<div class="scr"><div class="hd"><h1>냉장고</h1><span class="sp"></span></div>
 <div class="search fsrch"><span class="sic">🔍</span><input id="fqs" type="search" placeholder="이름 / 태그 로 검색" value="${esc(ui.fs||'')}" autocomplete="off" enterkeyhint="search"></div>
 <div class="chips frow gst" style="margin:6px 0 8px"><button class="gsb gall ${f.gr.length||f.st.length?'':'on'}" data-a="fall" aria-pressed="${!(f.gr.length||f.st.length)}" aria-label="전체(등급·상태 선택 해제)"><span class="stamp"><i class="ink">전체</i></span></button>${[5,4,3,2,1].map(g=>[String(g),GR[g][0],'g'+g]).concat([['hold','보류','ghd']]).map(x=>`<button class="gsb ${f.gr.includes(x[0])?'on':''}" data-a="fq" data-k="gr" data-x="${x[0]}" aria-pressed="${f.gr.includes(x[0])}" aria-label="${x[0]=='hold'?'판단 보류':x[1]+' 등급'}"><span class="stamp ${x[2]}"><i class="ink">${esc(x[1])}</i></span></button>`).join('')}</div>
 <div class="chips frow" style="margin:0 0 12px">${[['fresh','신선'],['today','오늘 손질'],['aging','숙성 중'],['spoil','상하기 직전']].map(x=>`<button class="chip sm ${f.st.includes(x[0])?'on':''}" data-a="fq" data-k="st" data-x="${x[0]}">${esc(x[1])}</button>`).join('')}<span class="small sortlbl">연락 임박순</span></div>`;
 if(!all)return h+`<div class="empty">냉장고가 비어 있어요.<br>진열대에서 연락처를 찾아 첫 평가를 써 보세요.<br><br><button class="btn-red-sm" data-a="tab" data-v="shelf">진열대로 가기</button></div></div>`;
 if(!L.length)return h+`<div id="flist"><div class="empty">맞는 사람이 없어요</div></div></div>`;
 const cell=p=>{const s=p.hold?{k:'none',t:'판단 보류'}:stage(p);const mt=sq?personTags(p).filter(t=>t.toLowerCase().includes(sq)):[];const org=!p.hold&&p.persona!=null&&organic(p);const bare=!rated(p)&&!p.hold;
  return `<div class="row tap frrow" data-a="${searchAct(p)}" data-id="${p.id}"><div class="tav">${emo(p,'').replace('src="emoji/p'+p.persona,org?'src="emoji/o'+p.persona:'src="emoji/p'+p.persona)}${bare||p.grade==null?'':stamp(p.grade)}</div><div class="grow"><div class="nm"><span class="nmt">${esc(p.name)}</span>${org?'<span class="org">유기농</span>':''}</div><div class="meta">${cycLabel(p)} 주기${mt.length?' · '+mt.map(esc).join(' · '):''}</div></div><div class="frchips">${bare?'':`<span class="pill st-${s.k}">${s.t}</span>`}${searchFlags(p)}</div></div>`};
 let tiers='';
 for(let i=0;i<L.length;i+=2)tiers+=`<div class="frtier${L[i+1]?'':' solo'}">${cell(L[i])}${L[i+1]?cell(L[i+1]):'<div class="frpad"></div>'}</div>`;
 const decal=(n,c)=>`<img class="frz-${c}" alt="" draggable="false" src="art/${n}.png" srcset="art/${n}.png 1x, art/${n}@2x.png 2x">`;
 return h+`<div id="flist"><div class="card frz">${decal('arc','arc')}${decal('spark','spark')}<div class="frz-room">${tiers}${decal('frost','frost')}</div><i class="frz-foot"></i><i class="frz-foot r"></i></div></div></div>`}

function allMemo(){const m={};GROUPS.forEach(g=>m[g[0]]=[...(g[0]=='생년'?[]:g[2])]);Object.entries(S.customTags).forEach(([g,a])=>a.forEach(t=>{if(!m[g].includes(t))m[g].push(t)}));S.people.forEach(p=>p.memo.forEach(t=>{const g=groupOf(t);if(g&&!m[g].includes(t))m[g].push(t)}));return m}
function groupOf(t){if(/^\d{4}$/.test(t)||/년대$/.test(t))return '생년';for(const g of GROUPS)if(g[2].includes(t))return g[0];for(const [g,a] of Object.entries(S.customTags))if(a.includes(t))return g;return null}
function tags(){const m=allMemo();const used=t=>S.people.some(p=>!p.hidden&&(p.memo.includes(t)||p.rep.includes(t)));
 let h=`<div class="scr"><div class="hd"><h1>태그</h1>${info('tags')}</div><div class="note" style="margin:0 0 10px">메모 태그는 나만 봐요. 평판 태그만 익명으로 모여요.</div>`;
 GROUPS.forEach(g=>{const ts=m[g[0]];h+=`<div class="grp"><div class="gn"><span class="gdot" style="background:${g[1]}"></span>${g[0]}</div><div class="chips">${ts.map(t=>`<button class="chip sm" style="${used(t)?'':'opacity:.45'}" data-a="tagp" data-t="${esc(t)}">${esc(t)}</button>`).join('')||'<span class="small">아직 없어요</span>'}</div></div>`});
 h+=`<div class="grp"><div class="gn"><span class="gdot" style="background:#7F7CF6"></span>평판 <span class="badge">익명 공개</span></div><div class="chips">${[...REP_POS,...REP_NEG].filter(used).map(t=>`<button class="chip sm" data-a="tagp" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>`;
 return h+'</div>'}
function tagPeople(v){const L=visible().filter(p=>p.memo.includes(v.t)||p.rep.includes(v.t));const isRep=REP_POS.includes(v.t)||REP_NEG.includes(v.t);
 return `<div class="scr"><div class="hd"><button class="back" data-a="back">‹</button><h1 style="font-size:1.1765rem">${esc(v.t)}</h1></div>${isRep?`<div class="small">내 연락처 ${L.length}명</div>`:''}<div class="card" style="margin-top:10px">${L.map(p=>`<div class="row tap" data-a="open" data-id="${p.id}">${stamp(p.grade)}<div class="grow"><div class="nm">${emo(p)} ${esc(p.name)}</div></div></div>`).join('')||'<div class="empty">아직 없어요</div>'}</div></div>`}

/* 판정서 (테스트용 예시) */
function fakeRaters(n){const out=[];const g=[5,4,4,5,3,4,5,4,2,4];const pe=[2,2,5,1,2,0,2,5,2,3];const reps=[['숫자에 강함','답장 냉동 보관'],['숫자에 강함'],['약속 칼같음','답장 냉동 보관'],['숫자에 강함','인맥왕'],['답장 냉동 보관','뒷심 부족'],['약속 칼같음'],['인맥왕','뒷심 부족'],['약속 칼같음'],[],['디테일 장인']];
 for(let i=0;i<n;i++)out.push({g:g[i%10],p:pe[i%10],r:reps[i%10]});return out}
function mode(a){const c={};a.forEach(x=>c[x]=(c[x]||0)+1);return +Object.entries(c).sort((a,b)=>b[1]-a[1])[0][0]}
function verdictBody(n,pub){const R=fakeRaters(n);const g=mode(R.map(r=>r.g)),pe=mode(R.map(r=>r.p));const c={};R.forEach(r=>new Set(r.r).forEach(t=>c[t]=(c[t]||0)+1));
 let tg=Object.keys(c).filter(t=>c[t]>=3);if(pub)tg=tg.filter(t=>!REP_NEG.includes(t));
 const sat=S.day-((dateOf(S.day).getDay()+1)%7);
 return `<div class="vcard"><div class="testbar">테스트용 예시</div><div class="small">${mdw(sat)} 기준 · 평가 5명 이상 · 익명 종합</div><div style="margin:14px 0 6px">${stamp(g,true)}</div><div style="font-weight:800;font-size:1.1765rem">${GR[g][0]} ${GR[g][1]}</div>
 <div style="margin-top:16px"><img class="em-big" src="emoji/p${pe}.svg"></div><div style="margin-top:6px">사람들이 꼽은 대표 성격 · <b>${PERS[pe]} 타입</b></div>
 <div class="chips" style="justify-content:center;margin-top:14px">${tg.map(t=>`<span class="chip sm ${REP_NEG.includes(t)?'neg':''}">${esc(t)}</span>`).join('')}</div>
 <div class="small" style="margin-top:12px">결과는 매주 토요일 오전 9시에 갱신돼요</div></div>`}
function verdictCert(n){const R=fakeRaters(n);const g=mode(R.map(r=>r.g)),pe=mode(R.map(r=>r.p));const c={};R.forEach(r=>new Set(r.r).forEach(t=>c[t]=(c[t]||0)+1));
 const tg=Object.keys(c).filter(t=>c[t]>=3);const sat=S.day-((dateOf(S.day).getDay()+1)%7);
 return `<div class="cert"><div class="tb2">테스트용 예시</div><div class="when">${mdw(sat)} 기준 · 평가 5명 이상 · 익명 종합</div><div class="rule"></div><div class="hero"><div class="halo"></div><img src="emoji/p${pe}.svg" alt=""><div class="vstamp g${g}"><i class="ink">${GR[g][0]}</i></div></div><div class="grade">${GR[g][0]} ${GR[g][1]}</div><div class="pers">사람들이 꼽은 대표 성격 · <b>${PERS[pe]} 타입</b></div><div class="chips">${tg.map(t=>`<span class="chip sm ${REP_NEG.includes(t)?'neg':''}">${esc(t)}</span>`).join('')}</div><div class="upd">결과는 매주 토요일 오전 9시에 갱신돼요</div></div>`}
function verdict(){let h=`<div class="vd"><div class="vtop"><button class="vback" data-a="vback" aria-label="뒤로">‹</button><h1>내 판정서</h1>${info('verdict')}</div><div class="testbar">테스트용 예시 · 휴대폰 번호 인증은 건너뛰어요</div>`;
 if(!S.accepted)return h+`<h2 style="margin-top:20px">내 판정서 받기</h2><p class="note" style="font-size:0.8824rem;color:var(--ink)">평가가 5명 이상 모이면 익명 종합 결과만 볼 수 있어요. 누가 평가했는지는 알 수 없어요.</p>${S.reopen?'<p class="note">평가자들이 남긴 예전 평가까지 모두 다시 모여요.</p>':''}
  <label class="inp">이 번호를 언제부터 쓰셨나요?<input value="2019년 3월" readonly></label><div class="small" style="margin-top:6px">이 날짜 전에 쌓인 평가는 판정서에 넣지 않아요.</div><div style="height:20px"></div><button class="btn-r" data-a="accept">판정서 받기 시작</button></div>`;
 if(S.verdictN<5)h+=`<div class="vcard" style="margin-top:12px"><p style="line-height:1.6;margin:0 0 14px">판정 대기 중이에요. 등급 평가가 5명 미만이라 아직 보여드릴 수 없어요. 여의도 정육점을 주변에 알려주면 더 빨리 판정돼요!</p><button class="btn-r" data-a="invite">초대 링크 보내기</button><div class="small" style="margin-top:8px">링크에는 내 번호·계정 정보가 담기지 않아요.</div><div class="small" style="margin-top:12px">결과는 매주 토요일 오전 9시에 갱신돼요</div></div>
  <div class="sw" style="margin-top:16px"><div class="grow"><b>판정서 공개</b><span>판정서가 열리면 공개할 수 있어요.</span></div><span class="tog" style="opacity:.4"></span></div>`;
 else h+=`<div style="margin-top:12px">${verdictCert(S.verdictN)}</div><div class="sw" style="margin-top:16px"><div class="grow"><b>판정서 공개</b><span>${S.pub?'내 번호를 아는 앱 사용자에게 보여지고 있어요. 누가 봤는지는 알려드리지 않아요.':'켜면 내 번호를 아는 앱 사용자가 이 판정서를 볼 수 있어요.'}</span></div><button class="tog ${S.pub?'on':''}" data-a="pubtog"></button></div>`;
 return h+`<button class="link-red" data-a="closev">판정서 닫기</button></div>`}
function pubVerdict(v){return `<div class="scr"><div class="hd"><button class="back" data-a="back">‹</button><h1 style="font-size:1.1765rem">공개된 판정서</h1></div>${verdictBody(7,true)}<p class="note">부정 태그는 공개된 판정서에 보이지 않아요.</p></div>`}

/* 사람 상세 */
function person(v){const p=P(v.id);if(!p){return shelf()}const s=stage(p);const hold=p.hold;
 const chips=(list,kind)=>`<span class="tlist">${list.length?list.map(t=>`<span class="ptag ${kind}${kind==='rep'&&REP_NEG.includes(t)?' neg':''}">${esc(t)}</span>`).join(''):'<span class="blank">빈칸</span>'}</span>`;
 let h=`<div class="scr pdetail"><div class="hd phd"><button type="button" class="pback" data-a="back" aria-label="뒤로가기"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M 11 5 L 4 12 L 11 19 M 4 12 H 21" fill="none" stroke="#252525" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="sp"></span></div>
 <div class="ph-head">${!hold&&!S.gintro?'<div class="gintro">캐릭터를 쓰다듬거나,<br>두 번 톡톡 꿀밤을 줘 보세요</div>':''}<div class="gz${hold?' nog':''}" ${hold?'':`data-gid="${p.id}"`}>${!hold&&!S.gintro?'<span class="gh gh-l" aria-hidden="true">👆<br>⟷</span><span class="gh gh-r" aria-hidden="true">((👆</span>':''}<div class="av"><span class="face">${!hold&&p.persona!=null&&organic(p)?`<img class="${fbn('o'+p.persona)}" src="emoji/o${p.persona}.svg" alt="유기농">`:emo(p,'')}<i class="fx"></i></span>${hold||p.grade==null||p.persona==null?'':`<button class="stampbtn" data-a="pgsheet" data-id="${p.id}" aria-label="성격·등급 고르기">${stamp(p.grade,true)}</button>`}</div>${hold?'':`<button class="sr" data-a="gpat" data-id="${p.id}">쓰담쓰담</button><button class="sr" data-a="gkkul" data-id="${p.id}">꿀밤 콩콩</button>`}</div><button class="plabel" data-a="pgsheet" data-id="${p.id}">${hold?'판단 보류':(p.grade==null||p.persona==null)?'아직 판정 없음':PERS[p.persona]+' · '+GR[p.grade][0]+'등급'} ›</button><h1>${esc(p.name)} ${hold&&organic(p)?'<span class="org" data-a="orgtip">유기농</span>':''}</h1><div class="small">${p.phone}</div></div>`;
 if(p.ratedDay!=null&&S.day-p.ratedDay>=90)h+=`<div class="recard"><span class="grow">${hold?'이제 등급을 매겨 볼까요?':'지금도 '+GR[p.grade][0]+'인가요? 다시 평가해 보세요.'}</span><button class="chip sm" data-a="stillok" data-id="${p.id}">${hold?'아직 보류할게요':'지금도 맞아요'}</button></div>`;
 h+=`<div class="three"><button class="bigb" data-a="call" data-t="전화" data-id="${p.id}">📞 전화걸기</button><button class="bigb red" data-a="call" data-t="연락했어요" data-id="${p.id}">✓ 연락했어요</button></div>`;
 h+=`<h2>내 평가</h2><div class="card">`;
 if(!hold)h+=[['again','다시 맡기기',AGAIN],['rel','관계',REL]].map(([f,k,L])=>`<div class="kvsec"><span class="k">${k}</span><div class="chips">${L.map(a=>`<button class="chip ${p[f]===a?'on':''}" data-a="qset" data-f="${f}" data-x="${a}" data-id="${p.id}" aria-pressed="${p[f]===a}">${a}</button>`).join('')}</div></div>`).join('');
 h+=`<div class="kv kvtags" data-a="edit" data-f="memo" data-id="${p.id}"><span class="k">메모 태그 <span class="badge me">나만 보기</span></span><span class="v tchips">${chips(p.memo,'memo')}</span></div>`;
 if(!hold)h+=`<div class="kv kvtags" data-a="edit" data-f="rep" data-id="${p.id}"><span class="k">평판 태그 <span class="badge">익명 공개</span></span><span class="v tchips">${chips(p.rep,'rep')}</span></div><div class="kv" data-a="edit" data-f="priv" data-id="${p.id}"><span class="k">판정서 반영</span><span class="v">${p.priv?'나만 보기':'익명으로 반영'}</span></div>`;
 h+=`</div><h2>신선도</h2><div class="card"><div class="kv" data-a="edit" data-f="cycle" data-id="${p.id}"><span class="k">${cycLabel(p)} 주기 · 마지막 연락 ${lastC(p)!=null?md(lastC(p)):'없음'}</span><span class="pill st-${s.k}">${hold?'판단 보류':s.t}</span></div></div>
 <h2>연락 기록</h2><div class="card">${p.contacts.slice().reverse().map(c=>`<div class="kv ro"><span>${md(c.day)} ${c.t}</span></div>`).join('')||'<div class="kv ro"><span class="k">아직 없어요</span></div>'}</div>`;
 if(p.pub)h+=`<button class="btn-g" style="margin-top:14px" data-a="pubv">공개된 판정서 보기 <span class="badge test">테스트용 예시</span></button>`;
 h+=p.hidden?`<button class="btn-g" style="margin-top:14px" data-a="unhide" data-id="${p.id}">다시 보이기</button>`:`<button class="btn-g" style="margin-top:14px" data-a="hide" data-id="${p.id}">냉장고에서 숨기기</button>`;
 h+=`<button class="link-red" data-a="del" data-id="${p.id}">${hold?'이 기록 지우기':'이 평가 지우기'}</button></div>`;
 return h}

/* 평가 쓰기 */
function write(v){const p=P(v.id);const w=ui.w;const hold=w.hold;const ok=hold||(w.grade!=null&&w.persona!=null);
 let h=`<div class="scr nonav"><div class="hd"><button class="back" data-a="back">‹</button><div style="flex:1"><div style="font-weight:800;font-size:1.1765rem">${esc(p.name)}</div><div class="small">${p.phone}</div>${S.firstWrite?'<div class="small">이름은 이 폰에서만 읽어요</div>':''}</div>${info('write')}</div>
 <h2>한마디로 어떤 사람?<span class="req">필수</span></h2><div class="grid3">${PERS.map((n,i)=>`<button class="tile ${w.persona===i?'on':''}" data-a="w" data-f="persona" data-x="${i}"><img class="${fbn('p'+i)}" src="emoji/p${i}.svg">${n}</button>`).join('')}</div>
 <h2>등급 판정<span class="req">필수</span></h2><div class="grades">${[5,4,3,2,1].map(g=>`<button class="${w.grade===g?'on':''}" data-a="w" data-f="grade" data-x="${g}">${stamp(g)}${GR[g][1]}</button>`).join('')}</div>
 <button class="holdbtn ${hold?'on':''}" data-a="w" data-f="hold">아직 판단 보류 · 성격·등급 없이 저장</button>
 <h2>연락 주기</h2>${hold?'<div class="note" style="margin:-4px 0 8px">판단 보류는 자동으로 1개월 주기예요.</div>':''}<div class="chips">${CYC.map(c=>`<button class="chip ${w.cycle===c[0]?'on':''}" data-a="w" data-f="cycle" data-x="${c[0]}">${c[1]}</button>`).join('')}</div>`;
 if(!hold)h+=`<h2>다시 거래를 맡기겠다?<span class="opt">선택</span></h2><div class="chips">${AGAIN.map(a=>`<button class="chip ${w.again===a?'on':''}" data-a="w" data-f="again" data-x="${a}">${a}</button>`).join('')}</div>
 <h2>어떤 관계?<span class="opt">선택</span></h2><div class="chips">${REL.map(a=>`<button class="chip ${w.rel===a?'on':''}" data-a="w" data-f="rel" data-x="${a}">${a}</button>`).join('')}</div>`;
 h+=memoBox(w.memo)+`<div class="box ${hold?'dim':''}"><div class="boxh">평판 태그 <span class="badge">익명 공개</span></div>${hold?'<div class="note">성격과 등급을 고르면 평판 태그를 달 수 있어요.</div>':`<div class="chips">${w.rep.map(t=>`<button class="chip sm on ${REP_NEG.includes(t)?'neg':''}" data-a="reprm" data-t="${esc(t)}">${esc(t)} ✕</button>`).join('')}<button class="chip sm dash" data-a="reppick">+ 추가</button></div>`}</div></div>
 <div class="bar">${hold?'':`<div class="sw"><div class="grow"><b>이 평가는 나만 보기</b><span>끄면 상대가 평가 받기를 시작할 때 익명으로 반영돼요</span></div><button class="tog ${w.priv?'on':''}" data-a="w" data-f="priv"></button></div>`}${ok?'':'<div class="hint">성격·등급을 고르면 저장할 수 있어요</div>'}<button class="btn-r" data-a="wsave" ${ok?'':'disabled'}>저장</button></div>`;
 return h}
function memoBox(sel){const m=allMemo();return `<div class="box"><div class="boxh">메모 태그 <span class="badge me">나만 보기</span></div>${GROUPS.map(g=>{let ts=m[g[0]];if(g[0]=='생년')ts=g[2];const bsel=sel.find(t=>groupOf(t)=='생년');return `<div class="grp"><div class="gn"><span class="gdot" style="background:${g[1]}"></span>${g[0]}${g[0]=='생년'&&bsel?` <span class="chip sm on" data-a="memo" data-t="${bsel}" style="margin-left:auto">${bsel}</span>`:''}</div><div class="chips">${ts.map(t=>`<button class="chip sm ${sel.includes(t)?'on':''}" data-a="memo" data-t="${esc(t)}">${esc(t)}</button>`).join('')}${g[0]=='생년'?`<button class="chip sm dash" data-a="year">연도</button>`:`<button class="chip sm dash" data-a="memoadd" data-g="${g[0]}">+ 추가</button>`}</div></div>`}).join('')}</div>`}

function notifs(){S.readBell=true;save();const g={};S.notifs.forEach(n=>(g[n.day]=g[n.day]||[]).push(n));
 let h=`<div class="scr"><div class="hd"><button class="back" data-a="back">‹</button><h1 style="font-size:1.1765rem">알림</h1><span class="sp"></span><button class="chip sm" data-a="readall" ${S.notifs.length?'':'disabled'}>모두 읽음</button><button class="ib" data-a="settings">⚙️</button></div>`;
 if(!S.notifs.length)return h+'<div class="empty">아직 알림이 없어요.</div></div>';
 Object.keys(g).sort((a,b)=>b-a).forEach(d=>{d=+d;h+=`<h2 style="font-size:0.8824rem">${d==S.day?'오늘':d==S.day-1?'어제':mdw(d)}</h2>`+g[d].map((n,i)=>`<div class="ntf row tap" data-a="ntf" data-i="${S.notifs.indexOf(n)}"><span class="d ${n.read?'off':''}"></span><div class="grow"><div class="t">${n.kind} · ${d==S.day?'방금':'오전 9:00'} ${n.test?'<span class="badge test">테스트용 예시</span>':''}</div><div>${esc(n.text)}</div></div></div>`).join('')});
 return h+'</div>'}
function settings(){const hid=S.people.filter(p=>p.hidden);return `<div class="scr"><div class="hd"><button class="back" data-a="back">‹</button><h1 style="font-size:1.1765rem">설정</h1></div>
 <div class="testbar">테스트용 예시 · 알림 스위치는 실제로 보내지 않아요</div>
 <div class="kv" id="ptrow"><b>포인트</b><span><span id="pts">${S.pts||0}</span>점 · 테스트 값</span></div>
 ${[['아침 장보기 알림','오전 9:00',1],['주간 조회 알림','',1],['월간 조회 권유 알림','',0],['판정서 변화 알림','토요일 갱신 때 내 판정서가 바뀌면 알려드려요.',1],['쓰다듬기 알림','누군가 쓰담쓰담 하면 토요일에 모아서 알려드려요.',1],['이벤트 알림','',0]].map((x,i)=>{const on=(S.sets||{})[i]??x[2];return `<div class="sw srow"><div class="grow"><b>${x[0]}</b><span>${x[1]}</span></div><button class="tog ${on?'on':''}" data-a="settog" data-i="${i}"></button></div>`}).join('')}
 <h2>숨긴 연락처</h2><div class="card">${hid.map(p=>`<div class="row"><div class="grow nm">${esc(p.name)}</div><button class="chip sm" data-a="unhide" data-id="${p.id}">다시 보이기</button></div>`).join('')||'<div class="empty">숨긴 연락처가 없어요.</div>'}</div></div>`}
function addContact(){return `<div class="scr"><div class="hd"><button class="back" data-a="back">‹</button><h1 style="font-size:1.1765rem">새 연락처</h1></div><div class="testbar">테스트용: 실제 앱은 폰 연락처를 읽어요</div>
 <label class="inp">이름<input id="cn" maxlength="20" value="${esc(ui.q||'')}"></label><label class="inp">번호<input id="cp" inputmode="numeric" placeholder="010-0000-0000" maxlength="13"></label><div style="height:20px"></div><button class="btn-r" data-a="addsave">저장</button></div>`}

/* sheets */
function sheet(html,center){const r=$('#sheet-root');r.innerHTML=`<div class="dim ${center?'center':''}" data-a="sclose">${center?`<div class="dialog">${html}</div>`:`<div class="sheet">${html}</div>`}</div>`}
function closeSheet(){const back=ui.secFocus;ui.sec=null;ui.secFocus=null;const d=$('#sheet-root .dim');if(!d)return;d.classList.add('out');setTimeout(()=>{$('#sheet-root').innerHTML='';if(nav[nav.length-1]&&nav[nav.length-1].v=='shelf'&&back&&document.contains(back))back.focus()},matchMedia('(prefers-reduced-motion:reduce)').matches?0:200)}
function openSec(k,el){if(k=='fresh'||k=='aging'||k=='spoil'){goFridge(k,el);return}ui.sec=k;ui.sheetMore=false;ui.secFocus=el&&el.closest?el.closest('button.sec')||el:el;drawSec()}
function drawSec(){const k=ui.sec;if(!k)return;const title={trim:'손질할 고기',nw:'새로 들어온 고기',hold:'판정 보류'}[k];
 const L=k=='trim'?todayList():k=='nw'?newOnes():holdList();let body='';
 if(!L.length)body='<div class="empty">아직 없어요</div>';
 else if(k=='trim')body=L.map(p=>{const s=stage(p);const org=!p.hold&&p.persona!=null&&organic(p);const src=org?'emoji/o'+p.persona+'.svg':'emoji/p'+p.persona+'.svg';
  return `<div class="sline"><button type="button" class="who" data-a="open" data-id="${p.id}"><span class="tav"><img class="${fbn(org?'o'+p.persona:'p'+p.persona)}" src="${src}" alt="">${p.grade==null?'':stamp(p.grade)}</span><span class="grow"><span class="nm">${esc(p.name)}${org?' <span class="org">유기농</span>':''}</span><span class="meta"><span class="pill st-${s.k}">${s.t}</span></span></span></button><button type="button" class="rb" data-a="call" data-t="전화" data-id="${p.id}">전화걸기</button><button type="button" class="btn-o" data-a="call" data-t="연락했어요" data-id="${p.id}">연락했어요</button></div>`}).join('');
 else if(k=='nw'){const show=ui.sheetMore?L:L.slice(0,5);
  body=show.map(p=>`<div class="sline"><button type="button" class="who" data-a="open" data-id="${p.id}"><span class="grow"><span class="meta"><b>NEW</b> · ${S.day==p.addedDay?'오늘':(S.day-p.addedDay)+'일 전'}</span><span class="nm">${esc(p.name)}</span></span></button><button type="button" class="go" data-a="write" data-id="${p.id}">등급 매기기 →</button></div>`).join('');
  if(!ui.sheetMore&&L.length>5)body+=`<button type="button" class="row more" data-a="sheetmore">${L.length-5}명 더 보기</button>`}
 else body=L.map(p=>`<div class="sline"><button type="button" class="who" data-a="open" data-id="${p.id}"><img class="hface" src="emoji/hold.svg" alt=""><span class="grow"><span class="nm">${esc(p.name)}</span><span class="meta">${md(p.ratedDay)} 판정 보류</span></span></button><button type="button" class="go" data-a="holdsheet" data-id="${p.id}">등급 매기기 →</button></div>`).join('');
 const x='<button type="button" class="secx" data-a="sclose2" aria-label="닫기"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>';
 sheet(`<div class="sechead"><div class="sectitle"><h3 id="sec-title">${title} ${L.length}명</h3>${x}</div></div><div class="seclist">${body}</div>`);
 const sh=$('#sheet-root .sheet');if(sh){sh.classList.add('secsheet');sh.setAttribute('role','dialog');sh.setAttribute('aria-modal','true');sh.setAttribute('aria-labelledby','sec-title');sh.tabIndex=-1}bindSwipe();
 if(sh&&!sh.contains(document.activeElement)){const b=sh.querySelector('.secx');if(b)b.focus({focusVisible:false})}}
function bindSwipe(){const sh=$('#sheet-root .sheet');if(!sh||sh._sw)return;sh._sw=1;const list=sh.querySelector('.seclist');let y0=null;
 const arm=e=>{if(e.target.closest('.secx'))return;if(list&&list.scrollTop>0)return;y0=e.clientY};
 sh.querySelector('.sectitle').addEventListener('pointerdown',arm);
 sh.addEventListener('pointermove',e=>{if(y0==null)return;const dy=e.clientY-y0;sh.style.transform=dy>0?`translateY(${dy}px)`:''});
 sh.addEventListener('pointerup',()=>{if(y0==null)return;const dy=parseFloat((sh.style.transform.match(/[\d.]+/)||[0])[0]);y0=null;if(dy>64)closeSheet();else sh.style.transform=''});
 sh.addEventListener('pointercancel',()=>{y0=null;sh.style.transform=''})}
function goFridge(k){if(ui._xslide)return;
 const land=()=>{ui.ff={st:[k],gr:[],tg:[]};nav=[{v:'fridge'}];ui._xslide=0;render();window.scrollTo(0,0)};
 if(matchMedia('(prefers-reduced-motion:reduce)').matches){land();return}
 const app=$('#app'),scr=app.querySelector('.scr');if(!scr){land();return}
 ui._xslide=1;ui.ff={st:[k],gr:[],tg:[]};
 const tabnav=app.querySelector('nav.tab'),shelfB=tabnav&&tabnav.querySelector('button[data-v="shelf"]'),fridgeB=tabnav&&tabnav.querySelector('button[data-v="fridge"]');
 let mark=null,dx=0;
 if(shelfB&&fridgeB){const nr=tabnav.getBoundingClientRect(),sr=shelfB.getBoundingClientRect(),fr=fridgeB.getBoundingClientRect();
  mark=document.createElement('i');mark.className='tabglide';mark.style.left=(sr.left-nr.left+sr.width*.28)+'px';mark.style.width=(sr.width*.44)+'px';
  dx=fr.left-sr.left;tabnav.classList.add('xslide');tabnav.appendChild(mark)}
 const y=window.scrollY||0;
 const stage=document.createElement('div');stage.className='xpush';
 stage.innerHTML='<div class="xrail"><div class="xpane out"></div><div class="xpane inn"></div></div>';
 const out=stage.querySelector('.out'),inn=stage.querySelector('.inn');
 scr.style.marginTop=(-y)+'px';out.appendChild(scr);inn.innerHTML=fridge();
 const block=document.createElement('div');block.className='xpush-block';
 document.body.appendChild(block);app.appendChild(stage);
 let done=false;
 const end=()=>{if(done)return;done=true;stage.remove();block.remove();land()};
 out.addEventListener('transitionend',e=>{if(e.propertyName==='transform')end()});
 requestAnimationFrame(()=>requestAnimationFrame(()=>{stage.classList.add('go');if(mark){mark.style.transform='translateX('+dx+'px)';tabnav.classList.add('go')}}));
 setTimeout(end,1000)}
const INFO={shelf:['진열대는 이렇게 봐요',['새로 들어온 고기는 폰에 새로 저장한 연락처예요. 7일 동안 남아요.','손질할 고기는 연락할 때가 됐거나 지난 사람이에요.','판정 보류 고기는 판정 보류로 저장한 사람이에요.','신선·숙성 중·상하기 직전 칸을 누르면 냉장고의 그 상태로 넘어가요.','전화 버튼을 누르면 연락 기록이 저절로 남아요.']],
 write:['평가는 이렇게 써요',['이름은 이 폰에서만 읽어요',"아직 판단하기 이르면 '판단 보류'를 골라요. 성격과 등급 없이 저장돼요.",'평판 태그는 같은 태그를 3명 이상 달아야 판정서에 보여요.','성격과 등급만 고르면 저장돼요. 나머지 질문과 태그는 선택이에요.']],
 tags:['태그는 이렇게 써요',['태그를 누르면 그 태그가 붙은 사람을 모아 봐요.','메모 태그를 길게 누르면 이름 바꾸기, 합치기, 옮기기, 지우기를 할 수 있어요.','평판 태그는 같은 태그를 3명 이상 달았을 때만 익명으로 보여요.']],
 verdict:['',['결과는 매주 토요일 오전 9시에 갱신돼요','언제든 판정서를 닫을 수 있어요.']]};
function infoSheet(k){const x=INFO[k];sheet(`${x[0]?`<h3>${x[0]}</h3>`:''}<ul>${x[1].map(l=>`<li>${l}</li>`).join('')}</ul><button class="btn-r" data-a="sclose2">알겠어요</button>`);if(k=='write'){S.firstWrite=false;save()}}
function repSheet(){const w=ui.w;const neg=w.rep.filter(t=>REP_NEG.includes(t)).length;
 sheet(`<h3>평판 태그 고르기</h3><div class="chips">${REP_POS.map(t=>`<button class="chip sm ${w.rep.includes(t)?'on':''}" data-a="reptg" data-t="${t}">${t}</button>`).join('')}</div><div class="small" style="margin:14px 0 6px">부정 태그는 한 사람에게 3개까지</div><div class="chips">${REP_NEG.map(t=>`<button class="chip sm neg ${w.rep.includes(t)?'on':''}" data-a="reptg" data-t="${t}" ${!w.rep.includes(t)&&neg>=3?'disabled style="opacity:.35"':''}>${t}</button>`).join('')}</div><div style="height:16px"></div><button class="btn-r" data-a="sclose2">완료</button>`)}
function holdSheet(id){const p=P(id);ui.hs=p.hold?{id,grade:null,persona:null,hold:false}:{id,grade:p.grade,persona:p.persona,hold:false};drawHold()}
function drawHold(){const h=ui.hs,ok=h.hold||(h.grade!=null&&h.persona!=null);sheet(`<div class="hsheet"><h3>성격·등급 고르기</h3><div class="grid3">${PERS.map((n,i)=>`<button class="tile ${h.persona===i?'on':''}" data-a="hsx" data-f="persona" data-x="${i}"><img class="${fbn('p'+i)}" src="emoji/p${i}.svg">${n}</button>`).join('')}</div><div style="height:14px"></div><div class="grades">${[5,4,3,2,1].map(g=>`<button class="${h.grade===g?'on':''}" data-a="hsx" data-f="grade" data-x="${g}">${stamp(g)}${GR[g][1]}</button>`).join('')}</div>${ok?'':'<div class="hint">성격·등급을 고르면 저장할 수 있어요</div>'}<div class="hsrow"><button class="holdbtn ${h.hold?'on':''}" data-a="hsx" data-f="hold">판단 보류</button><button class="btn-r" data-a="hssave" ${ok?'':'disabled'}>저장</button></div></div>`)}
function editSheet(id,f){const p=P(id);ui.ed={id,f,val:JSON.parse(JSON.stringify(f=='memo'||f=='rep'?p[f]:p[f]))};drawEdit()}
function drawEdit(){const e=ui.ed,p=P(e.id);let b='';const T={grade:'등급',persona:'성격',again:'다시 맡기기',rel:'관계',memo:'메모 태그',rep:'평판 태그',priv:'판정서 반영',cycle:'연락 주기'}[e.f];
 if(e.f=='grade')b=`<div class="grades">${[5,4,3,2,1].map(g=>`<button class="${e.val===g?'on':''}" data-a="edx" data-x="${g}">${stamp(g)}${GR[g][1]}</button>`).join('')}</div>`;
 if(e.f=='persona')b=`<div class="grid3">${PERS.map((n,i)=>`<button class="tile ${e.val===i?'on':''}" data-a="edx" data-x="${i}"><img class="${fbn('p'+i)}" src="emoji/p${i}.svg">${n}</button>`).join('')}</div>`;
 if(e.f=='again'||e.f=='rel')b=`<div class="chips">${(e.f=='again'?AGAIN:REL).map(a=>`<button class="chip ${e.val===a?'on':''}" data-a="edx" data-x="${a}">${a}</button>`).join('')}</div>`;
 if(e.f=='cycle')b=`<div class="chips">${CYC.map(c=>`<button class="chip ${e.val===c[0]?'on':''}" data-a="edx" data-x="${c[0]}">${c[1]}</button>`).join('')}</div>`;
 if(e.f=='priv')b=`<div class="sw"><div class="grow"><b>이 평가는 나만 보기</b><span>끄면 상대가 평가 받기를 시작할 때 익명으로 반영돼요</span></div><button class="tog ${e.val?'on':''}" data-a="edx" data-x="t"></button></div>${e.val?'<div class="note">다음 토요일 오전 9시 갱신부터 판정서에서 빠져요. 이미 열린 지난 판정서에는 남을 수 있어요.</div>':''}`;
 if(e.f=='memo')b=memoBox(e.val);
 if(e.f=='rep'){const neg=e.val.filter(t=>REP_NEG.includes(t)).length;b=`<div class="chips">${[...REP_POS,...REP_NEG].map(t=>{const n=REP_NEG.includes(t);const off=n&&!e.val.includes(t)&&neg>=3;return `<button class="chip sm ${n?'neg':''} ${e.val.includes(t)?'on':''}" data-a="edx" data-x="${t}" ${off?'disabled style="opacity:.35"':''}>${t}</button>`}).join('')}</div>`}
 sheet(`<h3>${T}</h3>${b}<div style="height:16px"></div><button class="btn-r" data-a="edsave">저장</button>`)}
function confirmDel(id){const p=P(id);sheet(p.hold?`<h3>이 기록을 지울까요?</h3><p>연락 주기와 메모 태그가 지워져요.</p><div class="dbtn"><button data-a="sclose2">취소</button><button class="r" data-a="delok" data-id="${id}">지우기</button></div>`:`<h3>이 평가를 지울까요?</h3><p>지운 평가는 다음 토요일 오전 9시 갱신부터 빠져요. 이미 열린 지난 판정서에는 남을 수 있어요.</p><div class="dbtn"><button data-a="sclose2">취소</button><button class="r" data-a="delok" data-id="${id}">지우기</button></div>`,true)}

function testMenu(){sheet(`<h3>테스트 메뉴</h3><div class="small">지금 날짜: ${mdw(S.day)}</div><div style="display:grid;gap:8px;margin-top:12px">
 <button class="btn-g" data-a="t" data-x="1">하루 넘기기</button><button class="btn-g" data-a="t" data-x="7">7일 넘기기</button><button class="btn-g" data-a="t" data-x="newc">새 연락처 들어오게 하기</button>
 <button class="btn-g" data-a="t" data-x="vn">판정서 예시 인원: ${S.verdictN}명 (바꾸기)</button><button class="btn-g" data-a="t" data-x="seed">예시 데이터 넣기</button><button class="btn-g" data-a="t" data-x="reset" style="color:var(--red)">초기화</button></div>`)}

/* events */
let taps=[];
document.addEventListener('input',e=>{if(e.target.id=='fqs'){ui.fs=e.target.value;const d=document.createElement('div');d.innerHTML=fridge();const n=d.querySelector('#flist'),o=$('#flist');if(n&&o)o.replaceWith(n);return}if(e.target.id=='q'){ui.q=e.target.value;const pos=e.target.selectionStart;render();const q=$('#q');q.focus();q.setSelectionRange(pos,pos)}});
document.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a,id=el.dataset.id;
 if(a=='sclose'&&e.target!==el)return;e.stopPropagation();
 const p=id?P(id):null;
 switch(a){
 case 'tab':if(ui._xslide)break;ui.q='';tab(el.dataset.v);break;
 case 'qset':{const q=P(+id),f=el.dataset.f,x=el.dataset.x;q[f]=q[f]===x?null:x;save();render('same');break}
 case 'vopen':openVerdict();break;
 case 'vback':closeVerdict();break;
 case 'back':back();break;
 case 'info':infoSheet(el.dataset.k);break;
 case 'sclose':case 'sclose2':closeSheet();if(ui.w&&nav[nav.length-1].v=='write')render('same');break;
 case 'secret':taps=taps.filter(t=>Date.now()-t<1500);taps.push(Date.now());if(taps.length>=5){taps=[];testMenu()}break;
 case 'bell':go({v:'notifs'});break;
 case 'settings':go({v:'settings'});break;
 case 'readall':S.notifs.forEach(n=>n.read=true);save();render('same');break;
 case 'ntf':{const n=S.notifs[+el.dataset.i];n.read=true;save();if(['판정서 변화','쓰다듬기'].includes(n.kind))tab('verdict');else tab('shelf');break}
 case 'settog':S.sets=S.sets||{};const i=el.dataset.i;S.sets[i]=!(S.sets[i]??[1,1,0,1,1,0][i]);save();render('same');break;
 case 'unhide':p.hidden=false;save();render('same');toast('냉장고에 다시 보여요.');break;
 case 'sec':openSec(el.dataset.k,el);break;
 case 'sheetmore':ui.sheetMore=true;drawSec();break;
 case 'open':closeSheet();go({v:'person',id});break;
 case 'write':closeSheet();ui.w={grade:null,persona:null,hold:false,cycle:'auto',again:null,rel:null,memo:[],rep:[],priv:false};go({v:'write',id});break;
 case 'add':go({v:'addContact'});break;
 case 'addsave':{const n=$('#cn').value.trim();if(!n){toast('이름을 넣어 주세요');break}const ph=$('#cp').value.trim()||'010-****-'+String(1000+S.seq*37%9000);
  const np=mk({name:n,phone:ph,isNew:true,addedDay:S.day,ratedDay:null});S.people.push(np);save();ui.q='';ui.fresh=np.id;tab('shelf');toast('새로 들어온 고기에 넣었어요');setTimeout(()=>ui.fresh=null,500);break}
 case 'w':{const w=ui.w,f=el.dataset.f,x=el.dataset.x;
  if(f=='hold'){w.hold=!w.hold;if(w.hold){w._g=w.grade;w._p=w.persona;w.grade=null;w.persona=null}else{w.grade=w._g??null;w.persona=w._p??null}}
  else if(f=='priv')w.priv=!w.priv;
  else if(f=='persona'||f=='grade'){w[f]=+x;if(w.hold){w.hold=false;if(f=='grade')w.persona=w._p??null;else w.grade=w._g??null}}
  else if(f=='cycle')w.cycle=x=='auto'?'auto':+x;
  else w[f]=w[f]===x?null:x;render('same');break}
 case 'memo':{const arr=$('#sheet-root .sheet')?ui.ed.val:ui.w.memo;const t=el.dataset.t;const i=arr.indexOf(t);
  if(i>=0)arr.splice(i,1);else{if(groupOf(t)=='생년'){for(let k=arr.length-1;k>=0;k--)if(groupOf(arr[k])=='생년')arr.splice(k,1)}arr.push(t)}
  $('#sheet-root .sheet')?drawEdit():render('same');break}
 case 'year':{const inSheet=!!$('#sheet-root .sheet');const arr=inSheet?ui.ed.val:ui.w.memo;sheet(`<h3>생년 (연도)</h3><div class="chips">${Array.from({length:60},(_,i)=>1950+i).map(y=>`<button class="chip sm" data-a="yearpick" data-x="${y}" data-s="${inSheet?1:0}">${y}</button>`).join('')}</div>`);ui._yarr=arr;ui._ys=inSheet;break}
 case 'yearpick':{const arr=ui._yarr;for(let k=arr.length-1;k>=0;k--)if(groupOf(arr[k])=='생년')arr.splice(k,1);arr.push(el.dataset.x);if(ui._ys)drawEdit();else{closeSheet();render('same')}break}
 case 'memoadd':{const g=el.dataset.g;const t=prompt("'"+g+"' 태그 (20자까지)");if(t&&t.trim()){const v=t.trim().slice(0,20);S.customTags[g]=S.customTags[g]||[];if(!S.customTags[g].includes(v))S.customTags[g].push(v);const arr=$('#sheet-root .sheet')?ui.ed.val:ui.w.memo;if(!arr.includes(v))arr.push(v);save();$('#sheet-root .sheet')?drawEdit():render('same')}break}
 case 'reppick':repSheet();break;
 case 'reptg':{const t=el.dataset.t,r=ui.w.rep,i=r.indexOf(t);i>=0?r.splice(i,1):r.push(t);repSheet();break}
 case 'reprm':ui.w.rep=ui.w.rep.filter(t=>t!==el.dataset.t);render('same');break;
 case 'wsave':{const v=nav[nav.length-1],q=P(v.id),w=ui.w;
  Object.assign(q,{hold:w.hold,grade:w.hold?null:w.grade,persona:w.hold?null:w.persona,cycle:w.hold?'auto':w.cycle,again:w.hold?null:w.again,rel:w.hold?null:w.rel,memo:w.memo,rep:w.hold?[]:w.rep,priv:w.hold?false:w.priv,isNew:false,ratedDay:S.day});
  S.firstWrite=false;save();nav.pop();nav.push({v:'person',id:q.id});render('fade');toast(w.hold?'판단 보류로 저장했어요':'평가를 저장했어요');break}
 case 'call':{const t=el.dataset.t;const row=document.getElementById('r'+id);const sec=ui.sec;
  const doit=()=>{p.contacts.push({day:S.day,t});const got=t=='전화'&&earnPt(p.id);save();render('same');toast(t=='연락했어요'?'연락을 기록했어요':t+' 기록을 남겼어요'+(got?' · 포인트 +1':''));if(sec){ui.sec=sec;drawSec()}};
  if(row&&nav[nav.length-1].v=='shelf'&&!sec){row.classList.add('out');setTimeout(doit,matchMedia('(prefers-reduced-motion:reduce)').matches?0:280)}else doit();break}
 case 'gpat':doGesture(id,'pat');break;
 case 'gkkul':doGesture(id,'kkul');break;
 case 'orgtip':toast('2주 연속 쓰담쓰담한 사람이에요. 4주 동안 안 하면 떼요.');break;
 case 'stillok':p.ratedDay=S.day;save();render('same');break;
 case 'hide':p.hidden=true;save();back();toast('냉장고에서 숨겼어요');break;
 case 'del':confirmDel(id);break;
 case 'delok':S.people=S.people.filter(x=>x.id!=id);save();closeSheet();nav=[{v:'shelf'}];render('back');toast('지웠어요');break;
 case 'edit':editSheet(id,el.dataset.f);break;
 case 'edx':{const e2=ui.ed,x=el.dataset.x;if(e2.f=='grade'||e2.f=='persona')e2.val=+x;else if(e2.f=='cycle')e2.val=x=='auto'?'auto':+x;else if(e2.f=='priv')e2.val=!e2.val;else if(e2.f=='rep'){const i=e2.val.indexOf(x);i>=0?e2.val.splice(i,1):e2.val.push(x)}else e2.val=e2.val===x?null:x;drawEdit();break}
 case 'edsave':{const e2=ui.ed,q=P(e2.id);q[e2.f]=e2.val;if(e2.f=='grade'||e2.f=='persona')q.ratedDay=S.day;save();closeSheet();render('same');toast('저장했어요');break}
 case 'holdsheet':holdSheet(id);break;
 case 'hsx':{const h=ui.hs;if(el.dataset.f=='hold'){h.hold=!h.hold;if(h.hold){h.grade=null;h.persona=null}}else{h[el.dataset.f]=+el.dataset.x;h.hold=false}drawHold();break}
 case 'pgsheet':holdSheet(id);break;
 case 'hssave':{const q=P(ui.hs.id),hs=ui.hs;if(hs.hold){const was=q.hold;Object.assign(q,{hold:true,grade:null,persona:null,again:null,rel:null,rep:[],priv:false,ratedDay:S.day});if(!was)q.cycle='auto'}else{const was=q.hold;Object.assign(q,{hold:false,grade:hs.grade,persona:hs.persona,ratedDay:S.day});if(was)q.cycle='auto'}save();closeSheet();render('same');toast(hs.hold?'판단 보류로 저장했어요':'평가를 저장했어요');break}
 case 'tagp':go({v:'tagPeople',t:el.dataset.t});break;
 case 'filter':filterSheet();break;
 case 'newmore':ui.newAll=true;render('same');break;
 case 'fall':{ui.ff={st:[],gr:[],tg:[]};render('same');break}
 case 'fq':{ui.ff=ui.ff||{st:[],gr:[],tg:[]};const f=ui.ff,k=el.dataset.k,x=el.dataset.x,i=f[k].indexOf(x);f[k]=i>=0?[]:[x];render('same');break}
 case 'ffx':{const f=ui.ff2,k=el.dataset.k,x=el.dataset.x,i=f[k].indexOf(x);i>=0?f[k].splice(i,1):f[k].push(x);filterSheet(true);break}
 case 'ffreset':ui.ff2={st:[],gr:[],tg:[]};filterSheet(true);break;
 case 'ffok':ui.ff=ui.ff2;closeSheet();render('same');break;
 case 'accept':S.accepted=true;S.reopen=false;save();render('same');break;
 case 'invite':toast('테스트용 예시: 실제로 보내지 않아요');break;
 case 'pubtog':if(S.pub){S.pub=false;save();render('same')}else sheet(`<h3>내 판정서를 공개할까요?</h3><p>연락처에 저장한 사용자 누구나 볼 수 있어요.<br>대표 등급·대표 성격·평판 태그만 보이고 누가 어떻게 평가했는지는 안 보여요.<br>누가 봤는지 알리지 않아요.<br>끄면 바로 안 보이고, 판정서를 닫으면 공개가 꺼져요.</p><div class="dbtn"><button data-a="sclose2">취소</button><button class="r" data-a="pubok">공개하기</button></div>`,true);break;
 case 'pubok':S.pub=true;save();closeSheet();render('same');break;
 case 'pubv':go({v:'pubVerdict'});break;
 case 'closev':sheet(`<h3>판정서를 닫을까요?</h3><p>지금까지 모인 결과가 나에게도 보이지 않고 새 평가도 모이지 않아요. 다시 열면 평가자들이 남긴 예전 평가까지 모두 다시 모여요<br><span class="warn">지난 판정서도 함께 지워져요</span></p><div class="dbtn"><button data-a="sclose2">취소</button><button class="r" data-a="closeok">닫기</button></div>`,true);break;
 case 'closeok':S.accepted=false;S.pub=false;S.reopen=true;save();closeSheet();render('same');break;
 case 't':{const x=el.dataset.x;if(x=='1'||x=='7'){for(let i=0;i<+x;i++){S.day++;morning()}save();closeSheet();render('same');toast(mdw(S.day)+'로 넘어갔어요')}
  if(x=='seed'){seed();closeSheet();nav=[{v:'shelf'}];render('fade');toast('예시 데이터를 넣었어요')}
  if(x=='reset'){localStorage.removeItem(KEY);S=blank();save();closeSheet();nav=[{v:'shelf'}];render('fade');toast('초기화했어요')}
  if(x=='vn'){S.verdictN=S.verdictN>=5?3:7;save();testMenu();render('same')}
  if(x=='newc'){const n=['남궁민 과장','도현우 차장','변소라 대리'][S.seq%3];const np=mk({name:n,phone:'010-****-'+(2000+S.seq*53%7000),isNew:true,addedDay:S.day,ratedDay:null});S.people.push(np);save();closeSheet();ui.fresh=np.id;tab('shelf');setTimeout(()=>ui.fresh=null,500)}break}
 }});
function filterSheet(keep){if(!keep)ui.ff2=JSON.parse(JSON.stringify(ui.ff||{st:[],gr:[],tg:[]}));const f=ui.ff2;f.tg=[];
 const base=visible().filter(p=>rated(p)||p.hold);let L=base;if(f.st.length)L=L.filter(p=>f.st.includes(stage(p).k));if(f.gr.length)L=L.filter(p=>f.gr.includes(p.hold?'hold':String(p.grade)));if(f.tg.length)L=L.filter(p=>f.tg.every(t=>p.memo.includes(t)||p.rep.includes(t)));
 const c=(k,x,l)=>`<button class="chip sm ${f[k].includes(x)?'on':''}" data-a="ffx" data-k="${k}" data-x="${esc(x)}">${esc(l)}</button>`;
 sheet(`<h3>골라 보기</h3><div class="gn" style="font-weight:700;margin:6px 0">상태</div><div class="chips">${[['fresh','신선'],['today','오늘 손질'],['aging','숙성 중'],['spoil','상하기 직전']].map(x=>c('st',x[0],x[1])).join('')}</div>
 <div style="font-weight:700;margin:14px 0 6px">등급</div><div class="chips">${[5,4,3,2,1].map(g=>c('gr',String(g),GR[g][0])).join('')}${c('gr','hold','판단 보류')}</div>
 <div class="dbtn" style="margin-top:18px"><button data-a="ffreset">초기화</button><button class="r" data-a="ffok" ${L.length?'':'disabled style="opacity:.5"'}>${L.length?L.length+'명 보기':'맞는 사람이 없어요'}</button></div>`)}

/* v7 제스처 */
function doGesture(id,k){const p=P(id);if(!p||p.hold)return;const z=document.querySelector('.gz[data-gid="'+id+'"]');
 if(z){z.classList.remove('r-pat','r-kkul');void z.offsetWidth;z.classList.add('r-'+k);clearTimeout(z._t);z._t=setTimeout(()=>z.classList.remove('r-'+k),k=='pat'?1000:900)}
 if(!S.gintro){S.gintro=1;document.querySelectorAll('.gintro,.gh').forEach(x=>x.remove())}
 const t=S.day,arr=k=='pat'?(p.pats=p.pats||[]):(p.kkul=p.kkul||[]);let ok=!arr.includes(t);if(k=='kkul'&&arr.filter(d=>t-d<7&&d<=t).length>=3)ok=false;
 if(ok){arr.push(t);toast(k=='pat'?'쓰담쓰담이 오늘 한 번 기록되었어요':'꿀밤 콩콩이 오늘 한 번 기록되었어요')}save()}
(function(){let st=null,lastTap=0,lastId=null;
 document.addEventListener('pointerdown',e=>{const z=e.target.closest('.gz[data-gid]');if(!z||e.target.closest('.stampbtn,.sr'))return;st={z,id:z.dataset.gid,x0:e.clientX,y0:e.clientY,lx:e.clientX,ly:e.clientY,dx:0,dy:0,vx:null,vy:null,ch:0,tr:0,t0:Date.now(),mode:null,moved:false}},{passive:true});
 document.addEventListener('pointermove',e=>{if(!st)return;const dx=e.clientX-st.x0,dy=e.clientY-st.y0;
  if(Math.hypot(dx,dy)>6)st.moved=true;
  const mx=e.clientX-st.lx,my=e.clientY-st.ly,seg=Math.hypot(mx,my);if(seg<3)return;st.tr+=seg;st.lx=e.clientX;st.ly=e.clientY;
  const sx=Math.abs(mx)>=2?Math.sign(mx):0,sy=Math.abs(my)>=2?Math.sign(my):0;let rev=false;
  if(sx&&st.dx&&sx!=st.dx)rev=true;if(sy&&st.dy&&sy!=st.dy)rev=true;
  if(st.vx!=null){const c=(mx*st.vx+my*st.vy)/(seg*Math.hypot(st.vx,st.vy));if(c<-0.5)rev=true}
  if(rev)st.ch++;if(sx)st.dx=sx;if(sy)st.dy=sy;st.vx=mx;st.vy=my;
  if(st.ch>=2&&st.tr>=80&&Date.now()-st.t0<=1200&&!st.done){st.done=1;doGesture(st.id,'pat')}},{passive:true});
 document.addEventListener('pointerup',e=>{if(!st)return;const s=st;st=null;if(s.moved)return;const n=Date.now();
  if(lastId==s.id&&n-lastTap<=300){lastTap=0;doGesture(s.id,'kkul')}else{lastTap=n;lastId=s.id}});
 document.addEventListener('pointercancel',()=>st=null);})();
document.addEventListener('keydown',e=>{if(e.key!='Escape'||!document.querySelector('.secsheet'))return;e.preventDefault();closeSheet()});
addEventListener('resize',fitStall);
addEventListener('orientationchange',fitStall);
const had=localStorage.getItem(KEY);load();if(!had)seed();render('fade');
if(location.hash=='#test')testMenu();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
