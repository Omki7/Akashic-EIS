/* ============================================================
   Akashic EIS — Shared Entity Data Model & State Manager
   window.AKData — single source of truth for all screens
   ============================================================ */
(function () {
  let state = {};

  const DEFAULT_CLIENTS = [
    { id:'C01', name:'Meridian Retail Group',  logo:'MR', color:'#2563a8', industry:'Retail',      geo:'USA',    stage:'renewal',  health:'crit', ltv:61.4,  arr:14.2, expiry:'22 Jun 2026', owner:'Priya Nair',    ownerInit:'PN', region:'Americas', since:'Mar 2019', cohort:'62% renewed · 38% churned', concRisk:true },
    { id:'C02', name:'Hanseatic Bank',          logo:'HB', color:'#2f6f9e', industry:'BFSI',        geo:'Germany',stage:'renewal',  health:'crit', ltv:48.9,  arr:11.8, expiry:'25 Jun 2026', owner:'Rohan Desai',   ownerInit:'RD', region:'Europe',   since:'Aug 2020', cohort:'67% renewed · 33% churned', concRisk:false },
    { id:'C03', name:'Cobalt Energy',           logo:'CE', color:'#5a7a2f', industry:'Energy',      geo:'India',  stage:'active',   health:'good', ltv:41.2,  arr:9.3,  expiry:'30 Sep 2027', owner:'Priya Nair',    ownerInit:'PN', region:'India',    since:'Jan 2021', cohort:null },
    { id:'C04', name:'Indus Pharma',            logo:'IP', color:'#7a2f6a', industry:'Pharma',      geo:'India',  stage:'active',   health:'good', ltv:29.6,  arr:7.1,  expiry:'18 Jan 2028', owner:'Anil Kapoor',   ownerInit:'AK', region:'India',    since:'Sep 2019', cohort:null },
    { id:'C05', name:'Northwind Insurance',     logo:'NW', color:'#9e5a2f', industry:'Insurance',   geo:'UK',     stage:'risk',     health:'crit', ltv:33.1,  arr:6.4,  expiry:'14 Nov 2026', owner:'Kavya Iyer',    ownerInit:'KI', region:'Europe',   since:'Feb 2020', cohort:'58% renewed · 42% churned', concRisk:false },
    { id:'C06', name:'Brightwater Utilities',   logo:'BW', color:'#2f7a8e', industry:'Utilities',   geo:'UK',     stage:'risk',     health:'warn', ltv:27.8,  arr:5.2,  expiry:'09 Mar 2027', owner:'Rohan Desai',   ownerInit:'RD', region:'Europe',   since:'Jun 2021', cohort:'71% renewed · 29% churned', concRisk:false },
    { id:'C07', name:'Vermillion Health',       logo:'VH', color:'#a23f6a', industry:'Healthcare',  geo:'USA',    stage:'active',   health:'warn', ltv:22.4,  arr:5.8,  expiry:'07 Aug 2026', owner:'Kavya Iyer',    ownerInit:'KI', region:'Americas', since:'Nov 2021', cohort:null },
    { id:'C08', name:'Sundara Logistics',       logo:'SL', color:'#3a7a55', industry:'Logistics',   geo:'India',  stage:'active',   health:'warn', ltv:18.9,  arr:4.6,  expiry:'12 Dec 2026', owner:'Anil Kapoor',   ownerInit:'AK', region:'India',    since:'Mar 2022', cohort:null },
    { id:'C09', name:'Aether Mobility',         logo:'AE', color:'#46508c', industry:'Automotive',  geo:'Germany',stage:'onboard',  health:'good', ltv:3.1,   arr:3.1,  expiry:'01 May 2028', owner:'Rohan Desai',   ownerInit:'RD', region:'Europe',   since:'Feb 2026', cohort:null },
  ];

  const DEFAULT_PROJECTS = [
    { id:'P01', name:'Orion Commerce Rollout',  clientId:'C01', status:'over',   budget:9.6,  spent:8.26, margin:14, daysToDeadline:-11, lead:'E01', practice:'Digital',       sla:null,  spendTrend:[6.1,7.0,7.5,8.0,8.26], revRec:7.2,  billUtil:86, milestones:{done:7,total:11}, stage:'active-delivery' },
    { id:'P02', name:'Helix Managed Support',   clientId:'C01', status:'good',   budget:4.1,  spent:2.21, margin:31, daysToDeadline:999, lead:'E03', practice:'Cloud',          sla:99.5, spendTrend:[1.2,1.5,1.8,2.0,2.21], revRec:2.1, billUtil:54, milestones:{done:null,total:null}, stage:'active-delivery' },
    { id:'P03', name:'Atlas Migration',         clientId:'C08', status:'crit',   budget:3.8,  spent:3.19, margin:9,  daysToDeadline:12,  lead:'E02', practice:'Cloud',          sla:null,  spendTrend:[1.8,2.2,2.6,2.9,3.19], revRec:2.8,  billUtil:84, milestones:{done:9,total:12}, stage:'change-mgmt' },
    { id:'P04', name:'Cobalt Data Lake',        clientId:'C03', status:'good',   budget:6.2,  spent:3.22, margin:34, daysToDeadline:61,  lead:'E04', practice:'Data & AI',       sla:null,  spendTrend:[1.0,1.5,2.0,2.6,3.22], revRec:3.4,  billUtil:52, milestones:{done:6,total:14}, stage:'active-delivery' },
    { id:'P05', name:'Indus Pharma Cloud',      clientId:'C04', status:'good',   budget:5.1,  spent:2.40, margin:31, daysToDeadline:90,  lead:'E06', practice:'Enterprise Apps', sla:null,  spendTrend:[0.8,1.2,1.6,2.0,2.40], revRec:2.6,  billUtil:47, milestones:{done:4,total:10}, stage:'kickoff' },
    { id:'P06', name:'Nova CRM Platform',       clientId:'C09', status:'warn',   budget:2.8,  spent:1.99, margin:19, daysToDeadline:22,  lead:'E08', practice:'Enterprise Apps', sla:null,  spendTrend:[0.6,0.9,1.2,1.6,1.99], revRec:1.7,  billUtil:71, milestones:{done:5,total:9},  stage:'kickoff' },
    { id:'P07', name:'Brightwater SCADA',       clientId:'C06', status:'warn',   budget:4.4,  spent:2.99, margin:21, daysToDeadline:40,  lead:'E05', practice:'Cloud',          sla:99.2, spendTrend:[0.9,1.3,1.8,2.4,2.99], revRec:2.8,  billUtil:68, milestones:{done:7,total:13}, stage:'active-delivery' },
    { id:'P08', name:'Hanseatic Core Banking',  clientId:'C02', status:'good',   budget:8.9,  spent:5.16, margin:29, daysToDeadline:120, lead:'E07', practice:'Enterprise Apps', sla:null,  spendTrend:[1.4,2.0,3.0,4.2,5.16], revRec:5.5,  billUtil:58, milestones:{done:9,total:18}, stage:'change-mgmt' },
    { id:'P09', name:'Vermillion Helix Platform',clientId:'C07',status:'warn',   budget:3.6,  spent:2.66, margin:12, daysToDeadline:28,  lead:'E03', practice:'Cloud',          sla:99.2, spendTrend:[0.8,1.2,1.6,2.1,2.66], revRec:2.3,  billUtil:74, milestones:{done:6,total:11}, stage:'closure' },
  ];

  const DEFAULT_EMPLOYEES = [
    { id:'E01', name:'Vikram Rao',        init:'VR', role:'Lead Architect',       practice:'Data & AI',        level:'Principal', tenure:6.2, util:96, risk:88, riskDrivers:['Comp 28% below market','No promotion in 18mo','3 recruiter contacts'],  value:1.84, cost:0.38, deployments:[{pid:'P01',cid:'C01',pct:64,since:'Jan 2025'},{pid:'P04',cid:'C03',pct:32,since:'Mar 2025'}], spof:['C01'], stage:'retention-risk' },
    { id:'E02', name:'Ananya Krishnan',   init:'AK', role:'Delivery Lead',         practice:'Cloud',            level:'Senior',    tenure:4.1, util:88, risk:76, riskDrivers:['High workload 6mo','2 competing offers known'],                          value:1.41, cost:0.29, deployments:[{pid:'P03',cid:'C08',pct:80,since:'Apr 2022'},{pid:'P07',cid:'C06',pct:20,since:'Jan 2024'}], spof:['C08'], stage:'staffed' },
    { id:'E03', name:'Sneha Pillai',      init:'SP', role:'Delivery Manager',      practice:'Cloud',            level:'Senior',    tenure:3.8, util:88, risk:58, riskDrivers:['Recent good review','High engagement'],                                  value:1.41, cost:0.29, deployments:[{pid:'P02',cid:'C01',pct:50,since:'Jun 2024'},{pid:'P09',cid:'C07',pct:40,since:'Oct 2024'}], spof:[], stage:'staffed' },
    { id:'E04', name:'Imran Qureshi',     init:'IQ', role:'Sr. Data Engineer',     practice:'Data & AI',        level:'Senior',    tenure:2.9, util:92, risk:64, riskDrivers:['Comp slightly below market'],                                            value:1.38, cost:0.31, deployments:[{pid:'P04',cid:'C03',pct:90,since:'Feb 2025'}], spof:['C03'], stage:'staffed' },
    { id:'E05', name:'Rahul Sethi',       init:'RS', role:'Data Engineer',         practice:'Data & AI',        level:'Mid',       tenure:1.9, util:74, risk:71, riskDrivers:['Poor manager relationship','Comp below market'],                         value:0.94, cost:0.19, deployments:[{pid:'P07',cid:'C06',pct:70,since:'Jul 2024'}], spof:['C06'], stage:'staffed' },
    { id:'E06', name:'Meera Nair',        init:'MN', role:'SAP Principal',         practice:'Enterprise Apps',  level:'Principal', tenure:5.4, util:91, risk:64, riskDrivers:['Only SAP S/4 expert, high pressure'],                                   value:1.62, cost:0.34, deployments:[{pid:'P05',cid:'C04',pct:80,since:'Oct 2024'}], spof:['C04'], stage:'staffed' },
    { id:'E07', name:'Lena Fischer',      init:'LF', role:'Onsite Coordinator',    practice:'Digital',          level:'Mid',       tenure:3.0, util:80, risk:58, riskDrivers:['Relocation preference expressed'],                                       value:1.22, cost:0.27, deployments:[{pid:'P08',cid:'C02',pct:100,since:'Mar 2024'}], spof:['C02'], stage:'staffed' },
    { id:'E08', name:'Arjun Bhat',        init:'AB', role:'QA Lead',               practice:'QA & Testing',     level:'Mid',       tenure:1.1, util:74, risk:45, riskDrivers:['Early tenure — watch'],                                                  value:0.94, cost:0.19, deployments:[{pid:'P01',cid:'C01',pct:30,since:'Jan 2025'},{pid:'P06',cid:'C09',pct:40,since:'Feb 2026'}], spof:[], stage:'onboarding' },
    { id:'E09', name:'Kavya Sharma',      init:'KS', role:'Business Analyst',      practice:'Cloud',            level:'Junior',    tenure:0.8, util:0,  risk:32, riskDrivers:['On bench'],                                                              value:0.42, cost:0.14, deployments:[], spof:[], stage:'onboarding' },
    { id:'E10', name:'Priya Sharma',      init:'PS', role:'Frontend Developer',    practice:'Digital',          level:'Mid',       tenure:2.2, util:80, risk:41, riskDrivers:['Recent comp adjustment'],                                                value:0.88, cost:0.18, deployments:[{pid:'P06',cid:'C09',pct:80,since:'Feb 2026'}], spof:[], stage:'staffed' },
  ];

  const DEFAULT_CONTRACTS = [
    { id:'K01', clientId:'C01', type:'MSA',      value:null,  start:'18 Mar 2019', end:'22 Jun 2026', autoRenew:false, status:'renewal', conf:0.71 },
    { id:'K02', clientId:'C01', type:'SOW-04',   value:9.6,   start:'02 Jan 2025', end:'30 Sep 2026', autoRenew:false, status:'active',  conf:0.99 },
    { id:'K03', clientId:'C01', type:'SOW-03',   value:4.1,   start:'01 Apr 2024', end:'31 Mar 2027', autoRenew:true,  status:'active',  conf:0.84 },
    { id:'K04', clientId:'C02', type:'MSA',      value:null,  start:'12 Aug 2020', end:'25 Jun 2026', autoRenew:false, status:'renewal', conf:0.92 },
    { id:'K05', clientId:'C02', type:'SOW-02',   value:11.8,  start:'01 Jan 2025', end:'31 Dec 2026', autoRenew:false, status:'active',  conf:0.99 },
    { id:'K06', clientId:'C03', type:'MSA',      value:null,  start:'15 Jan 2021', end:'30 Sep 2027', autoRenew:true,  status:'active',  conf:0.99 },
    { id:'K07', clientId:'C06', type:'SOW-02',   value:4.4,   start:'01 Jul 2024', end:'30 Jun 2026', autoRenew:false, status:'active',  conf:0.73 },
  ];

  const DEFAULT_INVOICES = [
    { id:'INV-2026-0412', clientId:'C01', projectId:'P01', amount:1.20, date:'28 May 2026', status:'outstanding', daysOld:7 },
    { id:'INV-2026-0388', clientId:'C01', projectId:'P02', amount:1.03, date:'12 May 2026', status:'paid',        daysOld:23 },
    { id:'INV-2026-0309', clientId:'C05', projectId:null,  amount:2.40, date:'14 Mar 2026', status:'overdue',     daysOld:82 },
    { id:'INV-2026-0276', clientId:'C01', projectId:'P01', amount:1.10, date:'28 Feb 2026', status:'paid',        daysOld:95 },
    { id:'INV-2026-0301', clientId:'C02', projectId:'P08', amount:2.95, date:'01 Apr 2026', status:'paid',        daysOld:64 },
    { id:'INV-2026-0355', clientId:'C08', projectId:'P03', amount:0.64, date:'30 Apr 2026', status:'outstanding', daysOld:35 },
  ];

  const DEFAULT_DOCUMENTS = [
    { id:'D01', name:'Meridian_MSA_2019.pdf',        clientId:'C01', projectId:null,  type:'MSA',      conf:0.71, validated:false, ingested:true },
    { id:'D02', name:'SOW-04_Orion.pdf',              clientId:'C01', projectId:'P01', type:'SOW',      conf:0.99, validated:true,  ingested:true },
    { id:'D03', name:'SOW-03_Support.pdf',            clientId:'C01', projectId:'P02', type:'SOW',      conf:0.84, validated:false, ingested:true },
    { id:'D04', name:'Addendum_A2_DataResidency.pdf', clientId:'C01', projectId:null,  type:'Addendum', conf:0.68, validated:false, ingested:true },
    { id:'D05', name:'QBR_Apr2026_MoM.docx',          clientId:'C01', projectId:null,  type:'MoM',      conf:0.99, validated:true,  ingested:true },
    { id:'D06', name:'Hanseatic_MSA.pdf',             clientId:'C02', projectId:null,  type:'MSA',      conf:0.92, validated:true,  ingested:true },
    { id:'D07', name:'Brightwater_SOW2.pdf',          clientId:'C06', projectId:'P07', type:'SOW',      conf:0.73, validated:false, ingested:true },
    { id:'D08', name:'Atlas_Kickoff_Deck.pdf',        clientId:'C08', projectId:'P03', type:'MoM',      conf:0.88, validated:true,  ingested:true },
    { id:'D09', name:'Renewal_Intent_email.eml',      clientId:'C01', projectId:null,  type:'Email',    conf:null, validated:false, ingested:false },
  ];

  const DEFAULT_PRACTICES = [
    { id:'PR01', name:'Data & AI',        headcount:320, utilization:86, revenue:34.2, margin:28, benchCost:0.42 },
    { id:'PR02', name:'Cloud & Infra',    headcount:480, utilization:82, revenue:46.1, margin:24, benchCost:0.61 },
    { id:'PR03', name:'Enterprise Apps',  headcount:360, utilization:76, revenue:38.4, margin:22, benchCost:0.51 },
    { id:'PR04', name:'Digital / UX',     headcount:210, utilization:74, revenue:14.8, margin:19, benchCost:0.28 },
    { id:'PR05', name:'QA & Testing',     headcount:280, utilization:80, revenue:8.9,  margin:18, benchCost:0.17 },
    { id:'PR06', name:'Cybersecurity',    headcount:190, utilization:78, revenue:5.2,  margin:31, benchCost:0.09 },
  ];

  /* Detailed Financial Cash Cycles (Transaction Ledgers) */
  const DEFAULT_TRANSACTIONS = [
    { id:'TXN-2026-001', clientId:'C01', projectId:'P01', amount:'₹1.20 Cr', detail:'Milestone M7 performance hardening sign-off', stage:'billed', statusText:'Invoice outstanding · 7 days', lastUpdated:'28 May 2026',
      history:[
        { step:'booked', date:'02 Jan 2025', desc:'SOW-04 contract signed' },
        { step:'accrued', date:'24 Apr 2026', desc:'Work completed & UAT accepted' },
        { step:'billed', date:'28 May 2026', desc:'Invoice INV-2026-0412 generated' }
      ]
    },
    { id:'TXN-2026-002', clientId:'C01', projectId:'P02', amount:'₹1.03 Cr', detail:'Q1 Support Managed Services flat retainer', stage:'collected', statusText:'Settled & reconciled', lastUpdated:'23 May 2026',
      history:[
        { step:'booked', date:'01 Apr 2024', desc:'SOW-03 signed & approved' },
        { step:'accrued', date:'01 May 2026', desc:'Retainer effort delivered' },
        { step:'billed', date:'12 May 2026', desc:'Invoice INV-2026-0388 raised' },
        { step:'collected', date:'23 May 2026', desc:'Bank clearance · NetSuite reconciled' }
      ]
    },
    { id:'TXN-2026-003', clientId:'C05', projectId:null, amount:'₹2.40 Cr', detail:'Fixed fee phase 2 migration overdue', stage:'billed', statusText:'Critically overdue · 82 days', lastUpdated:'14 Mar 2026',
      history:[
        { step:'booked', date:'10 Feb 2025', desc:'SOW-02 signed' },
        { step:'accrued', date:'01 Mar 2026', desc:'Milestone sign-off verified' },
        { step:'billed', date:'14 Mar 2026', desc:'Invoice INV-2026-0309 raised' }
      ]
    },
    { id:'TXN-2026-004', clientId:'C01', projectId:'P01', amount:'₹48 L', detail:'Milestone M8 Pre-launch hardening deliverable', stage:'accrued', statusText:'Effort delivered · unbilled', lastUpdated:'30 May 2026',
      history:[
        { step:'booked', date:'02 Jan 2025', desc:'SOW-04 contract signed' },
        { step:'accrued', date:'30 May 2026', desc:'UAT complete · pending invoice creation' }
      ]
    },
    { id:'TXN-2026-005', clientId:'C06', projectId:'P07', amount:'₹1.10 Cr', detail:'SCADA Migration Milestone 5 scope', stage:'booked', statusText:'Booked · work in progress', lastUpdated:'01 Jul 2024',
      history:[
        { step:'booked', date:'01 Jul 2024', desc:'SOW-02 signed' }
      ]
    }
  ];

  function loadState() {
    try {
      const data = sessionStorage.getItem('ak_data');
      if (data) {
        state = JSON.parse(data);
        return;
      }
    } catch (e) {}

    state = {
      clients: DEFAULT_CLIENTS,
      projects: DEFAULT_PROJECTS,
      employees: DEFAULT_EMPLOYEES,
      contracts: DEFAULT_CONTRACTS,
      invoices: DEFAULT_INVOICES,
      documents: DEFAULT_DOCUMENTS,
      practices: DEFAULT_PRACTICES,
      transactions: DEFAULT_TRANSACTIONS
    };
    saveState();
  }

  function saveState() {
    try {
      sessionStorage.setItem('ak_data', JSON.stringify(state));
    } catch (e) {}
  }

  loadState();

  const D = {
    get clients() { return state.clients; },
    get projects() { return state.projects; },
    get employees() { return state.employees; },
    get contracts() { return state.contracts; },
    get invoices() { return state.invoices; },
    get documents() { return state.documents; },
    get practices() { return state.practices; },
    get transactions() { return state.transactions; },

    save() { saveState(); },

    /* ---- LOOKUP HELPERS ---- */
    clientById(id)              { return this.clients.find(c=>c.id===id); },
    projectById(id)             { return this.projects.find(p=>p.id===id); },
    employeeById(id)            { return this.employees.find(e=>e.id===id); },
    contractById(id)            { return this.contracts.find(k=>k.id===id); },
    projectsByClient(cid)       { return this.projects.filter(p=>p.clientId===cid); },
    contractsByClient(cid)      { return this.contracts.filter(k=>k.clientId===cid); },
    invoicesByClient(cid)       { return this.invoices.filter(i=>i.clientId===cid); },
    documentsByClient(cid)      { return this.documents.filter(d=>d.clientId===cid); },
    documentsByProject(pid)     { return this.documents.filter(d=>d.projectId===pid); },
    employeesByProject(pid)     { return this.employees.filter(e=>e.deployments.some(d=>d.pid===pid)); },
    deploymentsByEmployee(eid)  { const e=this.employeeById(eid); return e?e.deployments.map(d=>({...d,project:this.projectById(d.pid),client:this.clientById(d.cid)})):[];  },
    transactionsByClient(cid)   { return this.transactions.filter(t=>t.clientId===cid); },
    transactionsByProject(pid)  { return this.transactions.filter(t=>t.projectId===pid); },
  };

  window.AKData = D;
})();
