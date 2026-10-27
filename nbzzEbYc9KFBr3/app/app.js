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
function cycLabel(p){const c=cycleDays(p);return CYC.find(x=>x[0]===c)[1]}
function emo(p,cls='em'){const src=p.hold||p.persona==null?'emoji/hold.svg':'emoji/p'+p.persona+'.svg';return `<img class="${cls}" src="${src}" alt="">`}
function stamp(g,big){if(g==null)return `<span class="stamp hold ${big?'big':''}"></span>`;return `<span class="stamp ${g==5?'fill':''} ${big?'big':''}">${GR[g][0]}</span>`}
function organic(p){const wk=d=>Math.floor((d-S.day%7+70000)/7);if(!p.pats||!p.pats.length)return false;const w=new Set(p.pats.map(d=>Math.floor(d/7)));const cw=Math.floor(S.day/7);return (w.has(cw)&&w.has(cw-1))||(w.has(cw-1)&&w.has(cw-2))}
function visible(){return S.people.filter(p=>!p.hidden)}
function newOnes(){return visible().filter(p=>p.isNew&&!rated(p)&&!p.hold&&S.day-p.addedDay<7)}
function todayList(){return visible().filter(p=>rated(p)&&!p.hold&&['today','aging','spoil'].includes(stage(p).k)).sort(sortFn)}
function holdList(){return visible().filter(p=>p.hold)}
function sortFn(a,b){const x=stage(a),y=stage(b);if(x.o!=y.o)return x.o-y.o;return x.o<=1?y.d-x.d:(x.d||0)-(y.d||0)}
function countN(){return todayList().length}

function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2000)}
function go(v,dir){nav.push(v);render(dir||'fwd')}
function back(){if(nav.length>1)nav.pop();render('back')}
function tab(v){nav=[{v}];render('fade')}

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
 add({name:'오승민 대리',phone:'010-****-5591',grade:3,persona:0,ratedDay:-50,hidden:true});
 S.firstWrite=true;morning();save()}
function morning(){const t=todayList(),sp=t.filter(p=>stage(p).k=='spoil').length;let s='오늘 손질할 고기 '+t.length+'개';if(sp)s+=' · 상하기 직전 '+sp+'개';const n=newOnes().length;if(n)s+=' · 새로 들어온 고기 '+n+'개';const h=holdList().length;if(h)s+=' · 판단 보류 '+h+'개';
 const re=visible().filter(p=>(rated(p)||p.hold)&&p.ratedDay!=null&&S.day-p.ratedDay>=90).length;if(re)s+=' · 다시 맛볼 고기 '+re+'개';
 S.notifs.unshift({day:S.day,kind:'아침 장보기',text:s,read:false});
 if(dateOf(S.day).getDay()==6){S.notifs.unshift({day:S.day,kind:'주간 조회',text:'이번 주 내가 평가한 사람들의 판정서가 4번 열렸어요.',read:false,test:true});S.notifs.unshift({day:S.day,kind:'쓰다듬기',text:'이번 주 당신을 쓰담쓰담 한 사람이 있어요.',read:false,test:true})}
 S.notifs=S.notifs.filter(n=>S.day-n.day<=30).slice(0,100);S.readBell=false}

/* render */
function render(dir){const v=nav[nav.length-1];const app=$('#app');let h='';
 const f={shelf,fridge,tags,verdict,person,write,notifs,settings,tagPeople,pubVerdict,addContact}[v.v];h=f(v);
 const tabs=['shelf','fridge','tags','verdict'];
 if(tabs.includes(v.v))h+=navBar(v.v);
 app.innerHTML=h;const sc=app.querySelector('.scr');if(sc&&dir){sc.classList.add('enter');if(dir=='back')sc.classList.add('back');if(dir=='fade')sc.classList.add('fade')}
 if(dir&&dir!=='same')window.scrollTo(0,0);
 const n=countN();const ne=app.querySelector('#nnum');if(ne&&lastN!=null&&lastN!==n){ne.classList.add('bump')}lastN=n}
function navBar(c){const t=[['shelf','진열대','🥩'],['fridge','냉장고','🧊'],['tags','태그','🏷️'],['verdict','내 판정서','📋']];
 return `<nav class="tab">${t.map(x=>`<button data-a="tab" data-v="${x[0]}" class="${c==x[0]?'on':''}"><b>${x[2]}</b>${x[1]}</button>`).join('')}</nav>`}
function info(k){return `<button class="info" data-a="info" data-k="${k}">i</button>`}

function shelf(){const n=countN(),nw=newOnes(),td=todayList(),hd=holdList();const q=ui.q||'';
 const unread=S.notifs.some(x=>!x.read)&&!S.readBell;
 let h=`<div class="scr"><div class="hd"><h1 data-a="secret">진열대</h1>${info('shelf')}<span class="sp"></span><button class="ib" data-a="bell">🔔${unread?'<span class="dot"></span>':''}</button></div>
 <div class="lead">오늘 연락할 <b class="num" id="nnum">${n}</b>명</div>
 <div class="search">🔍<input id="q" placeholder="이름이나 번호로 찾기" value="${esc(q)}" autocomplete="off"></div>`;
 if(q){const r=S.people.filter(p=>p.name.includes(q)||p.phone.includes(q));
  h+=`<div class="card" style="margin-top:10px">${r.map(p=>`<div class="row tap" data-a="${rated(p)||p.hold?'open':'write'}" data-id="${p.id}">${stamp(p.grade)}<div class="grow"><div class="nm">${esc(p.name)}</div><div class="meta">${p.phone}</div></div><span class="go">${rated(p)||p.hold?'›':'평가 쓰기 →'}</span></div>`).join('')}
  <div class="row tap" data-a="add"><div class="grow"><div class="nm">＋ 새 연락처로 추가</div><div class="meta">테스트용: 폰 연락처 대신 여기서 넣어요</div></div></div></div>`;
  return h+'</div>'}
 if(!nw.length&&!td.length&&!hd.length)h+=`<div class="empty">오늘은 손질할 고기가 없어요.<br>이름이나 번호로 찾아 평가를 써 보세요.</div>`;
 if(nw.length)h+=`<h2>새로 들어온 고기<small>${nw.length}</small></h2><div class="card">${nw.map(p=>`<div class="row tap ${ui.fresh==p.id?'in':''}" data-a="write" data-id="${p.id}"><div class="grow"><div class="meta"><b>NEW</b> · ${S.day==p.addedDay?'오늘':(S.day-p.addedDay)+'일 전'}</div><div class="nm">${esc(p.name)}</div></div><span class="go">등급 매기기 →</span></div>`).join('')}</div>`;
 if(td.length)h+=`<h2>오늘 손질할 고기<small>${td.length}</small></h2><div class="card">${td.map(p=>{const s=stage(p);return `<div class="row tap" data-a="open" data-id="${p.id}" id="r${p.id}" style="flex-wrap:wrap">${stamp(p.grade)}<div class="grow"><div class="nm">${emo(p)} ${esc(p.name)} ${organic(p)?'<span class="org">유기농</span>':''}</div><div class="meta">${cycLabel(p)} 주기</div></div><span class="pill st-${s.k}">${s.t}</span>
   <div class="acts" style="width:100%;padding:8px 0 0"><button class="rb" data-a="call" data-t="전화" data-id="${p.id}">📞</button><button class="rb" data-a="call" data-t="문자" data-id="${p.id}">💬</button><button class="btn-o" data-a="call" data-t="연락했어요" data-id="${p.id}">✓ 연락했어요</button></div></div>`}).join('')}</div>`;
 if(hd.length)h+=`<h2>아직 등급 안 매긴 고기<small>${hd.length}</small></h2><div class="card">${hd.map(p=>`<div class="row tap" data-a="holdsheet" data-id="${p.id}">${emo(p,'stamp hold')}<div class="grow"><div class="nm">${esc(p.name)}</div><div class="meta">${S.day-p.ratedDay==0?'오늘':md(p.ratedDay)} 판단 보류 · ${cycLabel(p)} 주기</div></div><span class="go">등급 매기기 →</span></div>`).join('')}</div>`;
 return h+'</div>'}

function fridge(){const f=ui.ff||{st:[],gr:[],tg:[]};let L=visible().filter(p=>rated(p)||p.hold);
 if(f.st.length)L=L.filter(p=>f.st.includes(stage(p).k));
 if(f.gr.length)L=L.filter(p=>f.gr.includes(p.hold?'hold':String(p.grade)));
 if(f.tg.length)L=L.filter(p=>f.tg.every(t=>p.memo.includes(t)||p.rep.includes(t)||(t.endsWith('년대')&&p.memo.some(m=>/^\d{4}$/.test(m)&&(m.slice(2,3)+'0년대'==t)))));
 L.sort(sortFn);const all=visible().filter(p=>rated(p)||p.hold).length;
 let h=`<div class="scr"><div class="hd"><h1>냉장고</h1><span class="sp"></span></div>
 <div class="chips" style="margin:6px 0 12px"><button class="chip ${f.st.length?'on':''}" data-a="filter">상태${f.st.length?' '+f.st.length:''}</button><button class="chip ${f.gr.length?'on':''}" data-a="filter">등급${f.gr.length?' '+f.gr.length:''}</button><button class="chip ${f.tg.length?'on':''}" data-a="filter">태그${f.tg.length?' '+f.tg.length:''}</button><span class="small" style="margin-left:auto;align-self:center">연락 임박순</span></div>`;
 if(!all)return h+`<div class="empty">냉장고가 비어 있어요.<br>진열대에서 연락처를 찾아 첫 평가를 써 보세요.<br><br><button class="btn-red-sm" data-a="tab" data-v="shelf">진열대로 가기</button></div></div>`;
 if(!L.length)return h+`<div class="empty">맞는 사람이 없어요</div></div>`;
 return h+`<div class="card">${L.map(p=>{const s=p.hold?{k:'none',t:'판단 보류'}:stage(p);const mt=f.tg.filter(t=>p.memo.includes(t)||p.rep.includes(t));return `<div class="row tap" data-a="open" data-id="${p.id}">${stamp(p.grade)}<div class="grow"><div class="nm">${emo(p)} ${esc(p.name)} ${organic(p)?'<span class="org">유기농</span>':''}</div><div class="meta">${cycLabel(p)} 주기${mt.length?' · '+mt.map(esc).join(' · '):''}</div></div><span class="pill st-${s.k}">${s.t}</span></div>`}).join('')}</div></div>`}

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
function verdict(){let h=`<div class="scr"><div class="hd"><h1>내 판정서</h1>${info('verdict')}</div><div class="testbar">테스트용 예시 · 휴대폰 번호 인증은 건너뛰어요</div>`;
 if(!S.accepted)return h+`<h2 style="margin-top:20px">내 판정서 받기</h2><p class="note" style="font-size:0.8824rem;color:var(--ink)">평가가 5명 이상 모이면 익명 종합 결과만 볼 수 있어요. 누가 평가했는지는 알 수 없어요.</p>${S.reopen?'<p class="note">평가자들이 남긴 예전 평가까지 모두 다시 모여요.</p>':''}
  <label class="inp">이 번호를 언제부터 쓰셨나요?<input value="2019년 3월" readonly></label><div class="small" style="margin-top:6px">이 날짜 전에 쌓인 평가는 판정서에 넣지 않아요.</div><div style="height:20px"></div><button class="btn-r" data-a="accept">판정서 받기 시작</button></div>`;
 if(S.verdictN<5)h+=`<div class="vcard" style="margin-top:12px"><p style="line-height:1.6;margin:0 0 14px">판정 대기 중이에요. 등급 평가가 5명 미만이라 아직 보여드릴 수 없어요. 여의도 정육점을 주변에 알려주면 더 빨리 판정돼요!</p><button class="btn-r" data-a="invite">초대 링크 보내기</button><div class="small" style="margin-top:8px">링크에는 내 번호·계정 정보가 담기지 않아요.</div><div class="small" style="margin-top:12px">결과는 매주 토요일 오전 9시에 갱신돼요</div></div>
  <div class="sw" style="margin-top:16px"><div class="grow"><b>판정서 공개</b><span>판정서가 열리면 공개할 수 있어요.</span></div><span class="tog" style="opacity:.4"></span></div>`;
 else h+=`<div style="margin-top:12px">${verdictBody(S.verdictN,false)}</div><div class="sw" style="margin-top:16px"><div class="grow"><b>판정서 공개</b><span>${S.pub?'내 번호를 아는 앱 사용자에게 보여지고 있어요. 누가 봤는지는 알려드리지 않아요.':'켜면 내 번호를 아는 앱 사용자가 이 판정서를 볼 수 있어요.'}</span></div><button class="tog ${S.pub?'on':''}" data-a="pubtog"></button></div>`;
 return h+`<button class="link-red" data-a="closev">판정서 닫기</button></div>`}
function pubVerdict(v){return `<div class="scr"><div class="hd"><button class="back" data-a="back">‹</button><h1 style="font-size:1.1765rem">공개된 판정서</h1></div>${verdictBody(7,true)}<p class="note">부정 태그는 공개된 판정서에 보이지 않아요.</p></div>`}

/* 사람 상세 */
function person(v){const p=P(v.id);if(!p){return shelf()}const s=stage(p);const hold=p.hold;
 const today=S.day;const kd=p.kkul.filter(d=>d==today).length,kw=p.kkul.filter(d=>today-d<7).length;const kOff=kd>=1||kw>=3;
 let h=`<div class="scr"><div class="hd"><button class="back" data-a="back">‹</button><span class="sp"></span></div>
 <div class="ph-head"><div class="av">${emo(p,'')}${hold?'':stamp(p.grade,true)}</div><h1>${esc(p.name)} ${organic(p)?'<span class="org" data-a="orgtip">유기농</span>':''}</h1><div class="small">${p.phone}</div></div>`;
 if(p.ratedDay!=null&&S.day-p.ratedDay>=90)h+=`<div class="recard"><span class="grow">${hold?'이제 등급을 매겨 볼까요?':'지금도 '+GR[p.grade][0]+'인가요? 다시 평가해 보세요.'}</span><button class="chip sm" data-a="stillok" data-id="${p.id}">${hold?'아직 보류할게요':'지금도 맞아요'}</button></div>`;
 h+=`<div class="three"><button class="bigb" data-a="call" data-t="전화" data-id="${p.id}">📞 전화</button><button class="bigb" data-a="call" data-t="문자" data-id="${p.id}">💬 문자</button><button class="bigb red" data-a="call" data-t="연락했어요" data-id="${p.id}">✓ 연락했어요</button></div>`;
 if(!hold)h+=`<div class="three"><button class="bigb" data-a="pat" data-id="${p.id}">🤲 쓰담쓰담</button><button class="bigb" data-a="kkul" data-id="${p.id}" ${kOff?'disabled':''}>👊 꿀밤 콩콩</button></div>${kOff?'<div class="note" style="text-align:center">오늘은 여기까지. 내일 다시 콩콩 할 수 있어요.</div>':''}${kw?`<div class="note" style="text-align:center">최근 꿀밤 ${kw}번</div>`:''}`;
 h+=`<h2>내 평가</h2><div class="card">`;
 if(hold)h+=`<div class="kv" data-a="holdsheet" data-id="${p.id}"><span class="k">등급</span><span class="v">판단 보류</span></div>`;
 else h+=`<div class="kv" data-a="edit" data-f="grade" data-id="${p.id}"><span class="k">등급</span><span class="v">${GR[p.grade][0]} ${GR[p.grade][1]}</span></div><div class="kv" data-a="edit" data-f="persona" data-id="${p.id}"><span class="k">성격</span><span class="v">${PERS[p.persona]}</span></div><div class="kv" data-a="edit" data-f="again" data-id="${p.id}"><span class="k">다시 맡기기</span><span class="v">${p.again??'<span class="blank">빈칸</span>'}</span></div><div class="kv" data-a="edit" data-f="rel" data-id="${p.id}"><span class="k">관계</span><span class="v">${p.rel??'<span class="blank">빈칸</span>'}</span></div>`;
 h+=`<div class="kv" data-a="edit" data-f="memo" data-id="${p.id}"><span class="k">메모 태그 <span class="badge me">나만 보기</span></span><span class="v">${p.memo.map(esc).join(', ')||'<span class="blank">빈칸</span>'}</span></div>`;
 if(!hold)h+=`<div class="kv" data-a="edit" data-f="rep" data-id="${p.id}"><span class="k">평판 태그 <span class="badge">익명 공개</span></span><span class="v">${p.rep.map(esc).join(', ')||'<span class="blank">빈칸</span>'}</span></div><div class="kv" data-a="edit" data-f="priv" data-id="${p.id}"><span class="k">판정서 반영</span><span class="v">${p.priv?'나만 보기':'익명으로 반영'}</span></div>`;
 h+=`</div><h2>신선도</h2><div class="card"><div class="kv" data-a="edit" data-f="cycle" data-id="${p.id}"><span class="k">${cycLabel(p)} 주기 · 마지막 연락 ${lastC(p)!=null?md(lastC(p)):'없음'}</span><span class="pill st-${s.k}">${hold?'판단 보류':s.t}</span></div></div>
 <h2>연락 기록</h2><div class="card">${p.contacts.slice().reverse().map(c=>`<div class="kv ro"><span>${md(c.day)} ${c.t}</span></div>`).join('')||'<div class="kv ro"><span class="k">아직 없어요</span></div>'}</div>`;
 if(p.pub)h+=`<button class="btn-g" style="margin-top:14px" data-a="pubv">공개된 판정서 보기 <span class="badge test">테스트용 예시</span></button>`;
 h+=`<button class="btn-g" style="margin-top:14px" data-a="hide" data-id="${p.id}">냉장고에서 숨기기</button><button class="link-red" data-a="del" data-id="${p.id}">${hold?'이 기록 지우기':'이 평가 지우기'}</button></div>`;
 return h}

/* 평가 쓰기 */
function write(v){const p=P(v.id);const w=ui.w;const hold=w.hold;const ok=hold||(w.grade!=null&&w.persona!=null);
 let h=`<div class="scr nonav"><div class="hd"><button class="back" data-a="back">‹</button><div style="flex:1"><div style="font-weight:800;font-size:1.1765rem">${esc(p.name)}</div><div class="small">${p.phone}</div>${S.firstWrite?'<div class="small">이름은 이 폰에서만 읽어요</div>':''}</div>${info('write')}</div>
 <h2>한마디로 어떤 사람?<span class="req">필수</span></h2><div class="grid3">${PERS.map((n,i)=>`<button class="tile ${w.persona===i?'on':''}" data-a="w" data-f="persona" data-x="${i}"><img src="emoji/p${i}.svg">${n}</button>`).join('')}</div>
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
 ${[['아침 장보기 알림','오전 9:00',1],['주간 조회 알림','',1],['월간 조회 권유 알림','',0],['판정서 변화 알림','토요일 갱신 때 내 판정서가 바뀌면 알려드려요.',1],['쓰다듬기 알림','누군가 쓰담쓰담 하면 토요일에 모아서 알려드려요.',1],['이벤트 알림','',0]].map((x,i)=>{const on=(S.sets||{})[i]??x[2];return `<div class="sw srow"><div class="grow"><b>${x[0]}</b><span>${x[1]}</span></div><button class="tog ${on?'on':''}" data-a="settog" data-i="${i}"></button></div>`}).join('')}
 <h2>숨긴 연락처</h2><div class="card">${hid.map(p=>`<div class="row"><div class="grow nm">${esc(p.name)}</div><button class="chip sm" data-a="unhide" data-id="${p.id}">다시 보이기</button></div>`).join('')||'<div class="empty">숨긴 연락처가 없어요.</div>'}</div></div>`}
function addContact(){return `<div class="scr"><div class="hd"><button class="back" data-a="back">‹</button><h1 style="font-size:1.1765rem">새 연락처</h1></div><div class="testbar">테스트용: 실제 앱은 폰 연락처를 읽어요</div>
 <label class="inp">이름<input id="cn" maxlength="20" value="${esc(ui.q||'')}"></label><label class="inp">번호<input id="cp" inputmode="numeric" placeholder="010-0000-0000" maxlength="13"></label><div style="height:20px"></div><button class="btn-r" data-a="addsave">저장</button></div>`}

/* sheets */
function sheet(html,center){const r=$('#sheet-root');r.innerHTML=`<div class="dim ${center?'center':''}" data-a="sclose">${center?`<div class="dialog">${html}</div>`:`<div class="sheet">${html}</div>`}</div>`}
function closeSheet(){const d=$('#sheet-root .dim');if(!d)return;d.classList.add('out');setTimeout(()=>{$('#sheet-root').innerHTML=''},matchMedia('(prefers-reduced-motion:reduce)').matches?0:200)}
const INFO={shelf:['진열대는 이렇게 봐요',['새로 들어온 고기는 폰에 새로 저장한 연락처예요. 7일 동안 남아요.','오늘 손질할 고기는 연락할 때가 됐거나 지난 사람이에요.','아직 등급 안 매긴 고기는 판단 보류로 저장한 사람이에요.','전화·문자 버튼을 누르면 연락 기록이 저절로 남아요.']],
 write:['평가는 이렇게 써요',['이름은 이 폰에서만 읽어요',"아직 판단하기 이르면 '판단 보류'를 골라요. 성격과 등급 없이 저장돼요.",'평판 태그는 같은 태그를 3명 이상 달아야 판정서에 보여요.','성격과 등급만 고르면 저장돼요. 나머지 질문과 태그는 선택이에요.']],
 tags:['태그는 이렇게 써요',['태그를 누르면 그 태그가 붙은 사람을 모아 봐요.','메모 태그를 길게 누르면 이름 바꾸기, 합치기, 옮기기, 지우기를 할 수 있어요.','평판 태그는 같은 태그를 3명 이상 달았을 때만 익명으로 보여요.']],
 verdict:['',['결과는 매주 토요일 오전 9시에 갱신돼요','언제든 판정서를 닫을 수 있어요.']]};
function infoSheet(k){const x=INFO[k];sheet(`${x[0]?`<h3>${x[0]}</h3>`:''}<ul>${x[1].map(l=>`<li>${l}</li>`).join('')}</ul><button class="btn-r" data-a="sclose2">알겠어요</button>`);if(k=='write'){S.firstWrite=false;save()}}
function repSheet(){const w=ui.w;const neg=w.rep.filter(t=>REP_NEG.includes(t)).length;
 sheet(`<h3>평판 태그 고르기</h3><div class="chips">${REP_POS.map(t=>`<button class="chip sm ${w.rep.includes(t)?'on':''}" data-a="reptg" data-t="${t}">${t}</button>`).join('')}</div><div class="small" style="margin:14px 0 6px">부정 태그는 한 사람에게 3개까지</div><div class="chips">${REP_NEG.map(t=>`<button class="chip sm neg ${w.rep.includes(t)?'on':''}" data-a="reptg" data-t="${t}" ${!w.rep.includes(t)&&neg>=3?'disabled style="opacity:.35"':''}>${t}</button>`).join('')}</div><div style="height:16px"></div><button class="btn-r" data-a="sclose2">완료</button>`)}
function holdSheet(id){const p=P(id);ui.hs={id,grade:null,persona:null};drawHold()}
function drawHold(){const h=ui.hs,ok=h.grade!=null&&h.persona!=null;sheet(`<h3>등급 매기기</h3><div class="grid3">${PERS.map((n,i)=>`<button class="tile ${h.persona===i?'on':''}" data-a="hsx" data-f="persona" data-x="${i}"><img src="emoji/p${i}.svg">${n}</button>`).join('')}</div><div style="height:14px"></div><div class="grades">${[5,4,3,2,1].map(g=>`<button class="${h.grade===g?'on':''}" data-a="hsx" data-f="grade" data-x="${g}">${stamp(g)}${GR[g][1]}</button>`).join('')}</div><div style="height:16px"></div>${ok?'':'<div class="hint">성격·등급을 고르면 저장할 수 있어요</div>'}<button class="btn-r" data-a="hssave" ${ok?'':'disabled'}>저장</button>`)}
function editSheet(id,f){const p=P(id);ui.ed={id,f,val:JSON.parse(JSON.stringify(f=='memo'||f=='rep'?p[f]:p[f]))};drawEdit()}
function drawEdit(){const e=ui.ed,p=P(e.id);let b='';const T={grade:'등급',persona:'성격',again:'다시 맡기기',rel:'관계',memo:'메모 태그',rep:'평판 태그',priv:'판정서 반영',cycle:'연락 주기'}[e.f];
 if(e.f=='grade')b=`<div class="grades">${[5,4,3,2,1].map(g=>`<button class="${e.val===g?'on':''}" data-a="edx" data-x="${g}">${stamp(g)}${GR[g][1]}</button>`).join('')}</div>`;
 if(e.f=='persona')b=`<div class="grid3">${PERS.map((n,i)=>`<button class="tile ${e.val===i?'on':''}" data-a="edx" data-x="${i}"><img src="emoji/p${i}.svg">${n}</button>`).join('')}</div>`;
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
document.addEventListener('input',e=>{if(e.target.id=='q'){ui.q=e.target.value;const pos=e.target.selectionStart;render();const q=$('#q');q.focus();q.setSelectionRange(pos,pos)}});
document.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a,id=el.dataset.id;
 if(a=='sclose'&&e.target!==el)return;e.stopPropagation();
 const p=id?P(id):null;
 switch(a){
 case 'tab':ui.q='';tab(el.dataset.v);break;
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
 case 'open':go({v:'person',id});break;
 case 'write':ui.w={grade:null,persona:null,hold:false,cycle:'auto',again:null,rel:null,memo:[],rep:[],priv:false};go({v:'write',id});break;
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
 case 'call':{const t=el.dataset.t;const row=document.getElementById('r'+id);
  const doit=()=>{p.contacts.push({day:S.day,t});save();render('same');toast(t=='연락했어요'?'연락을 기록했어요':t+' 기록을 남겼어요')};
  if(row&&nav[nav.length-1].v=='shelf'){row.classList.add('out');setTimeout(doit,matchMedia('(prefers-reduced-motion:reduce)').matches?0:280)}else doit();break}
 case 'pat':p.pats.push(S.day);save();render('same');toast('쓰담쓰담 했어요');break;
 case 'kkul':p.kkul.push(S.day);save();render('same');toast('꿀밤 콩콩');break;
 case 'orgtip':toast('2주 연속 쓰담쓰담한 사람이에요. 4주 동안 안 하면 떼요.');break;
 case 'stillok':p.ratedDay=S.day;save();render('same');break;
 case 'hide':p.hidden=true;save();back();toast('냉장고에서 숨겼어요');break;
 case 'del':confirmDel(id);break;
 case 'delok':S.people=S.people.filter(x=>x.id!=id);save();closeSheet();nav=[{v:'shelf'}];render('back');toast('지웠어요');break;
 case 'edit':editSheet(id,el.dataset.f);break;
 case 'edx':{const e2=ui.ed,x=el.dataset.x;if(e2.f=='grade'||e2.f=='persona')e2.val=+x;else if(e2.f=='cycle')e2.val=x=='auto'?'auto':+x;else if(e2.f=='priv')e2.val=!e2.val;else if(e2.f=='rep'){const i=e2.val.indexOf(x);i>=0?e2.val.splice(i,1):e2.val.push(x)}else e2.val=e2.val===x?null:x;drawEdit();break}
 case 'edsave':{const e2=ui.ed,q=P(e2.id);q[e2.f]=e2.val;if(e2.f=='grade'||e2.f=='persona')q.ratedDay=S.day;save();closeSheet();render('same');toast('저장했어요');break}
 case 'holdsheet':holdSheet(id);break;
 case 'hsx':ui.hs[el.dataset.f]=+el.dataset.x;drawHold();break;
 case 'hssave':{const q=P(ui.hs.id);Object.assign(q,{hold:false,grade:ui.hs.grade,persona:ui.hs.persona,cycle:'auto',ratedDay:S.day});save();closeSheet();render('same');toast('평가를 저장했어요');break}
 case 'tagp':go({v:'tagPeople',t:el.dataset.t});break;
 case 'filter':filterSheet();break;
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
function filterSheet(keep){if(!keep)ui.ff2=JSON.parse(JSON.stringify(ui.ff||{st:[],gr:[],tg:[]}));const f=ui.ff2;
 const base=visible().filter(p=>rated(p)||p.hold);let L=base;if(f.st.length)L=L.filter(p=>f.st.includes(stage(p).k));if(f.gr.length)L=L.filter(p=>f.gr.includes(p.hold?'hold':String(p.grade)));if(f.tg.length)L=L.filter(p=>f.tg.every(t=>p.memo.includes(t)||p.rep.includes(t)));
 const tagsUsed=[...new Set(base.flatMap(p=>p.memo))];
 const c=(k,x,l)=>`<button class="chip sm ${f[k].includes(x)?'on':''}" data-a="ffx" data-k="${k}" data-x="${esc(x)}">${esc(l)}</button>`;
 sheet(`<h3>골라 보기</h3><div class="gn" style="font-weight:700;margin:6px 0">상태</div><div class="chips">${[['fresh','신선'],['today','오늘 손질'],['aging','숙성 중'],['spoil','상하기 직전']].map(x=>c('st',x[0],x[1])).join('')}</div>
 <div style="font-weight:700;margin:14px 0 6px">등급</div><div class="chips">${[5,4,3,2,1].map(g=>c('gr',String(g),GR[g][0])).join('')}${c('gr','hold','판단 보류')}</div>
 <div style="font-weight:700;margin:14px 0 6px">태그</div><div class="chips">${tagsUsed.map(t=>c('tg',t,t)).join('')||'<span class="small">아직 없어요</span>'}</div>
 <div class="dbtn" style="margin-top:18px"><button data-a="ffreset">초기화</button><button class="r" data-a="ffok" ${L.length?'':'disabled style="opacity:.5"'}>${L.length?L.length+'명 보기':'맞는 사람이 없어요'}</button></div>`)}

const had=localStorage.getItem(KEY);load();if(!had)seed();render('fade');
if(location.hash=='#test')testMenu();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
