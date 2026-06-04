/* ============================================================
   Akashic EIS — shell.js v2
   Shared app shell: sidebar · topbar · decisions bar
   Additions: command palette (⌘K) · notifications panel ·
   integration sync status · decisions→AKActions composer
   ============================================================ */
(function () {
  /* ---- Icons ---- */
  const I = {
    home:    '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M9.5 20v-6h5v6"/>',
    clients: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 4v16"/>',
    projects:'<path d="M4 5h16v4H4z"/><path d="M4 13h10v6H4z"/><path d="M17 13h3v6h-3z"/>',
    people:  '<circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><circle cx="17.5" cy="9" r="2.3"/><path d="M16 20a4.5 4.5 0 0 1 5.5-4.4"/>',
    finance: '<path d="M3 20h18"/><path d="M6 20V10"/><path d="M11 20V5"/><path d="M16 20v-7"/><path d="M21 20v-4"/>',
    docs:    '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 13h6"/><path d="M9 16.5h6"/>',
    ai:      '<path d="M12 3v3"/><rect x="5" y="6" width="14" height="11" rx="3"/><circle cx="9.5" cy="11.5" r="1.2"/><circle cx="14.5" cy="11.5" r="1.2"/><path d="M9 21h6"/><path d="M12 17v4"/>',
    approvals:'<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
    search:  '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell:    '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    bolt:    '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    check:   '<path d="M20 6 9 17l-5-5"/>',
    chev:    '<path d="m9 6 6 6-6 6"/>',
    open:    '<path d="M7 17 17 7M9 7h8v8"/>',
    link:    '<path d="M9 15 15 9"/><path d="M10 6l1-1a4 4 0 0 1 6 6l-1 1"/><path d="M14 18l-1 1a4 4 0 0 1-6-6l1-1"/>',
    workflow:'<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H15a3 3 0 0 1 3 3v6"/>',
    audit:   '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    sync:    '<path d="M20 8A8 8 0 0 0 4.9 4.9"/><path d="M4 20a8 8 0 0 0 15.1-3.1"/><path d="M20 4v4h-4"/><path d="M4 20v-4h4"/>',
    plug:    '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2z"/>',
    flag:    '<path d="M5 21V4"/><path d="M5 4h12l-2.5 4L17 12H5"/>',
    assign:  '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M18 8v6M15 11h6"/>',
    close:   '<path d="M18 6 6 18M6 6l12 12"/>',
  };
  function icon(name, cls) {
    return `<svg class="${cls||''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${I[name]||''}</svg>`;
  }
  window.AK = { icon, I };

  /* ---- Employee photos map (globally accessible) ---- */
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

  /* ---- Integration status (mock) ---- */
  const INTEG_ICONS = {
    salesforce: '<svg viewBox="0 0 20 20" fill="none"><path d="M5 12.5c0-2.2 1.8-4 4-4 1.3 0 2.4.6 3.1 1.5.5-.3 1.1-.5 1.7-.5 2 0 3.7 1.7 3.7 3.7 0 2-1.7 3.7-3.7 3.7H5.5C3.6 17 2 15.4 2 13.5c0-1.6 1.1-2.9 2.5-3.3L5 12.5z" fill="#00A1E0"/></svg>',
    sap: '<svg viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="10" rx="2" fill="#0070F2"/><text x="10" y="12.5" text-anchor="middle" fill="#fff" font-size="6" font-weight="800" font-family="sans-serif">SAP</text></svg>',
    darwinbox: '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" fill="#7B2D8E"/><path d="M7 10l2 2 4-4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    tally: '<svg viewBox="0 0 20 20" fill="none"><rect x="4" y="4" width="12" height="12" rx="3" fill="#E8712B"/><path d="M8 8v4M10 7v5M12 9v3" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/></svg>',
    psa: '<svg viewBox="0 0 20 20" fill="none"><polygon points="10,3 17,7 17,13 10,17 3,13 3,7" fill="#2563A8"/><text x="10" y="12" text-anchor="middle" fill="#fff" font-size="5" font-weight="700" font-family="sans-serif">PSA</text></svg>',
  };
  const INTEGRATIONS = [
    { id:'salesforce', label:'Salesforce', status:'live',  lastSync:'2 min ago', color:'#00A1E0' },
    { id:'sap',        label:'SAP ERP',    status:'live',  lastSync:'8 min ago', color:'#0070F2' },
    { id:'darwinbox',  label:'Darwinbox',  status:'live',  lastSync:'5 min ago', color:'#7B2D8E' },
    { id:'tally',      label:'Tally',      status:'lag',   lastSync:'42 min ago',color:'#E8712B' },
    { id:'psa',        label:'PSA',        status:'live',  lastSync:'1 min ago', color:'#2563A8' },
  ];

  /* ---- Navigation ---- */
  const NAV_PRIMARY = [
    { id:'home',      label:'Home',         ico:'home',      href:'Home.html' },
    { id:'assistant', label:'Ask Akashic',  ico:'ai',        href:'Assistant.html' },
    { id:'approvals', label:'Approvals',    ico:'approvals', href:'Approvals.html', badge:'5', alert:true },
  ];
  const NAV_PILLARS = [
    { id:'clients',   label:'Clients',    ico:'clients',  href:'Clients.html',    pillar:'P1', badge:'48' },
    { id:'projects',  label:'Projects',   ico:'projects', href:'Projects.html',   pillar:'P2', badge:'31' },
    { id:'employees', label:'Employees',  ico:'people',   href:'Employees.html',  pillar:'P3', badge:'1,840' },
    { id:'financials',label:'Financials', ico:'finance',  href:'Financials.html', pillar:'P4', badge:'₹142Cr' },
  ];
  const NAV_TRUST = [
    { id:'documents', label:'Documents',  ico:'docs',     href:'Documents.html',  badge:'14', alert:true },
  ];
  const PERSONAS = [
    { id:'ceo', label:'CEO',           home:'Home.html',        color:'var(--accent)' },
    { id:'cfo', label:'CFO',           home:'Financials.html',  color:'var(--composite)' },
    { id:'dh',  label:'Delivery Head', home:'Projects.html',    color:'var(--good)' },
  ];
  const PERSONA_USER = {
    ceo: { name:'Arjun Mehta',   role:'Chief Executive',  init:'AM' },
    cfo: { name:'Devika Rao',    role:'Chief Financial',  init:'DR' },
    dh:  { name:'Karthik Menon', role:'Head of Delivery', init:'KM' },
  };

  /* ---- Nav item builder ---- */
  function navItem(it, active) {
    const badge = it.badge ? `<span class="nav-badge ${it.alert?'alert':''}">${it.badge}</span>`
                 : it.pillar ? `<span class="pillar-tag">${it.pillar}</span>` : '';
    return `<a class="nav-item ${active===it.id?'active':''}" href="${it.href}">
      ${icon(it.ico,'nav-ico')}<span>${it.label}</span>${badge}</a>`;
  }

  function buildSidebar(screen, persona) {
    const u = PERSONA_USER[persona] || PERSONA_USER.ceo;
    const syncDot = INTEGRATIONS.some(i=>i.status==='lag') ? '<span class="sync-lag" title="One integration behind"></span>' : '';
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
      ${NAV_PILLARS.filter(n => {
        if (persona === 'cfo' && n.id === 'employees') return false;
        if (persona === 'dh' && n.id === 'financials') return false;
        return true;
      }).map(n=>navItem(n,screen)).join('')}
    </div>
    <div class="nav-group">
      <div class="nav-label">Trust Layer</div>
      ${NAV_TRUST.map(n=>navItem(n,screen)).join('')}
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
        <div class="avatar">${u.init}</div>
        <div style="min-width:0"><div style="font-weight:600;font-size:13px;line-height:1.2">${u.name}</div>
          <div style="font-size:11px;color:var(--ink-3)">${u.role}</div></div>
        ${icon('chev','nav-ico')}
      </div>
    </div>`;
  }

  function buildTopbar(screen, persona, crumb) {
    const crumbHtml = (crumb||'').split('/').map((c,i,a)=>{
      const last=i===a.length-1;
      return `${i>0?'<span class="sep">›</span>':''}${last?`<b>${c.trim()}</b>`:`<span>${c.trim()}</span>`}`;
    }).join('');
    return `
    <div class="crumbs">${crumbHtml}</div>
    <button class="topbar-search" onclick="AK.openPalette()" title="⌘K">
      ${icon('search','')} <span class="tsq-text">Search anything…</span><span class="kbd">⌘K</span>
    </button>
    <div class="topbar-spacer"></div>
    <button class="icon-btn" id="notif-btn" title="Notifications" onclick="AK.toggleNotifs()">
      <span class="dot"></span>${icon('bell')} <span>Notifications</span></button>`;
  }

  /* ---- Decisions bar — context-aware, wired to composer ---- */
  function buildDecisions(entityType, entityId, entityName) {
    const et = entityType || 'portfolio';
    const eid = entityId || '';
    const en = entityName || '';
    const maps = {
      client:   [['RAISE_INVOICE','Raise invoice'],['RAISE_RENEWAL_SOW','Create renewal SOW'],['COLLECTION_ACTION','Collection action'],['REFORECAST','Re-forecast'],['ESCALATE','Escalate']],
      project:  [['RAISE_INVOICE','Raise invoice'],['APPROVE_CR','Approve CR'],['REFORECAST','Re-forecast margin'],['FLAG_SUCCESSION','Succession plan'],['ESCALATE','Escalate']],
      employee: [['RETENTION_ACTION','Retention action'],['REDEPLOY','Redeploy'],['APPROVE_HIKE','Approve hike'],['FLAG_SUCCESSION','Succession plan']],
      portfolio:[['REFORECAST','Re-forecast'],['RAISE_INVOICE','Raise invoice'],['ESCALATE','Escalate']],
    };
    const actions = maps[et] || maps.portfolio;
    const btns = actions.map(([t,label],i)=>
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
    { type:'nav',    label:'Home',                   hint:'Intelligence Feed',  href:'Home.html' },
    { type:'nav',    label:'Clients',                hint:'Portfolio view',      href:'Clients.html' },
    { type:'nav',    label:'Meridian Retail 360',    hint:'Client profile',      href:'ClientProfile.html' },
    { type:'nav',    label:'Projects',               hint:'Health dashboard',    href:'Projects.html' },
    { type:'nav',    label:'Financials',             hint:'CFO view',            href:'Financials.html' },
    { type:'nav',    label:'Employees',              hint:'People lens',         href:'Employees.html' },
    { type:'nav',    label:'Ask Akashic',            hint:'AI Assistant',        href:'Assistant.html' },
    { type:'nav',    label:'Approvals',              hint:'Pending actions',     href:'Approvals.html' },
    { type:'nav',    label:'Documents',              hint:'Validation queue',    href:'Documents.html' },
    { type:'action', label:'Raise milestone invoice',hint:'Billing → Tally',     action:'RAISE_INVOICE' },
    { type:'action', label:'Create renewal SOW',     hint:'CRM → Salesforce',    action:'RAISE_RENEWAL_SOW' },
    { type:'action', label:'Re-forecast revenue',    hint:'ERP → SAP',           action:'REFORECAST' },
    { type:'action', label:'Initiate retention',     hint:'HRMS → Darwinbox',    action:'RETENTION_ACTION' },
    { type:'action', label:'Collection action',      hint:'Billing + CRM',       action:'COLLECTION_ACTION' },
    { type:'action', label:'Approve change request', hint:'PSA → Zoho',          action:'APPROVE_CR' },
    { type:'client', label:'Meridian Retail Group',  hint:'₹14.2 Cr · Renewal',  href:'ClientProfile.html' },
    { type:'client', label:'Hanseatic Bank',         hint:'₹11.8 Cr · Renewal',  href:'ClientProfile.html' },
    { type:'client', label:'Cobalt Energy',          hint:'₹9.3 Cr · Active',    href:'ClientProfile.html' },
    { type:'project',label:'Orion Commerce Rollout', hint:'Overdue · Meridian',  href:'Projects.html' },
    { type:'project',label:'Atlas Migration',        hint:'At-risk · Sundara',   href:'Projects.html' },
    { type:'employee',label:'Vikram Rao',            hint:'88% exit risk',       href:'Employees.html' },
  ];

  function openPalette() {
    if (document.getElementById('ak-palette')) return;
    const div = document.createElement('div');
    div.id = 'ak-palette-overlay';
    div.innerHTML = buildPaletteHTML();
    document.body.appendChild(div);
    setTimeout(()=>{ const inp=document.getElementById('ak-palette-input'); inp&&inp.focus(); }, 30);
    div.addEventListener('click',e=>{ if(e.target.id==='ak-palette-overlay') closePalette(); });
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
    if (it.href) { window.location.href = it.href; }
    else if (it.action && window.AKActions) AKActions.compose({ type:it.action, entityType:'portfolio', entityId:'', entityName:'' });
  }
  function closePalette() {
    const el = document.getElementById('ak-palette-overlay');
    if (el) el.remove();
  }

  /* ---- Notifications panel ---- */
  const NOTIFS = [
    { id:1, read:false, icon:'crit', title:'Meridian renewal: 18 days',    sub:'MSA expires 22 Jun. No SOW in pipeline.',         href:'ClientProfile.html',  time:'2 min ago' },
    { id:2, read:false, icon:'crit', title:'Northwind overdue ₹2.4 Cr',    sub:'90+ days — escalate to CFO recommended.',         href:'Financials.html',    time:'4 min ago' },
    { id:3, read:false, icon:'warn', title:'Orion Rollout: 11 days late',  sub:'Atlas migration predicted ₹62 L overrun.',        href:'Projects.html',      time:'18 min ago' },
    { id:4, read:false, icon:'warn', title:'Vikram Rao: 88% exit signal',  sub:'SPOF on Meridian. Shadow recommended.',           href:'Employees.html',     time:'1 hr ago' },
    { id:5, read:true,  icon:'good', title:'Cobalt SOW verbal yes',        sub:'₹5.1 Cr expansion SOW — paperwork in flight.',    href:'ClientProfile.html', time:'3 hr ago' },
    { id:6, read:true,  icon:'good', title:'Tally sync lag resolved',      sub:'Integration back to live after 2hr lag.',          href:'Documents.html',     time:'Yesterday' },
  ];
  let _notifsOpen = false;
  function toggleNotifs() {
    if (_notifsOpen) { closeNotifs(); return; }
    closeNotifs();
    const panel = document.createElement('div');
    panel.id = 'ak-notifs';
    const unread = NOTIFS.filter(n=>!n.read).length;
    panel.innerHTML = `
      <div class="nf-head">
        <b>Notifications</b>
        ${unread ? `<span class="badge b-risk" style="padding:0 7px"><span class="bd"></span>${unread} new</span>` : ''}
        <button class="btn xs ghost" style="margin-left:auto" onclick="AK.markAllRead()">Mark all read</button>
      </div>
      ${NOTIFS.map(n=>`<a class="nf-item ${n.read?'read':''}" href="${n.href}">
        <span class="hdot ${n.icon}" style="flex:0 0 auto;margin-top:3px"></span>
        <div style="flex:1;min-width:0"><div class="nf-title">${n.title}</div><div class="nf-sub">${n.sub}</div></div>
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
    if (p && !p.contains(e.target) && e.target !== btn) closeNotifs();
  }
  function closeNotifs() {
    const el = document.getElementById('ak-notifs');
    if (el) el.remove();
    _notifsOpen = false;
    document.removeEventListener('click', _closeNotifsOutside);
  }
  function markAllRead() {
    NOTIFS.forEach(n=>n.read=true);
    const btn = document.getElementById('notif-btn');
    if (btn) btn.querySelector('.dot') && (btn.querySelector('.dot').style.display='none');
    closeNotifs(); toggleNotifs();
  }

  /* ---- User / Persona menu popover ---- */
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
      btn.className = 'user-menu-opt' + (activePersona === p.id ? ' active' : '');

      if (activePersona === p.id) {
        btn.style.background = 'var(--accent-soft)';
      }

      btn.innerHTML = `
        <span class="avatar sm" style="background:${p.color};width:24px;height:24px;font-size:9.5px;color:#fff">${u.init}</span>
        <div style="min-width:0;flex:1">
          <div style="font-weight:600;font-size:12.5px;color:var(--ink);line-height:1.2">${u.name}</div>
          <div style="font-size:10.5px;color:var(--ink-3)">${u.role}</div>
        </div>
        ${activePersona === p.id ? icon('check', 'accent-text') : ''}
      `;

      btn.onclick = () => {
        closeUserMenu();
        window.AK.setPersona(p.id);
      };

      btn.onmouseenter = () => {
        if (activePersona !== p.id) btn.style.background = 'var(--hover)';
      };
      btn.onmouseleave = () => {
        if (activePersona !== p.id) btn.style.background = 'none';
      };

      panel.appendChild(btn);
    });

    document.body.appendChild(panel);
    _userMenuOpen = true;
    setTimeout(() => document.addEventListener('click', _closeUserMenuOutside), 10);
  }

  function _closeUserMenuOutside(e) {
    const p = document.getElementById('ak-user-menu');
    const chip = document.querySelector('.user-chip');
    if (p && !p.contains(e.target) && (!chip || !chip.contains(e.target))) {
      closeUserMenu();
    }
  }

  function closeUserMenu() {
    const el = document.getElementById('ak-user-menu');
    if (el) el.remove();
    _userMenuOpen = false;
    document.removeEventListener('click', _closeUserMenuOutside);
  }

  /* ---- Persona switching ---- */
  window.AK.setPersona = function(id) {
    try { localStorage.setItem('ak_persona', id); } catch {}
    const p = PERSONAS.find(x=>x.id===id);
    const pathname = window.location.pathname.split('/').pop() || 'Home.html';
    if (pathname === 'Home.html' || pathname === 'index.html' || pathname === 'Financials.html' || pathname === 'Projects.html') {
      if (p) window.location.href = p.home;
    } else {
      window.location.reload();
    }
  };

  /* ---- Toast ---- */
  window.AK.toast = function(msg) {
    let t = document.getElementById('ak-toast');
    if (!t) { t = document.createElement('div'); t.id='ak-toast';
      t.style.cssText = 'position:fixed;bottom:74px;left:50%;transform:translateX(-50%);z-index:700;background:var(--ink);color:#fff;padding:10px 16px;border-radius:10px;font-size:13px;font-weight:600;box-shadow:var(--shadow-lg);display:flex;align-items:center;gap:9px;opacity:0;transition:opacity .18s, transform .18s;pointer-events:none;max-width:480px;text-align:center';
      document.body.appendChild(t); }
    t.innerHTML = icon('check') + '<span>' + msg + '</span>';
    requestAnimationFrame(()=>{ t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(-4px)'; });
    clearTimeout(t._tm); t._tm = setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(-50%)'; }, 2400);
  };

  /* ---- Keyboard shortcuts ---- */
  function initShortcuts() {
    document.addEventListener('keydown', e => {
      if ((e.metaKey||e.ctrlKey) && e.key==='k') { e.preventDefault(); openPalette(); }
      if (e.key==='Escape') { closePalette(); closeNotifs(); closeUserMenu(); }
    });
  }

  /* ---- Custom premium tooltips with event delegation ---- */
  function initTooltips() {
    document.addEventListener('mouseover', function(e) {
      const el = e.target.closest('[title], [data-tip], .pop-info');
      if (!el) return;
      if (el._customTip) return;

      let text = el.getAttribute('data-tip') || el.getAttribute('title');
      if (!text && el.classList.contains('pop-info')) {
        text = el.getAttribute('title') || "Information Details";
      }
      if (!text) return;

      if (el.hasAttribute('title')) {
        el.setAttribute('data-original-title', el.getAttribute('title'));
        el.removeAttribute('title');
      }

      const tip = document.createElement('div');
      tip.className = 'ak-tip';
      tip.textContent = text;
      document.body.appendChild(tip);

      const rect = el.getBoundingClientRect();
      const tipWidth = tip.offsetWidth;
      let left = rect.left + window.scrollX + (rect.width - tipWidth) / 2;
      let top = rect.bottom + window.scrollY + 6;
      
      if (left < 6) left = 6;
      if (left + tipWidth > window.innerWidth - 6) left = window.innerWidth - tipWidth - 6;
      
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';

      el._customTip = tip;
    });

    document.addEventListener('mouseout', function(e) {
      const el = e.target.closest('[data-original-title], [data-tip], .pop-info');
      if (!el) return;
      if (e.relatedTarget && el.contains(e.relatedTarget)) return;

      if (el.hasAttribute('data-original-title')) {
        el.setAttribute('title', el.getAttribute('data-original-title'));
        el.removeAttribute('data-original-title');
      }

      if (el._customTip) {
        el._customTip.remove();
        el._customTip = null;
      }
    });

    document.addEventListener('click', function() {
      document.querySelectorAll('.ak-tip').forEach(t => t.remove());
    });
  }

  /* ---- Extra shell styles ---- */
  function injectShellStyles() {
    if (document.getElementById('shell-ext')) return;
    const s = document.createElement('style');
    s.id = 'shell-ext';
    s.textContent = `
.topbar-search{display:flex;align-items:center;gap:8px;background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r);padding:7px 11px;color:var(--ink-3);font-size:13px;cursor:pointer;flex:0 1 340px;font-family:var(--sans)}
.topbar-search:hover{border-color:var(--line-strong);background:var(--hover)}
.tsq-text{flex:1;text-align:left}.kbd{font-family:var(--mono);font-size:10.5px;color:var(--ink-faint);border:1px solid var(--line-2);border-radius:4px;padding:1px 5px}
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
/* Palette */
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
#ak-notifs{position:fixed;top:60px;right:12px;width:360px;background:var(--surface);border:1px solid var(--line-2);border-radius:var(--r-xl);box-shadow:var(--shadow-lg);z-index:450;overflow:hidden}
.nf-head{display:flex;align-items:center;gap:8px;padding:13px 15px 11px;border-bottom:1px solid var(--line);font-size:14px}
.nf-item{display:flex;align-items:flex-start;gap:10px;padding:11px 15px;border-bottom:1px solid var(--line);text-decoration:none;color:inherit}
.nf-item:hover{background:var(--surface-2)}
.nf-item.read{opacity:.6}
.nf-title{font-weight:600;font-size:13px;margin-bottom:2px}
.nf-sub{font-size:11.5px;color:var(--ink-3);line-height:1.4}
.nf-time{font-size:10.5px;color:var(--ink-faint);white-space:nowrap;font-family:var(--mono);flex:0 0 auto}
.nf-foot{padding:10px 15px;background:var(--surface-2);font-size:12.5px;font-weight:600}
.nf-foot a{color:var(--accent-2)}`;
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
    // Reflect active persona back onto body
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

  /* expose for palette */
  window.AK.getPersona = function() {
    try { return localStorage.getItem('ak_persona') || 'ceo'; } catch { return 'ceo'; }
  };
  window.AK.openPalette = openPalette;
  window.AK.filterPalette = filterPalette;
  window.AK.paletteKey = paletteKey;
  window.AK.runPaletteItem = runPaletteItem;
  window.AK.selectPaletteItem = selectPaletteItem;
  window.AK.toggleNotifs = toggleNotifs;
  window.AK.markAllRead = markAllRead;
  window.AK.toggleUserMenu = toggleUserMenu;
})();
