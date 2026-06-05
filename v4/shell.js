/* ============================================================
   Akashic EIS — shell.js v3
   Shared app shell: sidebar · topbar · decisions bar
   v3: Full persona-aware experience across 7 dimensions:
       sidebar order, primary pillar, role-shaped decisions,
       per-persona pulse/brief/feed/rail/notifs,
       Cross-Persona Handoff Protocol
   ============================================================ */
(function () {

  /* ---- Icons ---- */
  const I = {
    home:     '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M9.5 20v-6h5v6"/>',
    clients:  '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 4v16"/>',
    projects: '<path d="M4 5h16v4H4z"/><path d="M4 13h10v6H4z"/><path d="M17 13h3v6h-3z"/>',
    people:   '<circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><circle cx="17.5" cy="9" r="2.3"/><path d="M16 20a4.5 4.5 0 0 1 5.5-4.4"/>',
    finance:  '<path d="M3 20h18"/><path d="M6 20V10"/><path d="M11 20V5"/><path d="M16 20v-7"/><path d="M21 20v-4"/>',
    docs:     '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 13h6"/><path d="M9 16.5h6"/>',
    ai:       '<path d="M12 3v3"/><rect x="5" y="6" width="14" height="11" rx="3"/><circle cx="9.5" cy="11.5" r="1.2"/><circle cx="14.5" cy="11.5" r="1.2"/><path d="M9 21h6"/><path d="M12 17v4"/>',
    approvals:'<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
    search:   '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell:     '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    bolt:     '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    check:    '<path d="M20 6 9 17l-5-5"/>',
    chev:     '<path d="m9 6 6 6-6 6"/>',
    open:     '<path d="M7 17 17 7M9 7h8v8"/>',
    link:     '<path d="M9 15 15 9"/><path d="M10 6l1-1a4 4 0 0 1 6 6l-1 1"/><path d="M14 18l-1 1a4 4 0 0 1-6-6l1-1"/>',
    workflow: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H15a3 3 0 0 1 3 3v6"/>',
    audit:    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    sync:     '<path d="M20 8A8 8 0 0 0 4.9 4.9"/><path d="M4 20a8 8 0 0 0 15.1-3.1"/><path d="M20 4v4h-4"/><path d="M4 20v-4h4"/>',
    plug:     '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2z"/>',
    flag:     '<path d="M5 21V4"/><path d="M5 4h12l-2.5 4L17 12H5"/>',
    assign:   '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M18 8v6M15 11h6"/>',
    close:    '<path d="M18 6 6 18M6 6l12 12"/>',
    route:    '<path d="M5 9V5h4"/><path d="M5 5l6 6"/><path d="M19 15v4h-4"/><path d="M19 19l-6-6"/>',
    handoff:  '<path d="M9 12h6"/><path d="M15 8l4 4-4 4"/><path d="M3 6h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3"/>',
    horizon:  '<path d="M3 12h18"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/><path d="M3 6v12M21 6v12"/>',
    decisions:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    pipeline: '<path d="M3 6h18"/><path d="M6 12h12"/><path d="M9 18h6"/>',
    skills:   '<path d="M12 2 4 6v6c0 5 3.5 7.5 8 10 4.5-2.5 8-5 8-10V6z"/><path d="M9 12l2 2 4-4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 3.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 3.6h.09A1.65 1.65 0 0 0 9 2.09V2a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 14 3.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20.4 8v.09c.66.1 1.2.55 1.51 1.51"/>',
  };
  function icon(name, cls) {
    return `<svg class="${cls||''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${I[name]||''}</svg>`;
  }
  window.AK = { icon, I };

  /* ---- Employee photos ---- */
  const EMPLOYEE_PHOTOS = {
    'Vikram Rao': 'img/vikram_rao.png',
    'Sneha Pillai': 'img/sneha_pillai.png',
    'Priya Nair': 'img/priya_nair.png',
    'Ananya Krishnan': 'img/ananya_krishnan.png',
    'Meera Nair': 'img/meera_nair.png',
    'Arjun Bhat': 'img/arjun_bhat.png',
    'Rahul Sethi': 'img/rahul_sethi.png',
    'Imran Qureshi': 'img/imran_qureshi.png',
    'Lena Fischer': 'img/lena_fischer.png',
    'Karthik Menon': 'img/karthik_menon.png',
    'Priya Sharma': 'img/priya_nair.png',
    'Kavya Sharma': 'img/ananya_krishnan.png',
    'Kavya Iyer': 'img/ananya_krishnan.png',
    'Rohan Desai': 'img/arjun_bhat.png',
    'Anil Kapoor': 'img/karthik_menon.png',
    'Devika Rao': 'img/meera_nair.png',
    'Arjun Mehta': 'img/imran_qureshi.png',
  };
  window.AK.PHOTOS = EMPLOYEE_PHOTOS;
  window.AK.avatar = function(name, cls) {
    const p = EMPLOYEE_PHOTOS[name];
    const initials = name.split(' ').map(x=>x[0]).join('');
    if (p) return `<span class="avatar ${cls||'sm'}"><img src="${p}" alt="${name}" onerror="this.parentElement.innerHTML='${initials}'"></span>`;
    return `<span class="avatar ${cls||'sm'} gray">${initials}</span>`;
  };

  /* ---- Integrations ---- */
  const INTEG_ICONS = {
    salesforce: '<svg viewBox="0 0 20 20" fill="none"><path d="M5 12.5c0-2.2 1.8-4 4-4 1.3 0 2.4.6 3.1 1.5.5-.3 1.1-.5 1.7-.5 2 0 3.7 1.7 3.7 3.7 0 2-1.7 3.7-3.7 3.7H5.5C3.6 17 2 15.4 2 13.5c0-1.6 1.1-2.9 2.5-3.3L5 12.5z" fill="#00A1E0"/></svg>',
    sap:        '<svg viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="10" rx="2" fill="#0070F2"/><text x="10" y="12.5" text-anchor="middle" fill="#fff" font-size="6" font-weight="800" font-family="sans-serif">SAP</text></svg>',
    darwinbox:  '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" fill="#7B2D8E"/><path d="M7 10l2 2 4-4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    tally:      '<svg viewBox="0 0 20 20" fill="none"><rect x="4" y="4" width="12" height="12" rx="3" fill="#E8712B"/><path d="M8 8v4M10 7v5M12 9v3" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/></svg>',
    psa:        '<svg viewBox="0 0 20 20" fill="none"><polygon points="10,3 17,7 17,13 10,17 3,13 3,7" fill="#2563A8"/><text x="10" y="12" text-anchor="middle" fill="#fff" font-size="5" font-weight="700" font-family="sans-serif">PSA</text></svg>',
  };
  const INTEGRATIONS = [
    { id:'salesforce', label:'Salesforce', status:'live', lastSync:'2 min ago',  color:'#00A1E0' },
    { id:'sap',        label:'SAP ERP',    status:'live', lastSync:'8 min ago',  color:'#0070F2' },
    { id:'darwinbox',  label:'Darwinbox',  status:'live', lastSync:'5 min ago',  color:'#7B2D8E' },
    { id:'tally',      label:'Tally',      status:'lag',  lastSync:'42 min ago', color:'#E8712B' },
    { id:'psa',        label:'PSA',        status:'live', lastSync:'1 min ago',  color:'#2563A8' },
  ];

  /* ---- Navigation ---- */
  const NAV_PRIMARY = [
    { id:'home',      label:'Home',        ico:'home',      href:'Home.html' },
    { id:'assistant', label:'Ask Akashic', ico:'ai',        href:'Assistant.html' },
    { id:'horizon',   label:'Horizon',     ico:'horizon',   href:'Horizon.html' },
    { id:'decisions', label:'My Decisions',ico:'decisions', href:'Decisions.html', badge:'3' },
    { id:'approvals', label:'Approvals',   ico:'approvals', href:'Approvals.html', badge:'5', alert:true },
  ];

  const NAV_PILLARS_BASE = [
    { id:'clients',   label:'Clients',    ico:'clients',  href:'Clients.html',    pillar:'P1', badge:'48' },
    { id:'pipeline',  label:'Pipeline',   ico:'pipeline', href:'Pipeline.html',   pillar:'P2', badge:'18' },
    { id:'projects',  label:'Projects',   ico:'projects', href:'Projects.html',   pillar:'P3', badge:'31' },
    { id:'employees', label:'Employees',  ico:'people',   href:'Employees.html',  pillar:'P4', badge:'1,840' },
    { id:'skills',    label:'Skills',     ico:'skills',   href:'Skills.html',     pillar:'P5', badge:'gap' },
    { id:'financials',label:'Financials', ico:'finance',  href:'Financials.html', pillar:'P6', badge:'₹142Cr' },
  ];

  /* Per-persona pillar order and designations */
  const PILLAR_CONFIG = {
    ceo: { order:['clients','pipeline','projects','employees','skills','financials'], primary:'clients',   secondary:['skills'] },
    cfo: { order:['financials','clients','projects','pipeline','employees','skills'], primary:'financials', secondary:['employees','skills'] },
    dh:  { order:['projects','employees','skills','pipeline','clients','financials'], primary:'projects',  secondary:['financials'] },
  };

  function getPersonaPillars(persona) {
    const cfg = PILLAR_CONFIG[persona] || PILLAR_CONFIG.ceo;
    return cfg.order.map(id => ({
      ...NAV_PILLARS_BASE.find(n => n.id === id),
      isPrimary:   id === cfg.primary,
      isSecondary: cfg.secondary.includes(id),
    }));
  }

  const NAV_TRUST = [
    { id:'documents', label:'Documents', ico:'docs', href:'Documents.html', badge:'14', alert:true },
    { id:'integrations', label:'Integration Health', ico:'plug', href:'IntegrationHealth.html', badge:'2', alert:true },
  ];

  const NAV_GOVERN = [
    { id:'settings', label:'Settings & Admin', ico:'settings', href:'Settings.html' },
  ];

  /* All personas land on Home — Home renders the right lens */
  const PERSONAS = [
    { id:'ceo', label:'CEO',           home:'Home.html', color:'var(--accent)' },
    { id:'cfo', label:'CFO',           home:'Home.html', color:'var(--composite)' },
    { id:'dh',  label:'Delivery Head', home:'Home.html', color:'var(--good)' },
  ];
  const PERSONA_USER = {
    ceo: { name:'Arjun Mehta',   role:'Chief Executive',  init:'AM' },
    cfo: { name:'Devika Rao',    role:'Chief Financial',  init:'DR' },
    dh:  { name:'Karthik Menon', role:'Head of Delivery', init:'KM' },
  };

  /* ---- Per-persona primary decisions ---- */
  /* When Decisions bar is shown on an entity page, the persona's
     signature verb is promoted to the primary (filled) button.   */
  const PERSONA_PRIMARY_ACTION = {
    ceo: { client:'ESCALATE',         project:'ESCALATE',   employee:'RETENTION_ACTION', portfolio:'ESCALATE' },
    cfo: { client:'RAISE_INVOICE',    project:'REFORECAST', employee:'APPROVE_HIKE',     portfolio:'RAISE_INVOICE' },
    dh:  { client:'RAISE_RENEWAL_SOW',project:'APPROVE_CR', employee:'REDEPLOY',         portfolio:'APPROVE_CR' },
  };

  /* ---- Per-persona notifications ---- */
  const PERSONA_NOTIFS = {
    ceo: [
      { id:1, read:false, icon:'crit', title:'Meridian renewal: 18 days',        sub:'3 cross-pillar risks converging. ₹14.2 Cr at stake.',                href:'ClientProfile.html',   time:'2 min ago' },
      { id:2, read:false, icon:'crit', title:'Concentration: top-3 hit 31% ARR', sub:'Board threshold breached — above 30% policy limit.',                href:'Clients.html',          time:'9 min ago' },
      { id:3, read:false, icon:'warn', title:'Vikram Rao: high-value exit risk',  sub:'88% exit signal. SPOF on flagship account.',                        href:'EmployeeProfile.html',  time:'1 hr ago' },
      { id:4, read:false, icon:'warn', title:'Hanseatic sponsor changed in Apr',  sub:'Cohort renewal rate 67%. Sentiment on last 2 MoMs trending down.',  href:'ClientProfile.html',   time:'2 hr ago' },
      { id:5, read:true,  icon:'good', title:'Cobalt Energy: verbal SOW yes',     sub:'₹5.1 Cr expansion — paperwork in flight.',                          href:'ClientProfile.html',   time:'3 hr ago' },
      { id:6, read:true,  icon:'good', title:'Rev/Employee up 6.2% QoQ',          sub:'AI-augmented delivery model showing results.',                       href:'Home.html',             time:'Yesterday' },
    ],
    cfo: [
      { id:1, read:false, icon:'crit', title:'Northwind ₹2.4 Cr — 90+ days',    sub:'INV-2026-0309 crossed 90 days. Legal dunning recommended.',          href:'Financials.html',       time:'Now' },
      { id:2, read:false, icon:'crit', title:'Unbilled WIP: ₹48 L on Meridian',  sub:'M8 milestone delivered. Invoice not yet raised — leakage.',          href:'Financials.html',       time:'30 min ago' },
      { id:3, read:false, icon:'warn', title:'DSO at 58 days — target ≤52',      sub:'Working capital trapped. Resolving 2 clients unlocks ₹2.8 Cr.',      href:'Financials.html',       time:'1 hr ago' },
      { id:4, read:false, icon:'warn', title:'Margin compressed 1.1pt QoQ',       sub:'Digital practice at 19%. Bench cost drag.',                          href:'PracticePL.html',       time:'2 hr ago' },
      { id:5, read:true,  icon:'good', title:'Cobalt milestone: ₹1.03 Cr cleared',sub:'INV-2026-0388 settled & reconciled. DSO improving.',                 href:'Financials.html',       time:'4 hr ago' },
      { id:6, read:true,  icon:'good', title:'SAP sync back on schedule',          sub:'Revenue reforecast data now live in system.',                        href:'Approvals.html',        time:'Yesterday' },
    ],
    dh: [
      { id:1, read:false, icon:'crit', title:'Orion Rollout — 11 days late',      sub:'Budget 86% used at 64% scope. Margin 14% and falling.',             href:'Projects.html',         time:'Now' },
      { id:2, read:false, icon:'crit', title:'Vikram Rao — SPOF, no shadow',      sub:'88% exit signal. Sole architect on Orion Rollout. Act today.',       href:'EmployeeProfile.html',  time:'15 min ago' },
      { id:3, read:false, icon:'warn', title:'Atlas Migration: ₹62 L overrun',    sub:'Burn trajectory confirmed. Milestone 9 of 12 at 78% budget.',        href:'Projects.html',         time:'1 hr ago' },
      { id:4, read:false, icon:'warn', title:'SLA breach risk: Vermillion Helix',  sub:'Uptime 99.2% vs 99.5% SLA. One incident triggers penalty clause.',  href:'Projects.html',         time:'2 hr ago' },
      { id:5, read:true,  icon:'good', title:'Bench match: 6 engineers → pipeline',sub:'Data Eng pod (34d idle) matches Cobalt + Indus pursuits.',          href:'Employees.html',        time:'3 hr ago' },
      { id:6, read:true,  icon:'good', title:'Cobalt Data Lake on track',           sub:'34% margin, 52% utilization. No flags.',                            href:'Projects.html',         time:'Yesterday' },
    ],
  };

  /* ---- Handoff store (Cross-Persona Handoff Protocol) ---- */
  function getHandoffs() {
    try { return JSON.parse(sessionStorage.getItem('ak_handoffs') || '[]'); } catch { return []; }
  }
  function saveHandoffs(arr) {
    try { sessionStorage.setItem('ak_handoffs', JSON.stringify(arr)); } catch {}
  }

  /* Build effective notif list = persona notifs + inbound handoffs */
  function getEffectiveNotifs(persona) {
    const base = (PERSONA_NOTIFS[persona] || []).map(n => ({ ...n }));
    const handoffs = getHandoffs().filter(h => h.to === persona && !h.read);
    const fromUser = { ceo:'Arjun', cfo:'Devika', dh:'Karthik' };
    const handoffNotifs = handoffs.map(h => ({
      id: 'ho-' + h.id,
      read: false,
      icon: 'warn',
      isHandoff: true,
      fromName: fromUser[h.from] || h.from,
      title: `↗ Routed by ${fromUser[h.from]}: ${h.title}`,
      sub: h.note ? `"${h.note}"` : `Needs your attention — routed from ${fromUser[h.from]}'s feed.`,
      href: 'Assistant.html?handoff=' + h.id,
      time: h.time,
    }));
    return [...handoffNotifs, ...base];
  }

  /* ---- Nav item builder ---- */
  function navItem(it, active) {
    const badge = it.badge
      ? `<span class="nav-badge ${it.alert?'alert':''}">${it.badge}</span>`
      : it.pillar ? `<span class="pillar-tag">${it.pillar}</span>` : '';
    const star = it.isPrimary ? '<span class="pillar-star">★</span>' : '';
    const cls = [
      'nav-item',
      active === it.id ? 'active' : '',
      it.isPrimary   ? 'nav-primary-pillar' : '',
      it.isSecondary ? 'nav-secondary-pillar' : '',
    ].filter(Boolean).join(' ');
    return `<a class="${cls}" href="${it.href}">
      ${icon(it.ico,'nav-ico')}<span>${it.label}</span>${star}${badge}</a>`;
  }

  /* ---- Sidebar builder ---- */
  function buildSidebar(screen, persona) {
    const u = PERSONA_USER[persona] || PERSONA_USER.ceo;
    const pillars = getPersonaPillars(persona);
    const syncDot = INTEGRATIONS.some(i=>i.status==='lag')
      ? '<span class="sync-lag" title="One integration behind"></span>' : '';

    /* Split pillars into primary group and secondary/collapsed group */
    const primaryPillars   = pillars.filter(p => !p.isSecondary);
    const secondaryPillars = pillars.filter(p => p.isSecondary);

    return `
    <div class="brand">
      <div class="brand-mark">A</div>
      <div><div class="brand-name">Akashic</div><div class="brand-sub">NEXORA · EIS</div></div>
    </div>
    <div class="nav-group">
      ${NAV_PRIMARY.map(n=>navItem(n,screen)).join('')}
    </div>
    <div class="nav-group">
      <div class="nav-label">Pillars</div>
      ${primaryPillars.map(n=>navItem(n,screen)).join('')}
      ${secondaryPillars.length ? `
        <div class="nav-secondary-divider">More</div>
        ${secondaryPillars.map(n=>navItem(n,screen)).join('')}
      ` : ''}
    </div>
    ${persona === 'cfo' ? `<div class="nav-group">
      <div class="nav-label">Workspaces</div>
      <a class="nav-item ${screen==='collections'?'active':''}" href="Collections.html" style="border-left:2px solid var(--composite)">
        ${icon('finance','nav-ico')}<span>Collections</span><span class="nav-badge alert">₹5.2Cr</span></a>
    </div>` : ''}
    <div class="nav-group">
      <div class="nav-label">Trust Layer</div>
      ${NAV_TRUST.map(n=>navItem(n,screen)).join('')}
    </div>
    <div class="nav-group">
      <div class="nav-label">Governance</div>
      ${NAV_GOVERN.map(n=>navItem(n,screen)).join('')}
    </div>
    <div class="nav-group" style="margin-top:auto;padding-top:4px">
      <div class="nav-label">Connected Systems ${syncDot}</div>
      <div class="integ-list">
        ${INTEGRATIONS.map(i=>`<div class="integ-row" title="${i.label} · last sync ${i.lastSync}">
          <span class="integ-icon">${INTEG_ICONS[i.id]||''}</span>
          <span class="integ-dot" style="background:${i.status==='live'?'var(--good)':'var(--warn)'}"></span>
          <span class="integ-name">${i.label}</span>
          <span class="integ-time">${i.lastSync}</span></div>`).join('')}
      </div>
    </div>
    <div class="sidebar-foot">
      <div class="user-chip" onclick="AK.toggleUserMenu(event)">
        <div class="avatar" style="border:2px solid ${PERSONAS.find(pp=>pp.id===persona).color}">${EMPLOYEE_PHOTOS[u.name] ? `<img src="${EMPLOYEE_PHOTOS[u.name]}" alt="${u.name}" onerror="this.parentElement.textContent='${u.init}'">` : u.init}</div>
        <div style="min-width:0"><div style="font-weight:600;font-size:13px;line-height:1.2">${u.name}</div>
          <div style="font-size:11px;color:var(--ink-3)">${u.role}</div></div>
        ${icon('chev','nav-ico')}
      </div>
    </div>`;
  }

  /* ---- Topbar builder ---- */
  function buildTopbar(screen, persona, crumb) {
    const crumbHtml = (crumb||'').split('/').map((c,i,a)=>{
      const last = i === a.length - 1;
      return `${i>0?'<span class="sep">›</span>':''}${last?`<b>${c.trim()}</b>`:`<span>${c.trim()}</span>`}`;
    }).join('');
    const notifs = getEffectiveNotifs(persona);
    const unreadCount = notifs.filter(n=>!n.read).length;
    return `
    <div class="crumbs">${crumbHtml}</div>
    <button class="topbar-search" onclick="AK.openPalette()" title="⌘K">
      ${icon('search','')} <span class="tsq-text">Search anything…</span><span class="kbd">⌘K</span>
    </button>
    <div class="topbar-spacer"></div>
    <button class="icon-btn" id="notif-btn" title="Notifications" onclick="AK.toggleNotifs()">
      ${unreadCount > 0 ? '<span class="dot"></span>' : ''}${icon('bell')} <span>Notifications</span>
      ${unreadCount > 0 ? `<span class="notif-count">${unreadCount}</span>` : ''}
    </button>`;
  }

  /* ---- Decisions bar — context-aware + persona-primary verb ---- */
  function buildDecisions(entityType, entityId, entityName) {
    const persona = window.AK.getPersona ? window.AK.getPersona() : 'ceo';
    const et = entityType || 'portfolio';
    const eid = entityId || '';
    const en = entityName || '';

    const maps = {
      client:   [['RAISE_INVOICE','Raise invoice'],['RAISE_RENEWAL_SOW','Renewal SOW'],['COLLECTION_ACTION','Collection action'],['REFORECAST','Re-forecast'],['ESCALATE','Escalate']],
      project:  [['RAISE_INVOICE','Raise invoice'],['APPROVE_CR','Approve CR'],['REFORECAST','Re-forecast margin'],['FLAG_SUCCESSION','Succession plan'],['ESCALATE','Escalate']],
      employee: [['RETENTION_ACTION','Retention action'],['REDEPLOY','Redeploy'],['APPROVE_HIKE','Approve hike'],['FLAG_SUCCESSION','Succession plan']],
      portfolio:[['REFORECAST','Re-forecast'],['RAISE_INVOICE','Raise invoice'],['ESCALATE','Escalate'],['APPROVE_CR','Approve CR']],
    };

    const allActions = maps[et] || maps.portfolio;
    const personaPrimary = (PERSONA_PRIMARY_ACTION[persona] || {})[et];

    /* Sort so persona-primary action is first */
    const sorted = personaPrimary
      ? [...allActions].sort((a, b) => a[0]===personaPrimary ? -1 : b[0]===personaPrimary ? 1 : 0)
      : allActions;

    const btns = sorted.map(([t, label], i) =>
      `<button class="btn sm ${i===0?'primary':''}" onclick="AKActions&&AKActions.compose({type:'${t}',entityType:'${et}',entityId:'${eid}',entityName:'${en}'})">${label}</button>`
    ).join('');

    return `
      <div class="db-label">${icon('bolt')} Decisions${en ? ' · <b>'+en+'</b>' : ''}</div>
      <div class="db-actions">${btns}
        <button class="btn sm" onclick="AKDocs&&AKDocs.openFor({entityType:'${et}',entityId:'${eid}',entityName:'${en||'entity'}'})">
          ${icon('docs','')} Documents</button>
        <button class="btn sm" onclick="location.href='Approvals.html'">
          ${icon('approvals','')} Approvals</button>
      </div>
      <div class="audit" style="margin-left:auto;font-size:11px;color:var(--ink-3);font-family:var(--mono);display:flex;align-items:center;gap:6px">
        ${icon('audit','')} Audited · last: 2m ago
        <span id="sync-status" class="sync-ok">● synced</span></div>`;
  }

  /* ---- Command palette ---- */
  const PALETTE_ITEMS = [
    { type:'nav',     label:'Home',                  hint:'Intelligence Feed',   href:'Home.html' },
    { type:'nav',     label:'Clients',               hint:'Portfolio view',       href:'Clients.html' },
    { type:'nav',     label:'Meridian Retail 360',   hint:'Client profile',       href:'ClientProfile.html' },
    { type:'nav',     label:'Projects',              hint:'Health dashboard',     href:'Projects.html' },
    { type:'nav',     label:'Financials',            hint:'CFO view',             href:'Financials.html' },
    { type:'nav',     label:'Employees',             hint:'People lens',          href:'Employees.html' },
    { type:'nav',     label:'Ask Akashic',           hint:'AI Assistant',         href:'Assistant.html' },
    { type:'nav',     label:'Approvals',             hint:'Pending actions',      href:'Approvals.html' },
    { type:'nav',     label:'Documents',             hint:'Validation queue',     href:'Documents.html' },
    { type:'action',  label:'Raise milestone invoice',hint:'Billing → Tally',    action:'RAISE_INVOICE' },
    { type:'action',  label:'Create renewal SOW',    hint:'CRM → Salesforce',    action:'RAISE_RENEWAL_SOW' },
    { type:'action',  label:'Re-forecast revenue',   hint:'ERP → SAP',           action:'REFORECAST' },
    { type:'action',  label:'Initiate retention',    hint:'HRMS → Darwinbox',    action:'RETENTION_ACTION' },
    { type:'action',  label:'Collection action',     hint:'Billing + CRM',       action:'COLLECTION_ACTION' },
    { type:'action',  label:'Approve change request',hint:'PSA → Zoho',          action:'APPROVE_CR' },
    { type:'client',  label:'Meridian Retail Group', hint:'₹14.2 Cr · Renewal',  href:'ClientProfile.html' },
    { type:'client',  label:'Hanseatic Bank',        hint:'₹11.8 Cr · Renewal',  href:'ClientProfile.html' },
    { type:'client',  label:'Cobalt Energy',         hint:'₹9.3 Cr · Active',    href:'ClientProfile.html' },
    { type:'project', label:'Orion Commerce Rollout',hint:'Overdue · Meridian',  href:'Projects.html' },
    { type:'project', label:'Atlas Migration',       hint:'At-risk · Sundara',   href:'Projects.html' },
    { type:'employee',label:'Vikram Rao',            hint:'88% exit risk',        href:'EmployeeProfile.html' },
  ];

  function openPalette() {
    if (document.getElementById('ak-palette')) return;
    const div = document.createElement('div');
    div.id = 'ak-palette-overlay';
    div.innerHTML = buildPaletteHTML();
    document.body.appendChild(div);
    setTimeout(()=>{ const inp=document.getElementById('ak-palette-input'); inp&&inp.focus(); }, 30);
    div.addEventListener('click', e=>{ if(e.target.id==='ak-palette-overlay') closePalette(); });
  }
  function buildPaletteHTML() {
    return `<div id="ak-palette">
      <div class="pal-input-row">${icon('search','')} <input id="ak-palette-input" placeholder="Search clients, projects, people, actions…" oninput="AK.filterPalette(this.value)" onkeydown="AK.paletteKey(event)" /></div>
      <div class="pal-list" id="ak-palette-list">${renderPaletteItems(PALETTE_ITEMS)}</div>
      <div class="pal-foot">↑↓ navigate · Enter to open · Esc close · <kbd>⌘K</kbd> toggle</div>
    </div>`;
  }
  function renderPaletteItems(items) {
    const typeIcon = { nav:'→', action:'⚡', client:'◉', project:'▦', employee:'⊙' };
    return items.map((it,i)=>`<div class="pal-item ${i===0?'sel':''}" data-idx="${i}" onclick="AK.runPaletteItem(${i})" onmouseenter="AK.selectPaletteItem(${i})">
      <span class="pal-ico">${typeIcon[it.type]||'·'}</span>
      <span class="pal-label">${it.label}</span>
      <span class="pal-hint">${it.hint}</span>
      ${it.type==='action'?`<span class="pal-tag">action</span>`:''}
    </div>`).join('');
  }
  let _palFiltered = [...PALETTE_ITEMS];
  let _palSel = 0;
  function filterPalette(q) {
    _palSel = 0;
    _palFiltered = q ? PALETTE_ITEMS.filter(it=>it.label.toLowerCase().includes(q.toLowerCase())||it.hint.toLowerCase().includes(q.toLowerCase())) : [...PALETTE_ITEMS];
    const list = document.getElementById('ak-palette-list');
    if (list) list.innerHTML = renderPaletteItems(_palFiltered);
  }
  function selectPaletteItem(i) {
    _palSel = i;
    document.querySelectorAll('.pal-item').forEach((el,j)=>el.classList.toggle('sel',j===i));
  }
  function paletteKey(e) {
    if (e.key==='Escape') { closePalette(); return; }
    if (e.key==='ArrowDown') { selectPaletteItem(Math.min(_palSel+1,_palFiltered.length-1)); e.preventDefault(); }
    if (e.key==='ArrowUp')   { selectPaletteItem(Math.max(_palSel-1,0)); e.preventDefault(); }
    if (e.key==='Enter') runPaletteItem(_palSel);
  }
  function runPaletteItem(i) {
    const it = _palFiltered[i];
    if (!it) return;
    closePalette();
    if (it.href) window.location.href = it.href;
    else if (it.action && window.AKActions) AKActions.compose({ type:it.action, entityType:'portfolio', entityId:'', entityName:'' });
  }
  function closePalette() {
    const el = document.getElementById('ak-palette-overlay');
    if (el) el.remove();
  }

  /* ---- Notifications panel ---- */
  let _notifsOpen = false;
  function toggleNotifs() {
    if (_notifsOpen) { closeNotifs(); return; }
    closeNotifs();
    const persona = window.AK.getPersona ? window.AK.getPersona() : 'ceo';
    const notifs = getEffectiveNotifs(persona);
    const panel = document.createElement('div');
    panel.id = 'ak-notifs';
    const unread = notifs.filter(n=>!n.read).length;
    panel.innerHTML = `
      <div class="nf-head">
        <b>Notifications</b>
        ${unread ? `<span class="badge b-risk" style="padding:0 7px"><span class="bd"></span>${unread} new</span>` : ''}
        <button class="btn xs ghost" style="margin-left:auto" onclick="AK.markAllRead()">Mark all read</button>
      </div>
      ${notifs.map(n=>`<a class="nf-item ${n.read?'read':''} ${n.isHandoff?'nf-handoff':''}" href="${n.href}">
        <span class="hdot ${n.icon}" style="flex:0 0 auto;margin-top:3px"></span>
        <div style="flex:1;min-width:0">
          <div class="nf-title">${n.title}</div>
          <div class="nf-sub">${n.sub}</div>
        </div>
        <span class="nf-time">${n.time}</span>
      </a>`).join('')}
      <div class="nf-foot"><a href="Approvals.html">View all approvals →</a></div>`;
    document.body.appendChild(panel);
    _notifsOpen = true;
    setTimeout(()=>document.addEventListener('click', _closeNotifsOutside), 10);
  }
  function _closeNotifsOutside(e) {
    const p = document.getElementById('ak-notifs');
    const btn = document.getElementById('notif-btn');
    if (p && !p.contains(e.target) && e.target !== btn && !btn.contains(e.target)) closeNotifs();
  }
  function closeNotifs() {
    const el = document.getElementById('ak-notifs');
    if (el) el.remove();
    _notifsOpen = false;
    document.removeEventListener('click', _closeNotifsOutside);
  }
  function markAllRead() {
    const persona = window.AK.getPersona ? window.AK.getPersona() : 'ceo';
    if (PERSONA_NOTIFS[persona]) PERSONA_NOTIFS[persona].forEach(n=>n.read=true);
    /* mark handoffs read too */
    const handoffs = getHandoffs().map(h => h.to === persona ? { ...h, read:true } : h);
    saveHandoffs(handoffs);
    const btn = document.getElementById('notif-btn');
    if (btn) { const d = btn.querySelector('.dot'); if (d) d.style.display='none'; const c = btn.querySelector('.notif-count'); if(c) c.remove(); }
    closeNotifs(); toggleNotifs();
  }

  /* ---- Cross-Persona Handoff Protocol ---- */
  function openHandoffPanel(signalTitle, entityRef, sourceCardId) {
    closeHandoffPanel();
    const persona = window.AK.getPersona ? window.AK.getPersona() : 'ceo';
    const others = PERSONAS.filter(p => p.id !== persona);
    const fromUser = PERSONA_USER[persona];

    const overlay = document.createElement('div');
    overlay.id = 'ak-handoff-overlay';
    overlay.innerHTML = `
      <div class="ho-panel">
        <div class="ho-head">
          <div>
            <div class="ho-eyebrow">Cross-Persona Handoff Protocol</div>
            <div class="ho-title">Route this signal to a colleague</div>
          </div>
          <button onclick="AK.closeHandoffPanel()" style="background:none;border:0;cursor:pointer;color:var(--ink-3);font-size:18px;padding:4px">✕</button>
        </div>
        <div class="ho-signal">
          <span class="ho-signal-ico">⚡</span>
          <div style="min-width:0;flex:1">
            <div style="font-weight:700;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${signalTitle}</div>
            <div style="font-size:11.5px;color:var(--ink-3);margin-top:2px">Routing from <b>${fromUser.name}</b> · ${fromUser.role}</div>
          </div>
        </div>
        <div class="ho-body">
          <div class="ho-label">Route to</div>
          <div class="ho-personas">
            ${others.map(p => {
              const u = PERSONA_USER[p.id];
              return `<button class="ho-persona-btn" data-pid="${p.id}" onclick="AK._selectHandoffPersona('${p.id}')">
                <span class="avatar sm" style="background:${p.color};color:#fff">${u.init}</span>
                <div style="text-align:left;min-width:0">
                  <div style="font-weight:700;font-size:13px">${u.name}</div>
                  <div style="font-size:11px;color:var(--ink-3)">${u.role}</div>
                </div>
              </button>`;
            }).join('')}
          </div>
          <div class="ho-label" style="margin-top:14px">Add a note <span style="color:var(--ink-faint);font-weight:400">(optional)</span></div>
          <textarea id="ho-note" class="ho-note" placeholder="e.g. Please assess resource impact — this ties to Meridian delivery risk"></textarea>
        </div>
        <div class="ho-footer">
          <button class="btn ghost sm" onclick="AK.closeHandoffPanel()">Cancel</button>
          <button class="btn primary sm" id="ho-send-btn" onclick="AK._submitHandoff('${signalTitle}','${sourceCardId || ''}')">Route signal ›</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeHandoffPanel(); });
    /* Select first persona by default */
    if (others[0]) window.AK._selectedHandoffTo = others[0].id;
    const firstBtn = overlay.querySelector('.ho-persona-btn');
    if (firstBtn) firstBtn.classList.add('selected');
  }

  window.AK._selectedHandoffTo = null;
  window.AK._selectHandoffPersona = function(pid) {
    window.AK._selectedHandoffTo = pid;
    document.querySelectorAll('.ho-persona-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.pid === pid);
    });
  };
  window.AK._submitHandoff = function(title, sourceCardId) {
    const to = window.AK._selectedHandoffTo;
    if (!to) return;
    const from = window.AK.getPersona ? window.AK.getPersona() : 'ceo';
    const note = (document.getElementById('ho-note') || {}).value || '';
    const fromUser = PERSONA_USER[from];
    const toUser = PERSONA_USER[to];

    const handoff = {
      id: 'HO-' + Math.floor(1000 + Math.random() * 9000),
      from, to, title, note,
      fromName: fromUser.name,
      toName: toUser.name,
      time: 'Just now',
      read: false,
      context: {
        entity: title,
        fromRole: fromUser.role,
        toRole: toUser.role,
      },
    };

    const existing = getHandoffs();
    existing.unshift(handoff);
    saveHandoffs(existing);

    /* Mark the source card as handed off */
    if (sourceCardId) {
      const card = document.getElementById(sourceCardId);
      if (card) {
        card.classList.add('feed-card-handedoff');
        const tag = document.createElement('div');
        tag.className = 'handoff-tag';
        tag.innerHTML = `${icon('route','')} Routed to <b>${toUser.name}</b>`;
        card.prepend(tag);
      }
    }

    closeHandoffPanel();
    AK.toast(`Routed to ${toUser.name} · they'll see it in their feed`);
  };

  function closeHandoffPanel() {
    const el = document.getElementById('ak-handoff-overlay');
    if (el) el.remove();
  }

  /* ---- User / Persona menu ---- */
  let _userMenuOpen = false;
  function toggleUserMenu(e) {
    if (e) e.stopPropagation();
    if (_userMenuOpen) { closeUserMenu(); return; }
    closeUserMenu();

    const panel = document.createElement('div');
    panel.id = 'ak-user-menu';
    panel.style.cssText = 'position:fixed;bottom:70px;left:14px;width:224px;background:var(--surface);border:1px solid var(--line-2);border-radius:var(--r);box-shadow:var(--shadow-lg);z-index:450;overflow:hidden;padding:6px 0;display:flex;flex-direction:column;gap:2px';

    const title = document.createElement('div');
    title.style.cssText = 'padding:6px 12px;font-size:10px;font-weight:700;color:var(--ink-faint);text-transform:uppercase;letter-spacing:0.05em';
    title.innerText = 'Switch Role / Persona';
    panel.appendChild(title);

    const activePersona = window.AK.getPersona();
    PERSONAS.forEach(p => {
      const u = PERSONA_USER[p.id];
      const btn = document.createElement('button');
      btn.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 12px;background:none;border:0;width:100%;text-align:left;cursor:pointer;font-family:var(--sans);transition:background .12s;box-sizing:border-box';
      if (activePersona === p.id) btn.style.background = 'var(--accent-soft)';
      btn.innerHTML = `
        <span class="avatar sm" style="border:2px solid ${p.color};width:24px;height:24px;font-size:9.5px;color:#fff">${EMPLOYEE_PHOTOS[u.name] ? `<img src="${EMPLOYEE_PHOTOS[u.name]}" alt="${u.name}" onerror="this.parentElement.textContent='${u.init}'">` : u.init}</span>
        <div style="min-width:0;flex:1">
          <div style="font-weight:600;font-size:12.5px;color:var(--ink);line-height:1.2">${u.name}</div>
          <div style="font-size:10.5px;color:var(--ink-3)">${u.role}</div>
        </div>
        ${activePersona === p.id ? icon('check', 'accent-text') : ''}
      `;
      btn.onclick = () => { closeUserMenu(); window.AK.setPersona(p.id); };
      btn.onmouseenter = () => { if (activePersona !== p.id) btn.style.background = 'var(--hover)'; };
      btn.onmouseleave = () => { if (activePersona !== p.id) btn.style.background = 'none'; };
      panel.appendChild(btn);
    });

    document.body.appendChild(panel);
    _userMenuOpen = true;
    setTimeout(() => document.addEventListener('click', _closeUserMenuOutside), 10);
  }
  function _closeUserMenuOutside(e) {
    const p = document.getElementById('ak-user-menu');
    const chip = document.querySelector('.user-chip');
    if (p && !p.contains(e.target) && (!chip || !chip.contains(e.target))) closeUserMenu();
  }
  function closeUserMenu() {
    const el = document.getElementById('ak-user-menu');
    if (el) el.remove();
    _userMenuOpen = false;
    document.removeEventListener('click', _closeUserMenuOutside);
  }

  /* ---- Persona switching — all land on Home ---- */
  window.AK.setPersona = function(id) {
    try { localStorage.setItem('ak_persona', id); } catch {}
    window.location.href = 'Home.html';
  };

  /* ---- Toast ---- */
  window.AK.toast = function(msg) {
    let t = document.getElementById('ak-toast');
    if (!t) {
      t = document.createElement('div'); t.id='ak-toast';
      t.style.cssText = 'position:fixed;bottom:74px;left:50%;transform:translateX(-50%);z-index:700;background:var(--ink);color:#fff;padding:10px 16px;border-radius:10px;font-size:13px;font-weight:600;box-shadow:var(--shadow-lg);display:flex;align-items:center;gap:9px;opacity:0;transition:opacity .18s,transform .18s;pointer-events:none;max-width:480px;text-align:center';
      document.body.appendChild(t);
    }
    t.innerHTML = icon('check') + '<span>' + msg + '</span>';
    requestAnimationFrame(()=>{ t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(-4px)'; });
    clearTimeout(t._tm); t._tm = setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(-50%)'; }, 2600);
  };

  /* ---- Keyboard shortcuts ---- */
  function initShortcuts() {
    document.addEventListener('keydown', e => {
      if ((e.metaKey||e.ctrlKey) && e.key==='k') { e.preventDefault(); openPalette(); }
      if (e.key==='Escape') { closePalette(); closeNotifs(); closeUserMenu(); closeHandoffPanel(); }
    });
  }

  /* ---- Custom tooltips ---- */
  function initTooltips() {
    document.addEventListener('mouseover', function(e) {
      const el = e.target.closest('[title],[data-tip],.pop-info');
      if (!el || el._customTip) return;
      let text = el.getAttribute('data-tip') || el.getAttribute('title');
      if (!text && el.classList.contains('pop-info')) text = el.getAttribute('title') || 'Information';
      if (!text) return;
      if (el.hasAttribute('title')) { el.setAttribute('data-original-title', el.getAttribute('title')); el.removeAttribute('title'); }
      const tip = document.createElement('div');
      tip.className = 'ak-tip';
      tip.textContent = text;
      document.body.appendChild(tip);
      const rect = el.getBoundingClientRect();
      const tw = tip.offsetWidth;
      let left = rect.left + window.scrollX + (rect.width - tw) / 2;
      let top = rect.bottom + window.scrollY + 6;
      if (left < 6) left = 6;
      if (left + tw > window.innerWidth - 6) left = window.innerWidth - tw - 6;
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
      el._customTip = tip;
    });
    document.addEventListener('mouseout', function(e) {
      const el = e.target.closest('[data-original-title],[data-tip],.pop-info');
      if (!el) return;
      if (e.relatedTarget && el.contains(e.relatedTarget)) return;
      if (el.hasAttribute('data-original-title')) { el.setAttribute('title', el.getAttribute('data-original-title')); el.removeAttribute('data-original-title'); }
      if (el._customTip) { el._customTip.remove(); el._customTip = null; }
    });
    document.addEventListener('click', () => document.querySelectorAll('.ak-tip').forEach(t=>t.remove()));
  }

  /* ---- Shell styles ---- */
  function injectShellStyles() {
    if (document.getElementById('shell-ext')) return;
    const s = document.createElement('style');
    s.id = 'shell-ext';
    s.textContent = `
/* Topbar search */
.topbar-search{display:flex;align-items:center;gap:8px;background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r);padding:7px 11px;color:var(--ink-3);font-size:13px;cursor:pointer;flex:0 1 340px;font-family:var(--sans)}
.topbar-search:hover{border-color:var(--line-strong);background:var(--hover)}
.tsq-text{flex:1;text-align:left}
.kbd{font-family:var(--mono);font-size:10.5px;color:var(--ink-faint);border:1px solid var(--line-2);border-radius:4px;padding:1px 5px}
.notif-count{font-family:var(--mono);font-size:10px;font-weight:700;background:var(--critical);color:#fff;border-radius:10px;padding:1px 6px;margin-left:2px}

/* Primary pillar star */
.pillar-star{font-size:9px;color:var(--accent);margin-left:auto;margin-right:-4px;opacity:0.8}
.nav-primary-pillar .pillar-star{color:var(--accent-2)}
.nav-secondary-pillar{opacity:0.65}
.nav-secondary-divider{font-size:9.5px;font-weight:700;color:var(--ink-faint);text-transform:uppercase;letter-spacing:0.09em;padding:8px 10px 4px 22px;margin-top:2px}

/* Integrations */
.integ-list{padding:6px 0}
.integ-row{display:flex;align-items:center;gap:7px;padding:5px 10px;font-size:11.5px;border-radius:6px;transition:background .1s}
.integ-row:hover{background:var(--hover)}
.integ-icon{width:20px;height:20px;flex:0 0 auto;display:flex;align-items:center;justify-content:center}
.integ-icon svg{width:20px;height:20px}
.integ-dot{width:6px;height:6px;border-radius:50%;flex:0 0 auto}
.integ-name{flex:1;color:var(--ink-2);font-weight:600}
.integ-time{font-family:var(--mono);font-size:10px;color:var(--ink-faint)}
.sync-lag{width:7px;height:7px;border-radius:50%;background:var(--warn);display:inline-block;margin-left:4px}
.sync-ok{color:var(--good);font-weight:600}

/* Command palette */
#ak-palette-overlay{position:fixed;inset:0;background:oklch(0.2 0.01 265 / 0.36);z-index:800;display:flex;align-items:flex-start;justify-content:center;padding-top:14vh}
#ak-palette{background:var(--surface);border:1px solid var(--line-2);border-radius:var(--r-xl);box-shadow:var(--shadow-lg);width:100%;max-width:580px;overflow:hidden}
.pal-input-row{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--line)}
.pal-input-row svg{flex:0 0 auto;color:var(--ink-3);width:18px;height:18px}
#ak-palette-input{flex:1;border:0;outline:none;font-family:var(--sans);font-size:16px;color:var(--ink);background:none}
.pal-list{max-height:380px;overflow-y:auto}
.pal-item{display:flex;align-items:center;gap:10px;padding:11px 16px;cursor:pointer;font-size:13.5px}
.pal-item.sel,.pal-item:hover{background:var(--accent-soft)}
.pal-ico{width:20px;color:var(--ink-faint);font-size:13px;text-align:center}
.pal-label{font-weight:600;flex:1}
.pal-hint{color:var(--ink-3);font-size:12px}
.pal-tag{font-size:10px;font-weight:700;background:var(--accent-soft);color:var(--accent-2);border:1px solid var(--accent-line);padding:1px 6px;border-radius:5px;font-family:var(--mono)}
.pal-foot{padding:9px 16px;border-top:1px solid var(--line);font-size:11.5px;color:var(--ink-faint);background:var(--surface-2)}

/* Notifications */
#ak-notifs{position:fixed;top:60px;right:12px;width:380px;background:var(--surface);border:1px solid var(--line-2);border-radius:var(--r-xl);box-shadow:var(--shadow-lg);z-index:450;overflow:hidden}
.nf-head{display:flex;align-items:center;gap:8px;padding:13px 15px 11px;border-bottom:1px solid var(--line);font-size:14px}
.nf-item{display:flex;align-items:flex-start;gap:10px;padding:11px 15px;border-bottom:1px solid var(--line);text-decoration:none;color:inherit;transition:background .1s}
.nf-item:hover{background:var(--surface-2)}
.nf-item.read{opacity:.55}
.nf-item.nf-handoff{background:var(--composite-soft);}
.nf-item.nf-handoff:hover{background:oklch(0.95 0.03 290);}
.nf-title{font-weight:600;font-size:13px;margin-bottom:2px}
.nf-sub{font-size:11.5px;color:var(--ink-3);line-height:1.4}
.nf-time{font-size:10.5px;color:var(--ink-faint);white-space:nowrap;font-family:var(--mono);flex:0 0 auto}
.nf-foot{padding:10px 15px;background:var(--surface-2);font-size:12.5px;font-weight:600}
.nf-foot a{color:var(--accent-2)}

/* Cross-Persona Handoff Panel */
#ak-handoff-overlay{position:fixed;inset:0;background:oklch(0.2 0.01 265 / 0.42);z-index:600;display:flex;align-items:center;justify-content:center;padding:24px}
.ho-panel{background:var(--surface);border-radius:var(--r-xl);box-shadow:var(--shadow-lg);width:100%;max-width:480px;overflow:hidden}
.ho-head{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 20px 14px;border-bottom:1px solid var(--line)}
.ho-eyebrow{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--composite-2);font-family:var(--mono);margin-bottom:4px}
.ho-title{font-size:17px;font-weight:800;letter-spacing:-.01em}
.ho-signal{display:flex;align-items:center;gap:12px;padding:12px 20px;background:var(--surface-2);border-bottom:1px solid var(--line)}
.ho-signal-ico{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,var(--composite-soft),var(--accent-soft));border:1px solid var(--composite-line);display:grid;place-items:center;flex:0 0 auto;font-size:15px}
.ho-body{padding:16px 20px}
.ho-label{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-faint);margin-bottom:8px}
.ho-personas{display:flex;flex-direction:column;gap:7px}
.ho-persona-btn{display:flex;align-items:center;gap:11px;padding:10px 12px;background:var(--surface-2);border:1.5px solid var(--line-2);border-radius:var(--r);cursor:pointer;font-family:var(--sans);transition:all .12s;text-align:left}
.ho-persona-btn:hover{background:var(--hover);border-color:var(--line-strong)}
.ho-persona-btn.selected{background:var(--composite-soft);border-color:var(--composite-line)}
.ho-note{width:100%;border:1px solid var(--line-2);border-radius:var(--r);padding:9px 11px;font-family:var(--sans);font-size:13px;color:var(--ink);background:var(--surface);outline:none;resize:vertical;min-height:58px;box-sizing:border-box;margin-top:4px}
.ho-note:focus{border-color:var(--composite);box-shadow:0 0 0 3px var(--composite-soft)}
.ho-footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:14px 20px;border-top:1px solid var(--line);background:var(--surface-2)}

/* Handoff state on feed cards */
.feed-card-handedoff{opacity:.7;pointer-events:none}
.handoff-tag{display:flex;align-items:center;gap:7px;font-size:11.5px;font-weight:600;color:var(--composite-2);background:var(--composite-soft);border-radius:var(--r-sm) var(--r-sm) 0 0;padding:6px 14px;margin:-18px -20px 14px;border-bottom:1px solid var(--composite-line)}
.handoff-tag svg{width:13px;height:13px}

/* Route button on feed cards */
.route-btn{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:600;padding:5px 10px;border-radius:7px;border:1px solid var(--composite-line);background:var(--composite-soft);color:var(--composite-2);cursor:pointer;transition:all .12s;white-space:nowrap}
.route-btn:hover{background:var(--composite);color:#fff;border-color:var(--composite)}
.route-btn svg{width:12px;height:12px}`;
    document.head.appendChild(s);
  }

  /* ---- Boot ---- */
  function boot() {
    const b = document.body;
    const screen = b.dataset.screen || 'home';
    let persona;
    try { persona = localStorage.getItem('ak_persona'); } catch {}
    if (!persona) {
      persona = b.dataset.persona || 'ceo';
      try { localStorage.setItem('ak_persona', persona); } catch {}
    }
    b.dataset.persona = persona;

    const sb = document.getElementById('sidebar');
    const tb = document.getElementById('topbar');
    if (sb) sb.innerHTML = buildSidebar(screen, persona);
    if (tb) tb.innerHTML = buildTopbar(screen, persona, b.dataset.crumb || '');

    if (b.dataset.decisions === 'true') {
      const db = document.createElement('div');
      db.className = 'decisions-bar';
      const et = b.dataset.entitytype || 'portfolio';
      const eid = b.dataset.entityid || '';
      const en = b.dataset.entityname || '';
      db.innerHTML = buildDecisions(et, eid, en);
      document.body.appendChild(db);
      const c = document.querySelector('.content');
      if (c) c.style.paddingBottom = '84px';
    }

    injectShellStyles();
    initShortcuts();
    initTooltips();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* ---- Public API ---- */
  window.AK.getPersona        = function() { try { return localStorage.getItem('ak_persona') || 'ceo'; } catch { return 'ceo'; } };
  window.AK.openPalette       = openPalette;
  window.AK.filterPalette     = filterPalette;
  window.AK.paletteKey        = paletteKey;
  window.AK.runPaletteItem    = runPaletteItem;
  window.AK.selectPaletteItem = selectPaletteItem;
  window.AK.toggleNotifs      = toggleNotifs;
  window.AK.markAllRead       = markAllRead;
  window.AK.toggleUserMenu    = toggleUserMenu;
  window.AK.openHandoffPanel  = openHandoffPanel;
  window.AK.closeHandoffPanel = closeHandoffPanel;
  window.AK.getPersonaNotifs  = getEffectiveNotifs;
  window.AK.buildDecisions    = buildDecisions;

})();
