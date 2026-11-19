'use strict';
const KEY='yjp-app-v1';
const PERS=['무던무던','친절한','믿을만한','능글능글','소심이','똑부러지는','심한허세','멍충이','고집불통','불같은','꼰대','DOG'];
const GR={5:['1++','투뿔 마블링'],4:['1+','원뿔 등심'],3:['1','무난한 1등급'],2:['2','국거리용'],1:['반품','촉수엄금']};
const DEFC={5:7,4:30,3:90,2:180,1:0};
const CYC=[[7,'1주'],[30,'1개월'],[90,'3개월'],[180,'6개월'],[0,'연락 안 함']];
const AGAIN=['무조건','상황 봐서','절대 안 함'];
const REP_POS=['숫자에 강함','약속 칼같음','인맥왕','말발 좋음','디테일 장인'];
const REP_NEG=['답장 냉동 보관','약속 해동 중','말만 투뿔','뒷심 부족','생색 마블링','숟가락 얹기','밀당 장인','회식 전용','핑계 양념','읽고 숙성'];
const GROUPS=[['사는 곳','#834AF4',['여의도','마포']],['가족 구성','#75C895',['1남1녀','무자녀']],['생년','#88CBF0',['60s','70s','80s','90s','00s']],['취미·관심사','#89D16F',['골프','등산']],['고향','#F4A259',['서울','부산','대구']],['출신 대학','#3F89F6',['연세대','고려대','서울대']]];
const BASE=new Date(2026,9,27);
const $=s=>document.querySelector(s);
const BACK='<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M 11 5 L 4 12 L 11 19 M 4 12 H 21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let S,nav=[{v:'shelf'}],ui={},lastN=null;

function blank(){return {day:0,people:[],seq:1,customTags:{},notifs:[],readBell:false,accepted:false,verdictN:7,seenInfo:{},firstWrite:true}}
const DECADE_ALL=['50s','60s','70s','80s','90s','00s','10s','20s'];
const DECADE_BASE=['60s','70s','80s','90s','00s'];
function isBirthDecade(t){return DECADE_ALL.includes(t)}
function oldDecade(t){return /^(50|60|70|80|90|00)년대$/.test(String(t))}
function isBirthYear(t){return /^(0\d|1\d|2\d|[5-9]\d)$/.test(t)}
function decadeOfYear(yy){return String(Math.floor(+yy/10)*10).padStart(2,'0')+'s'}
function presentDecades(){const gone=new Set(S.tagGone||[]),custom=new Set(((S.customTags||{})['생년']||[]).filter(isBirthDecade));return DECADE_ALL.filter(d=>(DECADE_BASE.includes(d)&&!gone.has(d))||custom.has(d))}
function missingDecades(){const have=new Set(presentDecades());return DECADE_ALL.filter(d=>!have.has(d))}
function addDecade(t){if(!isBirthDecade(t))return;S.tagGone=(S.tagGone||[]).filter(x=>x!==t);if(!DECADE_BASE.includes(t)){S.customTags=S.customTags||{};S.customTags['생년']=S.customTags['생년']||[];if(!S.customTags['생년'].includes(t))S.customTags['생년'].push(t)}}
function deleteDecade(t){if(!isBirthDecade(t))return;const ys=new Set(yearsOfDecade(t)),drop=x=>x!==t&&!ys.has(x);(S.people||[]).forEach(p=>{if(p&&p.memo)p.memo=p.memo.filter(drop)});if(Array.isArray(S.tagRecent))S.tagRecent=S.tagRecent.filter(drop);if(Array.isArray(ui.tagSel))ui.tagSel=ui.tagSel.filter(drop);if(S.customTags&&Array.isArray(S.customTags['생년']))S.customTags['생년']=S.customTags['생년'].filter(drop);if(S.tagMove){delete S.tagMove[t];ys.forEach(y=>{delete S.tagMove[y]})}if(DECADE_BASE.includes(t)){S.tagGone=S.tagGone||[];if(!S.tagGone.includes(t))S.tagGone.push(t)}}
function birthDeleteConfirm(t){sheet(`<h3>'${esc(t)}' 태그를 지울까요?</h3><p>이 연대와 연도 태그가 붙은 사람에게서도 빠져요.</p><div class="dbtn"><button data-a="sclose2">취소</button><button class="r" data-a="bdelok" data-t="${esc(t)}">지우기</button></div>`,true)}
function yearsOfDecade(dec){const n=+dec.slice(0,2);return Array.from({length:10},(_,i)=>String(n+i).padStart(2,'0'))}
function isFullBirth(t){return /^(19[5-9]\d|200\d)$/.test(String(t))}
function decadeOfFull(y){y=+y;return y>=2000?'00s':String(y).slice(2,3)+'0s'}
function migrateBirthList(arr){if(!Array.isArray(arr)||!arr.some(t=>isFullBirth(t)||oldDecade(t)))return arr;if(!arr.some(isFullBirth))return arr.map(t=>oldDecade(t)?t.replace('년대','s'):t);let dec=null,yy=null;const rest=[];arr.forEach(t=>{if(isFullBirth(t)){dec=decadeOfFull(t);yy=String(+t).slice(-2)}else if(!isBirthDecade(t)&&!oldDecade(t)&&!isBirthYear(t))rest.push(t)});if(dec)rest.push(dec);if(yy)rest.push(yy);return rest}
function mapStoredTag(t){if(isFullBirth(t))return null;return oldDecade(t)?t.replace('년대','s'):t}
function migrateBirth(){let drop=false;(S.people||[]).forEach(p=>{if(!p||!p.memo)return;const next=migrateBirthList(p.memo);if(next!==p.memo){p.memo=next;drop=true}});if(Array.isArray(S.tagRecent)){const next=migrateBirthList(S.tagRecent);if(next!==S.tagRecent){S.tagRecent=next;drop=true}}if(Array.isArray(S.tagGone)){const next=[];S.tagGone.forEach(t=>{const n=mapStoredTag(t);if(n!=null&&!next.includes(n))next.push(n)});if(next.length!==S.tagGone.length||next.some((t,i)=>t!==S.tagGone[i])){S.tagGone=next;drop=true}}if(S.tagMove)Object.keys(S.tagMove).forEach(t=>{if(isFullBirth(t)){delete S.tagMove[t];drop=true}else if(oldDecade(t)){const n=t.replace('년대','s');if(S.tagMove[n]==null)S.tagMove[n]=S.tagMove[t];delete S.tagMove[t];drop=true}});if(S.customTags)Object.keys(S.customTags).forEach(g=>{const a=S.customTags[g];if(!Array.isArray(a))return;const next=[];a.forEach(t=>{const n=mapStoredTag(t);if(n!=null&&!next.includes(n))next.push(n)});if(next.length!==a.length||next.some((t,i)=>t!==a[i])){S.customTags[g]=next;drop=true}});return drop}
function load(){try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}if(!S)S=blank();let drop=false;(S.people||[]).forEach(p=>{if(!p)return;if(Object.prototype.hasOwnProperty.call(p,'rel')){delete p.rel;drop=true}if(p.hold&&p.cycle!=='auto'){p.cycle='auto';drop=true}else if(!p.hold&&p.cycle==='auto'&&p.grade!=null){p.cycle=DEFC[p.grade];drop=true}});if(migrateBirth())drop=true;if(drop)save()}
function kstDay(){return Math.floor((Date.now()+9*3600e3)/864e5)+S.day}
function earnPt(id){S.ptLog=S.ptLog||{};const d=kstDay();if(S.ptLog[id]===d)return false;S.ptLog[id]=d;S.pts=(S.pts||0)+1;return true}
function save(){localStorage.setItem(KEY,JSON.stringify(S))}
function dateOf(d){const x=new Date(BASE);x.setDate(x.getDate()+d);return x}
function md(d){const x=dateOf(d);return (x.getMonth()+1)+'월 '+x.getDate()+'일'}
function mdw(d){return md(d)+' ('+'일월화수목금토'[dateOf(d).getDay()]+')'}
function P(id){return S.people.find(p=>p.id==id)}
function rated(p){return p.grade!=null}
function cycleDays(p){if(p.hold)return 0;return p.cycle==='auto'?DEFC[p.grade]:p.cycle}
function lastC(p){return p.contacts.length?p.contacts[p.contacts.length-1].day:p.ratedDay}
function stage(p){const c=cycleDays(p);if(!c)return {k:'none',t:'연락 안 함',o:99};const diff=S.day-(lastC(p)+c);
 if(diff<0)return {k:'fresh',t:'신선 D-'+(-diff),o:3,d:diff};if(diff==0)return {k:'today',t:'오늘 손질',o:2,d:0};
 if(diff<14)return {k:'aging',t:'숙성 중 D+'+diff,o:1,d:diff};return {k:'spoil',t:'상하기 직전 D+'+diff,o:0,d:diff}}
function cycLabel(p){const c=cycleDays(p);const x=CYC.find(z=>z[0]===c);return x?x[1]:''}
function defCycleLine(g){const n=cycLabel({hold:false,grade:g,cycle:'auto'});return n==='연락 안 함'?n:n+' 주기'}
function fbn(id){return id==='p1'||id==='o1'?'fbn-p1':id==='p2'||id==='o2'?'fbn-p2':id==='p9'||id==='o9'?'fbn-p9':''}
function emo(p,cls='em'){const id=p.hold||p.persona==null?'hold':'p'+p.persona;const src=id==='hold'?'emoji/hold.svg':'emoji/'+id+'.svg';const c=[cls,fbn(id)].filter(Boolean).join(' ');return `<img class="${c}" src="${src}" alt="">`}
const PXG={
1:{a:'#7D6B6C',b:'#FFFFFF',rows:['....................','......bbbbbbbb......','.....baaaaaaaab.....','....baaaaaaaaaab....','...baaabbbbbbaaab...','..baaabbbbbbbbaaab..','.baaabbbbbbbbbbaaab.','.baabbbbbbbbbbbbaab.','.baabbbbabbbabbbaab.','.baabbbbbababbbbaab.','.baabbbbbbabbbbbaab.','.baabbbbbababbbbaab.','.baabbbbabbbabbbaab.','.baaabbbbbbbbbbaaab.','..baaabbbbbbbbaaab..','...baaabbbbbbaaab...','....baaaaaaaaaab....','.....baaaaaaaab.....','......bbbbbbbb......','....................']},
2:{a:'#995E62',b:'#FFFFFF',rows:['....................','......bbbbbbbb......','.....baaaaaaaab.....','....baaaaaaaaaab....','...baaabbbbbbaaab...','..baaabbbbbbbbaaab..','.baaabbbbbbbbbbaaab.','.baabbbbbbbbbbbbaab.','.baabbbbbaaabbbbaab.','.baabbbbbbbabbbbaab.','.baabbbbbaaabbbbaab.','.baabbbbbabbbbbbaab.','.baabbbbbaaabbbbaab.','.baaabbbbbbbbbbaaab.','..baaabbbbbbbbaaab..','...baaabbbbbbaaab...','....baaaaaaaaaab....','.....baaaaaaaab.....','......bbbbbbbb......','....................']},
3:{a:'#AE5359',b:'#FFFFFF',rows:['....................','......bbbbbbbb......','.....baaaaaaaab.....','....baaaaaaaaaab....','...baaabbbbbbaaab...','..baaabbbbbbbbaaab..','.baaabbbbbbbbbbaaab.','.baabbbbbbbbbbbbaab.','.baabbbbbbabbbbbaab.','.baabbbbbaabbbbbaab.','.baabbbbbbabbbbbaab.','.baabbbbbbabbbbbaab.','.baabbbbbaaabbbbaab.','.baaabbbbbbbbbbaaab.','..baaabbbbbbbbaaab..','...baaabbbbbbaaab...','....baaaaaaaaaab....','.....baaaaaaaab.....','......bbbbbbbb......','....................']},
4:{a:'#C0434B',b:'#FFFFFF',rows:['....................','......bbbbbbbb......','.....baaaaaaaab.....','....baaaaaaaaaab....','...baaabbbbbbaaab...','..baaabbbbbbbbaaab..','.baaabbbbbbbbbbaaab.','.baabbbbbbbbbbbbaab.','.baabbbbabbbbbbbaab.','.baabbbaabbbabbbaab.','.baabbbbabbaaabbaab.','.baabbbbabbbabbbaab.','.baabbbaaabbbbbbaab.','.baaabbbbbbbbbbaaab.','..baaabbbbbbbbaaab..','...baaabbbbbbaaab...','....baaaaaaaaaab....','.....baaaaaaaab.....','......bbbbbbbb......','....................']},
5:{a:'#A8740A',b:'#D52934',c:'#D9A21B',d:'#F6D46A',e:'#FFFFFF',rows:['....................','......eeeeeeee......','.....eddddcccce.....','....eddbbbbbbcce....','...eddbbeeeebbcce...','..eddbbeeeeeebbcce..','.eddbbeeeeeeeebbcce.','.edbbeeeebeeebebbce.','.edbeebebbbebbbebae.','.edbebbeebeeebeebae.','.ecbeebeeeeeeeeebae.','.ecbeebeeeeeeeeebae.','.ecbbbbbeeeeeeebbae.','.eccbbeeeeeeeebbaae.','..eccbbeeeeeebbaae..','...eccbbeeeebbaae...','....eccbbbbbbaae....','.....eccaaaaaae.....','......eeeeeeee......','....................']},
h:{a:'#8A8A8A',b:'#FFFFFF',rows:['....................','......bbbbbbbb......','.....baabaabaab.....','....bbaabaabaabb....','...baabbbbbbbbbab...','..baaabbbbbbbbaaab..','.bbbabbbbbbbbbbabbb.','.baabbbbbbbbbbbbbbb.','.baabbbbaaabbbbbaab.','.bbbbbbbbbabbbbbaab.','.baabbbbbabbbbbbbbb.','.baabbbbbbbbbbbbaab.','.bbbbbbbbabbbbbbaab.','.bbbabbbbbbbbbbabbb.','..baaabbbbbbbbaaab..','...babbbbbbbbbaab...','....bbaabaabaabb....','.....baabaabaab.....','......bbbbbbbb......','....................']}
};
function stamp(g,big){const hold=g==null;const spec=PXG[hold?'h':g];const label=hold?'판정 보류':GR[g][0];let rects='';spec.rows.forEach((row,y)=>{for(let x=0;x<20;x++){const ch=row[x];if(ch!=='.')rects+=`<rect x="${x}" y="${y}" width="1" height="1" fill="${spec[ch]}"/>`}});return `<span class="stamp ${hold?'hold':'g'+g}${big?' big':''}"><svg viewBox="0 0 20 20" shape-rendering="crispEdges" role="img" aria-label="${esc(label)}" focusable="false">${rects}</svg></span>`}
function organic(p){const wk=d=>Math.floor((d-S.day%7+70000)/7);if(!p.pats||!p.pats.length)return false;const w=new Set(p.pats.map(d=>Math.floor(d/7)));const cw=Math.floor(S.day/7);return (w.has(cw)&&w.has(cw-1))||(w.has(cw-1)&&w.has(cw-2))}
function visible(){return S.people.filter(p=>!p.hidden)}
function personTags(p){return [...new Set([].concat(p.memo||[],p.rep||[]).map(String))]}
function matchPerson(p,q){const s=String(q||'').trim().toLowerCase();if(!s)return true;return p.name.toLowerCase().includes(s)||personTags(p).some(t=>t.toLowerCase().includes(s))}
function searchPeople(){return visible().filter(p=>rated(p)||p.hold)}
function searchAll(q){return S.people.filter(p=>matchPerson(p,q))}
function searchAct(p){return p.hidden?'open':(!rated(p)||p.hold)?'write':'open'}
function searchFlags(p){let h='';if(!rated(p)&&!p.hold)h+='<span class="pill st-none">평가 전</span>';if(p.hidden)h+='<span class="pill st-none">숨김</span>';return h}
/* v22: 앱 설치 후 저장한 연락처만, 7일, 최근 저장 순 */function newOnes(){const ins=S.installDay??-Infinity;return visible().filter(p=>p.isNew&&!rated(p)&&!p.hold&&p.addedDay>=ins&&S.day-p.addedDay<7).sort((a,b)=>b.addedDay-a.addedDay||b.id-a.id)}
function todayList(){return visible().filter(p=>rated(p)&&!p.hold&&['today','aging','spoil'].includes(stage(p).k)).sort(sortFn)}
function holdList(){return visible().filter(p=>p.hold).sort((a,b)=>(a.ratedDay??0)-(b.ratedDay??0)||a.id-b.id)}
function byStage(k){return visible().filter(p=>rated(p)&&!p.hold&&stage(p).k==k).sort((a,b)=>(stage(b).d||0)-(stage(a).d||0))}
function holdStage(p){const c=p.cycle==='auto'?30:p.cycle;if(!c)return {o:99,d:0};const diff=S.day-(lastC(p)+c);if(diff<0)return {o:3,d:diff};if(diff==0)return {o:2,d:0};if(diff<14)return {o:1,d:diff};return {o:0,d:diff}}
function sortFn(a,b){if(!!a.hold!==!!b.hold)return a.hold?1:-1;const x=a.hold?holdStage(a):stage(a),y=b.hold?holdStage(b):stage(b);if(x.o!=y.o)return x.o-y.o;return x.o<=1?y.d-x.d:(x.d||0)-(y.d||0)}
function countN(){return todayList().length}

function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2000)}
function go(v,dir){nav.push(v);render(dir||'fwd')}
function shelfSec(k){return k==='trim'||k==='nw'||k==='hold'}
function reopenSec(){const k=ui.backSec;if(!k||!(nav.length===1&&nav[0].v==='shelf'))return;ui.backSec=null;ui.sec=k;ui.secFocus=null;drawSec()}
function back(){if(nav.length>1)nav.pop();render('back');reopenSec()}
function tab(v){if(v=='verdict'){openVerdict();return}ui.backSec=null;nav=[{v}];render('fade')}

/* seed */
function mk(o){return Object.assign({id:S.seq++,name:'',phone:'',isNew:false,addedDay:S.day,grade:null,persona:null,hold:false,cycle:'auto',again:null,memo:[],rep:[],priv:false,contacts:[],ratedDay:S.day,hidden:false,kkul:[],pats:[]},o)}
function seed(){S=blank();const d=0;
 const add=o=>S.people.push(mk(o));
 add({name:'박철호 부장',phone:'010-****-1234',grade:5,persona:2,ratedDay:-60,contacts:[{day:-7,t:'전화'}],rep:['숫자에 강함','약속 칼같음'],memo:['여의도','골프'],pats:[-8,-2],pub:true});
 add({name:'김형준 대표',phone:'010-****-2231',grade:4,persona:5,ratedDay:-120,contacts:[{day:-51,t:'문자'}]});
 add({name:'이서연 과장',phone:'010-****-3412',grade:3,persona:0,ratedDay:-100,contacts:[{day:-93,t:'연락했어요'}],memo:['80s']});
 add({name:'윤지현 팀장',phone:'010-****-5520',grade:4,persona:1,cycle:7,ratedDay:-40,contacts:[{day:-9,t:'전화'}],pats:[-9,-3]});
 add({name:'최영수 상무',phone:'010-****-6604',grade:2,persona:3,ratedDay:-30,contacts:[{day:-10,t:'전화'}],rep:['말만 투뿔']});
 add({name:'정은주 차장',phone:'010-****-7781',grade:1,persona:6,ratedDay:-20,rep:['답장 냉동 보관','핑계 양념']});
 add({name:'최은정 이사',phone:'010-****-8890',grade:4,persona:5,ratedDay:-15,contacts:[{day:-5,t:'문자'}]});
 add({name:'서준호 대리',phone:'010-****-9012',grade:2,persona:4,ratedDay:-25,contacts:[{day:-20,t:'전화'}]});
 add({name:'한동욱 이사',phone:'010-****-1150',hold:true,ratedDay:-127});
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
 S.people.forEach(p=>{if(p.hold)p.cycle='auto';else if(p.cycle==='auto'&&p.grade!=null)p.cycle=DEFC[p.grade]});
 S.installDay=-30;S.firstWrite=true;morning();save()}
function morning(){const t=todayList(),sp=t.filter(p=>stage(p).k=='spoil').length;let s='오늘 손질할 고기 '+t.length+'개';if(sp)s+=' · 상하기 직전 '+sp+'개';const n=newOnes().length;if(n)s+=' · 새로 들어온 고기 '+n+'개';const h=holdList().length;if(h)s+=' · 판정 보류 '+h+'개';
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
 if(v.v=='fridge')fitFridge();
 if(v.v=='tags')requestAnimationFrame(tagFit);
 if(window.curlRest)curlRest();
 const n=countN();const ne=app.querySelector('#nnum');if(ne&&lastN!=null&&lastN!==n){ne.classList.add('bump')}lastN=n}
function fitStall(){if(!nav[nav.length-1]||nav[nav.length-1].v!='shelf')return;const w=$('.stallwrap'),app=$('#app');if(!w||!app)return;w.style.setProperty('--s',String(Math.min(1,app.clientWidth/376)))}
function fitFridge(){if(!nav[nav.length-1]||nav[nav.length-1].v!='fridge')return;const room=$('#flist .frz-room'),rest=$('#flist .fsv-rest');if(!room||!rest)return;const rb=room.getBoundingClientRect(),w=Math.round(rb.width);room.classList.toggle('cramped',rb.height<400);
 const svg=(h,a)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="4" height="8" fill="#44515D" opacity="${a}"/><rect x="${w-4}" width="4" height="8" fill="#44515D" opacity="${a}"/><rect x="4" y="2" width="${w-8}" height="2" fill="#FFFFFF" opacity="${a}"/><rect x="4" y="4" width="${w-8}" height="2" fill="#B7D8F0" opacity="${a}"/><rect x="4" y="6" width="${w-8}" height="2" fill="#44515D" opacity="${a}"/></svg>`;
 const uri=s=>'url("data:image/svg+xml,'+encodeURIComponent(s)+'")';
 const strow=$('.fstatus .fst');if(strow)strow.classList.toggle('fade',strow.scrollWidth>strow.clientWidth+1);
 const tier=$('#flist .frtier');
 if(tier){const th=Math.max(1,Math.round(tier.getBoundingClientRect().height));rest.style.backgroundImage=uri(svg(8,1))+','+uri(svg(th,.5));rest.style.backgroundSize=w+'px 8px,'+w+'px '+th+'px';rest.style.backgroundRepeat='';rest.style.backgroundPosition='';return}
 const k=Math.max(1,Math.round(rb.height/115)),t=rb.height/k,imgs=[],sizes=[],pos=[];
 for(let i=1;i<k;i++){imgs.push(uri(svg(8,1)));sizes.push(w+'px 8px');pos.push('center '+(i*t)+'px')}
 rest.style.minHeight='0';rest.style.backgroundImage=imgs.join(',');rest.style.backgroundSize=sizes.join(',');rest.style.backgroundRepeat='no-repeat';rest.style.backgroundPosition=pos.join(',')}
function navBar(c){const t=[['shelf','진열대','🥩'],['fridge','냉장고','🧊'],['tags','태그','🏷️'],['verdict','내 판정서','📋']];
 return `<nav class="tab">${t.map(x=>x[0]=='verdict'?`<button type="button" class="vt" data-a="tab" data-v="verdict" aria-label="내 판정서"></button>`:`<button type="button" data-a="tab" data-v="${x[0]}" class="${c==x[0]?'on':''}" aria-label="${x[1]}"><b data-ic="${x[0]}">${x[2]}</b><span>${x[1]}</span></button>`).join('')}</nav>`}
function info(k){return `<button class="info" data-a="info" data-k="${k}">i</button>`}

function shelf(){const nw=newOnes(),td=todayList(),hd=holdList(),fr=byStage('fresh'),ag=byStage('aging'),sp=byStage('spoil');const q=ui.q||'';
 const unread=S.notifs.some(x=>!x.read)&&!S.readBell;
 let h=`<div class="scr"><div class="hd"><h1 data-a="secret">진열대</h1>${info('shelf')}<span class="sp"></span><button class="ib" data-a="bell"><span class="bic">🔔</span>${unread?'<span class="dot"></span>':''}</button></div>
 <div class="search"><span class="sic">🔍</span><input id="q" type="search" placeholder="이름 / 태그 로 검색" value="${esc(q)}" autocomplete="off" enterkeyhint="search"></div>`;
 if(q.trim()){const r=searchAll(q);
  h+=`<div class="card" style="margin-top:10px">${r.map(p=>`<div class="row tap" data-a="${searchAct(p)}" data-id="${p.id}">${stamp(p.grade)}<div class="grow"><div class="nm">${esc(p.name)}</div>${searchFlags(p)?`<div class="sflags">${searchFlags(p)}</div>`:''}<div class="meta">${p.phone}</div></div><span class="go">${rated(p)||p.hold?'›':'평가 쓰기 →'}</span></div>`).join('')}
  <div class="row tap" data-a="add"><div class="grow"><div class="nm">＋ 새 연락처로 추가</div><div class="meta">테스트용: 폰 연락처 대신 여기서 넣어요</div></div></div></div>`;
  return h+'</div>'}
 if(!nw.length&&!td.length&&!hd.length&&!fr.length&&!ag.length&&!sp.length)h+=`<div class="empty">오늘은 손질할 고기가 없어요.<br>이름이나 태그로 찾아 평가를 써 보세요.</div>`;
 /* sprite positions from build_base_c2.py / build_n1e.py (390 canvas, crop origin 8,136) */
 const FB={hold:[9,26,211,192],p0:[11,30,208,189],p1:[10,33,209,190],p2:[9,33,210,187],p3:[11,27,211,193],p4:[12,31,210,189],p5:[11,29,209,192],p6:[11,29,209,190],p7:[12,16,211,203],p8:[11,29,209,191],p9:[10,22,210,199],p10:[11,12,211,206],p11:[11,23,209,196]};
 const SLOT={trim:{cx:[66,130,194,258],bottom:172,width:52},hold:{cx:[238,297],bottom:322,width:50},fresh:{cx:[82],bottom:466,width:50},aging:{cx:[186],bottom:466,width:50},spoil:{cx:[290],bottom:466,width:50}};
 const LAB={trim:{cx:187,cy:217},nw:{cx:108,cy:361},hold:{cx:266,cy:361},fresh:{cx:82,cy:505},aging:{cx:186,cy:505},spoil:{cx:290,cy:505}};
 const TW={trim:65,nw:94,hold:53,fresh:24,aging:41,spoil:65};
 const PAD={trim:4,nw:4,hold:4,fresh:2,aging:2,spoil:2};
 const ADV=[0,14,17,17,17,17,17,17,17,17,22,19,22,22,22,22,22,22,22,22,25,22,25,25,25];
 const BOX={trim:[0,96,376,150],nw:[0,255,188,125],hold:[188,255,188,125],fresh:[0,378,124,152],aging:[124,378,126,152],spoil:[250,378,126,152]};
 const art=(name,w,ht,style,alt,cls)=>`<img class="${cls||'px'}" src="art/${name}.png" srcset="art/${name}.png 1x, art/${name}@2x.png 2x, art/${name}@3x.png 3x" width="${w}" height="${ht}" alt="${alt||''}" draggable="false" style="${style}">`;
 const FM={p1:{m:1.0625,ax:104,ay:190},p2:{m:1.1047,ax:110,ay:187},p9:{m:1.1771,ax:111.5,ay:199}};
 const face=(p,slot,i,box)=>{const id=p.hold||p.persona==null?'hold':'p'+p.persona;const b=FB[id];const n=FM[id];const m=n?n.m:1;const ax=n?n.ax:(b[0]+b[2])/2;const ay=n?n.ay:b[3];const cssW=slot.width*220/(b[2]-b[0])*m;const left=slot.cx[i]-box[0]-cssW*ax/220;const top=slot.bottom-box[1]-cssW*ay/220;const src=id==='hold'?'emoji/hold.svg':((!p.hold&&p.persona!=null&&organic(p))?'emoji/o'+p.persona+'.svg':'emoji/'+id+'.svg');const st=`left:${left.toFixed(1)}px;top:${top.toFixed(1)}px;width:${cssW.toFixed(1)}px;height:${cssW.toFixed(1)}px`;const ols=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]].map(([x,y])=>`<img alt="" draggable="false" style="transform:translate(${x}px,${y}px)" src="${src}">`).join('');return `<span class="fc-ol" style="${st}">${ols}</span><img class="fc" src="${src}" alt="" draggable="false" style="${st}">`};
 const sec=(k,title,list,n,inner)=>{const over=Math.max(0,list.length-n);const aria=over?`${title}, ${over}명 더 보기`:`${title}, ${list.length}명`;const m=LAB[k],box=BOX[k];
  const paper=TW[k]+PAD[k]*2;let left=m.cx-paper/2,chip='';
  if(over){const nch=Math.min(over,24);const wc=ADV[nch]+10;const gl=m.cx-Math.floor((paper+2+wc+2)/2);left=gl;const cL=gl+paper+3-box[0];const cT=m.cy-10-box[1];chip=`<span class="schip" style="left:${cL}px;top:${cT}px;width:${wc}px">+${nch}</span>`}
  const lab=`<span class="slabl" style="left:${left-box[0]}px;top:${m.cy-10-box[1]}px;width:${paper}px">${title}</span>`;
  return `<button type="button" class="sec" data-a="sec" data-k="${k}" aria-label="${esc(aria)}" style="left:${box[0]}px;top:${box[1]}px;width:${box[2]}px;height:${box[3]}px"><span class="pan">${inner}</span><span class="labg">${lab}${chip}</span></button>`};
 const packs=nw.slice(0,2).map((_,i)=>{const p=[{x:44,y:280},{x:112,y:280}][i];const b=BOX.nw;return art('pack',56,46,`left:${p.x-b[0]}px;top:${p.y-b[1]}px`,'새로 들어온 사람, 아직 판정 없음','pk px')}).join('');
 h+=`<div class="stallwrap"><div class="stall">${art('stall',376,530,'','','stallbg')}${art('sign',132,38,'','여의도 정육점','signboard px')}
 ${sec('trim','손질할 고기',td,4,td.slice(0,4).map((p,i)=>face(p,SLOT.trim,i,BOX.trim)).join(''))}
 ${sec('nw','새로 들어온 고기',nw,2,packs)}
 ${sec('hold','판정 보류',hd,2,hd.slice(0,2).map((p,i)=>face(p,SLOT.hold,i,BOX.hold)).join(''))}
 ${sec('fresh','신선',fr,1,fr.slice(0,1).map((p,i)=>face(p,SLOT.fresh,i,BOX.fresh)).join(''))}
 ${sec('aging','숙성 중',ag,1,ag.slice(0,1).map((p,i)=>face(p,SLOT.aging,i,BOX.aging)).join(''))}
 ${sec('spoil','상하기 직전',sp,1,sp.slice(0,1).map((p,i)=>face(p,SLOT.spoil,i,BOX.spoil)).join(''))}
 </div></div>`;
 return h+'</div>'}

function fridge(){const f=ui.ff||{st:[],gr:[],tg:[]};f.tg=[];/* v18: 냉장고 태그 필터 없앰(태그 탭이 따로 있음) */const sq=(ui.fs||'').trim().toLowerCase();let L=sq?searchAll(sq):searchPeople();
 if(f.st.length)L=L.filter(p=>!p.hold&&f.st.includes(stage(p).k));
 if(f.gr.length)L=L.filter(p=>f.gr.includes(p.hold?'hold':String(p.grade)));
 if(f.tg.length)L=L.filter(p=>f.tg.every(t=>p.memo.includes(t)||p.rep.includes(t)||(isBirthDecade(t)&&p.memo.some(m=>isFullBirth(m)&&decadeOfFull(m)===t))));
 L.sort(sortFn);const all=visible().filter(p=>rated(p)||p.hold).length;const none=!L.length||!all;
 const note=!all?`<div class="door-note"><div class="door-card"><i class="door-tape" aria-hidden="true"></i><p class="door-title">냉장고가 비어 있어요.</p><p class="door-body">진열대에서 연락처를 찾아 첫 평가를 써&nbsp;보세요.</p><button class="btn-red-sm" data-a="tab" data-v="shelf">진열대로 가기</button></div></div>`:(none?`<div class="door-note"><div class="door-card"><i class="door-tape" aria-hidden="true"></i><p class="door-title">맞는 사람이 없어요</p>${f.gr.length||f.st.length?'<button class="btn-o" data-a="fall">전체 보기</button>':''}</div></div>`:'');
 let h=`<div class="scr"><div class="hd"><h1>냉장고</h1><span class="sp"></span></div>
 <div class="search fsrch"><span class="sic">🔍</span><input id="fqs" type="search" placeholder="이름 / 태그 로 검색" value="${esc(ui.fs||'')}" autocomplete="off" enterkeyhint="search"></div>
 <div class="chips frow gst" style="margin:6px 0 8px"><button class="gsb gall ${f.gr.length||f.st.length?'':'on'}" data-a="fall" aria-pressed="${!(f.gr.length||f.st.length)}" aria-label="전체(등급·상태 선택 해제)">전체</button>${[5,4,3,2,1].map(g=>[String(g),GR[g][0],'g'+g]).concat([['hold','보류','ghd']]).map(x=>`<button class="gsb ${x[2]} ${f.gr.includes(x[0])?'on':''}" data-a="fq" data-k="gr" data-x="${x[0]}" aria-pressed="${f.gr.includes(x[0])}" aria-label="${x[0]=='hold'?'판정 보류':x[1]+' 등급'}">${esc(x[1])}</button>`).join('')}</div>
 <div class="fstatus"><div class="chips frow fst">${[['fresh','신선'],['today','오늘 손질'],['aging','숙성 중'],['spoil','상하기 직전']].map(x=>`<button class="chip sm ${f.st.includes(x[0])?'on':''}" data-a="fq" data-k="st" data-x="${x[0]}">${esc(x[1])}</button>`).join('')}</div><span class="sortlbl"${none?' hidden':''}>연락 임박순</span></div>`;
 const cell=p=>{const s=p.hold?{k:'none',t:'판정 보류'}:stage(p);const mt=sq?personTags(p).filter(t=>t.toLowerCase().includes(sq)):[];const org=!p.hold&&p.persona!=null&&organic(p);const bare=!rated(p)&&!p.hold;
  const lab=p.hold?'':cycLabel(p);const meta=p.hold?(mt.length?mt.map(esc).join(' · '):''):`${lab?lab+' 주기':''}${mt.length?(lab?' · ':'')+mt.map(esc).join(' · '):''}`;
  return `<div class="row tap frrow" data-a="${searchAct(p)}" data-id="${p.id}"><div class="tav">${emo(p,'').replace('src="emoji/p'+p.persona,org?'src="emoji/o'+p.persona:'src="emoji/p'+p.persona)}${bare||p.grade==null?'':stamp(p.grade)}</div><div class="grow"><div class="nm"><span class="nmt">${esc(p.name)}</span>${org?'<span class="org">유기농</span>':''}</div>${meta?`<div class="meta">${meta}</div>`:''}</div><div class="frchips">${bare?'':`<span class="pill st-${s.k}">${s.t}</span>`}${searchFlags(p)}</div></div>`};
 let tiers='';
 if(!none)for(let i=0;i<L.length;i+=2)tiers+=`<div class="frtier${L[i+1]?'':' solo'}">${cell(L[i])}${L[i+1]?cell(L[i+1]):'<div class="frpad"></div>'}</div>`;
 const decal=(n,c)=>`<img class="frz-${c}" alt="" aria-hidden="true" draggable="false" src="art/${n}.png" srcset="art/${n}.png 1x, art/${n}@2x.png 2x">`;
 return h+`<div id="flist"><div class="card frz">${decal('arc','arc')}${decal('spark','spark')}<div class="frz-room">${tiers}<div class="fsv-fill" aria-hidden="true"><div class="fsv-rest"></div></div>${decal('frost','frost')}${note}</div><i class="frz-shade" aria-hidden="true"></i><i class="frz-foot" aria-hidden="true"></i><i class="frz-foot r" aria-hidden="true"></i></div></div></div>`}

function allMemo(){const m={};GROUPS.forEach(g=>m[g[0]]=[...(g[0]=='생년'?[]:g[2])]);Object.entries(S.customTags).forEach(([g,a])=>a.forEach(t=>{if(!m[g].includes(t))m[g].push(t)}));S.people.forEach(p=>p.memo.forEach(t=>{const g=groupOf(t);if(g&&!m[g].includes(t))m[g].push(t)}));return m}
function groupOf(t){if(S.tagMove&&S.tagMove[t])return S.tagMove[t];if(isFullBirth(t)||isBirthDecade(t)||isBirthYear(t))return '생년';for(const g of GROUPS)if(g[2].includes(t))return g[0];for(const [g,a] of Object.entries(S.customTags||{}))if(a.includes(t))return g;return null}
function toggleBirth(arr,t){const wipe=()=>{for(let k=arr.length-1;k>=0;k--)if(isBirthDecade(arr[k])||isBirthYear(arr[k]))arr.splice(k,1)};if(isBirthDecade(t)){const on=arr.includes(t);wipe();if(!on)arr.push(t);return}if(!isBirthYear(t))return;const i=arr.indexOf(t);if(i>=0){arr.splice(i,1);return}for(let k=arr.length-1;k>=0;k--)if(isBirthYear(arr[k]))arr.splice(k,1);const dec=decadeOfYear(t);if(!arr.includes(dec))arr.push(dec);arr.push(t)}
function usedYears(dec){const ys=yearsOfDecade(dec),set=new Set();S.people.forEach(p=>(p.memo||[]).forEach(t=>{if(ys.includes(t))set.add(t)}));return ys.filter(y=>set.has(y))}
const TCOLORS=['#834AF4','#75C895','#88CBF0','#89D16F','#F4A259','#3F89F6','#7F7CF6','#EE8FC0','#2AAFB3','#A8937F'];
function tagInit(){S.tagRecent=S.tagRecent||[];S.tagGroups=S.tagGroups||[];S.tagMove=S.tagMove||{};S.tagGone=S.tagGone||[];S.groupGone=S.groupGone||[];S.groupName=S.groupName||{};S.groupColor=S.groupColor||{};S.customTags=S.customTags||{};ui.tagSel=ui.tagSel||[];
 const base=new Set();GROUPS.forEach(g=>(g[2]||[]).forEach(t=>base.add(t)));let dirty=false;
 Object.keys(S.customTags).forEach(g=>{const next=(S.customTags[g]||[]).filter(t=>{if(!base.has(t)||tagUsed(t))return true;dirty=true;return false});if(next.length!==(S.customTags[g]||[]).length)S.customTags[g]=next});
 if(dirty)save()}
function tagUsed(t){return S.people.some(p=>(p.memo||[]).includes(t)||(p.rep||[]).includes(t))}
function tagMine(t){const g=groupOf(t);return !!(g&&(S.customTags[g]||[]).includes(t))||tagUsed(t)}
function tagMatch(sel){sel=sel||ui.tagSel||[];if(!sel.length)return [];return S.people.filter(p=>sel.every(t=>(p.memo||[]).includes(t)||(p.rep||[]).includes(t)))}
function memoGroupList(){tagInit();const out=GROUPS.filter(g=>!S.groupGone.includes(g[0])).map(g=>({key:g[0],name:S.groupName[g[0]]||g[0],color:S.groupColor[g[0]]||g[1],base:g[2]}));
 S.tagGroups.forEach(g=>out.push({key:g.name,name:g.name,color:g.color,base:[],custom:1}));return out}
function tagsIn(g){const gone=new Set(S.tagGone),set=[],push=t=>{if(!t||gone.has(t)||set.includes(t)||groupOf(t)!==g.key)return;set.push(t)};
 (g.base||[]).forEach(push);(S.customTags[g.key]||[]).forEach(push);Object.entries(S.tagMove).forEach(([t,k])=>{if(k===g.key)push(t)});S.people.forEach(p=>(p.memo||[]).forEach(push));return set}
function isRepTag(t){return REP_POS.includes(t)||REP_NEG.includes(t)}
function tagHit(t,q){return !q||t.toLowerCase().includes(q)}
function pill(t,kind){const on=(ui.tagSel||[]).includes(t);const rep=kind==='rep'||isRepTag(t);const neg=REP_NEG.includes(t);const g=groupOf(t);const col=(memoGroupList().find(x=>x.key===g)||{}).color||'#E6E6E6';
 const lock=ui.tagEdit&&rep;
 const cls=['tpill',on?'on':'',rep?'rep':'',neg?'neg':'',lock?'lock':''].filter(Boolean).join(' ');
 return `<button type="button" class="${cls}" style="--gc:${col}" data-a="tsel" data-t="${esc(t)}" data-k="${rep?'rep':'memo'}" aria-pressed="${on}" ${lock?'disabled':''}>${esc(t)}</button>`}
function tags(){tagInit();const sel=ui.tagSel;const n=tagMatch(sel).length;const edit=!!ui.tagEdit;
 const chips=sel.map(t=>`<button type="button" class="tschip" data-a="tsel" data-t="${esc(t)}" aria-label="${esc(t)} 빼기">${esc(t)} <span aria-hidden="true">×</span></button>`).join('');
 const recent=S.tagRecent.filter(t=>!S.tagGone.includes(t)&&(isRepTag(t)||tagMine(t)));
 let h=`<div class="scr tagpage${sel.length?' hasbar':''}"><div class="hd"><h1>태그</h1>${info('tags')}<span class="phsub thlead">여러 개 고르면 모두 붙은 사람만 찾아요</span></div>
 <div class="trecent"><b>최근 검색 태그</b><button type="button" class="tclearh" data-a="treclear" ${recent.length?'':'disabled'}>최근 기록 삭제</button></div>
 ${recent.length?`<div class="chips tpills">${recent.map(t=>pill(t)).join('')}</div>`:'<p class="thint">아직 검색한 태그가 없어요</p>'}`;
 h+=`<div class="tsec"><b>메모 태그</b><span class="phsub"> · 나만 봐요</span></div>`;
 if(edit)h+=`<p class="thint">메모 태그를 누르면 이름을 바꾸거나 지울 수 있어요. ⋯를 누르면 그룹을 바꿀 수 있어요.</p>`;
 memoGroupList().forEach(g=>{let ts=g.key==='생년'?presentDecades().filter(tagMine):tagsIn(g).filter(tagMine);const more=edit?`<button type="button" class="t7more" data-a="tmore" data-g="${esc(g.key)}" aria-label="그룹 메뉴">⋯</button>`:'';
  const chipsHtml=ts.map(t=>pill(t,'memo'));
  const bare=edit&&!ts.length;
  let pills;
  if(edit&&ts.length){const last=chipsHtml.pop();pills=chipsHtml.join('')+`<span class="t7morewrap">${last}${more}</span>`}
  else if(!edit)pills=chipsHtml.join('')||'<span class="small">아직 없어요</span>';
  else pills='';
  let yrs='';
  if(g.key==='생년'&&!edit){const ys=[];(ui.tagSel||[]).filter(isBirthDecade).forEach(d=>usedYears(d).forEach(y=>{if(!ys.includes(y))ys.push(y)}));if(ys.length)yrs=`<div class="chips tpills">${ys.map(y=>pill(y,'memo')).join('')}</div>`}
  const row=yrs?`<div class="tby">${pills?`<div class="chips tpills">${pills}</div>`:''}${yrs}</div>`:(pills?`<div class="chips tpills">${pills}</div>`:'');
  h+=`<section class="tcard${bare?' is-empty':''}" style="--gc:${g.color}"><div class="tgh" data-g="${esc(g.key)}"><span class="gdot" aria-hidden="true"></span><h2>${esc(g.name)}</h2>${bare?more:''}</div>${row}</section>`});
 const reps=[...REP_POS,...REP_NEG];
 h+=`<div class="tsec"><b>평판 태그</b><span class="phsub"> · 익명으로 모여요</span></div>${edit?'<p class="thint">정해진 목록이라 검색만 돼요</p>':''}<div class="chips tpills">${reps.map(t=>pill(t,'rep')).join('')}</div>`;
 let dock='';
 if(!edit&&!sel.length)dock+=`<button type="button" class="tfab" data-a="tmenu" aria-expanded="${ui.tagMenu?'true':'false'}" aria-label="태그 메뉴">+</button>${ui.tagMenu?`<div class="tmenu"><button type="button" data-a="tadd">태그 추가</button><button type="button" data-a="tgadd">그룹 추가</button><button type="button" data-a="tedit">전체 편집</button></div>`:''}`;
 if(edit&&!sel.length)dock+=`<button type="button" class="btn-r teditend" data-a="teditdone">편집 끝내기</button>`;
 if(sel.length)dock+=`<div class="t7shade" aria-hidden="true"></div><div class="tagbar"><span class="tn">고른 태그를 모두 가진 사람 ${n}명</span><div class="tbchips" id="tbchips">${chips}</div><button type="button" class="btn-r" data-a="tsearch" ${n?'':'disabled'}>검색</button></div>`;
 return h+'</div>'+dock}
function drawTagSheet(){tagInit();const sel=ui.tagSel.slice();const L=tagMatch(sel);const x='<button type="button" class="secx" data-a="sclose2" aria-label="닫기"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>';
 const chips=`<div class="tpicks">${sel.map(t=>`<button type="button" class="tschip" data-a="tx" data-t="${esc(t)}" aria-label="${esc(t)} 빼기">${esc(t)} <span aria-hidden="true">×</span></button>`).join('')}</div>`;
 let body;
 if(!L.length)body=`<div class="tempty"><p>고른 태그를 모두 가진 사람이 없어요</p><p class="sub">위 칩의 ×를 눌러 태그를 하나씩 빼 보세요.</p><button type="button" class="tzero" data-a="tclear">고른 태그 모두 빼기</button></div>`;
 else body=L.map(p=>{const org=!p.hold&&p.persona!=null&&organic(p);const src=p.hold||p.persona==null?'emoji/hold.svg':(org?'emoji/o'+p.persona+'.svg':'emoji/p'+p.persona+'.svg');const idn=p.hold||p.persona==null?'hold':(org?'o'+p.persona:'p'+p.persona);const flags=searchFlags(p);
  return `<div class="sline"><button type="button" class="who" data-a="${searchAct(p)}" data-id="${p.id}"><span class="tav"><img class="${fbn(idn)}" src="${src}" alt="">${p.grade==null?'':stamp(p.grade)}</span><span class="grow"><span class="nm"><span class="nmt">${esc(p.name)}</span>${flags?`<span class="sflags">${flags}</span>`:''}</span></span></button><button type="button" class="rb" data-a="tcall" data-t="전화" data-id="${p.id}">전화걸기</button></div>`}).join('');
 sheet(`<div class="sechead"><div class="sectitle"><h3 id="sec-title">고른 태그를 모두 가진 사람 ${L.length}명</h3>${x}</div>${chips}</div><div class="seclist">${body}</div>`);
 const sh=$('#sheet-root .sheet');if(sh){sh.classList.add('secsheet','tagres');sh.setAttribute('role','dialog');sh.setAttribute('aria-modal','true');sh.setAttribute('aria-labelledby','sec-title');sh.tabIndex=-1}bindSwipe();
 if(sh&&!sh.contains(document.activeElement)){const b=sh.querySelector('.secx');if(b)b.focus({focusVisible:false})}}
function tagFit(){const sc=$('#tbchips');if(!sc||!ui.tagScroll)return;sc.scrollLeft=sc.scrollWidth;ui.tagScroll=0}
function tagRemember(){tagInit();ui.tagSel.forEach(t=>{S.tagRecent=S.tagRecent.filter(x=>x!==t);S.tagRecent.unshift(t)});S.tagRecent=S.tagRecent.filter(t=>!S.tagGone.includes(t)).slice(0,12);save()}
function dropTag(t){S.people.forEach(p=>{p.memo=(p.memo||[]).filter(x=>x!==t)});Object.keys(S.customTags).forEach(g=>{S.customTags[g]=(S.customTags[g]||[]).filter(x=>x!==t)});
 delete S.tagMove[t];if(!S.tagGone.includes(t))S.tagGone.push(t);S.tagRecent=S.tagRecent.filter(x=>x!==t);ui.tagSel=ui.tagSel.filter(x=>x!==t)}
function memoNames(){const s=[];memoGroupList().forEach(g=>tagsIn(g).forEach(t=>{if(!s.includes(t))s.push(t)}));return s}
function renameTag(old,neu){const g=groupOf(old);S.people.forEach(p=>{p.memo=(p.memo||[]).map(t=>t===old?neu:t);p.memo=[...new Set(p.memo)]});
 Object.keys(S.customTags).forEach(k=>{S.customTags[k]=(S.customTags[k]||[]).map(t=>t===old?neu:t)});if(S.tagMove[old]){S.tagMove[neu]=S.tagMove[old];delete S.tagMove[old]}
 if(g){S.customTags[g]=S.customTags[g]||[];if(!S.customTags[g].includes(neu))S.customTags[g].push(neu)}if(!S.tagGone.includes(old))S.tagGone.push(old);S.tagGone=S.tagGone.filter(t=>t!==neu);
 S.tagRecent=S.tagRecent.map(t=>t===old?neu:t);ui.tagSel=ui.tagSel.map(t=>t===old?neu:t)}
function mergeTag(a,b){if(!a||!b||a===b||isRepTag(a)||isRepTag(b))return;S.people.forEach(p=>{if((p.memo||[]).includes(a)){p.memo=p.memo.filter(t=>t!==a);if(!p.memo.includes(b))p.memo.push(b)}});dropTag(a)}
function birthTag(t){return groupOf(t)==='생년'}
function openTagAdd(){ui.tagMenu=0;if(!ui.tagNewGroup)ui.tagNewGroup=(memoGroupList()[0]||{}).key||'';const birth=ui.tagNewGroup==='생년';const groups=memoGroupList().map(g=>`<button type="button" class="tpill ${g.key===ui.tagNewGroup?'on':''}" style="--gc:${g.color}" data-a="tnewg" data-g="${esc(g.key)}">${esc(g.name)}</button>`).join('');const body=birth?`<div class="chips">${missingDecades().map(d=>`<button type="button" class="chip sm" data-a="badd" data-t="${esc(d)}">${esc(d)}</button>`).join('')}</div>`:`<label class="inp">태그 이름 (20자까지)<input id="tnew" maxlength="20" placeholder="태그 이름 (20자까지)"></label><div class="small" id="tcnt">0/20</div><p class="thint">평판 태그는 정해진 목록에서만 골라요.</p><button type="button" class="btn-r" data-a="tnewsave">저장</button>`;secSheetWrap(`<div class="sechead"><div class="sectitle"><h3>태그 추가</h3>${SECX}</div></div><div class="tform"><div class="tlab">그룹</div><div class="chips tpills">${groups}</div>${body}</div>`)}
function tagEditMenu(t){if(isBirthYear(t))return;if(isBirthDecade(t)){birthDeleteConfirm(t);return}sheet(`<h3>${esc(t)}</h3><button type="button" class="srow" data-a="trenamet" data-t="${esc(t)}">이름 바꾸기</button><button type="button" class="srow" data-a="tdel" data-t="${esc(t)}">지우기</button>`)}
function tagHoldMenu(t){if(!t||isRepTag(t)||isBirthYear(t))return;if(isBirthDecade(t)){birthDeleteConfirm(t);return}sheet(`<h3>${esc(t)}</h3><button type="button" class="srow" data-a="trenamet" data-t="${esc(t)}">이름 바꾸기</button><button type="button" class="srow" data-a="tmerge" data-t="${esc(t)}">다른 태그와 합치기</button><button type="button" class="srow" data-a="tmove" data-t="${esc(t)}">다른 그룹으로 옮기기</button><button type="button" class="srow" data-a="tdel" data-t="${esc(t)}">지우기</button>`)}
function groupHold(key){const g=memoGroupList().find(x=>x.key===key);if(!g)return;const birth=key==='생년';sheet(`<h3 style="--gc:${g.color}"><span class="t7sdot" aria-hidden="true"></span>${esc(g.name)}</h3>${birth?'':`<button type="button" class="srow" data-a="trenameg" data-g="${esc(key)}">이름 바꾸기</button>`}<button type="button" class="srow" data-a="trecolor" data-g="${esc(key)}" style="--gc:${g.color}">그룹 색 변경<span class="gsw" aria-hidden="true"></span></button>${birth?'':`<button type="button" class="srow" data-a="tdelg" data-g="${esc(key)}">지우기</button>`}`)}
function openGroupColor(key){ui.recolorG=key;ui.tagColor=(memoGroupList().find(g=>g.key===key)||{}).color||TCOLORS[0];secSheetWrap(`<div class="sechead"><div class="sectitle"><h3>그룹 색 변경</h3>${SECX}</div></div><div class="tform"><div class="tcolors">${TCOLORS.map(c=>`<button type="button" class="tcol ${c===ui.tagColor?'on':''}" style="background:${c}" data-a="tcol" data-c="${c}" aria-label="${c}"></button>`).join('')}</div><button type="button" class="btn-r" data-a="trecolorsave">저장</button></div>`)}
function tagRenameGroup(key){ui.renameG=key;const nm=(memoGroupList().find(g=>g.key===key)||{}).name||key;secSheetWrap(`<div class="sechead"><div class="sectitle"><h3>이름 바꾸기</h3>${SECX}</div></div><div class="tform"><label class="inp">그룹 이름<input id="tname" maxlength="20" value="${esc(nm)}"></label><div class="small" id="tcnt">${nm.length}/20</div><button type="button" class="btn-r" data-a="trenamegok">저장</button></div>`)}
function secSheetWrap(inner){sheet(inner);const sh=$('#sheet-root .sheet');if(sh){sh.classList.add('secsheet');sh.setAttribute('role','dialog');sh.setAttribute('aria-modal','true');sh.tabIndex=-1}const b=$('#sheet-root .secx');if(b)b.focus({focusVisible:false})}
const SECX='<button type="button" class="secx" data-a="sclose2" aria-label="닫기"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>';
function tagPeople(v){const L=visible().filter(p=>p.memo.includes(v.t)||p.rep.includes(v.t));const isRep=REP_POS.includes(v.t)||REP_NEG.includes(v.t);
 return `<div class="scr"><div class="hd"><button type="button" class="back" data-a="back" aria-label="뒤로가기">${BACK}</button><h1 style="font-size:1.1765rem">${esc(v.t)}</h1></div>${isRep?`<div class="small">내 연락처 ${L.length}명</div>`:''}<div class="card" style="margin-top:10px">${L.map(p=>`<div class="row tap" data-a="open" data-id="${p.id}">${stamp(p.grade)}<div class="grow"><div class="nm">${emo(p)} ${esc(p.name)}</div></div></div>`).join('')||'<div class="empty">아직 없어요</div>'}</div></div>`}

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
function verdict(){let h=`<div class="vd"><div class="vtop"><button type="button" class="vback" data-a="vback" aria-label="뒤로가기">${BACK}</button><h1>내 판정서</h1>${info('verdict')}</div><div class="testbar">테스트용 예시 · 휴대폰 번호 인증은 건너뛰어요</div>`;
 if(!S.accepted)return h+`<h2 style="margin-top:20px">내 판정서 받기</h2><p class="note" style="font-size:0.8824rem;color:var(--ink)">평가가 5명 이상 모이면 익명 종합 결과만 볼 수 있어요. 누가 평가했는지는 알 수 없어요.</p>${S.reopen?'<p class="note">평가자들이 남긴 예전 평가까지 모두 다시 모여요.</p>':''}
  <label class="inp">이 번호를 언제부터 쓰셨나요?<input value="2019년 3월" readonly></label><div class="small" style="margin-top:6px">이 날짜 전에 쌓인 평가는 판정서에 넣지 않아요.</div><div style="height:20px"></div><button class="btn-r" data-a="accept">판정서 받기 시작</button></div>`;
 if(S.verdictN<5)h+=`<div class="vcard" style="margin-top:12px"><p style="line-height:1.6;margin:0 0 14px">판정 대기 중이에요. 등급 평가가 5명 미만이라 아직 보여드릴 수 없어요. 여의도 정육점을 주변에 알려주면 더 빨리 판정돼요!</p><button class="btn-r" data-a="invite">초대 링크 보내기</button><div class="small" style="margin-top:8px">링크에는 내 번호·계정 정보가 담기지 않아요.</div><div class="small" style="margin-top:12px">결과는 매주 토요일 오전 9시에 갱신돼요</div></div>
  <div class="sw" style="margin-top:16px"><div class="grow"><b>판정서 공개</b><span>판정서가 열리면 공개할 수 있어요.</span></div><span class="tog" style="opacity:.4"></span></div>`;
 else h+=`<div style="margin-top:12px">${verdictCert(S.verdictN)}</div><div class="sw" style="margin-top:16px"><div class="grow"><b>판정서 공개</b><span>${S.pub?'내 번호를 아는 앱 사용자에게 보여지고 있어요. 누가 봤는지는 알려드리지 않아요.':'켜면 내 번호를 아는 앱 사용자가 이 판정서를 볼 수 있어요.'}</span></div><button class="tog ${S.pub?'on':''}" data-a="pubtog"></button></div>`;
 return h+`<button class="link-red" data-a="closev">판정서 닫기</button></div>`}
function pubVerdict(v){return `<div class="scr"><div class="hd"><button type="button" class="back" data-a="back" aria-label="뒤로가기">${BACK}</button><h1 style="font-size:1.1765rem">공개된 판정서</h1></div>${verdictBody(7,true)}<p class="note">부정 태그는 공개된 판정서에 보이지 않아요.</p></div>`}

/* 사람 상세 */
function person(v){const p=P(v.id);if(!p){return shelf()}const hold=p.hold;
 const chips=(list,kind)=>`<span class="tlist">${list.length?list.map(t=>{const g=kind==='memo'?memoGroupList().find(x=>x.key===groupOf(t)):null;const st=g&&g.color?` style="--gc:${g.color}"`:'';return `<span class="ptag ${kind}${kind==='rep'&&REP_NEG.includes(t)?' neg':''}"${st}>${esc(t)}</span>`}).join(''):'<span class="blank">아직 없어요</span>'}</span>`;
 let h=`<div class="scr pdetail"><div class="hd phd"><button type="button" class="pback" data-a="back" aria-label="뒤로가기"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M 11 5 L 4 12 L 11 19 M 4 12 H 21" fill="none" stroke="#252525" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="sp"></span></div>
 <div class="ph-head">${!hold&&!S.gintro?'<div class="gintro">캐릭터를 쓰다듬거나,<br>두 번 톡톡 꿀밤을 줘 보세요</div>':''}<div class="gz${hold?' nog':''}" ${hold?'':`data-gid="${p.id}"`}>${!hold&&!S.gintro?'<span class="gh gh-l" aria-hidden="true">👆<br>⟷</span><span class="gh gh-r" aria-hidden="true">((👆</span>':''}<div class="av"><span class="face">${!hold&&p.persona!=null&&organic(p)?`<img class="${fbn('o'+p.persona)}" src="emoji/o${p.persona}.svg" alt="유기농">`:emo(p,'')}<i class="fx"></i></span>${hold||p.grade==null||p.persona==null?'':`<button class="stampbtn" data-a="pgsheet" data-id="${p.id}" aria-label="성격·등급 고르기">${stamp(p.grade,true)}</button>`}</div>${hold?'':`<button class="sr" data-a="gpat" data-id="${p.id}">쓰담쓰담</button><button class="sr" data-a="gkkul" data-id="${p.id}">꿀밤 콩콩</button>`}</div><button class="plabel" data-a="pgsheet" data-id="${p.id}">${hold?'판정 보류':(p.grade==null||p.persona==null)?'아직 판정 없음':PERS[p.persona]+' · '+GR[p.grade][0]+'등급'} ›</button><h1>${esc(p.name)} ${hold&&organic(p)?'<span class="org" data-a="orgtip">유기농</span>':''}</h1><div class="small">${p.phone}</div></div>`;
 if(p.ratedDay!=null&&S.day-p.ratedDay>=90)h+=`<div class="recard"><span class="grow">${hold?'이제 등급을 매겨 볼까요?':'지금도 '+GR[p.grade][0]+'인가요? 다시 평가해 보세요.'}</span><button class="chip sm" data-a="stillok" data-id="${p.id}">${hold?'아직 보류할게요':'지금도 맞아요'}</button></div>`;
 h+=`<div class="three"><button class="bigb red" data-a="call" data-t="전화" data-id="${p.id}">📞 전화걸기</button><button class="bigb" data-a="call" data-t="연락했어요" data-id="${p.id}">✓ 연락했어요</button></div>`;
 h+=`<h2>내 평가</h2><div class="card">`;
 h+=`<div class="kv kvtags" data-a="edit" data-f="memo" data-id="${p.id}"><span class="k">메모 태그<span class="phsub"> · 나만 봐요</span></span><span class="v tchips">${chips(p.memo,'memo')}</span></div>`;
 if(!hold)h+=`<div class="kv kvtags" data-a="edit" data-f="rep" data-id="${p.id}"><span class="k">평판 태그<span class="phsub"> · 익명으로 모여요</span></span><span class="v tchips">${chips(p.rep,'rep')}</span></div><div class="kvsec"><span class="k">다시 맡기기</span><div class="chips">${AGAIN.map(a=>`<button class="chip c32 ${p.again===a?'on':''}" data-a="qset" data-f="again" data-x="${a}" data-id="${p.id}" aria-pressed="${p.again===a}">${a}</button>`).join('')}</div></div><div class="kv" data-a="edit" data-f="priv" data-id="${p.id}"><span class="k">판정서 반영</span><span class="v">${p.priv?'나만 보기':'익명으로 반영'}</span></div>`;
 h+=`</div>`;
 if(!hold){const s=stage(p);const lab=cycLabel(p);h+=`<h2>신선도</h2><div class="card"><div class="kv" data-a="edit" data-f="cycle" data-id="${p.id}"><span class="k">${lab?lab+' 주기 · ':''}마지막 연락 ${lastC(p)!=null?md(lastC(p)):'없음'}</span><span class="pill st-${s.k}">${s.t}</span></div></div>`}
 h+=`<h2>연락 기록</h2><div class="card">${p.contacts.slice().reverse().map(c=>`<div class="kv ro"><span>${md(c.day)} ${c.t}</span></div>`).join('')||'<div class="kv ro"><span class="k">아직 없어요</span></div>'}</div>`;
 if(p.pub)h+=`<button class="btn-g" style="margin-top:14px" data-a="pubv">공개된 판정서 보기 <span class="badge test">테스트용 예시</span></button>`;
 h+=p.hidden?`<button class="btn-g" style="margin-top:14px" data-a="unhide" data-id="${p.id}">다시 보이기</button>`:`<button class="btn-g" style="margin-top:14px" data-a="hide" data-id="${p.id}">냉장고에서 숨기기</button>`;
 h+=`<button class="link-red" data-a="del" data-id="${p.id}">${hold?'이 기록 지우기':'이 평가 지우기'}</button></div>`;
 return h}

/* 평가 쓰기 */
function write(v){const p=P(v.id);const w=ui.w;const hold=w.hold;const ok=hold||(w.grade!=null&&w.persona!=null);
 let h=`<div class="scr nonav"><div class="hd"><button type="button" class="back" data-a="back" aria-label="뒤로가기">${BACK}</button><div style="flex:1"><div style="font-weight:800;font-size:1.1765rem">${esc(p.name)}</div><div class="small">${p.phone}</div>${S.firstWrite?'<div class="small">이름은 이 폰에서만 읽어요</div>':''}</div>${info('write')}</div>
 <h2>한마디로 어떤 사람?<span class="req">필수</span></h2><div class="grid3">${PERS.map((n,i)=>`<button class="tile ${w.persona===i?'on':''}" data-a="w" data-f="persona" data-x="${i}"><img class="${fbn('p'+i)}" src="emoji/p${i}.svg">${n}</button>`).join('')}</div>
 <h2>등급 판정<span class="req">필수</span></h2><div class="grades">${[5,4,3,2,1].map(g=>`<button class="g${g} ${w.grade===g?'on':''}" data-a="w" data-f="grade" data-x="${g}">${stamp(g)}${GR[g][1]}<span class="gcy">${defCycleLine(g)}</span></button>`).join('')}</div>
 <button class="holdbtn ${hold?'on':''}" data-a="w" data-f="hold">아직 판정 보류 · 성격·등급 없이 저장</button>`;
 if(!hold)h+=`<h2>연락 주기</h2><div class="chips">${CYC.map(c=>`<button class="chip c32 ${w.cycle===c[0]?'on':''}" data-a="w" data-f="cycle" data-x="${c[0]}">${c[1]}</button>`).join('')}</div>`;
 h+=memoBox(w.memo)+`<div class="box ${hold?'dim':''}"><div class="boxh">평판 태그<span class="phsub">&nbsp;· 익명으로 모여요</span></div>${hold?'<div class="note wrepnote">성격과 등급을 고르면 평판 태그를 달 수 있어요.</div>':writeRep(w.rep)}</div>`;
 if(!hold)h+=`<h2>다시 거래를 맡기겠다?<span class="opt">선택</span></h2><div class="chips">${AGAIN.map(a=>`<button class="chip c32 ${w.again===a?'on':''}" data-a="w" data-f="again" data-x="${a}">${a}</button>`).join('')}</div><div class="sw"><div class="grow"><b>이 평가는 나만 보기</b><span>끄면 상대가 평가 받기를 시작할 때 익명으로 반영돼요</span></div><button class="tog ${w.priv?'on':''}" data-a="w" data-f="priv"></button></div>`;
 h+=`</div>
 <div class="bar">${ok?'':'<div class="hint">성격·등급을 고르면 저장할 수 있어요</div>'}<button class="btn-r" data-a="wsave" ${ok?'':'disabled'}>저장</button></div>`;
 return h}
function selStyle(g){const pair={'#834AF4':['#E6DBFD','#834AF4'],'#75C895':['#D2E5DA','#207F45'],'#88CBF0':['#D0E3EE','#1575AA'],'#89D16F':['#D7E5D2','#397E20'],'#F4A259':['#EFDECE','#AE580C'],'#3F89F6':['#CEE1FC','#0B67EF']};const c=String(g.color||'').toUpperCase();const p=pair[c];if(p)return `--selfill:${p[0]};--sel:${p[1]}`;return /^#[0-9A-F]{6}$/.test(c)?`--sel:${c}`:'--sel:#1A1A1A'}
function memoBox(sel){return `<div class="box"><div class="boxh">메모 태그<span class="phsub">&nbsp;· 나만 봐요</span></div>${memoGroupList().map(g=>{const birth=g.key==='생년';const ts=birth?presentDecades():tagsIn(g);const shown=birth?sel.filter(isBirthDecade).concat(sel.filter(isBirthYear)):[];const dec=birth?sel.find(isBirthDecade):null;const right=shown.length?`<span style="margin-left:auto;display:inline-flex;gap:6px">${shown.map(t=>`<span class="chip sm on" data-a="memo" data-t="${esc(t)}">${esc(t)}</span>`).join('')}</span>`:'';const years=dec?`<div class="chips">${yearsOfDecade(dec).map(y=>`<button class="chip sm ${sel.includes(y)?'on':''}" data-a="memo" data-t="${y}">${y}</button>`).join('')}</div>`:'';return `<div class="grp" style="${selStyle(g)}"><div class="gn"><span class="gdot" style="background:${g.color}"></span>${esc(g.name)}${right}</div><div class="chips">${ts.map(t=>`<button class="chip sm ${sel.includes(t)?'on':''}" data-a="memo" data-t="${esc(t)}">${esc(t)}</button>`).join('')}${birth&&!missingDecades().length?'':`<button class="chip sm dash" data-a="${birth?'baddopen':'memoadd'}" ${birth?'':`data-g="${esc(g.key)}"`}>+ 추가</button>`}</div>${years}</div>`}).join('')}</div>`}

function notifs(){S.readBell=true;save();const g={};S.notifs.forEach(n=>(g[n.day]=g[n.day]||[]).push(n));
 let h=`<div class="scr"><div class="hd"><button type="button" class="back" data-a="back" aria-label="뒤로가기">${BACK}</button><h1 style="font-size:1.1765rem">알림</h1><span class="sp"></span><button class="chip sm" data-a="readall" ${S.notifs.length?'':'disabled'}>모두 읽음</button><button class="ib" data-a="settings">⚙️</button></div>`;
 if(!S.notifs.length)return h+'<div class="empty">아직 알림이 없어요.</div></div>';
 Object.keys(g).sort((a,b)=>b-a).forEach(d=>{d=+d;h+=`<h2 style="font-size:0.8824rem">${d==S.day?'오늘':d==S.day-1?'어제':mdw(d)}</h2>`+g[d].map((n,i)=>`<div class="ntf row tap" data-a="ntf" data-i="${S.notifs.indexOf(n)}"><span class="d ${n.read?'off':''}"></span><div class="grow"><div class="t">${n.kind} · ${d==S.day?'방금':'오전 9:00'} ${n.test?'<span class="badge test">테스트용 예시</span>':''}</div><div>${esc(n.text)}</div></div></div>`).join('')});
 return h+'</div>'}
function settings(){const hid=S.people.filter(p=>p.hidden);return `<div class="scr"><div class="hd"><button type="button" class="back" data-a="back" aria-label="뒤로가기">${BACK}</button><h1 style="font-size:1.1765rem">설정</h1></div>
 <div class="testbar">테스트용 예시 · 알림 스위치는 실제로 보내지 않아요</div>
 <div class="kv" id="ptrow"><b>포인트</b><span><span id="pts">${S.pts||0}</span>점 · 테스트 값</span></div>
 ${[['아침 장보기 알림','오전 9:00',1],['주간 조회 알림','',1],['월간 조회 권유 알림','',0],['판정서 변화 알림','토요일 갱신 때 내 판정서가 바뀌면 알려드려요.',1],['쓰다듬기 알림','누군가 쓰담쓰담 하면 토요일에 모아서 알려드려요.',1],['이벤트 알림','',0]].map((x,i)=>{const on=(S.sets||{})[i]??x[2];return `<div class="sw srow"><div class="grow"><b>${x[0]}</b><span>${x[1]}</span></div><button class="tog ${on?'on':''}" data-a="settog" data-i="${i}"></button></div>`}).join('')}
 <h2>숨긴 연락처</h2><div class="card">${hid.map(p=>`<div class="row"><div class="grow nm">${esc(p.name)}</div><button class="chip sm" data-a="unhide" data-id="${p.id}">다시 보이기</button></div>`).join('')||'<div class="empty">숨긴 연락처가 없어요.</div>'}</div></div>`}
function addContact(){return `<div class="scr"><div class="hd"><button type="button" class="back" data-a="back" aria-label="뒤로가기">${BACK}</button><h1 style="font-size:1.1765rem">새 연락처</h1></div><div class="testbar">테스트용: 실제 앱은 폰 연락처를 읽어요</div>
 <label class="inp">이름<input id="cn" maxlength="20" value="${esc(ui.q||'')}"></label><label class="inp">번호<input id="cp" inputmode="numeric" placeholder="010-0000-0000" maxlength="13"></label><div style="height:20px"></div><button class="btn-r" data-a="addsave">저장</button></div>`}

/* sheets */
function sheet(html,center){const r=$('#sheet-root');r.innerHTML=`<div class="dim ${center?'center':''}" data-a="sclose">${center?`<div class="dialog">${html}</div>`:`<div class="sheet">${html}</div>`}</div>`}
function closeSheet(){const back=ui.secFocus;ui.sec=null;ui.secFocus=null;const d=$('#sheet-root .dim');if(!d)return;d.classList.add('out');setTimeout(()=>{if(!d.isConnected)return;d.remove();if(nav[nav.length-1]&&nav[nav.length-1].v=='shelf'&&back&&document.contains(back))back.focus()},matchMedia('(prefers-reduced-motion:reduce)').matches?0:200)}
function openSec(k,el){if(k=='fresh'||k=='aging'||k=='spoil'){goFridge(k,el);return}ui.sec=k;ui.secFocus=el&&el.closest?el.closest('button.sec')||el:el;drawSec()}
function drawSec(){const k=ui.sec;if(!k)return;const title={trim:'손질할 고기',nw:'새로 들어온 고기',hold:'판정 보류'}[k];
 const L=k=='trim'?todayList():k=='nw'?newOnes():holdList();let body='';
 if(!L.length)body='<div class="empty">아직 없어요</div>';
 else if(k=='trim')body=L.map(p=>{const s=stage(p);const org=!p.hold&&p.persona!=null&&organic(p);const src=org?'emoji/o'+p.persona+'.svg':'emoji/p'+p.persona+'.svg';
  return `<div class="sline"><button type="button" class="who" data-a="open" data-id="${p.id}"><span class="tav"><img class="${fbn(org?'o'+p.persona:'p'+p.persona)}" src="${src}" alt="">${p.grade==null?'':stamp(p.grade)}</span><span class="grow"><span class="nm"><span class="nmt">${esc(p.name)}</span>${org?'<span class="org">유기농</span>':''}</span><span class="meta"><span class="pill st-${s.k}">${s.t}</span></span></span></button><button type="button" class="rb" data-a="call" data-t="전화" data-id="${p.id}">전화걸기</button><button type="button" class="btn-o" data-a="call" data-t="연락했어요" data-id="${p.id}">연락했어요</button></div>`}).join('');
 else if(k=='nw')body=L.map(p=>`<div class="sline"><button type="button" class="who" data-a="write" data-id="${p.id}"><span class="grow"><span class="meta"><b>NEW</b> · ${S.day==p.addedDay?'오늘':(S.day-p.addedDay)+'일 전'}</span><span class="nm"><span class="nmt">${esc(p.name)}</span></span></span></button><button type="button" class="go" data-a="write" data-id="${p.id}">등급 매기기 →</button></div>`).join('');
 else body=L.map(p=>`<div class="sline"><button type="button" class="who" data-a="write" data-id="${p.id}"><img class="hface" src="emoji/hold.svg" alt=""><span class="grow"><span class="nm"><span class="nmt">${esc(p.name)}</span></span><span class="meta">${md(p.ratedDay)} 판정 보류</span></span></button><button type="button" class="go" data-a="write" data-id="${p.id}">등급 매기기 →</button></div>`).join('');
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
 write:['평가는 이렇게 써요',['이름은 이 폰에서만 읽어요',"아직 판단하기 이르면 '판정 보류'를 골라요. 성격과 등급 없이 저장돼요.",'평판 태그는 같은 태그를 3명 이상 달아야 판정서에 보여요.','성격과 등급만 고르면 저장돼요. 나머지 질문과 태그는 선택이에요.']],
 tags:['태그는 이렇게 써요',['태그를 골라 검색하면 그 태그를 모두 가진 사람을 모아 봐요.','메모 태그를 길게 누르면 이름 바꾸기, 합치기, 옮기기, 지우기를 할 수 있어요. 생년 태그는 지우기만 할 수 있어요.','평판 태그는 같은 태그를 3명 이상 달았을 때만 익명으로 보여요.']],
 verdict:['',['결과는 매주 토요일 오전 9시에 갱신돼요','언제든 판정서를 닫을 수 있어요.']]};
function infoSheet(k){const x=INFO[k];sheet(`${x[0]?`<h3>${x[0]}</h3>`:''}<ul>${x[1].map(l=>`<li>${l}</li>`).join('')}</ul><button class="btn-r" data-a="sclose2">알겠어요</button>`);if(k=='write'){S.firstWrite=false;save()}}
function repChips(sel,act,key){const neg=sel.filter(t=>REP_NEG.includes(t)).length;const btn=(t,n)=>`<button class="chip sm ${n?'neg':''} ${sel.includes(t)?'on':''}" data-a="${act}" data-${key}="${t}" ${n&&!sel.includes(t)&&neg>=3?'disabled style="opacity:.35"':''}>${t}</button>`;return `<div class="chips">${REP_POS.map(t=>btn(t,0)).join('')}</div><div class="small" style="margin:14px 0 6px">부정 태그는 한 사람에게 3개까지</div><div class="chips">${REP_NEG.map(t=>btn(t,1)).join('')}</div>`}
function writeRep(sel){const neg=sel.filter(t=>REP_NEG.includes(t)).length;const btn=(t,n)=>{const on=sel.includes(t),off=n&&!on&&neg>=3;return `<button type="button" class="tpill rep${n?' neg':''}${on?' on':''}" data-a="wrep" data-t="${esc(t)}" ${off?'disabled aria-disabled="true"':''}>${esc(t)}</button>`};return `<div class="chips tpills wrep">${REP_POS.map(t=>btn(t,0)).join('')}</div><div class="small" style="margin:14px 0 6px">부정 태그는 한 사람에게 3개까지</div><div class="chips tpills wrep">${REP_NEG.map(t=>btn(t,1)).join('')}</div>`}
function holdSheet(id){const p=P(id);ui.hs=p.hold?{id,grade:null,persona:null,hold:false}:{id,grade:p.grade,persona:p.persona,hold:false};drawHold()}
function drawHold(){const h=ui.hs,ok=h.hold||(h.grade!=null&&h.persona!=null);sheet(`<div class="hsheet"><h3>성격·등급 고르기</h3><div class="grid3">${PERS.map((n,i)=>`<button class="tile ${h.persona===i?'on':''}" data-a="hsx" data-f="persona" data-x="${i}"><img class="${fbn('p'+i)}" src="emoji/p${i}.svg">${n}</button>`).join('')}</div><div style="height:14px"></div><div class="grades">${[5,4,3,2,1].map(g=>`<button class="g${g} ${h.grade===g?'on':''}" data-a="hsx" data-f="grade" data-x="${g}">${stamp(g)}${GR[g][1]}</button>`).join('')}</div>${ok?'':'<div class="hint">성격·등급을 고르면 저장할 수 있어요</div>'}<div class="hsrow"><button class="holdbtn ${h.hold?'on':''}" data-a="hsx" data-f="hold">판정 보류</button><button class="btn-r" data-a="hssave" ${ok?'':'disabled'}>저장</button></div></div>`)}
function editSheet(id,f){const p=P(id);ui.ed={id,f,val:JSON.parse(JSON.stringify(f=='memo'||f=='rep'?p[f]:p[f]))};drawEdit()}
function drawEdit(){const e=ui.ed,p=P(e.id);let b='';const T={grade:'등급',persona:'성격',again:'다시 맡기기',memo:'메모 태그',rep:'평판 태그',priv:'판정서 반영',cycle:'연락 주기'}[e.f];
 if(e.f=='grade')b=`<div class="grades">${[5,4,3,2,1].map(g=>`<button class="g${g} ${e.val===g?'on':''}" data-a="edx" data-x="${g}">${stamp(g)}${GR[g][1]}</button>`).join('')}</div>`;
 if(e.f=='persona')b=`<div class="grid3">${PERS.map((n,i)=>`<button class="tile ${e.val===i?'on':''}" data-a="edx" data-x="${i}"><img class="${fbn('p'+i)}" src="emoji/p${i}.svg">${n}</button>`).join('')}</div>`;
 if(e.f=='again')b=`<div class="chips">${AGAIN.map(a=>`<button class="chip ${e.val===a?'on':''}" data-a="edx" data-x="${a}">${a}</button>`).join('')}</div>`;
 if(e.f=='cycle')b=`<div class="chips">${CYC.map(c=>`<button class="chip c32 ${e.val===c[0]?'on':''}" data-a="edx" data-x="${c[0]}">${c[1]}</button>`).join('')}</div>`;
 if(e.f=='priv')b=`<div class="sw"><div class="grow"><b>이 평가는 나만 보기</b><span>끄면 상대가 평가 받기를 시작할 때 익명으로 반영돼요</span></div><button class="tog ${e.val?'on':''}" data-a="edx" data-x="t"></button></div>${e.val?'<div class="note">다음 토요일 오전 9시 갱신부터 판정서에서 빠져요. 이미 열린 지난 판정서에는 남을 수 있어요.</div>':''}`;
 if(e.f=='memo')b=memoBox(e.val);
 if(e.f=='rep')b=repChips(e.val,'edx','x');
 sheet(`<h3>${T}</h3>${b}<div style="height:16px"></div><button class="btn-r" data-a="edsave">저장</button>`)}
function confirmDel(id){const p=P(id);sheet(p.hold?`<h3>이 기록을 지울까요?</h3><p>메모와 태그가 지워져요.</p><div class="dbtn"><button data-a="sclose2">취소</button><button class="r" data-a="delok" data-id="${id}">지우기</button></div>`:`<h3>이 평가를 지울까요?</h3><p>지운 평가는 다음 토요일 오전 9시 갱신부터 빠져요. 이미 열린 지난 판정서에는 남을 수 있어요.</p><div class="dbtn"><button data-a="sclose2">취소</button><button class="r" data-a="delok" data-id="${id}">지우기</button></div>`,true)}

function testMenu(){sheet(`<h3>테스트 메뉴</h3><div class="small">지금 날짜: ${mdw(S.day)}</div><div style="display:grid;gap:8px;margin-top:12px">
 <button class="btn-g" data-a="t" data-x="1">하루 넘기기</button><button class="btn-g" data-a="t" data-x="7">7일 넘기기</button><button class="btn-g" data-a="t" data-x="newc">새 연락처 들어오게 하기</button>
 <button class="btn-g" data-a="t" data-x="vn">판정서 예시 인원: ${S.verdictN}명 (바꾸기)</button><button class="btn-g" data-a="t" data-x="seed">예시 데이터 넣기</button><button class="btn-g" data-a="t" data-x="reset" style="color:var(--red)">초기화</button></div>`)}

/* events */
let taps=[];
document.addEventListener('input',e=>{if(e.target.id=='fqs'){ui.fs=e.target.value;const d=document.createElement('div');d.innerHTML=fridge();const n=d.querySelector('#flist'),o=$('#flist');if(n&&o)o.replaceWith(n);return}if(e.target.id=='q'){ui.q=e.target.value;const pos=e.target.selectionStart;render();const q=$('#q');q.focus();q.setSelectionRange(pos,pos);return}if(e.target.id=='tnew'||e.target.id=='tname'||e.target.id=='gnew'){const n=$('#tcnt');if(n)n.textContent=e.target.value.length+'/20'}});
document.addEventListener('click',e=>{if(ui._lp){ui._lp=0;e.preventDefault();e.stopPropagation();return}if(ui.tagMenu&&!e.target.closest('.tmenu,.tfab')){ui.tagMenu=0;render('same')}const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a,id=el.dataset.id;
 if(a=='sclose'&&e.target!==el)return;e.stopPropagation();
 const p=id?P(id):null;
 switch(a){
 case 'tab':if(ui._xslide)break;ui.q='';tab(el.dataset.v);break;
 case 'qset':{const q=P(+id),f=el.dataset.f,x=el.dataset.x;if(f==='rel')break;q[f]=q[f]===x?null:x;save();render('same');break}
 case 'vopen':openVerdict();break;
 case 'vback':closeVerdict();break;
 case 'back':back();break;
 case 'info':infoSheet(el.dataset.k);break;
 case 'sclose':case 'sclose2':{const backEdit=ui.birthAdd==='edit'&&ui.ed;ui.birthAdd=null;closeSheet();if(backEdit)drawEdit();else if(ui.w&&nav[nav.length-1].v=='write')render('same');break}
 case 'secret':taps=taps.filter(t=>Date.now()-t<1500);taps.push(Date.now());if(taps.length>=5){taps=[];testMenu()}break;
 case 'bell':go({v:'notifs'});break;
 case 'settings':go({v:'settings'});break;
 case 'readall':S.notifs.forEach(n=>n.read=true);save();render('same');break;
 case 'ntf':{const n=S.notifs[+el.dataset.i];n.read=true;save();if(['판정서 변화','쓰다듬기'].includes(n.kind))tab('verdict');else tab('shelf');break}
 case 'settog':S.sets=S.sets||{};const i=el.dataset.i;S.sets[i]=!(S.sets[i]??[1,1,0,1,1,0][i]);save();render('same');break;
 case 'unhide':p.hidden=false;save();render('same');toast('냉장고에 다시 보여요.');break;
 case 'sec':openSec(el.dataset.k,el);break;
 case 'open':{const k=ui.sec;closeSheet();if(shelfSec(k))ui.backSec=k;else ui.backSec=null;go({v:'person',id});break}
 case 'write':{const k=ui.sec;closeSheet();if(shelfSec(k))ui.backSec=k;ui.w={grade:null,persona:null,hold:false,cycle:null,again:null,memo:p&&p.hold?(p.memo||[]).slice():[],rep:[],priv:false};go({v:'write',id});break}
 case 'add':go({v:'addContact'});break;
 case 'addsave':{const n=$('#cn').value.trim();if(!n){toast('이름을 넣어 주세요');break}const ph=$('#cp').value.trim()||'010-****-'+String(1000+S.seq*37%9000);
  const np=mk({name:n,phone:ph,isNew:true,addedDay:S.day,ratedDay:null});S.people.push(np);save();ui.q='';ui.fresh=np.id;tab('shelf');toast('새로 들어온 고기에 넣었어요');setTimeout(()=>ui.fresh=null,500);break}
 case 'w':{const w=ui.w,f=el.dataset.f,x=el.dataset.x;
  if(f=='hold'){w.hold=!w.hold;if(w.hold){w._g=w.grade;w._p=w.persona;w.grade=null;w.persona=null}else{w.grade=w._g??null;w.persona=w._p??null}}
  else if(f=='priv')w.priv=!w.priv;
  else if(f=='persona'||f=='grade'){w[f]=+x;if(f=='grade')w.cycle=DEFC[+x];if(w.hold){w.hold=false;if(f=='grade')w.persona=w._p??null;else w.grade=w._g??null}}
  else if(f=='cycle')w.cycle=+x;
  else if(f!=='rel')w[f]=w[f]===x?null:x;render('same');break}
 case 'memo':{const sheetOn=!!$('#sheet-root .sheet');const arr=sheetOn?ui.ed.val:ui.w.memo;const t=el.dataset.t;if(isBirthDecade(t)||isBirthYear(t))toggleBirth(arr,t);else{const i=arr.indexOf(t);if(i>=0)arr.splice(i,1);else arr.push(t)}sheetOn?drawEdit():render('same');break}
 case 'memoadd':{const g=el.dataset.g;const t=prompt("'"+g+"' 태그 (20자까지)");if(t&&t.trim()){const v=t.trim().slice(0,20);S.customTags[g]=S.customTags[g]||[];if(!S.customTags[g].includes(v))S.customTags[g].push(v);const arr=$('#sheet-root .sheet')?ui.ed.val:ui.w.memo;if(!arr.includes(v))arr.push(v);save();$('#sheet-root .sheet')?drawEdit():render('same')}break}
 case 'baddopen':{ui.birthAdd=!!$('#sheet-root .sheet')?'edit':'write';sheet(`<h3>태그 추가</h3><div class="chips">${missingDecades().map(d=>`<button type="button" class="chip sm" data-a="badd" data-t="${esc(d)}">${esc(d)}</button>`).join('')}</div>`);break}
 case 'badd':{const t=el.dataset.t;if(!isBirthDecade(t)||!missingDecades().includes(t))break;addDecade(t);const mode=ui.birthAdd;ui.birthAdd=null;if(mode==='edit'||mode==='write'){const arr=mode==='edit'?ui.ed.val:ui.w.memo;if(arr)toggleBirth(arr,t)}save();if(mode==='edit')drawEdit();else{closeSheet();render('same')}break}
 case 'bdelok':{if(!isBirthDecade(el.dataset.t))break;deleteDecade(el.dataset.t);save();closeSheet();render('same');break}
 case 'wrep':{const t=el.dataset.t,r=ui.w.rep,i=r.indexOf(t);if(i>=0)r.splice(i,1);else if(!(REP_NEG.includes(t)&&r.filter(x=>REP_NEG.includes(x)).length>=3))r.push(t);render('same');break}
 case 'wsave':{const v=nav[nav.length-1],q=P(v.id),w=ui.w;
  Object.assign(q,{hold:w.hold,grade:w.hold?null:w.grade,persona:w.hold?null:w.persona,cycle:w.hold?'auto':w.cycle,again:w.hold?null:w.again,memo:w.memo,rep:w.hold?[]:w.rep,priv:w.hold?false:w.priv,isNew:false,ratedDay:S.day});delete q.rel;
  S.firstWrite=false;save();const direct=shelfSec(ui.backSec)&&nav.length===2&&nav[0].v==='shelf'&&nav[1].v==='write';nav.pop();if(direct){render('back');reopenSec()}else{nav.push({v:'person',id:q.id});render('fade')}toast(w.hold?'판정 보류로 저장했어요':'평가를 저장했어요');break}
 case 'call':{const t=el.dataset.t;const row=document.getElementById('r'+id);const sec=ui.sec;
  const doit=()=>{p.contacts.push({day:S.day,t});const got=t=='전화'&&earnPt(p.id);save();render('same');toast(t=='연락했어요'?'연락을 기록했어요':t+' 기록을 남겼어요'+(got?' · 포인트 +1':''));if(sec){ui.sec=sec;drawSec()}};
  if(row&&nav[nav.length-1].v=='shelf'&&!sec){row.classList.add('out');setTimeout(doit,matchMedia('(prefers-reduced-motion:reduce)').matches?0:280)}else doit();break}
 case 'gpat':doGesture(id,'pat');break;
 case 'gkkul':doGesture(id,'kkul');break;
 case 'orgtip':toast('2주 연속 쓰담쓰담한 사람이에요. 4주 동안 안 하면 떼요.');break;
 case 'stillok':p.ratedDay=S.day;save();render('same');break;
 case 'hide':p.hidden=true;save();back();toast('냉장고에서 숨겼어요');break;
 case 'del':confirmDel(id);break;
 case 'delok':S.people=S.people.filter(x=>x.id!=id);save();closeSheet();ui.backSec=null;nav=[{v:'shelf'}];render('back');toast('지웠어요');break;
 case 'edit':if(el.dataset.f==='cycle'&&p&&p.hold)break;editSheet(id,el.dataset.f);break;
 case 'edx':{const e2=ui.ed,x=el.dataset.x;if(e2.f=='grade'||e2.f=='persona')e2.val=+x;else if(e2.f=='cycle')e2.val=x=='auto'?'auto':+x;else if(e2.f=='priv')e2.val=!e2.val;else if(e2.f=='rep'){const i=e2.val.indexOf(x);if(i>=0)e2.val.splice(i,1);else if(!(REP_NEG.includes(x)&&e2.val.filter(t=>REP_NEG.includes(t)).length>=3))e2.val.push(x)}else e2.val=e2.val===x?null:x;drawEdit();break}
 case 'edsave':{const e2=ui.ed,q=P(e2.id);if(e2.f==='rel'){closeSheet();break}const prevG=q.grade;q[e2.f]=e2.val;if(e2.f==='grade'&&prevG!==e2.val)q.cycle=DEFC[e2.val];if(e2.f=='grade'||e2.f=='persona')q.ratedDay=S.day;save();closeSheet();render('same');toast('저장했어요');break}
 case 'hsx':{const h=ui.hs;if(el.dataset.f=='hold'){h.hold=!h.hold;if(h.hold){h.grade=null;h.persona=null}}else{h[el.dataset.f]=+el.dataset.x;h.hold=false}drawHold();break}
 case 'pgsheet':holdSheet(id);break;
 case 'hssave':{const q=P(ui.hs.id),hs=ui.hs;if(hs.hold){Object.assign(q,{hold:true,grade:null,persona:null,again:null,rep:[],priv:false,cycle:'auto',ratedDay:S.day});delete q.rel}else{const was=q.hold,prev=q.grade;Object.assign(q,{hold:false,grade:hs.grade,persona:hs.persona,ratedDay:S.day});delete q.rel;if(was||prev!==hs.grade)q.cycle=DEFC[hs.grade]}save();closeSheet();render('same');toast(hs.hold?'판정 보류로 저장했어요':'평가를 저장했어요');break}
 case 'tagp':go({v:'tagPeople',t:el.dataset.t});break;
 case 'tsel':{if(ui._lp)break;tagInit();const t=el.dataset.t;if(ui.tagEdit&&el.dataset.k==='memo'){tagEditMenu(t);break}if(ui.tagEdit&&el.dataset.k==='rep')break;const i=ui.tagSel.indexOf(t);if(i>=0){ui.tagSel.splice(i,1);if(isBirthDecade(t))ui.tagSel=ui.tagSel.filter(x=>!isBirthYear(x)||decadeOfYear(x)!==t)}else{ui.tagSel.push(t);ui.tagScroll=1}save();render('same');break}
 case 'tsearch':{if(!tagMatch().length)break;tagRemember();drawTagSheet();break}
 case 'tx':{tagInit();const tx=el.dataset.t;ui.tagSel=ui.tagSel.filter(t=>t!==tx);if(isBirthDecade(tx))ui.tagSel=ui.tagSel.filter(t=>!isBirthYear(t)||decadeOfYear(t)!==tx);if(!ui.tagSel.length){closeSheet();render('same');break}render('same');drawTagSheet();break}
 case 'tclear':{ui.tagSel=[];closeSheet();render('same');break}
 case 'tcall':{p.contacts.push({day:S.day,t:'전화'});const got=earnPt(p.id);save();toast('전화 기록을 남겼어요'+(got?' · 포인트 +1':''));break}
 case 'treclear':S.tagRecent=[];save();render('same');break;
 case 'tmenu':ui.tagMenu=!ui.tagMenu;render('same');break;
 case 'tadd':ui.tagMenu=0;ui.tagNewGroup=(memoGroupList()[0]||{}).key||'';openTagAdd();break;
 case 'tnewg':ui.tagNewGroup=el.dataset.g;openTagAdd();break;
 case 'tnewsave':{const name=($('#tnew').value||'').trim().slice(0,20);const g=ui.tagNewGroup;if(!name||!g||g==='생년'||isRepTag(name)||groupOf(name))break;S.tagGone=S.tagGone.filter(x=>x!==name);S.customTags[g]=S.customTags[g]||[];S.customTags[g].push(name);save();closeSheet();render('same');break}
 case 'tgadd':ui.tagMenu=0;ui.tagColor=TCOLORS[0];secSheetWrap(`<div class="sechead"><div class="sectitle"><h3>그룹 추가</h3>${SECX}</div></div><div class="tform"><label class="inp">그룹 이름<input id="gnew" maxlength="20"></label><div class="small" id="tcnt">0/20</div><div class="tlab">그룹 색 변경</div><div class="tcolors">${TCOLORS.map(c=>`<button type="button" class="tcol ${c===ui.tagColor?'on':''}" style="background:${c}" data-a="tcol" data-c="${c}" aria-label="${c}"></button>`).join('')}</div><button type="button" class="btn-r" data-a="tgsave">저장</button></div>`);break;
 case 'tcol':ui.tagColor=el.dataset.c;document.querySelectorAll('#sheet-root .tcol').forEach(b=>b.classList.toggle('on',b.dataset.c===ui.tagColor));break;
 case 'tgsave':{const name=($('#gnew').value||'').trim().slice(0,20);if(!name||memoGroupList().some(g=>g.name===name||g.key===name))break;S.tagGroups.push({name,color:ui.tagColor||TCOLORS[0]});S.customTags[name]=[];save();closeSheet();render('same');break}
 case 'tedit':ui.tagMenu=0;ui.tagEdit=1;render('same');break;
 case 'teditdone':ui.tagEdit=0;render('same');break;
 case 'trenameg':if(el.dataset.g==='생년')break;tagRenameGroup(el.dataset.g);break;
 case 'trenamegok':{const neu=($('#tname').value||'').trim().slice(0,20),key=ui.renameG;if(!neu||key==='생년'||memoGroupList().some(g=>g.key!==key&&(g.name===neu||g.key===neu)))break;const cg=S.tagGroups.find(x=>x.name===key);
  if(cg){const old=cg.name;cg.name=neu;if(S.customTags[old]){S.customTags[neu]=S.customTags[old];delete S.customTags[old]}Object.keys(S.tagMove).forEach(t=>{if(S.tagMove[t]===old)S.tagMove[t]=neu})}else S.groupName[key]=neu;save();closeSheet();render('same');break}
 case 'tmore':if(el.dataset.g==='생년')openGroupColor(el.dataset.g);else groupHold(el.dataset.g);break;
 case 'trecolor':openGroupColor(el.dataset.g);break;
 case 'trecolorsave':{const g=ui.recolorG;const cg=S.tagGroups.find(x=>x.name===g);if(cg)cg.color=ui.tagColor;else S.groupColor[g]=ui.tagColor;save();closeSheet();render('same');break}
 case 'tdelg':{const g=el.dataset.g;if(g==='생년')break;const nm=(memoGroupList().find(x=>x.key===g)||{}).name||g;sheet(`<h3>'${esc(nm)}' 그룹을 지울까요?</h3><p>이 그룹의 태그가 붙은 사람에게서도 빠져요.</p><div class="dbtn"><button data-a="sclose2">취소</button><button class="r" data-a="tdelgok" data-g="${esc(g)}">지우기</button></div>`,true);break}
 case 'tdelgok':{const g=el.dataset.g;if(g==='생년')break;tagsIn({key:g,base:[]}).concat((GROUPS.find(x=>x[0]===g)||[])[2]||[]).forEach(dropTag);S.tagGroups=S.tagGroups.filter(x=>x.name!==g);delete S.customTags[g];if(!S.groupGone.includes(g))S.groupGone.push(g);save();closeSheet();render('same');break}
 case 'thold':tagHoldMenu(el.dataset.t);break;
 case 'trenamet':if(birthTag(el.dataset.t))break;ui.renameT=el.dataset.t;secSheetWrap(`<div class="sechead"><div class="sectitle"><h3>이름 바꾸기</h3>${SECX}</div></div><div class="tform"><label class="inp">태그 이름 (20자까지)<input id="tname" maxlength="20" value="${esc(el.dataset.t)}"></label><div class="small" id="tcnt">${[...el.dataset.t].length}/20</div><button type="button" class="btn-r" data-a="trenametok">저장</button></div>`);break;
 case 'trenametok':{const neu=($('#tname').value||'').trim().slice(0,20),old=ui.renameT;if(!neu||neu===old||birthTag(old)||isRepTag(neu)||(groupOf(neu)&&neu!==old))break;renameTag(old,neu);save();closeSheet();render('same');break}
 case 'tmerge':if(birthTag(el.dataset.t))break;ui.mergeT=el.dataset.t;secSheetWrap(`<div class="sechead"><div class="sectitle"><h3>다른 태그와 합치기</h3>${SECX}</div></div><div class="seclist">${memoNames().filter(t=>t!==el.dataset.t&&!birthTag(t)).map(t=>`<button type="button" class="srow" data-a="tmergeok" data-t="${esc(t)}">${esc(t)}</button>`).join('')||'<div class="empty">합칠 태그가 없어요</div>'}</div>`);break;
 case 'tmergeok':{if(birthTag(ui.mergeT)||birthTag(el.dataset.t))break;mergeTag(ui.mergeT,el.dataset.t);save();closeSheet();render('same');break}
 case 'tmove':if(birthTag(el.dataset.t))break;ui.moveT=el.dataset.t;secSheetWrap(`<div class="sechead"><div class="sectitle"><h3>다른 그룹으로 옮기기</h3>${SECX}</div></div><div class="seclist">${memoGroupList().filter(g=>g.key!=='생년'&&g.key!==groupOf(el.dataset.t)).map(g=>`<button type="button" class="srow" data-a="tmoveok" data-g="${esc(g.key)}">${esc(g.name)}</button>`).join('')}</div>`);break;
 case 'tmoveok':{const t=ui.moveT,g=el.dataset.g;if(birthTag(t)||g==='생년')break;const og=groupOf(t);if(og&&S.customTags[og])S.customTags[og]=S.customTags[og].filter(x=>x!==t);S.tagMove[t]=g;S.customTags[g]=S.customTags[g]||[];if(!S.customTags[g].includes(t))S.customTags[g].push(t);if(S.tagGone.includes(t))S.tagGone=S.tagGone.filter(x=>x!==t);save();closeSheet();const nm=(memoGroupList().find(x=>x.key===g)||{}).name||g;render('same');toast("'"+nm+"' 그룹으로 옮겼어요.");break}
 case 'tdel':if(birthTag(el.dataset.t))break;sheet(`<h3>'${esc(el.dataset.t)}' 태그를 지울까요?</h3><p>이 태그가 붙은 사람에게서도 빠져요.</p><div class="dbtn"><button data-a="sclose2">취소</button><button class="r" data-a="tdelok" data-t="${esc(el.dataset.t)}">지우기</button></div>`,true);break;
 case 'tdelok':if(birthTag(el.dataset.t))break;dropTag(el.dataset.t);save();closeSheet();render('same');break;
 case 'newmore':ui.newAll=true;render('same');break;
 case 'fall':{ui.ff={st:[],gr:[],tg:[]};render('same');break}
 case 'fq':{ui.ff=ui.ff||{st:[],gr:[],tg:[]};const f=ui.ff,k=el.dataset.k,x=el.dataset.x,i=f[k].indexOf(x);f[k]=i>=0?[]:[x];render('same');break}
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

/* v7 제스처 */
function doGesture(id,k){const p=P(id);if(!p||p.hold)return;const z=document.querySelector('.gz[data-gid="'+id+'"]');
 if(z){z.classList.remove('r-pat','r-kkul');void z.offsetWidth;z.classList.add('r-'+k);clearTimeout(z._t);z._t=setTimeout(()=>z.classList.remove('r-'+k),k=='pat'?1000:900)}
 if(!S.gintro){S.gintro=1;document.querySelectorAll('.gintro,.gh').forEach(x=>x.remove())}
 const t=S.day,arr=k=='pat'?(p.pats=p.pats||[]):(p.kkul=p.kkul||[]);let ok=!arr.includes(t);if(k=='kkul'&&arr.filter(d=>t-d<7&&d<=t).length>=3)ok=false;
 if(ok){arr.push(t);toast(k=='pat'?'쓰담쓰담이 오늘 한 번 기록되었어요':'꿀밤 콩콩이 오늘 한 번 기록되었어요')}save()}
(function(){let st=null,lastTap=0,lastId=null;
 document.addEventListener('pointerdown',e=>{const hold=e.target.closest('.tpill[data-k="memo"], .tgh');if(hold&&!e.target.closest('.tga,.tschip,.t7more')&&!(hold.classList.contains('tpill')&&isBirthYear(hold.dataset.t))){const x0=e.clientX,y0=e.clientY;let kill=false;const timer=setTimeout(()=>{kill=true;ui._lp=1;if(hold.classList.contains('tpill'))tagHoldMenu(hold.dataset.t);else if(hold.dataset.g)groupHold(hold.dataset.g)},550);
  const stop=ev=>{if(ev&&ev.type==='pointermove'&&Math.hypot(ev.clientX-x0,ev.clientY-y0)<8)return;clearTimeout(timer);hold.removeEventListener('pointermove',stop);hold.removeEventListener('pointerup',stop);hold.removeEventListener('pointercancel',stop)};
  hold.addEventListener('pointermove',stop);hold.addEventListener('pointerup',stop);hold.addEventListener('pointercancel',stop)}
 const z=e.target.closest('.gz[data-gid]');if(!z||e.target.closest('.stampbtn,.sr'))return;st={z,id:z.dataset.gid,x0:e.clientX,y0:e.clientY,lx:e.clientX,ly:e.clientY,dx:0,dy:0,vx:null,vy:null,ch:0,tr:0,t0:Date.now(),mode:null,moved:false}},{passive:true});
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
addEventListener('resize',()=>{fitStall();fitFridge()});
addEventListener('orientationchange',()=>{fitStall();fitFridge()});
function maybeLanding(){
 if(window.__landed)return;
 let seen=false;try{seen=sessionStorage.getItem('yjp-landed')==='1'}catch(e){}
 if(seen){window.__landed=1;return}
 if(!$('.stall'))return;
 window.__landed=1;try{sessionStorage.setItem('yjp-landed','1')}catch(e){}
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const land=document.createElement('div');
 land.id='land';land.className='land';land.tabIndex=0;land.setAttribute('role','button');
 land.setAttribute('aria-label','등급으로 관리하는 내 인맥. 탭하면 진열대로 넘어갑니다');
 land.innerHTML='<div class="land-bg"></div><img class="land-awn px" alt="" width="376" height="60" draggable="false" src="art/awning.png" srcset="art/awning.png 1x, art/awning@2x.png 2x, art/awning@3x.png 3x"><i class="land-str"></i><i class="land-str"></i><img class="land-sign px" alt="" width="264" height="76" draggable="false" src="art/sign-land.png"><p class="land-copy">등급으로 관리하는 내 인맥</p>';
 document.body.appendChild(land);
 document.documentElement.classList.add('landing');
 const app=$('#app');if(app)app.setAttribute('aria-hidden','true');
 const awn=land.querySelector('.land-awn'),sg=land.querySelector('.land-sign'),strs=[...land.querySelectorAll('.land-str')],bg=land.querySelector('.land-bg'),copy=land.querySelector('.land-copy');
 const rnd=v=>Math.round(v);
 const geo=()=>{const stall=$('.stall');if(!stall)return null;const sr=stall.getBoundingClientRect();if(!sr.width)return null;const s=sr.width/376;
  const end={x:sr.left+122*s,y:sr.top+63*s,w:132*s,h:38*s};
  const start={x:end.x-66*s,y:end.y+48*s,w:end.w*2,h:end.h*2};
  return {s,start,end,as:{x:sr.left,y:sr.top+33*s,w:sr.width,h:60*s},ae:{x:sr.left,y:sr.top,w:sr.width,h:60*s}}};
 const paint=(o,k)=>{
  const x=o.start.x+(o.end.x-o.start.x)*k,y=o.start.y+(o.end.y-o.start.y)*k,w=o.start.w+(o.end.w-o.start.w)*k,h=o.start.h+(o.end.h-o.start.h)*k;
  sg.style.left=rnd(x)+'px';sg.style.top=rnd(y)+'px';sg.style.width=rnd(w)+'px';sg.style.height=rnd(h)+'px';
  const mul=w/132,len=9*mul,sw=Math.max(1,rnd(2*o.s));
  [18,112].forEach((lx,i)=>{const el=strs[i];el.style.left=rnd(x+lx*mul)+'px';el.style.top=rnd(y-len)+'px';el.style.height=Math.max(1,rnd(len))+'px';el.style.width=sw+'px'});
  awn.style.left=rnd(o.as.x)+'px';awn.style.top=rnd(o.as.y+(o.ae.y-o.as.y)*k)+'px';awn.style.width=rnd(o.as.w)+'px';awn.style.height=rnd(o.as.h)+'px';
  if(k===0)copy.style.top=rnd(o.start.y+o.start.h+28*o.s)+'px'};
 const layout=k=>{const o=geo();if(o)paint(o,reduce?0:k);return o};
 let raf=0,timer=0,running=false,done=false;
 const close=()=>{if(done)return;done=true;cancelAnimationFrame(raf);clearTimeout(timer);removeEventListener('resize',onResize);
  document.documentElement.classList.remove('landing');land.remove();const a=$('#app');if(a)a.removeAttribute('aria-hidden')};
 const frame=k=>{layout(k);if(!reduce){bg.style.opacity=String(1-k);copy.style.opacity=String(Math.max(0,1-k*2.2))}};
 const run=()=>{if(running||done)return;running=true;clearTimeout(timer);
  if(reduce){document.documentElement.classList.remove('landing');land.classList.add('out');timer=setTimeout(close,320);return}
  const t0=performance.now();
  const step=now=>{const k=Math.min(1,(now-t0)/1200);frame(1-Math.pow(1-k,3));if(k<1)raf=requestAnimationFrame(step);else close()};
  raf=requestAnimationFrame(step)};
 const skip=()=>{if(done)return;if(!running){run();return}if(reduce){close();return}cancelAnimationFrame(raf);frame(1);close()};
 function onResize(){if(!running&&!done)layout(0)}
 land.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();skip()});
 land.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();skip()}});
 addEventListener('resize',onResize);
 layout(0);requestAnimationFrame(()=>{if(!running&&!done)layout(0)});
 try{land.focus({preventScroll:true})}catch(e){}
 timer=setTimeout(run,1500)}
const had=localStorage.getItem(KEY);load();if(!had)seed();render('fade');
if(location.hash=='#test')testMenu();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
maybeLanding();
