/* Client 360 Profile — data + rendering */
(function(){
const $=s=>document.querySelector(s);

/* ---------- A · CLIENT LIFECYCLE STAGES ---------- */
const STAGES = [
  { id: 'sourcing', label: '1. Onboarding', desc: 'Initial Master Agreement ingestion and business setup completed.', date: '18 Mar 2019', status: 'done', owner: 'Priya Nair', system: 'Salesforce CRM' },
  { id: 'active', label: '2. Managed Delivery', desc: 'Execution of multiple SOWs, managed support, and platform migration projects.', date: '14 May 2023', status: 'done', owner: 'Sneha Pillai', system: 'Zoho PSA' },
  { id: 'expansion', label: '3. Scope Expansion', desc: 'SOW-04 Orion commerce signed and initiated. ₹9.6 Cr value added.', date: '02 Jan 2025', status: 'done', owner: 'Priya Nair', system: 'Salesforce CRM' },
  { id: 'renewal-risk', label: '4. Renewal Decision', desc: 'MSA expiring in 18 days. No SOW in pipeline. Attrition risk triggers review.', date: 'Critical Gate', status: 'active', owner: 'Arjun Mehta', system: 'Akashic Models' },
  { id: 'renewed', label: '5. Partner Retention', desc: 'Next SOW approved and synced to Salesforce. Contract lock enabled.', date: 'Upcoming', status: 'upcoming', owner: 'Devika Rao', system: 'NetSuite' }
];

function renderStages() {
  const el = document.getElementById('c-stages');
  if (!el) return;
  el.innerHTML = STAGES.map(s => {
    const cls = s.status === 'done' ? 'done' : s.status === 'active' ? 'active' : 'upcoming';
    return `
      <div class="stage-node ${cls}" onclick="AKProfile.selectStage('${s.id}')">
        <div class="stage-dot-wrap"><div class="stage-dot"></div></div>
        <div class="stage-label">${s.label}</div>
      </div>
    `;
  }).join('');

  // Default to active stage
  selectStage('renewal-risk');
}

function selectStage(id) {
  document.querySelectorAll('.stage-node').forEach((node, i) => {
    node.classList.toggle('selected', STAGES[i].id === id);
  });
  
  const s = STAGES.find(x => x.id === id);
  const detail = document.getElementById('c-stage-detail');
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
        <div class="faint">Status: ${s.date}</div>
      </div>
    `;
  }
  const badge = document.getElementById('c-stage-badge');
  if (badge && s) {
    badge.innerHTML = `<span class="bd"></span>${s.label.split('. ')[1]}`;
  }
}

/* ---------- B · CONTRACTS ---------- */
const conf=(lvl,v)=>lvl==='verified'?`<span class="conf verified">✓</span>`:`<span class="conf ${lvl}"><span class="cbar"><i style="width:${lvl==='lo'?68:lvl==='md'?82:93}%"></i></span>${v}</span>`;

function renderContracts() {
  if (!window.AKData) return;
  const contracts = [
    {type:'MSA',sv:'Master agreement · all services',val:'—',vc:'verified',s:'18 Mar 2019',e:AKData.contracts[0].end || '22 Jun 2026',ec:'lo',ev:'0.71',auto:'No',auc:'verified',st:'b-renewal',stl:'Renewal'},
    {type:'SOW-04',sv:'Orion commerce rollout',val:'₹9.6 Cr',vc:'verified',s:'02 Jan 2025',e:'30 Sep 2026',ec:'verified',ev:'✓',auto:'No',auc:'md',st:'b-active',stl:'Active'},
    {type:'SOW-03',sv:'Managed support · platform',val:'₹4.1 Cr/yr',vc:'md',vv:'0.84',s:'01 Apr 2024',e:'31 Mar 2027',ec:'verified',ev:'✓',auto:'Yes',auc:'verified',st:'b-active',stl:'Active'},
    {type:'Addendum A2',sv:'Data residency clause',val:'—',vc:'verified',s:'15 Nov 2024',e:'—',ec:'verified',ev:'✓',auto:'—',auc:'verified',st:'b-active',stl:'Active'},
    {type:'SOW-02',sv:'Atlas migration (closed)',val:'₹6.2 Cr',vc:'verified',s:'10 Feb 2022',e:'20 Aug 2023',ec:'verified',ev:'✓',auto:'No',auc:'verified',st:'b-churned',stl:'Expired'},
  ];
  $('#contract-tbl tbody').innerHTML=contracts.map(c=>`<tr>
    <td><span class="cell-strong mono">${c.type}</span></td>
    <td class="cell-sub" style="color:var(--ink-2)">${c.sv}</td>
    <td class="r cell-mono cell-strong">${c.val}</td>
    <td class="cell-mono">${c.s}</td>
    <td><div class="flex items-center gap-8"><span class="cell-mono">${c.e}</span>${c.ec==='verified'?'':conf(c.ec,c.ev)}</div></td>
    <td>${c.auto==='Yes'?'<span class="badge b-active" style="padding:1px 8px"><span class="bd"></span>Yes</span>':`<span class="muted">${c.auto}</span>`}</td>
    <td><span class="badge ${c.st}"><span class="bd"></span>${c.stl}</span></td>
    <td><a class="btn xs" onclick="AK.toast('Opening source document with extraction overlay')">View source</a></td>
  </tr>`).join('');
}

/* ---------- C · REVENUE CHART + WATERFALL ---------- */
function renderCharts() {
  const rev=[78,82,88,72,95,110,86,120,140,98,132,150,118,160,142,175,138,168,190,205,178,212,196,224];
  const ms=[3,8,13,17,21];
  const maxR=Math.max(...rev);
  let bars='';
  rev.forEach((v,i)=>{ bars+=`<div class="rc-bar ${ms.includes(i)?'ms':''}" style="height:${(v/maxR*100).toFixed(1)}%" title="₹${v} L"></div>`; });
  
  let cum=0; const cumPts=rev.map((v,i)=>{cum+=v; return cum;});
  const cmax=Math.max(...cumPts);
  const W=100,H=160;
  const path=cumPts.map((c,i)=>`${(i/(rev.length-1)*W).toFixed(2)},${(H-(c/cmax)*(H-20)-6).toFixed(2)}`).join(' ');
  $('#revchart').innerHTML=bars+`<svg class="ltv-line" viewBox="0 0 100 160" preserveAspectRatio="none"><polyline points="${path}" fill="none" stroke="var(--composite)" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`;

  const wf=[['Booked','₹68.4 Cr',100,'var(--accent)'],['Billed','₹58.9 Cr',86,'var(--composite)'],['Collected','₹52.1 Cr',76,'var(--good)']];
  $('#waterfall').innerHTML=wf.map(w=>`<div class="wf-col"><div class="wf-v">${w[1]}</div><div class="wf-bar" style="height:${w[2]}%;background:${w[3]}"></div><div class="wf-l">${w[0]}</div></div>`).join('');
}

/* ---------- D · PROJECTS ---------- */
const projects=[
  {n:'Orion Rollout',st:'crit',stl:'At-Risk',budget:86,margin:'14%',mc:'warn-text',days:'11 days behind',lead:'Vikram Rao',ms:'7 / 11'},
  {n:'Helix Managed Support',st:'good',stl:'On-track',budget:54,margin:'31%',mc:'good-text',days:'On schedule',lead:'Sneha Pillai',ms:'continuous'},
  {n:'Atlas Data Sync',st:'warn',stl:'Watch',budget:72,margin:'22%',mc:'',days:'4 days behind',lead:'Imran Q.',ms:'9 / 12'},
  {n:'Insights Dashboard',st:'good',stl:'On-track',budget:41,margin:'34%',mc:'good-text',days:'Ahead',lead:'Sneha Pillai',ms:'3 / 6'},
];
$('#projects').innerHTML=projects.map(p=>`<div class="proj">
  <div class="proj-top"><span class="hdot ${p.st}"></span><a href="ProjectProfile.html" class="proj-name accent-text">${p.n}</a><span class="badge ${p.st==='crit'?'b-risk':p.st==='warn'?'b-renewal':'b-active'}" style="margin-left:auto;padding:1px 8px"><span class="bd"></span>${p.stl}</span></div>
  <div class="proj-grid">
    <div><div class="pg-l">Budget used</div><div class="pg-v ${p.budget>80?'crit-text':''}">${p.budget}%</div><div class="meter ${p.budget>80?'crit':p.budget>65?'warn':'good'}" style="margin-top:4px"><i style="width:${p.budget}%"></i></div></div>
    <div><div class="pg-l">Margin</div><div class="pg-v ${p.mc}">${p.margin}</div></div>
    <div><div class="pg-l">Milestones</div><div class="pg-v">${p.ms}</div></div>
  </div>
  <div class="proj-res"><span class="avatar sm gray" style="width:18px;height:18px;font-size:8px">${p.lead.split(' ').map(x=>x[0]).join('')}</span>Lead: ${p.lead} · ${p.days}</div>
</div>`).join('');

/* ---------- E · EMPLOYEE EXPOSURE ---------- */
const exposure=[
  {n:'Vikram Rao',r:'Lead Architect',util:96,risk:'crit',ten:'4.2 yrs',spof:true},
  {n:'Sneha Pillai',r:'Delivery Manager',util:88,risk:'good',ten:'2.1 yrs',spof:false},
  {n:'Imran Qureshi',r:'Sr. Data Engineer',util:92,risk:'warn',ten:'1.8 yrs',spof:false},
  {n:'Lena Fischer',r:'Onsite Coordinator (Dallas)',util:80,risk:'good',ten:'3.0 yrs',spof:false},
  {n:'Arjun Bhat',r:'QA Lead',util:74,risk:'good',ten:'1.1 yrs',spof:false},
];
$('#exposure').innerHTML=exposure.map(e=>`<div class="exp-row">
  <a href="EmployeeProfile.html">${AK.avatar(e.n,'sm')}</a>
  <div style="flex:1;min-width:0"><div class="flex items-center gap-6"><a href="EmployeeProfile.html" class="exp-name accent-text">${e.n}</a>${e.spof?'<span class="spof" style="margin-left:4px">⚑ SPOF · 64%</span>':''}</div><div class="exp-role">${e.r} · ${e.ten} on account</div></div>
  <div class="exp-util"><div class="flex justify-between fs-11 faint" style="margin-bottom:3px"><span>util</span><b style="color:var(--ink-2)">${e.util}%</b></div><div class="meter ${e.util>90?'crit':e.util>80?'warn':'good'}"><i style="width:${e.util}%"></i></div></div>
  <span class="hdot ${e.risk}" title="Attrition risk"></span>
</div>`).join('');

/* ---------- F · GEO + TXN ---------- */
const geo=[['United States','#2563a8',52,'₹7.4 Cr'],['India (delivery)','#3a7a55',31,'₹4.4 Cr'],['Germany','#5a4f9e',17,'₹2.4 Cr']];
$('#geo').innerHTML=geo.map(g=>`<div class="geo-row"><span class="geo-name">${g[0]}</span><div class="geo-bar"><i style="width:${g[2]}%;background:${g[1]}"></i></div><span class="geo-pct">${g[3]} · ${g[2]}%</span></div>`).join('');
const txns=[
  ['28 May 26','INV-2026-0412','SOW-04 · Orion M7','₹1.20 Cr','b-renewal','Outstanding'],
  ['12 May 26','INV-2026-0388','SOW-03 · Support Q1','₹1.03 Cr','b-active','Paid'],
  ['30 Apr 26','INV-2026-0351','SOW-04 · Orion M6','₹0.96 Cr','b-active','Paid'],
  ['14 Mar 26','INV-2026-0309','SOW-03 · Support','₹1.03 Cr','b-risk','Overdue 90+'],
  ['28 Feb 26','INV-2026-0276','SOW-04 · Orion M5','₹1.10 Cr','b-active','Paid'],
];
$('#txn tbody').innerHTML=txns.map(t=>`<tr><td class="cell-mono">${t[0]}</td><td class="cell-mono accent-text">${t[1]}</td><td class="cell-sub" style="color:var(--ink-2)">${t[2]}</td><td class="r cell-mono cell-strong">${t[3]}</td><td><span class="badge ${t[4]}" style="padding:1px 8px"><span class="bd"></span>${t[5]}</span></td></tr>`).join('');

/* ---------- G · Document Workspace ---------- */
function loadDocWorkspace() {
  if (window.AKDocs) {
    AKDocs.embedFor('client-doc-workspace', { entityType: 'client', entityId: 'C01', entityName: 'Meridian Retail Group' });
  }
}

/* ---- Document Propagation Listener ---- */
document.addEventListener('ak-doc-propagated', function(e) {
  const { docId, newVal } = e.detail;
  if (docId === 'D01') { // MSA
    AK.toast('MSA Expiring date validated: ' + newVal + '. Partnership stage refreshed.');
    renderContracts();
  }
});

/* ---- Inject Stage Tracker Styles ---- */
function injectLocalStyles() {
  if (document.getElementById('c-local-styles')) return;
  const s = document.createElement('style');
  s.id = 'c-local-styles';
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
.stage-node.active .stage-dot { background: var(--warn); border-color: var(--warn); box-shadow: 0 0 0 4px var(--warn-soft); }
.stage-label { font-size: 11px; font-weight: 700; color: var(--ink-3); text-align: center; }
.stage-node.active .stage-label { color: var(--warn); }
.stage-node.selected .stage-label { text-decoration: underline; }
.stage-node:hover .stage-dot { transform: scale(1.2); }
`;
  document.head.appendChild(s);
}

function init() {
  injectLocalStyles();
  renderStages();
  renderContracts();
  renderCharts();
  loadDocWorkspace();
}

window.AKProfile = { selectStage };

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
})();
