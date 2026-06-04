/* ============================================================
   Akashic EIS — docdrawer.js (v2)
   Universal embedded document workspace.
   Supports both right-side overlay drawer and inline split-pane embedding.
   ============================================================ */
(function () {
  let _open = false;

  /* ---- Shared data store, backed by sessionStorage if possible ---- */
  const EXTRACTIONS = {
    D01: [
      { field:'Contract expiry',    val:'22 Jun 2026', conf:.71, clause:'§2.1 Term', page:11, validated:false },
      { field:'Auto-renewal',       val:'No',          conf:.68, clause:'§2.3',      page:12, validated:false },
      { field:'Governing law',      val:'Delaware, USA', conf:.88, clause:'§17',     page:16, validated:true,  by:'K. Iyer' },
    ],
    D02: [
      { field:'SOW value',          val:'₹9.6 Cr',     conf:.99, clause:'§4 Fees',  page:5,  validated:true,  by:'R. Desai' },
      { field:'Go-live date',       val:'30 Sep 2026',  conf:.92, clause:'§3',       page:3,  validated:true,  by:'R. Desai' },
    ],
    D03: [
      { field:'Annual fee',         val:'₹4.1 Cr',     conf:.84, clause:'§4',       page:5,  validated:false },
      { field:'Escalation %',       val:'5% p.a.',      conf:.79, clause:'§4.2',     page:5,  validated:false },
    ],
    D07: [
      { field:'SLA uptime target',  val:'99.5%',        conf:.73, clause:'§6.2',     page:8,  validated:false },
      { field:'Penalty clause',     val:'Schedule C',   conf:.68, clause:'§6.3',     page:9,  validated:false },
    ],
  };

  const COMMENTS = {
    D01: [
      { user:'K. Iyer', time:'2 days ago', text:'Conf is 0.71 on expiry — needs manual check against original PDF signed copy.' },
      { user:'R. Desai', time:'1 day ago', text:'Confirmed with legal. Expiry is definitely 22 Jun 2026.' },
    ],
  };

  function getDocsForEntity(entityType, entityId) {
    if (!window.AKData) return [];
    if (entityType === 'client')  return AKData.documentsByClient(entityId);
    if (entityType === 'project') return AKData.documentsByProject(entityId);
    return AKData.documents.filter(d => d.clientId === entityId || d.projectId === entityId);
  }

  function confChip(conf, validated, by) {
    if (validated) return `<span class="conf verified">✓ ${by||'validated'}</span>`;
    if (conf === null) return `<span class="conf lo">processing</span>`;
    const lvl = conf >= .9 ? 'hi' : conf >= .8 ? 'md' : 'lo';
    return `<span class="conf ${lvl}"><span class="cbar"><i style="width:${conf*100}%"></i></span>${conf.toFixed(2)}</span>`;
  }

  function docIcon(type) {
    const icons = { MSA:'📄', SOW:'📋', Addendum:'🔗', MoM:'📝', Email:'✉', default:'📁' };
    return icons[type] || icons.default;
  }

  /* ---- Inline Workspace Builder ---- */
  function buildInlineWorkspace(entityType, entityId, entityName) {
    const docs = getDocsForEntity(entityType, entityId);
    const pendingCount = docs.filter(d => !d.validated && d.ingested && d.conf !== null && d.conf < .9).length;
    
    return `
      <div class="inline-workspace">
        <div class="iw-left">
          <div class="iw-section-header">
            <div>
              <div class="dd-eyebrow">Document Intelligence Workspace</div>
              <div class="dd-title" style="font-size:16px">${entityName} Library</div>
            </div>
            ${pendingCount > 0 ? `<span class="badge b-renewal"><span class="bd"></span>${pendingCount} review</span>` : ''}
          </div>
          
          <!-- Ingestion Zone -->
          <div class="dd-upload" id="iw-upload" style="margin:10px 0;padding:12px">
            <div class="dd-upload-inner">
              <span style="font-size:18px">⤵</span>
              <span class="fs-12 strong">Drop PDF here to ingest to operational ledgers</span>
              <span class="fs-10 muted" style="margin-top:2px">Auto-extracts SOW values, expiration, and SLAs</span>
            </div>
          </div>
          
          <!-- Documents List -->
          <div class="iw-list" id="iw-list-container">
            ${docs.map(d => buildInlineDocRow(d, entityId, entityName)).join('')}
          </div>
        </div>
        
        <div class="iw-right" id="iw-detail-pane">
          <div style="height:100%;display:grid;place-items:center;color:var(--ink-faint);font-size:13px;padding:40px;text-align:center">
            <div>
              <span style="font-size:32px;display:block;margin-bottom:8px">📄</span>
              Select a document from the list to view live clauses, validate extractions, or manage cross-links.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function buildInlineDocRow(d, entityId, entityName) {
    const ext = EXTRACTIONS[d.id] || [];
    const pending = ext.filter(e => !e.validated).length;
    return `
      <div class="iw-row" id="iw-row-${d.id}" onclick="AKDocs.selectInlineDoc('${d.id}','${entityId}','${entityName}')">
        <div class="iw-row-main">
          <span class="dd-doc-ico">${docIcon(d.type)}</span>
          <div style="flex:1;min-width:0">
            <div class="dd-doc-name" style="font-size:12.5px">${d.name}</div>
            <div class="dd-doc-meta" style="font-size:11px">${d.type} · ${ext.length} fields</div>
          </div>
          ${confChip(d.conf, d.validated, null)}
        </div>
        ${pending > 0 ? `<div style="margin-top:4px"><span class="badge b-renewal" style="font-size:10px;padding:0 6px"><span class="bd"></span>${pending} pending verification</span></div>` : ''}
      </div>
    `;
  }

  function renderInlineDetail(docId, entityId, entityName) {
    const d = (window.AKData ? AKData.documents.find(x => x.id === docId) : null) || { name: docId, type: '—', id: docId };
    const extractions = EXTRACTIONS[docId] || [];
    const comments = COMMENTS[docId] || [];
    
    const fieldRows = extractions.map((f, i) => {
      const lvl = f.validated ? 'verified' : f.conf >= .9 ? 'hi' : f.conf >= .8 ? 'md' : 'lo';
      return `
        <div class="ext-row ${f.validated ? 'validated' : ''}" style="padding:7px 9px;margin-bottom:6px">
          <div class="ext-field" style="flex:0 0 100px;font-size:10px">${f.field}</div>
          <input class="ext-input" id="ext-input-${docId}-${i}" value="${f.val}" ${f.validated ? 'readonly' : ''} style="padding:3px 6px;font-size:12px" />
          <span class="conf ${lvl}" style="padding:1px 5px;font-size:9.5px">${f.validated ? `✓ Verified` : `0.${Math.floor(f.conf*100)}`}</span>
          <span class="ext-src mono" style="font-size:9px">p.${f.page}</span>
          ${!f.validated ? `<button class="btn xs primary" style="padding:2px 6px;font-size:10px" onclick="AKDocs.validateInlineField('${docId}',${i},'${entityId}','${entityName}')">Confirm</button>` : ''}
        </div>
      `;
    }).join('');

    const commentRows = comments.map(c => `
      <div class="cmt-row" style="padding:5px 0;font-size:11.5px">
        <b>${c.user}</b> <span class="faint">${c.time}</span>
        <div style="margin-top:2px;color:var(--ink-2)">${c.text}</div>
      </div>
    `).join('');

    return `
      <div class="iw-viewer">
        <div class="iw-pdf-col">
          <div class="pdf-toolbar" style="padding:4px 8px;margin-bottom:6px">
            <span class="mono" style="font-size:10.5px">${d.name}</span>
            <span class="mono faint" style="font-size:10.5px">§ Clause Viewer</span>
          </div>
          <div class="pdf-pane" style="padding:12px;font-size:11px;line-height:1.6;height:220px;overflow-y:auto">
            <div class="pdf-line"><b>DOCUMENT PREVIEW:</b></div>
            <div class="pdf-line mt-4">This Master Agreement governs all delivery lines between Nexora Technologies and Meridian Retail Group.</div>
            <div class="pdf-line mt-4"><b>§2.1 Term.</b> The agreement commences on the Effective Date and continues for a period of <span class="clause-hl target">eighty-four (84) months</span>, expiring on <span class="clause-hl target">22 June 2026</span>.</div>
            <div class="pdf-line mt-4"><b>§4.2 Fees.</b> Professional services fees are set out in SOW annexures. Orion Commerce rollout is budgeted at <span class="clause-hl">₹9.6 Cr</span>. Escalation cap is set at 5% per annum.</div>
            <div class="pdf-line mt-4"><b>§6.3 SLAs.</b> Managed support services SLA availability target is <span class="clause-hl">99.5%</span>. Penalties calculated per Schedule C.</div>
          </div>
        </div>
        
        <div class="iw-fields-col">
          <div class="section-label" style="margin-bottom:6px;font-size:10px">Operational Parameters</div>
          <div class="col">${fieldRows || '<div class="muted fs-12">No fields extracted.</div>'}</div>
          
          <div class="divider" style="margin:10px 0"></div>
          
          <div class="section-label" style="margin-bottom:6px;font-size:10px">Cross-Entity Mapping</div>
          <div class="flex gap-4 wrap" style="margin-bottom:8px">
            <span class="badge b-accent" style="font-size:10px;padding:1px 6px">📋 SOW-04 → Orion Project</span>
            <span class="badge b-composite" style="font-size:10px;padding:1px 6px">⊙ Deployed → Vikram Rao</span>
            <button class="btn xs" style="font-size:9.5px;padding:1px 6px" onclick="AKDocs.triggerCrossLink('${docId}')">+ Link</button>
          </div>
          
          <div class="divider" style="margin:10px 0"></div>

          <div class="section-label" style="margin-bottom:6px;font-size:10px">Comments &amp; Audit Trail</div>
          <div class="col" style="max-height:100px;overflow-y:auto;margin-bottom:6px">${commentRows || '<div class="muted fs-11">No notes.</div>'}</div>
          <div class="flex gap-6">
            <input class="cmt-input" id="cmt-input-${docId}" placeholder="Add annotation..." style="padding:4px 8px;font-size:12px" />
            <button class="btn sm" style="padding:4px 10px;font-size:12px" onclick="AKDocs.postComment('${docId}','${entityId}','${entityName}')">Post</button>
          </div>
          
          <div class="divider" style="margin:10px 0"></div>
          
          <div class="propagate-box" style="padding:8px 10px;background:var(--composite-soft);border:1px solid var(--composite-line);border-radius:6px">
            <div class="prop-chip" style="font-size:11px;color:var(--composite-2)">
              ⚡ <b>Active Propagation:</b> Validated values write back to NetSuite, Darwinbox &amp; update active SLA gauges.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function injectStyles() {
    if (document.getElementById('dd-styles')) return;
    const s = document.createElement('style');
    s.id = 'dd-styles';
    s.textContent = `
.dd-overlay{position:fixed;inset:0;background:oklch(0.2 0.01 265 / 0.3);z-index:400;display:flex;justify-content:flex-end}
.dd-drawer{width:540px;max-width:96vw;background:var(--surface);height:100%;display:flex;flex-direction:column;box-shadow:var(--shadow-lg);overflow:hidden;animation:ddIn .18s ease}
@keyframes ddIn{from{transform:translateX(30px);opacity:0}to{transform:none;opacity:1}}
.dd-head{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 18px 14px;border-bottom:1px solid var(--line);flex-wrap:wrap;gap:8px;flex:0 0 auto}
.dd-eyebrow{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--accent-2);font-weight:700;font-family:var(--mono);margin-bottom:3px}
.dd-title{font-size:18px;font-weight:800}
.dd-upload{border:2px dashed var(--line-2);border-radius:var(--r-lg);margin:14px;padding:18px;text-align:center;cursor:pointer;transition:border-color .12s,background .12s;flex:0 0 auto}
.dd-upload:hover,.dd-upload.drag{border-color:var(--accent);background:var(--accent-soft)}
.dd-upload-inner{display:flex;flex-direction:column;align-items:center;gap:5px;color:var(--ink-3)}
.dd-list{flex:1;overflow-y:auto;padding:0 14px 12px}
.dd-empty{padding:18px;color:var(--ink-3);font-size:13px;text-align:center}
.dd-doc-row{border:1px solid var(--line);border-radius:var(--r-lg);margin-bottom:8px;overflow:hidden}
.dd-doc-main{display:flex;align-items:center;gap:10px;padding:11px 13px;cursor:pointer}
.dd-doc-main:hover{background:var(--hover)}
.dd-doc-ico{font-size:20px;flex:0 0 auto}
.dd-doc-name{font-weight:600;font-size:13px}
.dd-doc-meta{font-size:11.5px;color:var(--ink-3)}
.dd-doc-actions{display:flex;gap:6px;padding:8px 13px;border-top:1px solid var(--line);background:var(--surface-2);flex-wrap:wrap}
.dd-linked{padding:12px 14px 18px;border-top:1px solid var(--line);flex:0 0 auto;background:var(--surface-2)}
.dd-section-l{font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-faint);font-weight:700}
.ext-overlay{position:fixed;inset:0;background:oklch(0.2 0.01 265 / 0.5);z-index:600;display:flex;align-items:center;justify-content:center;padding:20px}
.ext-modal{background:var(--surface);border-radius:var(--r-xl);box-shadow:var(--shadow-lg);width:100%;max-width:900px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden}
.ext-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--line);flex:0 0 auto}
.ext-body{display:grid;grid-template-columns:1fr 1fr;flex:1;overflow:hidden}
.ext-pdf-col{border-right:1px solid var(--line);padding:14px;overflow-y:auto;display:flex;flex-direction:column;gap:8px}
.ext-fields-col{padding:14px 16px;overflow-y:auto}
.ext-row{display:flex;align-items:center;gap:8px;padding:9px 10px;border:1px solid var(--line);border-radius:var(--r);flex-wrap:wrap}
.ext-row.validated{background:var(--good-soft);border-color:var(--good-line)}
.ext-field{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:var(--ink-faint);flex:0 0 110px}
.ext-input{flex:1;border:1px solid var(--line-2);border-radius:5px;padding:5px 8px;font-family:var(--mono);font-size:12.5px;color:var(--ink);min-width:80px;background:#fff}
.ext-input:read-only{background:transparent;border-color:transparent}
.ext-src{font-size:10px;color:var(--ink-faint)}
.cmt-row{padding:8px 0;border-bottom:1px solid var(--line);font-size:12.5px}
.cmt-row b{font-weight:700}
.cmt-input{flex:1;border:1px solid var(--line-2);border-radius:var(--r);padding:8px 10px;font-family:var(--sans);font-size:13px;outline:none}

/* ---- Inline Workspace Styles ---- */
.inline-workspace {
  display: grid;
  grid-template-columns: 240px 1fr;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  min-height: 480px;
}
.iw-left {
  border-right: 1px solid var(--line);
  padding: 12px;
  background: var(--surface-2);
  display: flex;
  flex-direction: column;
}
.iw-section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}
.iw-list {
  flex: 1;
  overflow-y: auto;
}
.iw-row {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--r);
  padding: 8px 10px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: border-color 0.12s, box-shadow 0.12s;
}
.iw-row:hover, .iw-row.active {
  border-color: var(--accent);
  box-shadow: var(--shadow-sm);
}
.iw-row.active {
  background: var(--accent-soft);
}
.iw-row-main {
  display: flex;
  align-items: center;
  gap: 8px;
}
.iw-right {
  background: #fff;
}
.iw-viewer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
}
.iw-pdf-col {
  border-right: 1px solid var(--line);
  padding: 14px;
  display: flex;
  flex-direction: column;
}
.iw-fields-col {
  padding: 14px;
  overflow-y: auto;
}
`;
    document.head.appendChild(s);
  }

  function openFor(opts) {
    close();
    injectStyles();
    const { entityType, entityId, entityName } = opts;
    const div = document.createElement('div');
    div.innerHTML = buildDrawer(entityType, entityId, entityName);
    document.body.appendChild(div.firstElementChild);
    _open = true;
    document.getElementById('ak-doc-drawer').addEventListener('click', e => {
      if (e.target.id === 'ak-doc-drawer') close();
    });
  }

  function embedFor(containerId, opts) {
    injectStyles();
    const container = document.getElementById(containerId);
    if (!container) return;
    const { entityType, entityId, entityName } = opts;
    container.innerHTML = buildInlineWorkspace(entityType, entityId, entityName);
    
    // Wire up Drag and Drop
    const uploadZone = container.querySelector('#iw-upload');
    if (uploadZone) {
      uploadZone.addEventListener('dragover', e => {
        e.preventDefault();
        uploadZone.classList.add('drag');
      });
      uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag');
      });
      uploadZone.addEventListener('drop', e => {
        e.preventDefault();
        uploadZone.classList.remove('drag');
        const files = e.dataTransfer.files;
        if (files.length) {
          AK && AK.toast(`Ingesting "${files[0].name}" — running OCR analysis...`);
          // Add dummy doc to model
          const newDoc = {
            id: 'D' + Math.floor(10 + Math.random() * 90),
            name: files[0].name,
            clientId: entityId,
            projectId: entityType === 'project' ? entityId : null,
            type: files[0].name.toLowerCase().includes('sow') ? 'SOW' : 'MSA',
            conf: 0.85,
            validated: false,
            ingested: true
          };
          if (window.AKData) {
            AKData.documents.unshift(newDoc);
            AKData.save();
          }
          // Re-render
          embedFor(containerId, opts);
          // Auto-select new doc
          selectInlineDoc(newDoc.id, entityId, entityName);
        }
      });
    }
  }

  function selectInlineDoc(docId, entityId, entityName) {
    // Set active row
    document.querySelectorAll('.iw-row').forEach(row => row.classList.remove('active'));
    const activeRow = document.getElementById('iw-row-' + docId);
    if (activeRow) activeRow.classList.add('active');

    // Render details
    const pane = document.getElementById('iw-detail-pane');
    if (pane) {
      pane.innerHTML = renderInlineDetail(docId, entityId, entityName);
    }
  }

  function validateInlineField(docId, fieldIndex, entityId, entityName) {
    const input = document.getElementById(`ext-input-${docId}-${fieldIndex}`);
    const newVal = input ? input.value : '';
    
    if (EXTRACTIONS[docId] && EXTRACTIONS[docId][fieldIndex]) {
      EXTRACTIONS[docId][fieldIndex].validated = true;
      EXTRACTIONS[docId][fieldIndex].val = newVal;
      EXTRACTIONS[docId][fieldIndex].by = 'Arjun Mehta';

      // Propagate: update matching contract or invoice if exists
      if (window.AKData) {
        // If it's a contract end date or value, let's update it in AKData
        const fieldName = EXTRACTIONS[docId][fieldIndex].field;
        const matchingDoc = AKData.documents.find(d => d.id === docId);
        
        if (matchingDoc) {
          // If all fields are validated, validate the document
          const allExts = EXTRACTIONS[docId] || [];
          const allValidated = allExts.every(e => e.validated);
          if (allValidated) {
            matchingDoc.validated = true;
            matchingDoc.conf = 1.0;
          }
          
          // Let's search for a matching contract record and propagate
          const clientContracts = AKData.contractsByClient(matchingDoc.clientId);
          clientContracts.forEach(k => {
            if (k.type === matchingDoc.type) {
              if (fieldName.toLowerCase().includes('expiry') || fieldName.toLowerCase().includes('end')) {
                k.end = newVal;
                k.status = 'active'; // refreshed
              }
              if (fieldName.toLowerCase().includes('fee') || fieldName.toLowerCase().includes('value')) {
                k.value = parseFloat(newVal.replace(/[^\d\.]/g, ''));
              }
            }
          });
          
          // Re-sync transactions if any matches
          AKData.save();
        }
      }

      AK && AK.toast('Field validated · propagating changes to profiles and ledgers');
      
      // Re-render viewer details
      selectInlineDoc(docId, entityId, entityName);
      
      // Dispatch propagation event so active profiles update charts/timelines
      document.dispatchEvent(new CustomEvent('ak-doc-propagated', { detail: { docId, fieldIndex, newVal } }));
    }
  }

  function postComment(docId, entityId, entityName) {
    const input = document.getElementById(`cmt-input-${docId}`);
    if (input && input.value.trim()) {
      if (!COMMENTS[docId]) COMMENTS[docId] = [];
      COMMENTS[docId].push({
        user: 'Arjun Mehta',
        time: 'Just now',
        text: input.value.trim()
      });
      AK && AK.toast('Annotation recorded');
      input.value = '';
      selectInlineDoc(docId, entityId, entityName);
    }
  }

  function triggerCrossLink(docId) {
    AK && AK.toast('Linking document to Zoho PSA project lines...');
  }

  function openExtraction(docId, entityId, entityName) {
    const existing = document.getElementById('ak-ext-overlay');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.innerHTML = buildExtractionOverlay(docId, entityId, entityName);
    document.body.appendChild(div.firstElementChild);
  }

  function validateField(docId, index) {
    if (EXTRACTIONS[docId] && EXTRACTIONS[docId][index]) {
      EXTRACTIONS[docId][index].validated = true;
      EXTRACTIONS[docId][index].by = 'Arjun Mehta';
      AK && AK.toast('Field validated · propagating to entity profile');
      const overlay = document.getElementById('ak-ext-overlay');
      if (overlay) { overlay.remove(); }
    }
  }

  function close() {
    const el = document.getElementById('ak-doc-drawer');
    if (el) el.remove();
    _open = false;
  }

  function triggerUpload(entityId) {
    AK && AK.toast('Upload dialog opened — drag & drop or browse to select file');
  }

  function handleDrop(event, entityId, entityName) {
    event.preventDefault();
    const zone = event.currentTarget;
    zone.classList.remove('drag');
    const files = event.dataTransfer.files;
    if (files.length) AK && AK.toast(`Ingesting "${files[0].name}" — extraction queued`);
  }

  function addCrossLink(entityId) {
    AK && AK.toast('Cross-link dialog — search for document to link');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectStyles);
  else injectStyles();

  window.AKDocs = { 
    openFor, 
    embedFor, 
    close, 
    openExtraction, 
    validateField, 
    triggerUpload, 
    handleDrop, 
    addCrossLink,
    selectInlineDoc,
    validateInlineField,
    postComment,
    triggerCrossLink
  };
})();
