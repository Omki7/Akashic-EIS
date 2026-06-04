/* ProjectProfile.js — rendering for Orion Commerce Rollout 360 */
(function () {
  const $=s=>document.querySelector(s);

  /* ---- A: Lifecycle Stages ---- */
  const STAGES = [
    { id: 'pipeline', label: '1. Proposal & Ingest', desc: 'Contract SOW-04 uploaded, OCR field validation, rate approvals.', date: '18 Nov 2024', status: 'done', owner: 'Priya Nair', system: 'Salesforce CRM + Tally' },
    { id: 'kickoff', label: '2. Staffing & Kickoff', desc: 'Resource staffing allocations, kickoff deck validation, team onboarded.', date: '02 Jan 2025', status: 'done', owner: 'Karthik Menon', system: 'Zoho PSA + Darwinbox' },
    { id: 'active-delivery', label: '3. Active Delivery', desc: 'Sprint delivery cycles, burn-down monitoring, monthly timesheet audits.', date: 'In Progress', status: 'active', owner: 'Sneha Pillai', system: 'Zoho PSA + NetSuite' },
    { id: 'change-mgmt', label: '4. Scope Changes', desc: 'Change request CR-03 review, billing additions, scope expansion.', date: 'Upcoming', status: 'upcoming', owner: 'Priya Nair', system: 'Salesforce CRM' },
    { id: 'milestone-completion', label: '5. Accrual & Billing', desc: 'Milestone validation, billing trigger generation, NetSuite ledger sync.', date: 'Upcoming', status: 'upcoming', owner: 'Devika Rao', system: 'Tally / NetSuite' },
    { id: 'closure', label: '6. Closure & Support', desc: 'Project hypercare completion, support handover, lessons learned audit.', date: 'Upcoming', status: 'upcoming', owner: 'Karthik Menon', system: 'SAP ERP' }
  ];

  function renderStages() {
    const el = document.getElementById('p-stages');
    if (!el) return;
    el.innerHTML = STAGES.map(s => {
      const cls = s.status === 'done' ? 'done' : s.status === 'active' ? 'active' : 'upcoming';
      return `
        <div class="stage-node ${cls}" onclick="AKProject.selectStage('${s.id}')">
          <div class="stage-dot-wrap"><div class="stage-dot"></div></div>
          <div class="stage-label">${s.label}</div>
        </div>
      `;
    }).join('');

    // Select active stage by default
    selectStage('active-delivery');
  }

  function selectStage(id) {
    document.querySelectorAll('.stage-node').forEach((node, i) => {
      node.classList.toggle('selected', STAGES[i].id === id);
    });
    
    const s = STAGES.find(x => x.id === id);
    const detail = document.getElementById('p-stage-detail');
    if (detail && s) {
      const statusBadge = s.status === 'done' ? 'b-active' : s.status === 'active' ? 'b-renewal' : 'b-prospect';
      detail.innerHTML = `
        <div class="flex items-center justify-between mb-8">
          <b style="font-size:14px;color:var(--ink)">${s.label}</b>
          <span class="badge ${statusBadge}"><span class="bd"></span>${s.status}</span>
        </div>
        <p class="fs-13 muted mb-8">${s.desc}</p>
        <div class="flex justify-between items-center wrap gap-12 fs-12" style="border-top:1px dashed var(--line);padding-top:8px">
          <div>Owner: <b>${s.owner}</b></div>
          <div>Integrates: <span class="mono" style="color:var(--accent-2)">${s.system}</span></div>
          <div class="faint">Updated: ${s.date}</div>
        </div>
      `;
    }
    const badge = document.getElementById('p-stage-badge');
    if (badge && s) {
      badge.innerHTML = `<span class="bd"></span>${s.label.split('. ')[1]}`;
    }
  }

  /* ---- B: Milestones table ---- */
  const milestones = [
    ['M1','Architecture design','₹60 L','Jan 2025','done','paid'],
    ['M2','UI/UX sign-off','₹58 L','Mar 2025','done','paid'],
    ['M3','Frontend beta','₹72 L','May 2025','done','paid'],
    ['M4','Backend integration','₹88 L','Aug 2025','done','paid'],
    ['M5','Integration test','₹74 L','Oct 2025','done','paid'],
    ['M6','UAT sign-off','₹96 L','Jan 2026','done','paid'],
    ['M7','Performance & go/no-go','₹1.1 Cr','Apr 2026','delayed','outstanding'],
    ['M8','Pre-launch hardening','₹96 L','Jun 2026','upcoming','unbilled'],
    ['M9','Go-live','₹1.1 Cr','Sep 2026','upcoming','unbilled'],
    ['M10','Hypercare month 1','₹48 L','Oct 2026','upcoming','unbilled'],
    ['M11','Project closure','₹28 L','Nov 2026','upcoming','unbilled'],
  ];
  const mt = document.getElementById('milestones');
  if (mt) mt.innerHTML = `<thead><tr><th>MS</th><th>Description</th><th class="r">Value</th><th>Due</th><th>Status</th><th>Invoice</th></tr></thead>
    <tbody>${milestones.map(m => {
      const sc = m[4]==='done'?'b-active':m[4]==='delayed'?'b-risk':'b-prospect';
      const ic = m[5]==='paid'?'b-active':m[5]==='outstanding'?'b-renewal':m[5]==='unbilled'?'b-prospect':'b-risk';
      return `<tr><td class="cell-mono strong">${m[0]}</td><td class="cell-sub" style="color:var(--ink-2)">${m[1]}</td>
        <td class="r cell-mono">${m[2]}</td><td class="cell-mono fs-12">${m[3]}</td>
        <td><span class="badge ${sc}" style="padding:0 8px"><span class="bd"></span>${m[4]}</span></td>
        <td><span class="badge ${ic}" style="padding:0 8px"><span class="bd"></span>${m[5]}</span>
          ${m[5]==='outstanding'||m[5]==='unbilled'?`<button class="btn xs" style="margin-left:4px" onclick="AKActions.compose({type:'RAISE_INVOICE',entityType:'project',entityId:'P01',entityName:'Orion Commerce Rollout',prefill:{milestone:'${m[0]}',amount:'${m[2]}'}})">Raise</button>`:''}
        </td></tr>`;
    }).join('')}</tbody>`;

  /* ---- B: Change requests ---- */
  const crs = [
    { id:'CR-01', title:'Add loyalty module', impact:'+₹22 L', status:'approved', date:'Mar 2025' },
    { id:'CR-02', title:'Expand data residency scope', impact:'+₹16 L', status:'approved', date:'Nov 2025' },
    { id:'CR-03', title:'Additional UAT cycles ×2', impact:'+₹18 L', status:'pending', date:'May 2026' },
  ];
  const crd = document.getElementById('crs');
  if (crd) crd.innerHTML = crs.map(c => `<div class="proj" style="padding:10px 12px">
    <div class="flex items-center gap-8"><b class="mono fs-12">${c.id}</b>
      <span class="badge ${c.status==='approved'?'b-active':'b-renewal'}" style="padding:0 7px"><span class="bd"></span>${c.status}</span>
      <span class="mono fs-11 faint" style="margin-left:auto">${c.date}</span></div>
    <div class="fs-13 mt-4">${c.title}</div>
    <div class="flex items-center gap-8 mt-4"><b class="good-text mono">${c.impact}</b>
      ${c.status==='pending'?`<button class="btn xs primary" onclick="AKActions.compose({type:'APPROVE_CR',entityType:'project',entityId:'P01',entityName:'Orion Commerce Rollout',prefill:{crTitle:'${c.title}',impact:'${c.impact}'}})">Approve</button>`:''}
    </div>
  </div>`).join('');

  /* ---- C: Burn-down chart ---- */
  const planned = [0, 1.6, 3.2, 4.8, 6.4, 7.6, 8.8, 9.6, 9.6];
  const actual  = [0, 1.5, 3.4, 5.1, 6.5, 7.2, 8.0, 8.26];
  const eac     = [null,null,null,null,null,null,null, 8.26, 8.8, 9.4, 10.22];
  const W = 100, H = 120, MAX = 10.6;
  function line(pts, color, dash) {
    const start = pts.findIndex(v => v !== null);
    const startPts = pts.slice(start).filter(v => v !== null).map((v,i) => `${((i+start)/(pts.length-1)*W).toFixed(1)},${(H - v/MAX*H).toFixed(1)}`);
    return `<polyline points="${startPts.join(' ')}" fill="none" stroke="${color}" stroke-width="${dash?1.4:1.8}" stroke-dasharray="${dash?'4,3':''}" vector-effect="non-scaling-stroke"/>`;
  }
  const bd = document.getElementById('burndown');
  if (bd) bd.innerHTML = `<svg viewBox="0 0 100 120" preserveAspectRatio="none" style="width:100%;height:140px;border-bottom:1px solid var(--line-2);border-left:1px solid var(--line-2)">
    ${line(planned,'var(--accent)',true)}${line(actual,'var(--critical)',false)}${line(eac,'var(--warn)',true)}</svg>`;

  /* ---- D: Team ---- */
  const team = [
    { name:'Vikram Rao',     role:'Lead Architect', pct:64, risk:'crit', spof:true,  since:'Jan 2025', eid:'E01' },
    { name:'Arjun Bhat',     role:'QA Lead',        pct:30, risk:'good', spof:false, since:'Jan 2025', eid:'E08' },
    { name:'Priya Sharma',   role:'Frontend Dev',   pct:60, risk:'good', spof:false, since:'Feb 2026', eid:'E10' },
    { name:'Kavya Sharma',   role:'Business Analyst',pct:40,risk:'good', spof:false, since:'Jan 2025', eid:'E09' },
  ];
  const td = document.getElementById('team');
  if (td) td.innerHTML = team.map(t => `<div class="exp-row">
    <a href="EmployeeProfile.html">${AK.avatar(t.name,'sm')}</a>
    <div style="flex:1;min-width:0">
      <div class="flex items-center gap-6">
        <a href="EmployeeProfile.html" class="exp-name accent-text">${t.name}</a>
        ${t.spof ? '<span class="spof">⚑ SPOF</span>' : ''}
      </div>
      <div class="exp-role">${t.role} · ${t.pct}% alloc · since ${t.since}</div>
    </div>
    <div class="exp-util"><div class="flex justify-between fs-11 faint mb-4"><span>alloc</span><b style="color:var(--ink-2)">${t.pct}%</b></div>
      <div class="meter ${t.risk}"><i style="width:${t.pct}%"></i></div></div>
    <span class="hdot ${t.risk}"></span>
    <button class="btn xs" onclick="AKActions.compose({type:'FLAG_SUCCESSION',entityType:'employee',entityId:'${t.eid}',entityName:'${t.name}'})">Plan shadow</button>
  </div>`).join('');

  /* ---- E: Risks ---- */
  const risks = [
    { severity:'crit', title:'Key-person dependency', desc:'Vikram Rao is sole architect. Exit = delivery halt.' },
    { severity:'warn', title:'Scope creep unpriced',  desc:'CR-03 ×2 UAT cycles pending approval — ₹18 L risk.' },
    { severity:'warn', title:'Client UAT delays',     desc:'M7 sign-off held by client. Nexora impact = SLA breach.' },
  ];
  const rd = document.getElementById('risks');
  if (rd) rd.innerHTML = risks.map(r => `<div class="flex items-start gap-9 p-8" style="padding:8px;border:1px solid var(--line);border-radius:8px">
    <span class="hdot ${r.severity}" style="margin-top:3px;flex:0 0 auto"></span>
    <div><b class="fs-13">${r.title}</b><div class="exp-role mt-2">${r.desc}</div></div>
  </div>`).join('');

  /* ---- Document Workspace Injection ---- */
  function loadDocWorkspace() {
    if (window.AKDocs) {
      AKDocs.embedFor('project-doc-workspace', { entityType: 'project', entityId: 'P01', entityName: 'Orion Commerce Rollout' });
    }
  }

  /* ---- Document Propagation Listener ---- */
  document.addEventListener('ak-doc-propagated', function(e) {
    const { docId, fieldIndex, newVal } = e.detail;
    if (docId === 'D02') { // SOW-04 Orion
      if (newVal.includes('Cr') || newVal.includes('L') || !isNaN(parseFloat(newVal))) {
        const budgetField = document.getElementById('p-bac-field');
        if (budgetField) {
          budgetField.innerHTML = newVal;
          budgetField.style.animation = 'flashSuccess 1.5s';
          budgetField.style.color = 'var(--good)';
          AK.toast('BAC budget updated dynamically to ' + newVal);
          
          // Re-forecast estimation completion
          const eacField = document.getElementById('p-eac-field');
          const marginField = document.getElementById('p-margin-field');
          if (eacField && marginField) {
            eacField.innerHTML = '₹10.02 Cr <span style="font-size:11px">(-₹20 L overrun reduction)</span>';
            marginField.innerHTML = '16.4%';
            marginField.className = 'good-text';
          }
        }
      }
    }
  });

  /* ---- CFO Highlight Styles ---- */
  function applyCFOHighlight() {
    if (!window.AK) return;
    const persona = AK.getPersona();
    const finPanel = document.getElementById('project-fin-panel');
    if (persona === 'cfo' && finPanel) {
      finPanel.style.border = '2px solid var(--composite-line)';
      finPanel.style.boxShadow = '0 0 16px oklch(0.47 0.15 295 / 0.12)';
      finPanel.querySelector('.panel-head').style.background = 'var(--composite-soft)';
      
      const head = finPanel.querySelector('.panel-head');
      if (head && !document.getElementById('cfo-project-focus-tag')) {
        const tag = document.createElement('span');
        tag.id = 'cfo-project-focus-tag';
        tag.className = 'badge b-composite';
        tag.style.marginLeft = '8px';
        tag.innerHTML = 'CFO High-Priority Review';
        head.appendChild(tag);
      }
    }
  }

  /* ---- Inject Stage Tracker Styles ---- */
  function injectLocalStyles() {
    if (document.getElementById('p-local-styles')) return;
    const s = document.createElement('style');
    s.id = 'p-local-styles';
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
.stage-node.active .stage-dot { background: var(--accent); border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }
.stage-label { font-size: 11px; font-weight: 700; color: var(--ink-3); text-align: center; }
.stage-node.active .stage-label { color: var(--accent-2); }
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
    applyCFOHighlight();
  }

  window.AKProject = { selectStage };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
