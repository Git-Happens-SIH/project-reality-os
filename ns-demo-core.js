/* Local demo domain model. No remote persistence or trained AI is implied. */
(function (root) {
  'use strict';
  const KEY = 'ns_demo_v1';
  const tasks = [
    {id:'4.2.1', name:'Pier P7 pile cap', terms:['p7','pile cap','concrete','pour','formwork']},
    {id:'4.2.3', name:'Pier P8 rebar cage', terms:['p8','rebar','cage','reinforcement','steel']},
    {id:'5.1.0', name:'Crane utilisation', terms:['crane','lifting','girder','hoist']},
    {id:'3.4.2', name:'Embankment lift 3', terms:['embankment','compaction','soil','roller','earthwork']},
    {id:'6.1.1', name:'Road surfacing', terms:['asphalt','bitumen','paving','surfacing','tarmac']},
    {id:'3.2.1', name:'Drainage installation', terms:['drain','drainage','culvert','pipe','trench']}
  ];
  function match(text) {
    const normalized = text.toLowerCase().replace(/[^a-z0-9]+/g,' ');
    return tasks.map(t => {
      const evidence = t.terms.filter(term => (' '+normalized+' ').includes(' '+term+' '));
      return {...t, evidence, confidence: evidence.length ? Math.min(96, 48 + evidence.length*12) : 0};
    }).filter(t => t.confidence).sort((a,b)=>b.confidence-a.confidence);
  }
  function fresh() { return {version:1, draft:null, reports:[], queue:[], progress:[], audit:[], active:null}; }
  function load(storage) {
    const raw = storage.getItem(KEY);
    if (!raw) return fresh();
    const s = JSON.parse(raw);
    if(s.version!==1 || !['reports','queue','progress','audit'].every(k=>Array.isArray(s[k]))) throw Error('Demo data is unreadable. Export browser data before resetting.');
    return s;
  }
  function save(storage,s) { storage.setItem(KEY,JSON.stringify(s)); }
  function event(s,action,detail,reportId) { s.audit.push({id:uid(),at:new Date().toISOString(),actor:'Dhairya-jindal (demo)',action,detail,reportId}); }
  function uid() { return root.crypto?.randomUUID?.() || Date.now()+'-'+Math.random().toString(36).slice(2); }
  function submit(s,draft,online) {
    const r = {...draft,id:uid(),status:'pending',matches:[],createdAt:new Date().toISOString()};
    s.reports.push(r); s.active=r.id; s.draft=null;
    event(s,'Report saved',r.body,r.id);
    if(online) sync(s);
    return r;
  }
  function sync(s) {
    for(const r of s.reports.filter(r=>r.status==='pending')) {
      r.matches=match(r.body); r.status='matched'; r.syncedAt=new Date().toISOString();
      event(s,'Demo queue synced','Matched locally on reconnect; no server upload.',r.id);
    }
  }
  function confirm(s,reportId,ids) {
    const r=s.reports.find(r=>r.id===reportId);
    if(!r || r.status!=='matched') throw Error('Report is not ready for confirmation.');
    const chosen=r.matches.filter(m=>ids.includes(m.id));
    if(!chosen.length) throw Error('Select at least one task.');
    for(const m of chosen) s.queue.push({id:r.id+':'+m.id,reportId:r.id,taskId:m.id,name:m.name,confidence:m.confidence,body:r.body,status:'review',conflict:m.id==='5.1.0'});
    r.status='review'; event(s,'Engineer confirmed',chosen.map(m=>m.name).join(', '),r.id);
  }
  function decide(s,id,approved) {
    const q=s.queue.find(q=>q.id===id);
    if(!q || q.status!=='review') return false;
    q.status=approved?'approved':'rejected'; q.decidedAt=new Date().toISOString();
    if(approved) s.progress.push({id:q.id,taskId:q.taskId,reportId:q.reportId,name:q.name,note:q.body,at:q.decidedAt,conflict:q.conflict});
    event(s,approved?'Planner approved — progress written':'Planner rejected',q.name+(q.conflict?' · seeded crane risk remains open':''),q.reportId);
    return true;
  }
  function counts(s) { return {confirmed:18+s.progress.length,review:5+s.queue.filter(q=>q.status==='review').length,risk:2+s.queue.filter(q=>q.conflict&&q.status!=='rejected').length,pending:s.reports.filter(r=>r.status==='pending').length}; }
  const api={KEY,tasks,match,fresh,load,save,submit,sync,confirm,decide,counts};
  if(typeof module!=='undefined') module.exports=api; else root.NSDemo=api;
})(typeof window==='undefined'?globalThis:window);
