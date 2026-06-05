/* employee-profile.js — rendering for Vikram Rao 360 */
(function () {
  const $=s=>document.querySelector(s);

  /* ---- A: Career Lifecycle Stages ---- */
  const STAGES = [
    { id: 'sourcing', label: '1. Sourcing & Offer', desc: 'Offer letter signed, initial comp baseline set at ₹28 L.', date: '12 Jun 2020', status: 'done', owner: 'HR Operations', system: 'Workday + Darwinbox' },
    { id: 'onboarding', label: '2. Enablement', desc: 'Onboarding completed, Cloud certification tracks loaded.', date: '01 Jul 2020', status: 'done', owner: 'L&D Team', system: 'Darwinbox' },
    { id: 'staffed', label: '3. Billable Staffing', desc: 'Assigned to Meridian Retail Orion Commerce (64%) and Cobalt (32%).', date: '02 Jan 2025', status: 'done', owner: 'Karthik Menon', system: 'Zoho PSA' },
    { id: 'retention-risk', label: '4. Retention Gate', desc: '88% exit signal detected. Comp benchmark review triggered. Shadow shadow required.', date: 'Critical Alert', status: 'active', owner: 'Arjun Mehta', system: 'Akashic Models' },
    { id: 'transition', label: '5. Succession Handover', desc: 'Transition timeline mapping. Shadow architect assignment.', date: 'Upcoming', status: 'upcoming', owner: 'Karthik Menon', system: 'Zoho PSA' },
    { id: 'alumni', label: '6. Alumni Status', desc: 'Career tenure summary, exit interview archive, historical contribution.', date: 'Upcoming', status: 'upcoming', owner: 'HR Operations', system: 'Darwinbox' }
  ];

  function renderStages() {
    const el = document.getElementById('emp-stages');
    if (!el) return;
    el.innerHTML = STAGES.map(s => {
      const cls = s.status === 'done' ? 'done' : s.status === 'active' ? 'active' : 'upcoming';
      return `
        <div class="stage-node ${cls}" onclick="AKEmployee.selectStage('${s.id}')">
          <div class="stage-dot-wrap"><div class="stage-dot"></div></div>
          <div class="stage-label">${s.label}</div>
        </div>
      `;
    }).join('');

    // Default to active stage
    selectStage('retention-risk');
  }

  function selectStage(id) {
    document.querySelectorAll('.stage-node').forEach((node, i) => {
      node.classList.toggle('selected', STAGES[i].id === id);
    });
    
    const s = STAGES.find(x => x.id === id);
    const detail = document.getElementById('emp-stage-detail');
    if (detail && s) {
      const statusBadge = s.status === 'done' ? 'b-active' : s.status === 'active' ? 'b-risk' : 'b-prospect';
      detail.innerHTML = `
        <div class="flex items-center justify-between mb-8">
          <b style="font-size:14px;color:var(--ink)">${s.label}</b>
          <span class="badge ${statusBadge}"><span class="bd"></span>${s.status}</span>
        </div>
        <p class="fs-13 muted mb-8">${s.desc}</p>
        <div class="flex justify-between items-center wrap gap-12 fs-12" style="border-top:1px dashed var(--line);padding-top:8px">
          <div>Owner: <b>${s.owner}</b></div>
          <div>Integrates: <span class="mono" style="color:var(--accent-2)">${s.system}</span></div>
          <div class="faint">Status: ${s.date}</div>
        </div>
      `;
    }
    const badge = document.getElementById('emp-stage-badge');
    if (badge && s) {
      badge.innerHTML = `<span class="bd"></span>${s.label.split('. ')[1]}`;
    }
  }

  /* ---- B: Deployments ---- */
  const deployments = [
    { account:'Cobalt Energy',    project:'Data Eng setup', from:'Aug 2020', to:'Jan 2021', util:92, margin:'38%', status:'done' },
    { account:'Indus Pharma',     project:'Cloud migration', from:'Feb 2021', to:'Jun 2022', util:88, margin:'34%', status:'done' },
    { account:'Hanseatic Bank',   project:'Core Banking', from:'Jul 2022', to:'Sep 2023', util:90, margin:'29%', status:'done' },
    { account:'[Bench]',          project:'—', from:'Oct 2023', to:'Dec 2023', util:0, margin:'—', status:'bench' },
    { account:'Meridian Retail',  project:'Orion Rollout', from:'Jan 2025', to:'Present', util:96, margin:'14%', status:'active' },
    { account:'Cobalt Energy',    project:'Data Lake (partial)', from:'Mar 2025', to:'Present', util:32, margin:'34%', status:'active' },
  ];
  const dp = document.getElementById('deployments');
  if (dp) dp.innerHTML = deployments.map(d => `<div class="dep-row ${d.status==='bench'?'bench-row-s':''}">
    <div class="flex items-center gap-8">
      <span class="hdot ${d.status==='active'?'good':d.status==='bench'?'neutral':'good'}" style="width:7px;height:7px;box-shadow:none"></span>
      <div style="flex:1;min-width:0">
        <div class="flex items-center justify-between"><b class="fs-13">${d.account}</b><span class="mono fs-11 faint">${d.from} → ${d.to}</span></div>
        <div class="exp-role">${d.project}</div>
      </div>
    </div>
    <div class="flex items-center gap-10 mt-6" style="margin-left:15px">
      <div style="flex:0 0 120px"><div class="flex justify-between fs-11 faint mb-3"><span>util</span><b style="color:var(--ink-2)">${d.util}%</b></div>
        <div class="meter ${d.util>90?'crit':d.util>70?'warn':'good'}"><i style="width:${d.util}%"></i></div></div>
      <span class="fs-12 muted">Margin: <b>${d.margin}</b></span>
    </div>
  </div>`).join('');

  /* ---- C: Value grid ---- */
  const valgrid = document.getElementById('valgrid');
  if (valgrid) valgrid.innerHTML = `
    <div class="val-row"><div class="val-bar-wrap">
      <div class="val-label">Revenue / yr</div>
      <div class="val-bar" style="width:100%;background:var(--accent)"></div>
      <div class="val-num" data-prov='{"src":"PSA + billing","q":"revenue_attr WHERE emp=E01","conf":0.91,"refresh":"daily"}'>₹1.84 Cr</div>
    </div></div>
    <div class="val-row"><div class="val-bar-wrap">
      <div class="val-label">Margin contrib.</div>
      <div class="val-bar" style="width:82%;background:var(--good)"></div>
      <div class="val-num good-text">₹62 L</div>
    </div></div>
    <div class="val-row"><div class="val-bar-wrap">
      <div class="val-label">Cost (CTC)</div>
      <div class="val-bar" style="width:48%;background:var(--composite)"></div>
      <div class="val-num muted" id="valgrid-ctc">₹38 L</div>
    </div></div>
    <div class="val-row"><div class="val-bar-wrap">
      <div class="val-label">Realization rate</div>
      <div class="val-bar" style="width:88%;background:var(--ink-3)"></div>
      <div class="val-num">88%</div>
    </div></div>`;

  /* ---- D: Skills ---- */
  const skills = [
    { name:'Apache Spark / PySpark', level:5, demand:'high', cert:'Databricks Certified' },
    { name:'Snowflake Data Cloud', level:5, demand:'high', cert:'Snowflake SnowPro Core' },
    { name:'AWS Data Services', level:4, demand:'high', cert:'AWS SA Associate' },
    { name:'dbt (data build tool)', level:4, demand:'med', cert:null },
    { name:'LLM / GenAI Ops', level:2, demand:'critical', cert:null },
    { name:'Solution Architecture', level:5, demand:'med', cert:null },
  ];
  const demandColor = { high:'var(--warn)', critical:'var(--critical)', med:'var(--good)', low:'var(--ink-faint)' };
  const sd = document.getElementById('skills');
  if (sd) sd.innerHTML = skills.map(s => `<div class="skill-row">
    <div class="flex items-center justify-between mb-4">
      <b class="fs-13">${s.name}</b>
      ${s.cert ? `<span class="tag mono" style="font-size:9.5px">✓ ${s.cert}</span>` : ''}
    </div>
    <div class="flex items-center gap-10">
      <div style="display:flex;gap:3px">${[1,2,3,4,5].map(i=>`<span style="width:12px;height:12px;border-radius:3px;background:${i<=s.level?'var(--accent)':'var(--surface-3)'}"></span>`).join('')}</div>
      <span class="fs-11" style="color:${demandColor[s.demand]}">Pipeline demand: ${s.demand}</span>
    </div>
  </div>`).join('');

  /* ---- E: Risk drivers ---- */
  const drivers = [
    { label:'Compensation 28% below market', weight:34, severity:'crit' },
    { id:'prom-driver', label:'No promotion in 18 months', weight:24, severity:'warn' },
    { label:'3 documented recruiter contacts', weight:22, severity:'warn' },
    { label:'Overutilized 96% — burnout signal', weight:18, severity:'warn' },
  ];
  const rd = document.getElementById('riskdrivers');
  if (rd) rd.innerHTML = drivers.map(d => `<div class="risk-drv">
    <div class="flex items-center justify-between mb-4">
      <span class="fs-13">${d.label}</span>
      <span class="mono ${d.severity==='crit'?'crit-text':'warn-text'} strong fs-12">${d.weight}%</span>
    </div>
    <div class="meter ${d.severity}"><i style="width:${d.weight*2.5}%"></i></div>
  </div>`).join('');

  const spof = document.getElementById('spof-exp');
  if (spof) spof.innerHTML = `<div class="flex items-center gap-10 p-8" style="background:var(--critical-soft);border:1px solid var(--critical-line);border-radius:8px;padding:10px 12px">
    <span class="hdot crit"></span>
    <div><a href="ClientProfile.html" class="strong accent-text">Meridian Retail Group</a>
      <div class="exp-role">64% of Orion delivery — ₹14.2 Cr account. No shadow. Immediate risk.</div></div>
    <span class="crit-text mono strong" style="margin-left:auto">₹14.2 Cr</span>
  </div>
  <div class="flex items-center gap-10" style="padding:8px;border:1px solid var(--line);border-radius:8px">
    <span class="hdot warn"></span>
    <div><a href="ClientProfile.html" class="strong accent-text">Cobalt Energy</a>
      <div class="exp-role">32% allocation — secondary risk. Can be covered by I. Qureshi.</div></div>
    <span class="warn-text mono strong" style="margin-left:auto">₹9.3 Cr</span>
  </div>`;

  const levers = document.getElementById('levers');
  if (levers) levers.innerHTML = [
    { l:'Compensation review', impact:'−22pt risk', cost:'₹10 L', type:'primary', action:'APPROVE_HIKE' },
    { l:'Promotion to Distinguished Engineer', impact:'−18pt risk', cost:'Structural', type:'', action:'RETENTION_ACTION' },
    { l:'Assign shadow architect', impact:'Reduces SPOF', cost:'₹8 L ramp', type:'', action:'FLAG_SUCCESSION' },
    { l:'Reduce allocation to 80%', impact:'−12pt burnout', cost:'Revenue impact', type:'', action:'REDEPLOY' },
  ].map(l => `<div class="flex items-center gap-10" style="padding:8px 10px;border:1px solid var(--line);border-radius:8px">
    <div style="flex:1"><b class="fs-13">${l.l}</b><div class="exp-role">${l.impact} · ${l.cost}</div></div>
    <button class="btn xs ${l.type==='primary'?'primary':''}" onclick="AKActions.compose({type:'${l.action}',entityType:'employee',entityId:'E01',entityName:'Vikram Rao',prefill:{employee:'Vikram Rao',lever:'${l.l}'}})">Action</button>
  </div>`).join('');

  /* ---- F: Engagement & 1:1 ---- */
  const ooos = document.getElementById('ooos');
  if (ooos) ooos.innerHTML = [
    { date:'28 May 2026', by:'Karthik Menon', note:'Discussed workload. Vikram flagged interest in architecture leadership role. Follow-up scheduled.' },
    { date:'12 Apr 2026', by:'Priya Nair', note:'Client appreciation shared. Flagged comp concern informally.' },
    { date:'01 Mar 2026', by:'Karthik Menon', note:'Mid-year check-in. Engagement moderate. No escalation yet.' },
  ].map(o => `<div class="ooo-row"><div class="flex items-center gap-8 mb-4"><b class="fs-12 mono">${o.date}</b><span class="muted">— ${o.by}</span></div><div class="fs-12 muted">${o.note}</div></div>`).join('');

  /* ---- Document Workspace Injection ---- */
  function loadDocWorkspace() {
    if (window.AKDocs) {
      AKDocs.embedFor('employee-doc-workspace', { entityType: 'employee', entityId: 'E01', entityName: 'Vikram Rao' });
    }
  }

  /* ---- Document Propagation Listener ---- */
  document.addEventListener('ak-doc-propagated', function(e) {
    const { docId, fieldIndex, newVal } = e.detail;
    // Check if it's an appraisal adjustment or certification updates
    if (docId === 'D01' || docId === 'D02') { 
      if (newVal.includes('L') || !isNaN(parseFloat(newVal))) {
        const ctcField = document.getElementById('emp-ctc-field');
        const ctcGrid = document.getElementById('valgrid-ctc');
        if (ctcField) {
          ctcField.innerHTML = newVal + ' <span class="good-text">(Adjusted to market P75)</span>';
          ctcField.className = 'good-text';
          ctcField.style.animation = 'flashSuccess 1.5s';
          if (ctcGrid) ctcGrid.textContent = newVal;
          AK.toast('Salary rate records updated in Darwinbox ledger!');
        }
      }
    }
  });

  /* ---- CEO Attrition Highlight ---- */
  function applyCEOHighlight() {
    if (!window.AK) return;
    const persona = AK.getPersona();
    const riskPanel = document.getElementById('employee-risk-panel');
    if (persona === 'ceo' && riskPanel) {
      riskPanel.style.border = '2px solid var(--critical-line)';
      riskPanel.style.boxShadow = '0 0 16px oklch(0.55 0.18 25 / 0.12)';
      riskPanel.querySelector('.panel-head').style.background = 'var(--critical-soft)';
      
      const head = riskPanel.querySelector('.panel-head');
      if (head && !document.getElementById('ceo-risk-tag')) {
        const tag = document.createElement('span');
        tag.id = 'ceo-risk-tag';
        tag.className = 'badge b-risk';
        tag.style.marginLeft = '8px';
        tag.innerHTML = 'CEO Attention Required';
        head.appendChild(tag);
      }
    }
  }

  /* ---- Inject Stage Tracker Styles ---- */
  function injectLocalStyles() {
    if (document.getElementById('emp-local-styles')) return;
    const s = document.createElement('style');
    s.id = 'emp-local-styles';
    s.textContent = `
.lifecycle-stages { display: flex; align-items: center; justify-content: space-between; gap: 8px; position: relative; padding: 10px 0; }
.stage-node { flex: 1; display: flex; flex-direction: column; align-items: center; cursor: pointer; position: relative; }
.stage-dot-wrap { width: 100%; display: flex; align-items: center; position: relative; margin-bottom: 6px; }
.stage-dot-wrap::before { content: ""; position: absolute; height: 3px; background: var(--line-2); left: 0; right: 0; top: 50%; transform: translateY(-50%); z-index: 1; }
.stage-node:first-child .stage-dot-wrap::before { left: 50%; }
.stage-node:last-child .stage-dot-wrap::before { right: 50%; }
.stage-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--surface); border: 2.5px solid var(--line-strong); margin: 0 auto; z-index: 2; position: relative; transition: all 0.2s; }
.stage-node.done .stage-dot { background: var(--good); border-color: var(--good); }
.stage-node.done .stage-dot-wrap::before { background: var(--good-line); }
.stage-node.active .stage-dot { background: var(--critical); border-color: var(--critical); box-shadow: 0 0 0 4px var(--critical-soft); }
.stage-label { font-size: 11px; font-weight: 700; color: var(--ink-3); text-align: center; }
.stage-node.active .stage-label { color: var(--critical); }
.stage-node.selected .stage-label { text-decoration: underline; }
.stage-node:hover .stage-dot { transform: scale(1.2); }
@keyframes flashSuccess {
  0% { background: var(--good-soft); }
  100% { background: transparent; }
}
`;
    document.head.appendChild(s);
  }

  function init() {
    injectLocalStyles();
    renderStages();
    loadDocWorkspace();
    applyCEOHighlight();
  }

  window.AKEmployee = { selectStage };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
