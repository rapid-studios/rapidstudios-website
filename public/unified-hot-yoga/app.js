'use strict';
const cfg=window.PITCH_CONFIG;
const key=`rapid-${cfg.slug}-concept-v1`;
const catalog=cfg.kind==='spa'?[
 {id:'massage',name:'Relaxation massage',category:'Massage',duration:60,symbol:'≋',detail:'A sample monthly-benefit treatment. Actual covered services and duration require confirmation.'},
 {id:'facial',name:'A moment for your skin',category:'Facial',duration:60,symbol:'◌',detail:'A fictional facial appointment illustrating benefit-aware selection. This is not the business’s live menu.'},
 {id:'pedicure',name:'A little time to unwind',category:'Pedicure',duration:50,symbol:'⌁',detail:'A fictional pedicure appointment for exploring the member journey.'}
]:cfg.kind==='purify'?[
 {id:'yoga-flow',name:'Evening yoga flow',category:'Yoga',duration:60,symbol:'◒',detail:'A fictional yoga class showing the pass-to-session journey.'},
 {id:'salt-cave',name:'Salt-cave pause',category:'Salt cave',duration:45,symbol:'◈',detail:'A fictional salt-cave appointment using a sample pass allowance. No health outcomes are claimed.'},
 {id:'yoga-calm',name:'A slower yoga hour',category:'Yoga',duration:60,symbol:'◡',detail:'A fictional class for demonstrating a second yoga selection.'}
]:[
 {id:'hot-flow',name:'Hot flow',category:'Hot studio',duration:60,symbol:'H',eligible:true,detail:'Sample class covered by this fictional Hot Studio pass. Bring water, a mat and a towel.'},
 {id:'reformer',name:'Reformer foundations',category:'Reformer',duration:50,symbol:'R',eligible:false,detail:'This fictional Hot Studio pass does not include Reformer. Unified lists some cross-studio add-ons for purchase in person. Check current rules with the studio.'},
 {id:'hot-pilates',name:'Hot Pilates',category:'Hot studio',duration:60,symbol:'P',eligible:true,detail:'Sample Hot Studio class. Choose a session, then use a personal packing checklist.'},
 {id:'jumpboard',name:'Jumpboard',category:'Reformer',duration:50,symbol:'J',eligible:false,detail:'A reformer-format exploration. This sample pass does not include it; no purchase or pass upgrade happens here.'}
];
const locations=['Draper','Holladay','Pleasant Grove','Lehi','South Jordan','St. George'];
const times=['Wed Sep 16 · 5:00 pm','Thu Sep 17 · 10:00 am'];
const initial=()=>({tab:'home',filter:'All',location:'Draper',linked:false,visits:[],checks:[]});
let state=initial(),storageOK=true;
try {const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&typeof saved==='object'&&!Array.isArray(saved)){
 state.tab=['home','visits'].includes(saved.tab)?saved.tab:'home';
 state.filter=['All',...catalog.map(x=>x.category)].includes(saved.filter)?saved.filter:'All';
 state.location=locations.includes(saved.location)?saved.location:'Draper';
 state.linked=saved.linked===true;
 const seenVisits=new Set();
 state.visits=(Array.isArray(saved.visits)?saved.visits:[]).filter(v=>{
  if(!v||typeof v!=='object'||![0,1].includes(v.time)||!locations.includes(v.location)||seenVisits.has(v.id)||(cfg.kind==='purify'&&!state.linked))return false;
  const item=catalog.find(s=>s.id===v.id);if(!item||item.eligible===false)return false;
  seenVisits.add(v.id);return true;
 }).slice(0,cfg.kind==='spa'?1:3).map(v=>({id:v.id,time:v.time,location:v.location}));
 state.checks=[...new Set((Array.isArray(saved.checks)?saved.checks:[]).filter(x=>['mat','towel','water'].includes(x)))];
}}catch{storageOK=false}
const $=s=>document.querySelector(s);
const app=$('#app-content'),dialog=$('#detail'),detail=$('#detail-content');
let selected=null,slot=0,toastTimer;
function notice(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
function persist(){try{localStorage.setItem(key,JSON.stringify(state));storageOK=true}catch{storageOK=false;notice('Storage is unavailable. Choices last only in this open tab.')}}
function badge(item){if(state.visits.some(v=>v.id===item.id))return 'Saved sample visit';if(cfg.kind==='unified')return item.eligible?'Fits sample Hot Studio pass':'Different entitlement needed';if(cfg.kind==='purify')return item.category==='Yoga'?'Sample yoga allowance':'Sample salt-cave allowance';return 'Sample benefit choice'}
function hero(){if(cfg.kind==='spa')return `<p class="greeting">YOUR NEXT MOMENT OF CALM</p><h2>A little time,<br>just for you.</h2><section class="member-card"><span class="card-label">September · sample membership</span><div class="big">${state.visits.length?'Planned.':'One moment.'}</div><p>${state.visits.length?'Your sample benefit is held for your visit.':'Your sample monthly benefit is available.'}</p><div class="foot"><span>${state.visits.length?'0 AVAILABLE · 1 HELD':'1 AVAILABLE BENEFIT'}</span><span>DEMO MEMBER · ALEX</span></div></section>`;
 if(cfg.kind==='purify')return `<p class="greeting">MAKE SPACE IN YOUR WEEK</p><h2>Your pass.<br>Your next pause.</h2><section class="member-card"><span class="card-label">Salty Pass · fictional profile</span><div class="pass-grid"><div><strong>∞</strong><small>Sample yoga access</small></div><div><strong>${2-state.visits.filter(v=>v.id==='salt-cave').length}</strong><small>Sample salt visits left</small></div></div><div class="foot"><span>ALLOWANCES ARE FICTIONAL</span><span>SEPTEMBER</span></div></section>${!state.linked?'<div class="link-state"><strong>Let’s connect your pass.</strong><br>Explore the account-link recovery state.<br><button data-action="link">View sample linking step →</button></div>':'<p class="mini-note">✓ Sample accounts linked in this browser only.</p>'}`;
 return `<p class="greeting">FIND YOUR NEXT SESSION</p><h2>Two studios.<br>Your kind of class.</h2><section class="member-card"><span class="card-label">Fictional member · Alex</span><div class="big">HOT STUDIO</div><p>Your sample pass includes hot-studio classes.</p><div class="foot"><span>HOT YOGA + HOT PILATES</span><span>DEMO PASS</span></div></section>`;
}
function render(){
 $('#visit-count').textContent=state.visits.length;
 document.querySelectorAll('[data-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.tab===state.tab);b.setAttribute('aria-current',b.dataset.tab===state.tab?'page':'false')});
 if(state.tab==='visits'){renderVisits();return}
 const choices=['All',...new Set(catalog.map(x=>x.category))];
 const visible=catalog.filter(x=>state.filter==='All'||x.category===state.filter);
 app.innerHTML=hero()+(cfg.kind==='spa'?`<label class="field-label" for="location">YOUR PREFERRED LOCATION</label><select class="location" id="location">${locations.map(l=>`<option${l===state.location?' selected':''}>${l}</option>`).join('')}</select>`:'')+
 `<div class="section-heading"><h3>${cfg.kind==='spa'?'Choose your moment':cfg.kind==='purify'?'Plan a visit':'Explore classes'}</h3><small>SAMPLE SESSIONS</small></div><div class="filters" aria-label="Filter activities">${choices.map(c=>`<button class="filter ${c===state.filter?'active':''}" data-filter="${c}" aria-pressed="${c===state.filter}">${c}</button>`).join('')}</div>`+
 visible.map(item=>`<button class="service-card" data-open="${item.id}"><span class="service-icon" aria-hidden="true">${item.symbol}</span><span class="service-info"><strong>${item.name}</strong><span class="meta">${item.category} · ${item.duration} min · sample</span><span class="badge ${item.eligible===false?'locked':''}">${badge(item)}</span></span><span class="chevron" aria-hidden="true">›</span></button>`).join('')+
 `<p class="mini-note">${cfg.kind==='unified'?'Hot studio and reformer access are shown as a fictional example. No entitlement is purchased or validated here.':'All benefits, session names, times and availability are fictional. No real booking occurs.'}${storageOK?'':' Browser storage is unavailable.'}</p>`;
}
function renderVisits(){app.innerHTML=`<p class="greeting">YOUR SAVED PLAN</p><h2>Room in the week.</h2>`+(state.visits.length?state.visits.map(v=>{const s=catalog.find(x=>x.id===v.id);return `<article class="visit"><span class="tiny">SAMPLE RESERVATION · NOT A REAL BOOKING</span><h3>${s.name}</h3><p>${times[v.time]}<br>${cfg.kind==='spa'?v.location:cfg.kind==='purify'?'Purify · sample visit':'Unified · sample class'} · ${s.duration} min</p><div class="visit-actions"><button class="secondary" data-calendar="${v.id}">Save demo calendar</button><button class="secondary" data-cancel="${v.id}">Cancel sample</button></div>${cfg.kind==='unified'?`<div class="prep"><strong class="tiny">YOUR PREPARATION LIST</strong>${[['mat','Mat'],['towel','Towel'],['water','Water']].map(([id,label])=>`<label><input type="checkbox" data-check="${id}" ${state.checks.includes(id)?'checked':''}>${label}</label>`).join('')}</div>`:''}</article>`}).join(''):`<div class="empty"><span class="empty-icon" aria-hidden="true">◌</span><strong>Your next visit starts here.</strong><p>Choose a sample session to see your plan take shape.</p><button class="primary" data-action="browse">Explore sample sessions</button></div>`)+`<p class="mini-note">Saved locally on this browser. Calendar downloads are labeled DEMO and do not reserve a service.</p>`}
function showLink(){detail.innerHTML='<div class="detail-symbol" aria-hidden="true">↔</div><p class="eyebrow">ACCOUNT RECOVERY · SIMULATION</p><h2>Bring your pass into view.</h2><p>Purify’s official help page explains linking the Mindbody app with the Purify account. In production, the supported identity flow must be verified.</p><p class="demo-warning">This demo does not ask for credentials. The button only changes a fictional local state.</p><button class="primary" data-action="linked">Simulate linked accounts</button>';if(!dialog.open)dialog.showModal()}
function openItem(id){selected=catalog.find(x=>x.id===id);if(!selected)return;slot=0;renderDetail();dialog.showModal()}
function renderDetail(){const item=selected;const booked=state.visits.some(v=>v.id===item.id);const unavailable=cfg.kind==='spa'&&state.visits.length>0&&!booked;detail.innerHTML=`<div class="detail-symbol" aria-hidden="true">${item.symbol}</div><p class="eyebrow">${item.category} · SAMPLE SESSION</p><h2>${item.name}</h2><p>${item.detail}</p>`;
 if(item.eligible===false){detail.innerHTML+='<p class="demo-warning">Different entitlement needed. Your fictional Hot Studio pass does not cover this class. Some cross-studio add-ons are purchased in person; exact current eligibility needs confirmation.</p><button class="primary" data-action="eligible">See hot-studio choices</button>';return}
 if(booked){detail.innerHTML+='<p class="demo-warning">This sample session is already in your plan.</p><button class="primary" data-action="visits">View my sample visits</button>';return}
 if(unavailable){detail.innerHTML+='<p class="demo-warning">Your sample monthly benefit is already held for another visit. Cancel that sample visit before exploring a different choice.</p><button class="primary" data-action="visits">Review saved visit</button>';return}
 if(cfg.kind==='purify'&&!state.linked){detail.innerHTML+='<p class="demo-warning">Your fictional accounts need linking before this demo continues. No production credentials are used.</p><button class="primary" data-action="link">Explore account-link recovery</button>';return}
 detail.innerHTML+=`<p class="field-label">CHOOSE A FICTIONAL TIME</p><div class="time-grid">${times.map((t,i)=>`<button class="time ${i===slot?'active':''}" data-time="${i}" aria-pressed="${i===slot}">${t}</button>`).join('')}</div><p class="demo-warning">No live availability, payment or booking connection. “Confirm” saves only this sample plan in your browser.</p><button class="primary" data-action="reserve">Confirm sample reservation</button>`;
}
function navigate(tab){state.tab=tab;persist();render();if(dialog.open)dialog.close()}
document.addEventListener('click',e=>{
 const button=e.target.closest('button');if(!button)return;
 if(button.dataset.tab){navigate(button.dataset.tab);return}
 if(button.dataset.filter){state.filter=button.dataset.filter;persist();render();return}
 if(button.dataset.open){openItem(button.dataset.open);return}
 if(button.dataset.time!==undefined){slot=Number(button.dataset.time);renderDetail();return}
 if(button.dataset.cancel){state.visits=state.visits.filter(v=>v.id!==button.dataset.cancel);persist();render();notice('Sample visit canceled. No business was contacted.');return}
 if(button.dataset.calendar){downloadCalendar(button.dataset.calendar);return}
 const action=button.dataset.action;
 if(action==='browse'){navigate('home')}
 if(action==='link'){showLink()}
 if(action==='linked'){state.linked=true;persist();dialog.close();render();notice('Fictional accounts linked for this demo only.')}
 if(action==='visits'){navigate('visits')}
 if(action==='eligible'){state.filter='Hot studio';navigate('home')}
 if(action==='reserve'){
  if(!selected||selected.eligible===false||(cfg.kind==='purify'&&!state.linked)||state.visits.some(v=>v.id===selected.id)||(cfg.kind==='spa'&&state.visits.length)){notice('This sample choice is unavailable.');return}
  state.visits.push({id:selected.id,time:slot,location:state.location});navigate('visits');notice('Sample visit saved locally. No real booking occurred.')
 }
 if(action==='reset-confirm'){state=initial();try{localStorage.removeItem(key)}catch{}persist();dialog.close();render();notice('Sample data reset.')}
});
document.addEventListener('change',e=>{if(e.target.id==='location'){state.location=e.target.value;persist()}if(e.target.dataset.check){const id=e.target.dataset.check;state.checks=e.target.checked?[...new Set([...state.checks,id])]:state.checks.filter(x=>x!==id);persist()}});
$('#reset').addEventListener('click',()=>{detail.innerHTML='<p class="eyebrow">START AGAIN</p><h2>Reset this concept?</h2><p>This clears only this concept’s sample visits, choices and checklist on this browser.</p><button class="primary" data-action="reset-confirm">Reset sample data</button>';dialog.showModal()});
function downloadCalendar(id){const visit=state.visits.find(v=>v.id===id),item=catalog.find(x=>x.id===id);if(!visit||!item)return;
 const start=new Date(visit.time===0?'2026-09-16T23:00:00Z':'2026-09-17T16:00:00Z');const end=new Date(start.getTime()+item.duration*60000);const format=d=>d.toISOString().replace(/[-:]/g,'').replace('.000','');
 const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Rapid Studios//Independent Demo//EN','BEGIN:VEVENT',`UID:${cfg.slug}-${id}-${visit.time}@demo.rapidstudios.local`,`DTSTAMP:${format(new Date())}`,`DTSTART:${format(start)}`,`DTEND:${format(end)}`,`SUMMARY:DEMO - ${item.name}`,`DESCRIPTION:Fictional ${cfg.name} concept. This is NOT a real appointment.`,`LOCATION:Sample location - no reservation`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
 const url=URL.createObjectURL(new Blob([ics],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`${cfg.slug}-DEMO-${id}.ics`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notice('Demo calendar file downloaded. It is not a real booking.')
}
render();
