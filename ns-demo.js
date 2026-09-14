/* Shared UI for the SIH local-only demo. User text is always escaped. */
(()=>{
'use strict';
const D=window.NSDemo, $=s=>document.querySelector(s), page=location.pathname.split('/').pop().replace('nirmaan-setu-','').replace('.html','');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=p=>'nirmaan-setu-'+p+'.html';
let s;
const app=$('.app'); if(!app)return;
const bar=document.createElement('div'); bar.className='demo-toolbar';
bar.innerHTML='<span id="demo-status" role="status" aria-live="polite"></span><button class="btn btn-secondary btn-sm" id="reset-demo">Reset demo</button><p class="caption">Local demo · sync processes this browser’s queue, not a server · keyword matcher, not a trained AI model.</p><p id="demo-message" role="status" aria-live="polite"></p>';
$('.app-bar').after(bar);
function message(text){$('#demo-message').textContent=text;}
try{s=D.load(localStorage);}catch(e){message(e.message);return;}
function mutate(fn){try{const next=D.load(localStorage);fn(next);D.save(localStorage,next);s=next;badge();return true;}catch(e){message('Not saved: '+e.message+' Your input has been kept.');return false;}}
function badge(){const n=D.counts(s).pending;$('#demo-status').textContent=(navigator.onLine?'Online':'Offline')+' · '+n+' pending sync';}
$('#reset-demo').onclick=()=>{if(mutate(next=>Object.assign(next,D.fresh()))){localStorage.removeItem('ns_draft_report');localStorage.removeItem('ns_last_report');location.href=url('site-report');}};
function reconnect(){if(navigator.onLine&&D.counts(s).pending){if(mutate(D.sync)){message('Pending reports processed by the local demo matcher.');render();}}badge();}
window.addEventListener('online',reconnect);window.addEventListener('offline',badge);
window.addEventListener('storage',e=>{if(e.key===D.KEY){try{s=D.load(localStorage);badge();if(page!=='site-report')render();}catch(err){message(err.message);}}});
const link=(p,label)=>`<a class="btn btn-secondary btn-sm" href="${url(p)}">${label}</a>`;
const card=(title,body)=>`<article class="card card-white"><h3>${esc(title)}</h3>${body}</article>`;
function stats(){const c=D.counts(s);return `<div class="stat-grid" aria-live="polite">${[['confirmed','Confirmed'],['review','Review Needed'],['risk','Possible Risk']].map(([k,l])=>`<div class="stat-tile ${k}"><div class="stat-num">${c[k]}</div><div class="stat-label">${l}</div></div>`).join('')}</div><p class="caption">Seed baseline: 18 confirmed / 5 review / 2 risks. New approvals add progress entries.</p>`;}
// Query parameters belong after the .html extension.
function conflictLink(q){return `<a class="btn btn-secondary btn-sm" href="${url('delay-conflict')}?item=${encodeURIComponent(q.id)}">View crane conflict</a>`;}
let main;
if(page!=='site-report'&&page!=='settings'){
 main=document.createElement('main');
 for(const child of [...app.children])if(!child.matches('.app-bar,.demo-toolbar'))child.remove();
 app.append(main);
}
function render(){
 badge();if(!main)return;
 const r=s.reports.find(r=>r.id===s.active);
 if(page==='ai-processing'||page==='match-confirmation'){
  main.innerHTML=`<div class="page-head"><p class="label">MINI MATCHER</p><h1>Match your field note</h1><p>Task confidence is an explainable keyword score, not a calibrated probability.</p></div>`;
  if(!r){main.innerHTML+=card('No report yet',link('site-report','Write a report'));return;}
  main.innerHTML+=card('Your report',`<p>${esc(r.date)} · ${esc(r.location)} · ${esc(r.shift)}</p><p style="white-space:pre-wrap">${esc(r.body)}</p><span class="badge">${esc(r.status==='pending'?'Saved on device · pending sync':r.status)}</span>`);
  if(r.status==='pending'){main.innerHTML+=card('Waiting for connection','<p>Keep the page open and reconnect. Your report survives reloads.</p>');return;}
  if(r.status!=='matched'){main.innerHTML+=link('planner-review','Open planner queue');return;}
  main.innerHTML+=r.matches.length?r.matches.map(m=>card(`WBS ${m.id} — ${m.name}`,`<p><strong>Confidence ${m.confidence}%</strong></p><div class="confidence-bar"><div class="confidence-fill" style="width:${m.confidence}%"></div></div><p>Matched words: ${esc(m.evidence.join(', '))}</p><label><input type="checkbox" value="${m.id}" class="task-choice"> Confirm this task</label>`)).join(''):card('No confident task match','<p>Use specific work terms, for example drainage, compaction, rebar, crane or concrete. Unrelated text is not forced onto a task.</p>');
  main.innerHTML+=`<div class="btn-row">${link('site-report','Edit / new report')}<button class="btn btn-primary" id="confirm-tasks" ${r.matches.length?'':'disabled'}>Send confirmed tasks to planner</button></div>`;
  $('#confirm-tasks').onclick=()=>{const ids=[...document.querySelectorAll('.task-choice:checked')].map(e=>e.value);if(mutate(n=>D.confirm(n,r.id,ids)))location.href=url('planner-review');};
 }else if(page==='planner-review'){
  main.innerHTML='<div class="page-head"><h1>Planner review</h1><p>Approval records the reported progress, not automatic task completion.</p></div>'+stats();
  const queue=s.queue.filter(q=>q.status==='review');
  main.innerHTML+=queue.length?queue.map(q=>card(`WBS ${q.taskId} — ${q.name}`,`<p>${esc(q.body)}</p><p>Confidence ${q.confidence}%</p>${q.conflict?'<div class="banner banner-delay">Seeded crane / Package C booking conflict. Approval retains the risk flag.</div>'+conflictLink(q):''}<div class="btn-row"><button class="btn btn-primary" data-approve="${q.id}">Approve${q.conflict?' with flag':''}</button><button class="btn btn-danger" data-reject="${q.id}">Reject</button></div>`)).join(''):card('Queue is clear',link('site-report','Write a report'));
  main.innerHTML+=link('dashboard','Live dashboard')+' '+link('history','Audit trail');decisions();
 }else if(page==='dashboard'||page==='sync'){
  main.innerHTML='<div class="page-head"><h1>Live project dashboard</h1><p>Approved progress in this browser. Open this screen in a second tab to see counts update during approval.</p></div>'+stats()+`<div class="btn-row">${link('site-report','New report')}${link('planner-review','Review queue')}${link('history','Audit trail')}</div>`;
  main.innerHTML+=s.progress.slice().reverse().map(p=>card(p.name,`<p>Progress recorded · ${esc(new Date(p.at).toLocaleString())}</p><p>${esc(p.note)}</p>${p.conflict?'<span class="badge badge-risk">Crane risk remains open</span>':''}`)).join('')||card('Ready for your first approval','<p>Approve a matched report to see Confirmed move from 18 to 19.</p>');
 }else if(page==='history'){
  main.innerHTML='<div class="page-head"><h1>Audit trail</h1><p>Local demo activity · newest first · not a tamper-proof production log.</p></div><input class="input" id="audit-search" placeholder="Search activity, task or report" aria-label="Search audit trail"><div id="audit-list"></div>';
  const draw=()=>{$('#audit-list').innerHTML=s.audit.slice().reverse().filter(a=>(a.action+' '+a.detail).toLowerCase().includes($('#audit-search').value.toLowerCase())).map(a=>card(a.action,`<p>${esc(a.detail)}</p><p class="caption">${esc(a.actor)} · ${esc(new Date(a.at).toLocaleString())}<br>Report ${esc(a.reportId)}</p>`)).join('')||'<p>No matching activity yet.</p>';};$('#audit-search').oninput=draw;draw();
 }else if(page==='delay-conflict'){
  const id=new URLSearchParams(location.search).get('item');const q=s.queue.find(q=>q.id===id&&q.conflict)||s.queue.find(q=>q.conflict&&q.status==='review');
  main.innerHTML='<div class="page-head"><h1>Crane / Package C conflict</h1></div>';
  if(!q){main.innerHTML+=card('No active crane report',link('planner-review','Back to queue'));return;}
  main.innerHTML+=card('Seeded booking fixture',`<p>Package C reserves tower crane 14:00–18:00 for a girder lift at Ch. 15+100. Availability must be checked by the planner; this is not a live booking integration.</p><p>Your note: ${esc(q.body)}</p><p>Status: ${esc(q.status)}</p>${q.status==='review'?`<button class="btn btn-primary" data-approve="${q.id}">Approve with flag</button> <button class="btn btn-danger" data-reject="${q.id}">Reject</button>`:''}`)+link('planner-review','Back to queue');decisions();
 }
}
function decisions(){document.querySelectorAll('[data-approve],[data-reject]').forEach(b=>b.onclick=()=>{const approved=b.hasAttribute('data-approve');if(mutate(n=>D.decide(n,b.getAttribute(approved?'data-approve':'data-reject'),approved))){render();message(approved?'Approved: progress and audit entry saved. Confirmed count is now '+D.counts(s).confirmed+'.':'Rejected. Schedule unchanged.');}});}
if(page==='site-report'){
 const fields=['report-date','location','shift','body'];const date=new Date();date.setMinutes(date.getMinutes()-date.getTimezoneOffset());$('#report-date').value=date.toISOString().slice(0,10);
 const draft=s.draft;if(draft){fields.forEach((id,i)=>$('#'+id).value=draft[['date','location','shift','body'][i]]||'');message('Saved draft restored from this device.');}
 function payload(){return {date:$('#report-date').value,location:$('#location').value,shift:$('#shift').value,body:$('#body').value,savedAt:new Date().toISOString()};}
 function save(){if(mutate(n=>{n.draft=payload();})){$('#save-local').textContent='Saved on device';message('Draft saved at '+new Date().toLocaleTimeString());}}
 $('#save-local').onclick=save;
 fields.forEach(id=>$('#'+id).addEventListener('input',()=>{$('#save-local').textContent='Save locally';message('Unsaved changes — choose Save locally to keep this draft.');}));
 $('#report-form').onsubmit=e=>{e.preventDefault();if(!$('#report-form').reportValidity())return;if(mutate(n=>D.submit(n,payload(),navigator.onLine)))location.href=url('match-confirmation');};
 // Do not imply that placeholder photos are attachments. Text-only demo storage.
 $('#photos').disabled=true;$('.upload-zone .caption').textContent='Photo persistence is not included in this text-report demo.';$('#photo-grid').hidden=true;
 const preview=document.createElement('div');preview.className='card';preview.innerHTML='<h3>Live task preview</h3><p class="caption">Explainable keyword matcher · scores change with your words.</p><div id="live-matches"></div>';$('#body').closest('.card').after(preview);
 function live(){$('#live-matches').innerHTML=D.match($('#body').value).map(m=>`<p>${esc(m.name)} — <strong>${m.confidence}%</strong> <span class="caption">(${esc(m.evidence.join(', '))})</span></p>`).join('')||'<p>No task match yet.</p>';}
 $('#body').addEventListener('input',live);live();
 const offline=()=>{$('#offline-banner').hidden=navigator.onLine;};window.addEventListener('online',offline);window.addEventListener('offline',offline);offline();
}
reconnect();render();
if('serviceWorker' in navigator)navigator.serviceWorker.register('ns-sw.js').catch(()=>message('Offline page cache unavailable; keep this page open to save reports.'));
})();
