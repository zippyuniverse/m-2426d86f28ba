(function(){
const I={
shelf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M3.5 12h17"/><rect x="6.5" y="7" width="4" height="5" rx=".8"/><rect x="12.5" y="8.5" width="5" height="3.5" rx=".8"/><rect x="7" y="15" width="6" height="5.5" rx=".8"/></svg>',
fridge:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.8" width="12" height="18.4" rx="2.4"/><path d="M6 9.5h12"/><path d="M9 5.6v1.6M9 12.3v3"/></svg>',
tags:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.8 12.6V4.8a1 1 0 0 1 1-1h7.8l7.6 7.6a1.4 1.4 0 0 1 0 2l-6.8 6.8a1.4 1.4 0 0 1-2 0z"/><circle cx="8.3" cy="8.3" r="1.4"/></svg>',
bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.8h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/></svg>',
q:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/></svg>'};
function ap(){document.querySelectorAll('b[data-ic]').forEach(b=>{if(b.dataset.done)return;b.dataset.done=1;b.innerHTML=I[b.dataset.ic]||''});
 document.querySelectorAll('.bic').forEach(s=>{if(s.dataset.done)return;s.dataset.done=1;s.innerHTML=I.bell});
 document.querySelectorAll('.sic').forEach(s=>{if(s.dataset.done)return;s.dataset.done=1;s.innerHTML=I.q})}
new MutationObserver(ap).observe(document.body,{childList:true,subtree:true});ap();
})();
