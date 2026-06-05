/* ============================================================
   Akashic EIS — actions.js
   Reverse-ETL action composer + approvals store + sync badges
   Usage: AKActions.compose({ type, entityType, entityId, entityName, prefill })
          AKActions.getQueue() → pending approvals array
   ============================================================ */
(function () {
  /* ---- Integration targets ---- */
  const SYSTEMS = {
    billing:  { label:'Tally / NetSuite',     color:'#2563a8', icon:'₹' },
    crm:      { label:'Salesforce CRM',        color:'#0ea5e9', icon:'☁' },
    psa:      { label:'Zoho Projects / PSA',   color:'#3a7a55', icon:'▦' },
    hrms:     { label:'Darwinbox HRMS',        color:'#7a2f6a', icon:'⊙' },
    erp:      { label:'SAP ERP',               color:'#9e5a2f', icon:'≡' },
    notify:   { label:'Notification (email/Slack)', color:'#46508c', icon:'✉' },
  };

  /* ---- Action type definitions ---- */
  const ACTION_DEFS = {
    RAISE_INVOICE:    { label:'Raise milestone invoice',   systems:['billing'],       fields:[{id:'amount',label:'Amount (₹ Cr)',type:'num'},{id:'milestone',label:'Milestone / reference',type:'text'},{id:'contract',label:'Contract',type:'text'},{id:'dueDate',label:'Due date',type:'text'}], approver:'CFO' },
    APPROVE_CR:       { label:'Approve change request',    systems:['psa','billing'],  fields:[{id:'crTitle',label:'CR title',type:'text'},{id:'impact',label:'Budget impact (₹ L)',type:'num'},{id:'scope',label:'Scope change',type:'textarea'}], approver:'Delivery Head' },
    REFORECAST:       { label:'Re-forecast revenue',       systems:['erp'],            fields:[{id:'newForecast',label:'New forecast (₹ Cr)',type:'num'},{id:'reason',label:'Reason',type:'textarea'},{id:'period',label:'Period',type:'text'}], approver:'CFO' },
    RETENTION_ACTION: { label:'Initiate retention action', systems:['hrms','notify'],  fields:[{id:'employee',label:'Employee',type:'text'},{id:'lever',label:'Retention lever',type:'select',options:['Compensation review','Promotion','Project change','Recognition','Manager meeting']},{id:'budget',label:'Budget (₹ L)',type:'num'}], approver:'CEO' },
    REDEPLOY:         { label:'Redeploy to project',       systems:['psa','hrms'],     fields:[{id:'employee',label:'Employee',type:'text'},{id:'project',label:'Target project',type:'text'},{id:'alloc',label:'Allocation %',type:'num'},{id:'from',label:'Start date',type:'text'}], approver:'Delivery Head' },
    RAISE_RENEWAL_SOW:{ label:'Create renewal SOW',        systems:['crm','billing'],  fields:[{id:'client',label:'Client',type:'text'},{id:'value',label:'Contract value (₹ Cr)',type:'num'},{id:'duration',label:'Duration (months)',type:'num'},{id:'services',label:'Services in scope',type:'textarea'}], approver:'CEO' },
    APPROVE_PAYMENT:  { label:'Approve payment',           systems:['billing'],        fields:[{id:'invoice',label:'Invoice ref',type:'text'},{id:'amount',label:'Amount (₹ Cr)',type:'num'},{id:'payDate',label:'Payment date',type:'text'}], approver:'CFO' },
    ESCALATE:         { label:'Escalate to stakeholder',   systems:['crm','notify'],   fields:[{id:'to',label:'Escalate to',type:'text'},{id:'subject',label:'Subject',type:'text'},{id:'note',label:'Note',type:'textarea'}], approver:'CEO' },
    APPROVE_HIKE:     { label:'Approve salary revision',   systems:['hrms'],           fields:[{id:'employee',label:'Employee',type:'text'},{id:'current',label:'Current CTC (₹ L)',type:'num'},{id:'revised',label:'Revised CTC (₹ L)',type:'num'},{id:'effective',label:'Effective date',type:'text'}], approver:'CEO' },
    FLAG_SUCCESSION:  { label:'Flag for succession plan',  systems:['hrms','notify'],  fields:[{id:'employee',label:'Key person',type:'text'},{id:'shadow',label:'Proposed shadow',type:'text'},{id:'timeline',label:'Transition timeline',type:'text'}], approver:'Delivery Head' },
    COLLECTION_ACTION:{ label:'Initiate collection action',systems:['billing','crm'],  fields:[{id:'invoice',label:'Invoice ref',type:'text'},{id:'amount',label:'Overdue amount (₹ Cr)',type:'num'},{id:'step',label:'Dunning step',type:'select',options:['Reminder email','Formal notice','Escalate to legal','Promise-to-pay recorded']},{id:'owner',label:'Collection owner',type:'text'}], approver:'CFO' },
  };

  /* ---- In-memory queue ---- */
  let queue = [];
  try { queue = JSON.parse(sessionStorage.getItem('ak_actions') || '[]'); } catch {}
  function save() { try { sessionStorage.setItem('ak_actions', JSON.stringify(queue)); } catch {} }

  /* ---- Composer modal ---- */
  function compose(opts) {
    close();
    const { type, entityType, entityId, entityName, prefill = {} } = opts;
    const def = ACTION_DEFS[type];
    if (!def) { AK && AK.toast('Action type not recognised: ' + type); return; }
    const overlay = document.createElement('div');
    overlay.id = 'ak-action-overlay';
    overlay.innerHTML = buildModal(def, opts, prefill);
    document.body.appendChild(overlay);
    overlay.querySelector('#ak-action-form').addEventListener('submit', e => {
      e.preventDefault();
      submit(type, def, opts, new FormData(e.target));
    });
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    setTimeout(() => overlay.querySelector('.ac-modal') && overlay.querySelector('.ac-modal').classList.add('ac-in'), 10);
  }

  function buildModal(def, opts, prefill) {
    const sysBadges = def.systems.map(s => {
      const sys = SYSTEMS[s];
      return `<span class="ac-sys" style="border-color:${sys.color};color:${sys.color}">${sys.icon} ${sys.label}</span>`;
    }).join('');
    const fields = def.fields.map(f => {
      const val = prefill[f.id] || '';
      if (f.type === 'textarea') return `<div class="ac-field"><label>${f.label}</label><textarea name="${f.id}" rows="2">${val}</textarea></div>`;
      if (f.type === 'select') return `<div class="ac-field"><label>${f.label}</label><select name="${f.id}">${f.options.map(o=>`<option ${o===val?'selected':''}>${o}</option>`).join('')}</select></div>`;
      return `<div class="ac-field"><label>${f.label}</label><input type="${f.type==='num'?'number':'text'}" name="${f.id}" value="${val}" step="any" /></div>`;
    }).join('');
    return `
<div class="ac-modal">
  <div class="ac-head">
    <div>
      <div class="ac-eyebrow">Action · ${opts.entityType || ''} ${opts.entityName ? '→ ' + opts.entityName : ''}</div>
      <div class="ac-title">${def.label}</div>
    </div>
    <button class="pv-close" onclick="AKActions.close()" style="font-size:16px;padding:4px 8px">✕</button>
  </div>
  <div class="ac-writes">
    <span class="ac-writes-l">Writes back to</span>${sysBadges}
    <span class="ac-approver">Approver: <b>${def.approver}</b></span>
  </div>
  <form id="ak-action-form" class="ac-body">
    <div class="ac-fields">${fields}</div>
    <div class="ac-footer">
      <div class="ac-status-preview">
        <span class="ac-pill draft">Draft</span>
        <span class="ac-arrow">→</span>
        <span class="ac-pill pending">Pending approval</span>
        <span class="ac-arrow">→</span>
        <span class="ac-pill approved">Approved</span>
        <span class="ac-arrow">→</span>
        <span class="ac-pill synced">Synced to systems</span>
      </div>
      <div class="btn-row" style="justify-content:flex-end">
        <button type="button" class="btn sm ghost" onclick="AKActions.close()">Cancel</button>
        <button type="submit" class="btn sm primary">Create action ›</button>
      </div>
    </div>
  </form>
</div>`;
  }

  function submit(type, def, opts, formData) {
    const payload = {};
    def.fields.forEach(f => { payload[f.id] = formData.get(f.id); });
    const action = {
      id: 'ACT-' + Math.floor(1000 + Math.random() * 9000),
      type, label: def.label,
      entityType: opts.entityType, entityId: opts.entityId, entityName: opts.entityName,
      systems: def.systems.map(s => SYSTEMS[s].label),
      approver: def.approver,
      status: 'pending',
      createdBy: 'Arjun Mehta',
      createdAt: new Date().toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }),
      payload,
    };
    queue.unshift(action);
    save();
    close();
    
    // Trigger sync simulation
    simulateSync(action, () => {
      AK && AK.toast('Action created · ' + action.id + ' → awaiting ' + def.approver);
      document.dispatchEvent(new CustomEvent('ak-action-created', { detail: action }));
    });
  }

  function simulateSync(action, onComplete) {
    const overlay = document.createElement('div');
    overlay.id = 'ak-sync-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:oklch(0.2 0.01 265 / 0.5);z-index:900;display:flex;align-items:center;justify-content:center;padding:24px';
    
    const sysBadges = action.systems.map(s => `<span class="ac-sys" style="border-color:var(--accent);color:var(--accent-2)">${s}</span>`).join('');
    
    overlay.innerHTML = `
      <div class="ac-modal" style="max-width:460px;opacity:1;transform:none">
        <div class="ac-head" style="background:var(--surface-2);border-bottom:1px solid var(--line)">
          <div>
            <div class="ac-eyebrow">Reverse ETL Sync Engine</div>
            <div class="ac-title" style="font-size:16px">${action.label}</div>
          </div>
          <span class="badge b-renewal mono fs-11" id="sync-main-status">connecting</span>
        </div>
        <div class="ac-writes" style="background:#fff;border-bottom:0">
          <span class="ac-writes-l">Target systems:</span> ${sysBadges}
        </div>
        <div style="padding:10px 20px 20px" class="col gap-10">
          <div style="font-size:12.5px;color:var(--ink-2);background:var(--surface-2);padding:10px;border-radius:6px;border:1px solid var(--line)">
            <b class="mono fs-11">${action.id}</b> · ${action.entityType} ${action.entityName ? '→ ' + action.entityName : ''}
          </div>
          <div class="col gap-6" id="sync-steps">
            <div class="sync-step" id="step-0"><span class="bullet">⏳</span> <span>Authorizing secure API handshake...</span></div>
            <div class="sync-step muted" id="step-1"><span class="bullet">○</span> <span>Verifying ledger schema &amp; permissions...</span></div>
            <div class="sync-step muted" id="step-2"><span class="bullet">○</span> <span>Writing transactional entries back to source records...</span></div>
            <div class="sync-step muted" id="step-3"><span class="bullet">○</span> <span>Awaiting operational receipt audit hash...</span></div>
          </div>
          <div id="sync-progress" style="width:100%;height:4px;background:var(--surface-3);border-radius:2px;overflow:hidden;margin-top:6px">
            <div id="sync-bar" style="width:0%;height:100%;background:var(--accent);transition:width 0.4s"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    const steps = [
      { id: 0, text: 'Authorized. Handshake complete.' },
      { id: 1, text: 'Schema matched. Permissions validated.' },
      { id: 2, text: 'Transactions recorded in ledger databases.' },
      { id: 3, text: 'Sync verified. Audit receipt hashed.' }
    ];
    
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep > 0) {
        const prev = document.getElementById('step-' + (currentStep - 1));
        if (prev) {
          prev.querySelector('.bullet').innerHTML = '✓';
          prev.querySelector('.bullet').style.color = 'var(--good)';
          prev.classList.add('strong');
        }
      }
      
      const bar = document.getElementById('sync-bar');
      if (bar) bar.style.width = ((currentStep + 1) / steps.length * 100) + '%';
      
      if (currentStep < steps.length) {
        const curr = document.getElementById('step-' + currentStep);
        if (curr) {
          curr.classList.remove('muted');
          curr.querySelector('.bullet').innerHTML = '⚡';
          curr.querySelector('.bullet').style.color = 'var(--warn)';
          curr.querySelector('span:nth-child(2)').innerHTML = steps[currentStep].text;
        }
        currentStep++;
      } else {
        clearInterval(interval);
        const status = document.getElementById('sync-main-status');
        if (status) {
          status.className = 'badge b-active mono fs-11';
          status.innerHTML = 'synced';
        }
        const last = document.getElementById('step-3');
        if (last) {
          last.querySelector('.bullet').innerHTML = '✓';
          last.querySelector('.bullet').style.color = 'var(--good)';
          last.classList.add('strong');
        }
        
        setTimeout(() => {
          overlay.remove();
          if (onComplete) onComplete();
        }, 800);
      }
    }, 600);
  }

  function close() {
    const el = document.getElementById('ak-action-overlay');
    if (el) el.remove();
  }

  /* ---- Sync badge helper ---- */
  function syncBadge(systemKey) {
    const s = SYSTEMS[systemKey];
    if (!s) return '';
    return `<span class="ac-sys-sm" style="border-color:${s.color};color:${s.color}">${s.icon} ${s.label}</span>`;
  }

  /* ---- Decisions bar context-aware button builder ---- */
  function decisionsFor(entityType, entityId) {
    const maps = {
      client:   [['RAISE_INVOICE','Raise invoice'],['RAISE_RENEWAL_SOW','Create renewal SOW'],['COLLECTION_ACTION','Collection action'],['REFORECAST','Re-forecast'],['ESCALATE','Escalate']],
      project:  [['RAISE_INVOICE','Raise invoice'],['APPROVE_CR','Approve CR'],['REFORECAST','Re-forecast margin'],['FLAG_SUCCESSION','Succession plan'],['ESCALATE','Escalate']],
      employee: [['RETENTION_ACTION','Retention action'],['REDEPLOY','Redeploy'],['APPROVE_HIKE','Approve hike'],['FLAG_SUCCESSION','Succession plan']],
      invoice:  [['APPROVE_PAYMENT','Approve payment'],['COLLECTION_ACTION','Collection action']],
      portfolio:[['REFORECAST','Re-forecast'],['ESCALATE','Escalate']],
    };
    return (maps[entityType] || maps.portfolio).map(([t, label]) =>
      `<button class="btn sm" onclick="AKActions.compose({type:'${t}',entityType:'${entityType}',entityId:'${entityId||''}',entityName:''})">${label}</button>`
    ).join('');
  }

  /* ---- Action status chip ---- */
  function statusChip(status) {
    const map = { pending:'warn', approved:'good', synced:'accent', rejected:'crit', draft:'neutral' };
    const cls = map[status] || 'neutral';
    return `<span class="badge b-${cls==='accent'?'accent':cls==='warn'?'renewal':cls==='good'?'active':cls==='crit'?'risk':'prospect'}"><span class="bd"></span>${status}</span>`;
  }

  /* ---- Inject styles once ---- */
  function injectStyles() {
    if (document.getElementById('ac-styles')) return;
    const s = document.createElement('style');
    s.id = 'ac-styles';
    s.textContent = `
#ak-action-overlay{position:fixed;inset:0;background:oklch(0.2 0.01 265 / 0.42);z-index:500;display:flex;align-items:center;justify-content:center;padding:24px}
.ac-modal{background:var(--surface);border-radius:var(--r-xl);box-shadow:var(--shadow-lg);width:100%;max-width:560px;overflow:hidden;transform:translateY(18px) scale(.98);opacity:0;transition:transform .2s,opacity .18s}
.ac-modal.ac-in{transform:none;opacity:1}
.ac-head{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 20px 14px;border-bottom:1px solid var(--line)}
.ac-eyebrow{font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-faint);font-weight:700;font-family:var(--mono);margin-bottom:4px}
.ac-title{font-size:18px;font-weight:800;letter-spacing:-.01em}
.ac-writes{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 20px;background:var(--surface-2);border-bottom:1px solid var(--line)}
.ac-writes-l{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-faint)}
.ac-sys{font-size:11px;font-weight:700;border:1px solid;border-radius:20px;padding:2px 9px;white-space:nowrap}
.ac-sys-sm{font-size:10px;font-weight:700;border:1px solid;border-radius:12px;padding:1px 7px;white-space:nowrap}
.ac-approver{margin-left:auto;font-size:12px;color:var(--ink-3)}
.ac-body{padding:18px 20px}
.ac-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
.ac-field{display:flex;flex-direction:column;gap:5px}
.ac-field label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--ink-faint)}
.ac-field input,.ac-field textarea,.ac-field select{border:1px solid var(--line-2);border-radius:var(--r);padding:8px 10px;font-family:var(--sans);font-size:13px;color:var(--ink);background:var(--surface);outline:none}
.ac-field input:focus,.ac-field textarea:focus,.ac-field select:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.ac-field textarea{resize:vertical;min-height:60px}
.ac-footer{border-top:1px solid var(--line);padding-top:14px}
.ac-status-preview{display:flex;align-items:center;gap:6px;margin-bottom:12px;flex-wrap:wrap}
.ac-arrow{color:var(--ink-faint);font-size:13px}
.ac-pill{font-size:10.5px;font-weight:700;font-family:var(--mono);padding:2px 8px;border-radius:20px;border:1px solid var(--line-2);color:var(--ink-3)}
.ac-pill.draft{color:var(--ink-3)}.ac-pill.pending{background:var(--warn-soft);color:var(--warn);border-color:var(--warn-line)}
.ac-pill.approved{background:var(--good-soft);color:var(--good);border-color:var(--good-line)}
.ac-pill.synced{background:var(--accent-soft);color:var(--accent-2);border-color:var(--accent-line)}
.sync-step{font-size:13px;display:flex;align-items:center;gap:8px;padding:4px 0}
.sync-step.muted{opacity:0.4}
.sync-step .bullet{font-family:var(--mono);width:16px;display:inline-block;text-align:center;font-weight:bold}
.sync-step.strong{font-weight:600;color:var(--ink)}`;
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectStyles);
  else injectStyles();

  window.AKActions = {
    compose, close, save, simulateSync,
    getQueue: () => queue,
    getActionDefs: () => ACTION_DEFS,
    getSystems: () => SYSTEMS,
    decisionsFor,
    statusChip,
    syncBadge,
  };
})();
