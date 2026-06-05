/* ============================================================
   Akashic EIS — provenance.js
   Click any [data-prov] element → provenance popover.
   Usage: <span class="prov-val" data-prov='{"src":"Financial ledger","q":"SUM(revenue) WHERE client=C01","conf":0.94,"refresh":"2 min ago","records":["INV-0412","INV-0388"]}'>₹14.2 Cr</span>
   ============================================================ */
(function () {
  let _pop = null;

  function closePop() { if (_pop) { _pop.remove(); _pop = null; } }

  function buildPop(data, rect) {
    const p = document.createElement('div');
    p.className = 'prov-pop';
    const conf = data.conf || 0;
    const lvl = conf >= 0.9 ? 'hi' : conf >= 0.8 ? 'md' : 'lo';
    const lvlLabel = conf >= 0.9 ? 'High' : conf >= 0.8 ? 'Med' : 'Low';
    const confColor = conf >= 0.9 ? 'var(--good)' : conf >= 0.8 ? 'var(--warn)' : 'var(--critical)';
    const recs = (data.records || []);
    p.innerHTML = `
      <div class="pv-head">
        <span class="pv-icon">⌖</span>
        <span class="pv-title">Data Provenance</span>
        <button class="pv-close" onclick="this.closest('.prov-pop').remove()">✕</button>
      </div>
      <div class="pv-row"><span class="pv-l">Source</span><span class="pv-v">${data.src || '—'}</span></div>
      ${data.q ? `<div class="pv-row"><span class="pv-l">Query</span><code class="pv-code">${data.q}</code></div>` : ''}
      <div class="pv-row"><span class="pv-l">Last refresh</span><span class="pv-v">${data.refresh || '—'}</span></div>
      <div class="pv-row"><span class="pv-l">Confidence</span>
        <span class="pv-v" style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:700;color:${confColor}">${lvlLabel} · ${Math.round(conf * 100)}%</span>
          <span style="display:inline-block;width:60px;height:5px;border-radius:3px;background:var(--line-2);position:relative;overflow:hidden"><span style="position:absolute;left:0;top:0;bottom:0;width:${conf * 100}%;background:${confColor};border-radius:3px"></span></span>
        </span>
      </div>
      ${recs.length ? `<div class="pv-row pv-recs"><span class="pv-l">Records</span><div class="pv-rec-list">${recs.map(r => `<span class="pv-rec">${r}</span>`).join('')}</div></div>` : ''}
      <div class="pv-foot">Click figure to open source in entity profile</div>`;
    document.body.appendChild(p);
    const pr = p.getBoundingClientRect();
    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + 8;
    if (left + 300 > window.innerWidth) left = window.innerWidth - 310;
    if (top + pr.height > window.scrollY + window.innerHeight) top = rect.top + window.scrollY - pr.height - 8;
    p.style.left = left + 'px';
    p.style.top = top + 'px';
    return p;
  }

  function init() {
    document.addEventListener('click', function (e) {
      const el = e.target.closest('[data-prov]');
      if (!el) { closePop(); return; }
      e.stopPropagation();
      closePop();
      let data;
      try { data = JSON.parse(el.dataset.prov); } catch { data = { src: el.dataset.prov }; }
      _pop = buildPop(data, el.getBoundingClientRect());
    });

    /* inject styles */
    if (document.getElementById('prov-styles')) return;
    const s = document.createElement('style');
    s.id = 'prov-styles';
    s.textContent = `
.prov-pop{position:absolute;z-index:1000;width:290px;background:var(--surface);border:1px solid var(--line-2);border-radius:var(--r-lg);box-shadow:var(--shadow-lg);padding:0;overflow:hidden;animation:pvIn .14s ease}
@keyframes pvIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.pv-head{display:flex;align-items:center;gap:8px;padding:10px 13px 9px;border-bottom:1px solid var(--line);background:var(--surface-2)}
.pv-icon{font-size:14px;color:var(--accent-2)}
.pv-title{font-weight:700;font-size:12.5px;flex:1}
.pv-close{border:0;background:none;color:var(--ink-3);font-size:13px;cursor:pointer;padding:2px 4px;border-radius:4px;line-height:1}
.pv-close:hover{color:var(--ink);background:var(--hover)}
.pv-row{display:flex;align-items:flex-start;gap:8px;padding:8px 13px;border-bottom:1px solid var(--line);font-size:12px}
.pv-row:last-of-type{border-bottom:0}
.pv-l{flex:0 0 72px;color:var(--ink-faint);font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:.04em;padding-top:1px}
.pv-v{flex:1;color:var(--ink-2);font-weight:500}
.pv-code{font-family:var(--mono);font-size:10.5px;color:var(--accent-2);background:var(--accent-soft);padding:2px 6px;border-radius:4px;flex:1;word-break:break-all}
.pv-recs{flex-wrap:wrap}
.pv-rec-list{display:flex;gap:4px;flex-wrap:wrap}
.pv-rec{font-family:var(--mono);font-size:10.5px;background:var(--surface-3);border:1px solid var(--line);padding:1px 6px;border-radius:5px;color:var(--accent-2)}
.pv-foot{padding:8px 13px;background:var(--surface-2);font-size:10.5px;color:var(--ink-faint);border-top:1px solid var(--line)}
[data-prov]{cursor:pointer;border-bottom:1px dashed var(--accent-line);text-decoration:none}
[data-prov]:hover{color:var(--accent-2)}`;
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.AKProv = { close: closePop };
})();
