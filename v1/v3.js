/* ============================================================
   Akashic EIS v3 — cross-cutting enhancement layer
   Loads AFTER shell.js. Adds, without touching the shell:
     • Real ⌘K search over AKData            (G17)
     • Collaboration drawer: threads/@/RACI    (G9)
     • Briefing & digest engine + board-pack   (G7)
     • Benchmark / outside-in chip helper       (G16)
     • Personalization store (dismiss/snooze)   (G17)
     • Scope ("my portfolio") helper            (G8)
   ============================================================ */
(function () {
  const D = window.AKData;
  const P = () => (window.AK && AK.getPersona ? AK.getPersona() : 'ceo');

  /* ---------- Personalization store (G17) ---------- */
  function pkey(){ return 'ak_personal_' + P(); }
  function getPersonal(){ try { return JSON.parse(localStorage.getItem(pkey())||'{}'); } catch { return {}; } }
  function setPersonal(o){ try { localStorage.setItem(pkey(), JSON.stringify(o)); } catch {} }
  function markSignal(id, state){ const p=getPersonal(); p[id]={state, at:Date.now()}; setPersonal(p); }
  function signalState(id){ const p=getPersonal(); return p[id]?p[id].state:null; }

  /* ---------- Scope (G8) ---------- */
  function getScope(){ try { return localStorage.getItem('ak_scope')||'all'; } catch { return 'all'; } }
  function setScope(s){ try { localStorage.setItem('ak_scope', s); } catch {} location.reload(); }

  /* ---------- Benchmark chip (G16) ---------- */
  function benchChip(key){
    const b = D && D.benchmarks[key]; if (!b) return '';
    const firmBetter = b.better==='high' ? b.firm>=b.median : b.firm<=b.median;
    const cls = firmBetter ? 'over' : 'under';
    const verb = b.better==='high' ? (b.firm>=b.median?'above':'below') : (b.firm<=b.median?'below':'above');
    return `<span class="bench-chip ${cls}" title="Industry median ${b.median}${b.unit} · top-quartile ${b.top}${b.unit}">
      peer median ${b.median}${b.unit} · you're ${verb}</span>`;
  }
  function benchBar(key){
    const b = D && D.benchmarks[key]; if (!b) return '';
    const lo = Math.min(b.firm,b.median,b.top), hi=Math.max(b.firm,b.median,b.top), rng=(hi-lo)||1;
    const pos = v => ((v-lo)/rng*100);
    const firmBetter = b.better==='high' ? b.firm>=b.median : b.firm<=b.median;
    return `<div class="bench-bar">
      <div class="bench-track"></div>
      <div class="bench-mark median" style="left:${pos(b.median)}%" title="Industry median"></div>
      <div class="bench-mark top" style="left:${pos(b.top)}%" title="Top quartile"></div>
      <div class="bench-mark firm ${firmBetter?'good':'bad'}" style="left:${pos(b.firm)}%" title="Akashic"><span>${b.firm}${b.unit}</span></div>
    </div>`;
  }

  /* ============================================================
     REAL ⌘K SEARCH (G17) — search the live data model
     ============================================================ */
  function buildSearchIndex(){
    const idx = [];
    (D.clients||[]).forEach(c=>idx.push({type:'client', label:c.name, hint:`₹${c.arr} Cr · ${c.industry} · ${c.stage}`, href:'ClientProfile.html', kw:(c.industry+c.geo+c.owner+c.stage)}));
    (D.projects||[]).forEach(p=>idx.push({type:'project', label:p.name, hint:`${p.practice} · margin ${p.margin}% · ${p.status}`, href:'Projects.html', kw:(p.practice+p.status)}));
    (D.employees||[]).forEach(e=>idx.push({type:'employee', label:e.name, hint:`${e.role} · ${e.risk}% exit risk`, href:'EmployeeProfile.html', kw:(e.role+e.practice+e.level)}));
    (D.pursuits||[]).forEach(p=>idx.push({type:'pursuit', label:p.name, hint:`₹${p.value} Cr · ${p.prob}% · ${p.stage}`, href:'Pipeline.html', kw:(p.type+p.stage+p.owner)}));
    (D.skills||[]).forEach(s=>idx.push({type:'skill', label:s.skill, hint:`supply ${s.supply} · 90d demand ${s.demand90}`, href:'Skills.html', kw:s.practice}));
    const nav=[['Home','Intelligence Feed','Home.html'],['Horizon','Forward obligations','Horizon.html'],['My Decisions','Decision journal','Decisions.html'],['Ask Akashic','AI assistant','Assistant.html'],['Approvals','Pending actions','Approvals.html'],['Pipeline','Pursuits','Pipeline.html'],['Skills','Capability','Skills.html'],['Integration Health','Sync exceptions','IntegrationHealth.html'],['Settings & Admin','Control plane','Settings.html'],['Financials','CFO view','Financials.html'],['Documents','Validation queue','Documents.html']];
    nav.forEach(n=>idx.push({type:'nav', label:n[0], hint:n[1], href:n[2], kw:n[1]}));
    const acts=[['RAISE_INVOICE','Raise milestone invoice','Billing → Tally'],['RAISE_RENEWAL_SOW','Create renewal SOW','CRM → Salesforce'],['REFORECAST','Re-forecast revenue','ERP → SAP'],['RETENTION_ACTION','Initiate retention','HRMS → Darwinbox'],['COLLECTION_ACTION','Collection action','Billing + CRM']];
    acts.forEach(a=>idx.push({type:'action', label:a[1], hint:a[2], action:a[0], kw:a[0]}));
    return idx;
  }
  let _idx=[], _filt=[], _sel=0;
  function recents(){ try { return JSON.parse(localStorage.getItem('ak_recents')||'[]'); } catch { return []; } }
  function pushRecent(it){ let r=recents().filter(x=>x.label!==it.label); r.unshift({type:it.type,label:it.label,hint:it.hint,href:it.href||'',action:it.action||''}); r=r.slice(0,5); try{localStorage.setItem('ak_recents',JSON.stringify(r));}catch{} }

  function openSearch(){
    if (document.getElementById('ak-srch-ov')) return;
    _idx = buildSearchIndex();
    const ov=document.createElement('div'); ov.id='ak-srch-ov';
    ov.innerHTML=`<div id="ak-srch">
      <div class="srch-input">${AK.icon('search')}<input id="ak-srch-in" placeholder="Search clients, projects, people, pursuits, skills, actions…" autocomplete="off"><span class="kbd">esc</span></div>
      <div class="srch-list" id="ak-srch-list"></div>
      <div class="srch-foot"><span>↑↓ navigate · ↵ open</span><span>Searching ${_idx.length} live records</span></div>
    </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click',e=>{ if(e.target===ov) closeSearch(); });
    const inp=document.getElementById('ak-srch-in');
    inp.addEventListener('input',e=>filterSearch(e.target.value));
    inp.addEventListener('keydown',srchKey);
    filterSearch('');
    setTimeout(()=>inp.focus(),20);
  }
  function filterSearch(q){
    _sel=0;
    if(!q){ const r=recents(); _filt = r.length ? r.map(x=>({...x,_recent:true})) : _idx.slice(0,8); }
    else { const s=q.toLowerCase(); _filt=_idx.filter(it=>it.label.toLowerCase().includes(s)||(it.hint||'').toLowerCase().includes(s)||(it.kw||'').toLowerCase().includes(s)).slice(0,40); }
    renderSearch(q);
  }
  function renderSearch(q){
    const ico={client:'◉',project:'▦',employee:'⊙',pursuit:'◇',skill:'✦',nav:'→',action:'⚡'};
    const list=document.getElementById('ak-srch-list'); if(!list) return;
    if(!_filt.length){ list.innerHTML=`<div class="srch-empty">No live records match “${q}”.</div>`; return; }
    const head = !q ? `<div class="srch-sec">${recents().length?'Recent':'Jump to'}</div>` : '';
    list.innerHTML = head + _filt.map((it,i)=>`<div class="srch-item ${i===_sel?'sel':''}" data-i="${i}" onmousemove="AKV3._sel(${i})" onclick="AKV3._run(${i})">
      <span class="srch-ico t-${it.type}">${ico[it.type]||'·'}</span>
      <span class="srch-label">${it.label}</span>
      <span class="srch-hint">${it.hint||''}</span>
      <span class="srch-type">${it.type}</span>
    </div>`).join('');
  }
  function srchKey(e){
    if(e.key==='Escape') return closeSearch();
    if(e.key==='ArrowDown'){ _sel=Math.min(_sel+1,_filt.length-1); renderSearch(document.getElementById('ak-srch-in').value); e.preventDefault(); }
    if(e.key==='ArrowUp'){ _sel=Math.max(_sel-1,0); renderSearch(document.getElementById('ak-srch-in').value); e.preventDefault(); }
    if(e.key==='Enter'){ runSearch(_sel); }
  }
  function runSearch(i){ const it=_filt[i]; if(!it) return; pushRecent(it); closeSearch();
    if(it.href) location.href=it.href; else if(it.action&&window.AKActions) AKActions.compose({type:it.action,entityType:'portfolio',entityId:'',entityName:''}); }
  function closeSearch(){ const el=document.getElementById('ak-srch-ov'); if(el) el.remove(); }

  /* ============================================================
     COLLABORATION DRAWER (G9) — threads, @mentions, decision
     record, presence. Persists per entity in sessionStorage.
     ============================================================ */
  const PEOPLE = ['Arjun Mehta','Devika Rao','Karthik Menon','Priya Nair','Ananya Krishnan'];
  const SEED_THREADS = {
    'Meridian Retail Group':[
      { who:'Karthik Menon', role:'dh', at:'2h ago', text:'Vikram is the real risk here — without a shadow we can\'t commit to the renewal scope. @Arjun Mehta can we approve the hike today?' },
      { who:'Arjun Mehta', role:'ceo', at:'1h ago', text:'Agreed. Approving the hike now. @Priya Nair please open the renewal SOW in parallel.' },
    ],
  };
  function tkey(e){ return 'ak_thread_'+e; }
  function getThread(e){ try { return JSON.parse(sessionStorage.getItem(tkey(e))||'null') || (SEED_THREADS[e]||[]); } catch { return SEED_THREADS[e]||[]; } }
  function saveThread(e,arr){ try { sessionStorage.setItem(tkey(e),JSON.stringify(arr)); } catch {} }

  function openThread(entity, opts={}){
    closeThread();
    const me = ({ceo:'Arjun Mehta',cfo:'Devika Rao',dh:'Karthik Menon'})[P()];
    const presence = (opts.presence || ['Devika Rao','Priya Nair']).filter(n=>n!==me);
    const dr = document.createElement('div'); dr.id='ak-collab-ov';
    dr.innerHTML=`<div class="collab-drawer">
      <div class="collab-head">
        <div><div class="collab-eyebrow">Shared workspace</div><div class="collab-title">${entity}</div></div>
        <button class="pv-close" onclick="AKV3.closeThread()" style="font-size:17px">✕</button>
      </div>
      <div class="collab-presence">
        <span class="cp-label">Here now</span>
        ${presence.map(n=>AK.avatar(n,'sm')).join('')}
        <span class="cp-names">${presence.join(' & ')||'just you'} ${presence.length?'also viewing':''}</span>
      </div>
      <div class="collab-tabs">
        <button class="collab-tab active" data-t="thread" onclick="AKV3._tab('thread')">Discussion</button>
        <button class="collab-tab" data-t="decision" onclick="AKV3._tab('decision')">Decision record</button>
        <button class="collab-tab" data-t="raci" onclick="AKV3._tab('raci')">RACI</button>
      </div>
      <div class="collab-body" id="collab-body"></div>
      <div class="collab-compose" id="collab-compose">
        <textarea id="collab-input" placeholder="Comment… use @ to mention a colleague"></textarea>
        <button class="btn sm primary" onclick="AKV3._post('${entity.replace(/'/g,"\\'")}')">Post</button>
      </div>
    </div>`;
    document.body.appendChild(dr);
    dr.addEventListener('click',e=>{ if(e.target===dr) closeThread(); });
    _renderTab('thread', entity);
  }
  let _curTab='thread';
  function _renderTab(tab, entity){
    _curTab=tab;
    document.querySelectorAll('.collab-tab').forEach(b=>b.classList.toggle('active',b.dataset.t===tab));
    const body=document.getElementById('collab-body');
    const compose=document.getElementById('collab-compose');
    if(compose) compose.style.display = tab==='thread' ? '' : 'none';
    if(tab==='thread'){
      const th=getThread(entity);
      body.innerHTML = th.length ? th.map(m=>`<div class="cmt">
        ${AK.avatar(m.who,'sm')}
        <div class="cmt-body"><div class="cmt-top"><b>${m.who}</b><span class="cmt-at">${m.at}</span></div>
        <div class="cmt-text">${linkMentions(m.text)}</div></div></div>`).join('')
        : `<div class="collab-empty">No discussion yet. Start the conversation — @mention a colleague to pull them in.</div>`;
    } else if(tab==='decision'){
      body.innerHTML = `<div class="dr-rec">
        <div class="dr-row"><span class="dr-k">Decision</span><span class="dr-v">Approve Vikram retention hike + open renewal SOW in parallel</span></div>
        <div class="dr-row"><span class="dr-k">Decided by</span><span class="dr-v">Arjun Mehta (CEO) · 1h ago</span></div>
        <div class="dr-row"><span class="dr-k">Rationale</span><span class="dr-v">SPOF on flagship account; renewal in 18 days. Cost of churn (₹14.2 Cr) ≫ hike (₹4.3 L).</span></div>
        <div class="dr-row"><span class="dr-k">Linked decision</span><span class="dr-v"><a href="Decisions.html">DEC-2038 · awaiting outcome ›</a></span></div>
        <div class="dr-row"><span class="dr-k">Outcome</span><span class="dr-v muted">Tracking — due 05 Jun</span></div>
      </div>`;
    } else {
      const raci=[['Account renewal','Priya Nair','Arjun Mehta','Karthik Menon, Devika Rao','Board'],['Retention (Vikram)','Karthik Menon','Arjun Mehta','HR','Priya Nair'],['Unbilled recovery','Devika Rao','Devika Rao','Priya Nair','—']];
      body.innerHTML = `<table class="raci-tbl"><thead><tr><th>Workstream</th><th>R</th><th>A</th><th>C</th><th>I</th></tr></thead><tbody>
        ${raci.map(r=>`<tr><td class="cell-strong">${r[0]}</td><td>${r[1]}</td><td><b>${r[2]}</b></td><td class="muted">${r[3]}</td><td class="muted">${r[4]}</td></tr>`).join('')}
      </tbody></table>`;
    }
  }
  function linkMentions(t){ return t.replace(/@([A-Z][a-z]+ [A-Z][a-z]+)/g,'<span class="mention">@$1</span>'); }
  function postComment(entity){
    const inp=document.getElementById('collab-input'); if(!inp||!inp.value.trim()) return;
    const me=({ceo:'Arjun Mehta',cfo:'Devika Rao',dh:'Karthik Menon'})[P()];
    const th=getThread(entity); th.push({who:me, role:P(), at:'just now', text:inp.value.trim()}); saveThread(entity,th);
    inp.value=''; _renderTab('thread',entity);
    const b=document.getElementById('collab-body'); if(b) b.scrollTop=b.scrollHeight;
    if(/@\w/.test(th[th.length-1].text)) AK.toast('Mentioned colleagues notified');
  }
  function closeThread(){ const el=document.getElementById('ak-collab-ov'); if(el) el.remove(); }

  /* ============================================================
     BRIEFING & DIGEST ENGINE (G7)
     ============================================================ */
  function briefContent(){
    const persona=P();
    const briefs={
      ceo:{title:'CEO Morning Brief', lines:[
        ['crit','Meridian renewal — 18 days','3-pillar composite · ₹14.2 Cr at stake. Renewal SOW not started.'],
        ['warn','Concentration breached 30%','Top-3 at 31% ARR — board narrative needed Friday.'],
        ['warn','Vikram Rao retention','88% exit signal on flagship. Hike awaiting your sign-off.'],
        ['good','Rev/employee +6.2% QoQ','AI-augmentation thesis landing — ₹7.7 L/mo, above peer median.'],
      ]},
      cfo:{title:'CFO Morning Brief', lines:[
        ['crit','Northwind ₹2.4 Cr · 90+ days','Legal dunning threshold crossed. Collection call Wed.'],
        ['crit','₹48 L unbilled — Meridian M8','Work delivered, invoice not raised. Leakage.'],
        ['warn','DSO 58d vs 52d target','₹3.4 Cr trapped in working capital.'],
        ['good','Cobalt ₹1.03 Cr cleared','Reconciled in SAP. DSO improving.'],
      ]},
      dh:{title:'Delivery Brief', lines:[
        ['crit','Orion Rollout 11 days late','Budget 86% at 64% scope. Recovery plan needed.'],
        ['crit','Vikram Rao — SPOF, no shadow','Assign shadow before sprint ends.'],
        ['warn','Atlas ₹62 L overrun forecast','Re-baseline today.'],
        ['good','6 bench engineers → 2 pursuits','Redeploy to Cobalt + Indus.'],
      ]},
    };
    return briefs[persona]||briefs.ceo;
  }
  function openBrief(){
    closeBrief();
    const b=briefContent();
    const dr=document.createElement('div'); dr.id='ak-brief-ov';
    dr.innerHTML=`<div class="brief-drawer">
      <div class="brief-head">
        <div><div class="collab-eyebrow">Briefing & digest engine</div><div class="collab-title">${b.title}</div><div class="brief-date">Monday · 04 June 2026 · auto-generated 06:30 IST</div></div>
        <button class="pv-close" onclick="AKV3.closeBrief()" style="font-size:17px">✕</button>
      </div>
      <div class="brief-body">
        <div class="brief-preview">
          ${b.lines.map(l=>`<div class="brief-line"><span class="hdot ${l[0]}"></span><div><b>${l[1]}</b><div class="brief-sub">${l[2]}</div></div></div>`).join('')}
        </div>
        <div class="brief-sec">Delivery schedule</div>
        <div class="brief-sched">
          <label class="brief-opt"><input type="checkbox" checked> Daily digest · <b>06:30 email</b></label>
          <label class="brief-opt"><input type="checkbox" checked> Critical signals · <b>Slack push</b></label>
          <label class="brief-opt"><input type="checkbox"> Weekly board pack · <b>Mon 08:00</b></label>
        </div>
        <div class="brief-chan">
          <span class="brief-chan-l">Channels</span>
          <span class="chan-pill on">✉ arjun@nexora.com</span>
          <span class="chan-pill on">⧉ #exec-akashic</span>
          <span class="chan-pill">+ add</span>
        </div>
      </div>
      <div class="brief-foot">
        <button class="btn sm" onclick="AK.toast('Brief sent to your inbox & Slack now')">Send now</button>
        <button class="btn sm primary" onclick="AKV3.exportBoardPack()">Export board pack (PDF) ›</button>
      </div>
    </div>`;
    document.body.appendChild(dr);
    dr.addEventListener('click',e=>{ if(e.target===dr) closeBrief(); });
  }
  function exportBoardPack(){
    AK.toast('Board pack assembled — brief + scenarios + composite → PDF');
  }
  function closeBrief(){ const el=document.getElementById('ak-brief-ov'); if(el) el.remove(); }

  /* ---------- styles ---------- */
  function injectStyles(){
    if(document.getElementById('v3-shell-css')) return;
    const s=document.createElement('style'); s.id='v3-shell-css';
    s.textContent=`
/* search */
#ak-srch-ov{position:fixed;inset:0;background:oklch(0.2 0.01 265/0.36);z-index:800;display:flex;justify-content:center;align-items:flex-start;padding-top:13vh}
#ak-srch{width:100%;max-width:600px;background:var(--surface);border:1px solid var(--line-2);border-radius:var(--r-xl);box-shadow:var(--shadow-lg);overflow:hidden}
.srch-input{display:flex;align-items:center;gap:10px;padding:15px 17px;border-bottom:1px solid var(--line)}
.srch-input svg{color:var(--ink-3);width:18px;height:18px}
.srch-input input{flex:1;border:0;outline:0;font-family:var(--sans);font-size:16px;color:var(--ink);background:none}
.srch-input .kbd{font-family:var(--mono);font-size:10px;color:var(--ink-faint);border:1px solid var(--line-2);border-radius:4px;padding:2px 6px}
.srch-list{max-height:54vh;overflow-y:auto;padding:6px}
.srch-sec{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-faint);padding:8px 10px 4px}
.srch-item{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:9px;cursor:pointer}
.srch-item.sel{background:var(--accent-soft)}
.srch-ico{width:22px;height:22px;border-radius:6px;display:grid;place-items:center;font-size:12px;background:var(--surface-2);color:var(--ink-3);flex:0 0 auto}
.srch-ico.t-client{color:var(--accent-2);background:var(--accent-soft)}.srch-ico.t-pursuit{color:var(--composite-2);background:var(--composite-soft)}
.srch-ico.t-employee{color:var(--good);background:var(--good-soft)}.srch-ico.t-action{color:var(--warn);background:var(--warn-soft)}
.srch-label{font-weight:600;font-size:13.5px;flex:0 0 auto}
.srch-hint{font-size:12px;color:var(--ink-3);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.srch-type{font-size:9.5px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.05em;color:var(--ink-faint);background:var(--surface-2);padding:2px 7px;border-radius:5px}
.srch-empty,.collab-empty{padding:28px 18px;text-align:center;color:var(--ink-3);font-size:13px}
.srch-foot{display:flex;justify-content:space-between;padding:9px 16px;border-top:1px solid var(--line);background:var(--surface-2);font-size:11px;color:var(--ink-faint);font-family:var(--mono)}
/* drawers shared */
#ak-collab-ov,#ak-brief-ov{position:fixed;inset:0;background:oklch(0.2 0.01 265/0.34);z-index:560;display:flex;justify-content:flex-end}
.collab-drawer,.brief-drawer{width:440px;max-width:94vw;height:100%;background:var(--surface);box-shadow:var(--shadow-lg);display:flex;flex-direction:column;animation:drwIn .22s ease}
@keyframes drwIn{from{transform:translateX(30px);opacity:.4}to{transform:none;opacity:1}}
.collab-head,.brief-head{display:flex;justify-content:space-between;align-items:flex-start;padding:18px 20px;border-bottom:1px solid var(--line)}
.collab-eyebrow{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--composite-2);font-family:var(--mono);margin-bottom:3px}
.collab-title{font-size:17px;font-weight:800;letter-spacing:-.01em}
.brief-date{font-size:11px;color:var(--ink-3);margin-top:3px;font-family:var(--mono)}
.collab-presence{display:flex;align-items:center;gap:6px;padding:11px 20px;background:var(--surface-2);border-bottom:1px solid var(--line)}
.cp-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-faint)}
.cp-names{font-size:11.5px;color:var(--ink-3)}
.collab-presence .avatar{box-shadow:0 0 0 2px var(--good);margin-left:-4px}
.collab-tabs{display:flex;gap:4px;padding:10px 16px 0;border-bottom:1px solid var(--line)}
.collab-tab{border:0;background:none;padding:8px 12px;font-size:12.5px;font-weight:600;color:var(--ink-3);border-bottom:2px solid transparent;cursor:pointer}
.collab-tab.active{color:var(--accent-2);border-bottom-color:var(--accent)}
.collab-body{flex:1;overflow-y:auto;padding:16px 20px}
.cmt{display:flex;gap:11px;margin-bottom:16px}
.cmt-body{flex:1}.cmt-top{display:flex;gap:8px;align-items:baseline}.cmt-top b{font-size:13px}.cmt-at{font-size:11px;color:var(--ink-faint)}
.cmt-text{font-size:13px;color:var(--ink-2);line-height:1.5;margin-top:2px}
.mention{color:var(--accent-2);font-weight:600;background:var(--accent-soft);padding:0 4px;border-radius:4px}
.collab-compose{display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--line);align-items:flex-end}
#collab-input{flex:1;border:1px solid var(--line-2);border-radius:var(--r);padding:9px 11px;font-family:var(--sans);font-size:13px;resize:none;min-height:40px;outline:none}
#collab-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.dr-rec{display:flex;flex-direction:column;gap:0}
.dr-row{display:grid;grid-template-columns:110px 1fr;gap:12px;padding:11px 0;border-bottom:1px solid var(--line);font-size:13px}
.dr-k{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--ink-faint)}
.raci-tbl{width:100%;border-collapse:collapse;font-size:12.5px}
.raci-tbl th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-faint);padding:8px 6px;border-bottom:1px solid var(--line-2)}
.raci-tbl td{padding:10px 6px;border-bottom:1px solid var(--line)}
/* brief */
.brief-body{flex:1;overflow-y:auto;padding:16px 20px}
.brief-preview{display:flex;flex-direction:column;gap:11px;padding:14px;background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r-lg)}
.brief-line{display:flex;gap:10px;align-items:flex-start}.brief-line b{font-size:13px}.brief-sub{font-size:11.5px;color:var(--ink-3);line-height:1.45}
.brief-sec{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-faint);margin:20px 0 9px}
.brief-sched{display:flex;flex-direction:column;gap:9px}
.brief-opt{display:flex;align-items:center;gap:9px;font-size:13px;color:var(--ink-2)}.brief-opt input{width:15px;height:15px;accent-color:var(--accent)}
.brief-chan{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:16px}
.brief-chan-l{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-faint)}
.chan-pill{font-size:11.5px;font-weight:600;border:1px solid var(--line-2);border-radius:20px;padding:3px 11px;color:var(--ink-3)}
.chan-pill.on{background:var(--accent-soft);color:var(--accent-2);border-color:var(--accent-line)}
.brief-foot{display:flex;gap:8px;justify-content:flex-end;padding:14px 20px;border-top:1px solid var(--line);background:var(--surface-2)}
/* benchmark */
.bench-chip{font-size:10.5px;font-weight:600;font-family:var(--mono);padding:2px 8px;border-radius:5px}
.bench-chip.over{background:var(--good-soft);color:var(--good)}.bench-chip.under{background:var(--critical-soft);color:var(--critical)}
.bench-bar{position:relative;height:34px;margin-top:6px}
.bench-track{position:absolute;left:0;right:0;top:16px;height:4px;border-radius:3px;background:linear-gradient(90deg,var(--critical-soft),var(--surface-3),var(--good-soft))}
.bench-mark{position:absolute;top:11px;width:2px;height:14px;background:var(--ink-faint);transform:translateX(-50%)}
.bench-mark.median{background:var(--ink-3)}.bench-mark.top{background:var(--good)}
.bench-mark.firm{top:4px;height:0;width:0}
.bench-mark.firm span{position:absolute;transform:translateX(-50%);font-size:10px;font-weight:700;font-family:var(--mono);padding:2px 6px;border-radius:5px;white-space:nowrap;top:-4px}
.bench-mark.firm.good span{background:var(--good);color:#fff}.bench-mark.firm.bad span{background:var(--critical);color:#fff}
`;
    document.head.appendChild(s);
  }

  /* ---------- boot: override ⌘K + topbar search to real search ---------- */
  function boot(){
    injectStyles();
    if(window.AK){ AK.openPalette = openSearch; }
    document.addEventListener('keydown',e=>{ if((e.metaKey||e.ctrlKey)&&e.key==='k'){ e.preventDefault(); openSearch(); } },true);
    /* re-point the topbar search button (shell already rendered) */
    const tb=document.querySelector('.topbar-search'); if(tb) tb.setAttribute('onclick','AKV3.openSearch()');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();

  window.AKV3 = {
    openSearch, closeSearch, _sel:i=>{_sel=i;renderSearch(document.getElementById('ak-srch-in').value);}, _run:runSearch,
    openThread, closeThread, _tab:t=>_renderTab(t, document.querySelector('.collab-title')?.textContent||''), _post:postComment,
    openBrief, closeBrief, exportBoardPack,
    benchChip, benchBar, getScope, setScope,
    getPersonal, markSignal, signalState, getDecisions:()=> (window.AKActions?AKActions.getDecisions():[]),
  };
})();
