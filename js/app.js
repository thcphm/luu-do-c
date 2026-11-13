(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
  const NS = 'http://www.w3.org/2000/svg';
  const EN = () => I18N.lang === 'en';
  // Bài học theo ngôn ngữ: bản tiếng Anh ghi đè chữ, giữ nguyên hình và tọa độ.
  const lessonsNow = () => window.LESSONS.map(L => {
    if (!EN() || !window.LESSONS_EN[L.id]) return L;
    const E = window.LESSONS_EN[L.id];
    const M = { ...L, ...E };
    if (L.chart) M.chart = {
      nodes: L.chart.nodes.map(n => ({ ...n, text: (E.texts && E.texts[n.id]) || AnalyzerEN.node(n.text) })),
      edges: L.chart.edges.map(e => ({ ...e, label: e.label ? (e.label === 'Đúng' ? 'True' : 'False') : e.label }))
    };
    return M;
  });
  let LESSONS = lessonsNow();
  const shapesNow = () => EN() ? window.SHAPES_EN : window.SHAPES;
  const clone = o => JSON.parse(JSON.stringify(o));

  const toastEl = $('#toast');
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('on'), 2200);
  }

  // ================= Tabs =================
  const tabs = ['huong-dan', 'phan-tich', 've'];
  let drawReady = false;
  function showTab(id) {
    if (!tabs.includes(id)) id = 'huong-dan';
    for (const t of tabs) $('#tab-' + t).classList.toggle('on', t === id);
    window.scrollTo(0, 0);
    document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === id));
    if (id === 've') {
      requestAnimationFrame(() => {
        if (!drawReady) { drawReady = true; fitView(); } else applyView();
        drawCanvas();
      });
    }
  }
  document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => { location.hash = b.dataset.tab; }));
  window.addEventListener('hashchange', () => showTab(location.hash.slice(1)));

  // ================= Hướng dẫn =================
  function codeHtml(code) {
    return code.split('\n').map((line, i) => {
      let h = esc(line);
      if (/^\s*#/.test(line)) h = `<span class="pp">${h}</span>`;
      else {
        h = h.replace(/(&quot;|")(.*?)(&quot;|")/g, '<span class="str">"$2"</span>');
        h = h.replace(/\b(int|float|double|char|if|else|while|for|do|return)\b/g, '<span class="kw">$1</span>');
      }
      return `<span class="l" data-i="${i}">${h || ' '}</span>`;
    }).join('');
  }

  function miniShape(type) {
    const svg = document.createElementNS(NS, 'svg');
    svg.classList.add('chart');
    const text = EN() ? { term: 'Start', io: 'Input a', proc: 'x = a + 1', dec: 'a > b', sub: 'res = f(a)' }[type] : { term: 'Bắt đầu', io: 'Nhập a', proc: 'x = a + 1', dec: 'a > b', sub: 'kq = f(a)' }[type];
    const m = { nodes: [{ id: 'm', type, x: 0, y: 0, text }], edges: [] };
    FC.render(svg, m, {});
    FC.fit(svg, m, 6);
    return svg;
  }

  function linkHover(article, svg) {
    const lines = article.querySelectorAll('pre.code .l');
    const nodes = svg.querySelectorAll('.node');
    const clear = () => { svg.classList.remove('hovering'); nodes.forEach(n => n.classList.remove('hl')); lines.forEach(l => l.classList.remove('hl')); };
    const fromLine = i => {
      clear();
      const hit = [...nodes].filter(n => (n.dataset.ln || '').split(' ').includes(String(i)));
      if (!hit.length) return;
      svg.classList.add('hovering');
      hit.forEach(n => n.classList.add('hl'));
      lines[i].classList.add('hl');
    };
    const fromNode = n => {
      clear();
      svg.classList.add('hovering');
      n.classList.add('hl');
      (n.dataset.ln || '').split(' ').forEach(i => lines[i] && lines[i].classList.add('hl'));
    };
    lines.forEach(l => {
      l.addEventListener('mouseenter', () => fromLine(+l.dataset.i));
      l.addEventListener('click', () => fromLine(+l.dataset.i));
      l.addEventListener('mouseleave', clear);
    });
    nodes.forEach(n => {
      n.addEventListener('mouseenter', () => fromNode(n));
      n.addEventListener('click', () => fromNode(n));
      n.addEventListener('mouseleave', clear);
    });
  }

  function showLesson(i) {
    const L = LESSONS[i];
    document.querySelectorAll('#lessonList button').forEach((b, j) => b.setAttribute('aria-current', j === i));
    const a = $('#lesson');
    let h = `<h1>${esc(L.title)}</h1><div class="lead">${L.body.map(p => `<p>${fmt(p)}</p>`).join('')}</div>`;
    if (L.shapes) {
      h += '<table class="shape-table"><tbody>';
      for (const k of ['term', 'io', 'proc', 'dec', 'sub']) {
        const S = shapesNow()[k];
        h += `<tr><td data-shape="${k}"></td><td><b>${esc(S.name)}</b><br><span class="muted">${esc(S.look)}</span><br>${T('inC')} <code>${esc(S.c)}</code><br><span class="small">${esc(S.tip)}</span></td></tr>`;
      }
      h += `<tr><td><svg viewBox="0 0 170 70"><defs><marker id="mk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,1 L10,5 L0,9z" fill="#c9d6e8"/></marker></defs><path d="M20 35 H150" stroke="#c9d6e8" stroke-width="2" marker-end="url(#mk)"/></svg></td>
        <td><b>${T('arrowName')}</b><br><span class="muted">${T('arrowLook')}</span><br>${T('arrowTip')}</td></tr>`;
      h += '</tbody></table>';
    }
    if (L.chart) {
      h += `<div class="pair"><div class="card"><h3>${T('codeC')}</h3><pre class="code">${codeHtml(L.code)}</pre></div>
        <div class="card"><h3>${T('chart')}</h3><svg class="chart" id="lessonChart"></svg></div></div>`;
    }
    if (L.steps) h += `<ol class="steps">${L.steps.map(s => `<li>${fmt(s)}</li>`).join('')}</ol>`;
    if (L.tips) h += `<h3>${L.chart ? T('notes') : T('mistakes')}</h3><ul class="tips">${L.tips.map(t => `<li>${fmt(t)}</li>`).join('')}</ul>`;
    if (L.practice) h += `<div class="practice"><b>${T('tryDraw')}</b> ${fmt(L.practice)}</div>`;
    h += '<div class="row">';
    if (L.chart) h += `<button data-open="${i}">${T('openSample')}</button>`;
    h += `<button data-blank>${T('openBoard')}</button>`;
    if (i < LESSONS.length - 1) h += `<button class="primary" data-next="${i + 1}">${T('nextLesson')} ${esc(LESSONS[i + 1].title)} →</button>`;
    h += '</div>';
    a.innerHTML = h;
    a.querySelectorAll('[data-shape]').forEach(td => td.append(miniShape(td.dataset.shape)));
    if (L.chart) {
      const svg = $('#lessonChart');
      FC.render(svg, L.chart, {});
      FC.fit(svg, L.chart, 30);
      linkHover(a, svg);
    }
    a.querySelector('[data-open]')?.addEventListener('click', () => openInEditor(L.chart, L.title));
    a.querySelector('[data-blank]').addEventListener('click', () => { location.hash = 've'; });
    a.querySelector('[data-next]')?.addEventListener('click', () => { showLesson(i + 1); window.scrollTo({ top: 0 }); });
    curLesson = i;
  }
  let curLesson = 0;
  const renderLessonList = () => { $('#lessonList').innerHTML = LESSONS.map((L, i) => `<button data-i="${i}"><span class="no">${i + 1}</span>${esc(L.title)}</button>`).join(''); };
  renderLessonList();
  $('#lessonList').addEventListener('click', e => { const b = e.target.closest('button'); if (b) showLesson(+b.dataset.i); });

  // ================= Phân tích đề =================
  const examplesNow = () => EN() ? window.EXAMPLES_EN : window.EXAMPLES;
  const renderExamples = () => { $('#exampleList').innerHTML = examplesNow().map((t, i) => `<button data-i="${i}">${esc(t)}</button>`).join(''); };
  renderExamples();
  $('#exampleList').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    $('#deBai').value = examplesNow()[+b.dataset.i];
    runAnalyze();
  });
  $('#btnAnalyze').addEventListener('click', () => runAnalyze());
  $('#deBai').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) runAnalyze(); });

  // ---- Đọc đề từ ảnh (OCR chạy trong trình duyệt bằng Tesseract.js) ----
  const TESS_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  const OCR_STEP = {
    'loading tesseract core': 'ocrCore', 'initializing tesseract': 'ocrInit',
    'loading language traineddata': 'ocrLang', 'initializing api': 'ocrApi', 'recognizing text': 'ocrRead'
  };
  let ocrWorker = null, ocrBusy = false;
  function loadTesseract() {
    if (window.Tesseract) return Promise.resolve();
    return new Promise((ok, fail) => {
      const s = document.createElement('script');
      s.src = TESS_URL;
      s.onload = ok;
      s.onerror = () => fail(new Error('load'));
      document.head.append(s);
    });
  }
  async function readImage(file) {
    if (!file || !/^image\//.test(file.type)) return toast(T('ocrNotImg'));
    if (ocrBusy) return toast(T('ocrBusy'));
    ocrBusy = true;
    const box = $('#ocrBox'), st = $('#ocrStatus'), pg = $('#ocrProg'), note = $('#ocrNote');
    const img = $('#ocrImg');
    if (img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
    img.src = URL.createObjectURL(file);
    box.hidden = false;
    st.textContent = T('ocrApi'); pg.hidden = false; pg.removeAttribute('value'); note.textContent = '';
    $('#btnImg').disabled = true;
    try {
      await loadTesseract();
      if (!ocrWorker) {
        ocrWorker = await Tesseract.createWorker(['vie', 'eng'], 1, {
          logger: m => {
            if (OCR_STEP[m.status]) st.textContent = T(OCR_STEP[m.status]);
            if (typeof m.progress === 'number') pg.value = m.progress;
          }
        });
      }
      const { data } = await ocrWorker.recognize(file);
      const text = (data.text || '')
        .replace(/-\n(?=\p{Ll})/gu, '')
        .replace(/[ \t]*\n[ \t]*/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
      pg.hidden = true;
      if (!text) {
        st.textContent = T('ocrNone');
        note.textContent = T('ocrNoneTip');
        return;
      }
      $('#deBai').value = text;
      st.textContent = T('ocrDone');
      note.textContent = T('ocrDoneTip');
      runAnalyze();
    } catch (e) {
      pg.hidden = true;
      st.textContent = T('ocrFail');
      note.textContent = T('ocrFailTip');
    } finally {
      ocrBusy = false;
      $('#btnImg').disabled = false;
    }
  }
  $('#btnImg').addEventListener('click', () => $('#fileImg').click());
  $('#fileImg').addEventListener('change', e => { readImage(e.target.files[0]); e.target.value = ''; });
  document.addEventListener('paste', e => {
    if (!$('#tab-phan-tich').classList.contains('on')) return;
    const item = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/'));
    if (!item) return;
    e.preventDefault();
    readImage(item.getAsFile());
  });
  const dz = $('#dropZone');
  dz.addEventListener('dragover', e => { if ([...e.dataTransfer.types].includes('Files')) { e.preventDefault(); dz.classList.add('over'); } });
  dz.addEventListener('dragleave', () => dz.classList.remove('over'));
  dz.addEventListener('drop', e => {
    dz.classList.remove('over');
    const f = e.dataTransfer.files[0];
    if (!f) return;
    e.preventDefault();
    readImage(f);
  });

  let lastAna = null;
  function runAnalyze(noScroll) {
    const text = $('#deBai').value;
    const out = $('#anaResult');
    const r = AnalyzerEN.analyze(text, I18N.lang);
    if (!r) { out.innerHTML = ''; toast(T('needText')); $('#deBai').focus(); return; }
    lastAna = r;
    const li = arr => arr.length ? `<ul>${arr.map(x => `<li>${fmt(x)}</li>`).join('')}</ul>` : `<p class="muted">${T('none')}</p>`;
    const IC = { ok: '✓', warn: '!', bad: '✕', info: 'i' };
    let h = r.pattern
      ? `<span class="badge ok">${T('patternOk')} ${esc(r.pattern)}</span>`
      : `<span class="badge warn">${T('patternNo')}</span>`;
    h += `<div class="card read"><h3>${T('step1')}</h3>
      <p class="hl-text">${r.highlight.map(g => g.c ? `<mark class="hl-${g.c}">${esc(g.t)}</mark>` : esc(g.t)).join('')}</p>
      <p class="legend small"><mark class="hl-in">${T('lgIn')}</mark><mark class="hl-out">${T('lgOut')}</mark><mark class="hl-cond">${T('lgCond')}</mark><mark class="hl-loop">${T('lgLoop')}</mark><mark class="hl-data">${T('lgData')}</mark><mark class="hl-rule">${T('lgRule')}</mark></p>${r.inputNote ? `<p class="small muted">${esc(r.inputNote)}</p>` : ''}</div>`;
    h += `<h2 class="step-h">${T('step2')}</h2><div class="ana-grid">
      <div class="card given"><h3>${T('given')}</h3>${li(r.given)}</div>
      <div class="card asked"><h3>${T('asked')}</h3>${li(r.asked)}</div>
      <div class="card"><h3>${T('vars')}</h3>${li(r.vars)}</div>
      <div class="card rule"><h3>${T('rules')}</h3>${r.rules.length ? li(r.rules) : `<p class="muted">${T('noRules')}</p>`}</div>
    </div>`;
    h += `<h2 class="step-h">${T('step3')}</h2><div class="ana-grid">
      <div class="card branch"><h3>${T('branches')}</h3>${li(r.branches)}</div>
      <div class="card loop"><h3>${T('loops')}</h3>${r.loops.length ? li(r.loops) : `<p class="muted">${T('noLoop')}</p>`}</div>
    </div>`;
    if (r.funcs.length) h += `<div class="card" style="margin-top:14px"><h3>${T('funcs')}</h3>${li(r.funcs.map(f => `${f.name}(${f.params.join(', ')}): ${f.ret ? T('fnRet', f.ret) : T('fnVoid')}`))}</div>`;
    if (r.table) h += `<div class="card" style="margin-top:14px"><h3>${T('tbl')}</h3><div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>${T('tResult')}</th><th>${T('tWritten')}</th><th>${T('tRange')}</th><th>${T('tBlock')}</th></tr></thead>
      <tbody>${r.table.map(t => `<tr><td>${esc(t.name)}</td><td>${esc(t.raw)}</td><td>${esc(t.range)}</td><td><code>${esc(t.block)}</code></td></tr>`).join('')}</tbody></table></div></div>`;
    if (r.checks.length) h += `<div class="card" style="margin-top:14px"><h3>${T('audit')}</h3><ul class="issues">${r.checks.map(c => `<li class="${c.lv}"><span class="ic">${IC[c.lv]}</span>${esc(c.msg)}</li>`).join('')}</ul></div>`;
    if (r.found.length) h += `<div class="card" style="margin-top:14px"><h3>${T('found')}</h3>${li(r.found)}</div>`;
    if (r.note) h += `<p class="note" style="margin-top:14px">${fmt(r.note)}</p>`;
    h += `<h2 class="step-h">${T('step4')}</h2><div class="pair">
      <div class="card"><h3>${T('howto')}</h3><ol class="howto">${r.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>
      <div class="card"><h3>${T('suggested')}</h3><svg class="chart" id="anaChart"></svg>
        <div class="row"><button class="primary" id="anaOpen">${T('openEdit')}</button></div></div>
    </div>`;
    if (r.tests.length) h += `<h2 class="step-h">${T('step5')}</h2><div class="card"><p class="small muted">${T('runIntro')}</p>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>${T('tIn')}</th><th>${T('tPath')}</th><th>${T('tOut')}</th></tr></thead>
      <tbody>${r.tests.map(t => `<tr><td><code>${esc(t.input)}</code></td><td class="small">${esc(t.path.join(' → ') || T('straight'))}</td><td>${t.output.map(esc).join('<br>') || `<span class="muted">${T('noPrint')}</span>`}</td></tr>`).join('')}</tbody></table></div></div>`;
    out.innerHTML = h;
    const svg = $('#anaChart');
    FC.render(svg, r.chart, {});
    FC.fit(svg, r.chart, 30);
    $('#anaOpen').addEventListener('click', () => openInEditor(r.chart, T('suggestedName')));
    if (!noScroll) out.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }

  // ================= Bảng vẽ =================
  const KEY = 'luu-do-c-v1';
  const svg = $('#canvas');
  let model = load() || { nodes: [], edges: [] };
  let sel = null; // {kind:'node'|'edge', id}
  let connectMode = false, connectFrom = null;
  let undo = [];
  let view = { x: -300, y: -80, k: 1 };
  let checked = false, issues = [], badIds = new Set();

  function load() {
    try { const s = localStorage.getItem(KEY); if (s) { const m = JSON.parse(s); if (m && Array.isArray(m.nodes)) return m; } } catch (e) { }
    return null;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(model)); } catch (e) { } }
  function snap() { undo.push(JSON.stringify(model)); if (undo.length > 80) undo.shift(); }
  const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const node = id => model.nodes.find(n => n.id === id);
  const outs = id => model.edges.filter(e => e.from === id);
  const ins = id => model.edges.filter(e => e.to === id);
  const W = () => svg.clientWidth || 800, H = () => svg.clientHeight || 600;

  function applyView() { svg.setAttribute('viewBox', `${view.x} ${view.y} ${W() / view.k} ${H() / view.k}`); }
  function fitView() {
    const b = FC.bbox(model, 50);
    const k = Math.min(W() / b.w, H() / b.h, 1.3);
    view.k = Math.max(0.3, k);
    view.x = b.x + b.w / 2 - W() / view.k / 2;
    view.y = b.y + b.h / 2 - H() / view.k / 2;
    applyView();
  }
  function drawCanvas() {
    if (checked) runCheck(false);
    FC.render(svg, model, { editable: true, sel: sel && sel.id, bad: badIds, from: connectFrom });
    svg.classList.toggle('connecting', connectMode);
    applyView();
    save();
  }
  function select(s) { sel = s; renderPanel(); drawCanvas(); }
  function setStatus(t) { $('#status').textContent = t || ''; }

  function defaultText(type) {
    if (type === 'term') return model.nodes.some(n => n.type === 'term' && /^\s*(bắt đầu|start|begin)\s*$/i.test(n.text)) ? T('defEnd') : T('defStart');
    return { io: T('defIo'), proc: T('defProc'), dec: T('defDec'), sub: T('defSub') }[type];
  }
  function canGoOut(n) {
    const o = outs(n.id).length;
    if (n.type === 'dec') return o < 2;
    if (n.type === 'term' && /kết thúc|^\s*end|trả về|return/i.test(n.text)) return false;
    return o < 1;
  }
  const grid = v => Math.round(v / 10) * 10;
  function free(x, y, skip) {
    const near = () => model.nodes.some(n => n !== skip && Math.abs(n.x - x) < 120 && Math.abs(n.y - y) < 50);
    let tries = 0;
    while (near() && tries++ < 30) y += 70;
    return y;
  }

  function addNode(type) {
    snap();
    const base = sel && sel.kind === 'node' ? node(sel.id) : null;
    const auto = $('#autoLink').checked && base && canGoOut(base);
    const text = defaultText(type);
    const h = FC.size({ type, text }).h;
    let x, y;
    if (auto) {
      const bb = FC.box(base);
      if (base.type === 'dec' && outs(base.id).length === 1) { x = base.x + bb.w / 2 + 120; y = bb.b + 50 + h / 2; }
      else { x = base.x; y = bb.b + 44 + h / 2; }
    } else if (base) {
      x = base.x + 220; y = base.y;
    } else {
      x = view.x + W() / view.k / 2; y = view.y + H() / view.k / 3;
    }
    x = grid(x); y = grid(free(grid(x), grid(y)));
    const n = { id: uid('n'), type, x, y, text };
    model.nodes.push(n);
    if (auto) makeEdge(base.id, n.id, false);
    sel = { kind: 'node', id: n.id };
    renderPanel();
    drawCanvas();
    const ta = $('#nodeText');
    if (ta && matchMedia('(pointer: fine)').matches) { ta.focus(); ta.select(); }
  }

  function makeEdge(a, b, withSnap = true) {
    if (a === b) return toast(T('selfLink'));
    if (model.edges.some(e => e.from === a && e.to === b)) return toast(T('dupLink'));
    if (withSnap) snap();
    const s = node(a);
    const e = { id: uid('e'), from: a, to: b };
    if (s.type === 'dec') {
      const labels = outs(a).map(x => (x.label || '').toLowerCase());
      const hasYes = labels.some(l => l === 'đúng' || l === 'true'), hasNo = labels.some(l => l === 'sai' || l === 'false');
      e.label = !hasYes ? T('yes') : !hasNo ? T('no') : '';
      if (outs(a).length >= 2) toast(T('twoOuts'));
    } else if (outs(a).length >= 1) toast(T('oneOut'));
    model.edges.push(e);
  }

  function deleteSel() {
    if (!sel) return toast(T('noSel'));
    snap();
    if (sel.kind === 'node') {
      model.nodes = model.nodes.filter(n => n.id !== sel.id);
      model.edges = model.edges.filter(e => e.from !== sel.id && e.to !== sel.id);
    } else model.edges = model.edges.filter(e => e.id !== sel.id);
    select(null);
  }

  function setConnect(on) {
    connectMode = on;
    connectFrom = null;
    $('#btnConnect').setAttribute('aria-pressed', on);
    setStatus(on ? T('conn1') : '');
    drawCanvas();
  }
  function clickConnect(id) {
    if (!connectFrom) {
      connectFrom = id;
      setStatus(T('conn2'));
    } else if (connectFrom === id) {
      connectFrom = null;
      setStatus(T('conn1'));
    } else {
      makeEdge(connectFrom, id);
      connectFrom = null;
      setStatus(T('conn3'));
    }
    drawCanvas();
  }

  // ---- Chuột / cảm ứng ----
  const toWorld = ev => {
    const r = svg.getBoundingClientRect();
    return [view.x + (ev.clientX - r.left) / view.k, view.y + (ev.clientY - r.top) / view.k];
  };
  let drag = null, lastTap = { id: null, t: 0 };
  svg.addEventListener('pointerdown', ev => {
    if (ev.pointerType === 'mouse' && ev.button !== 0) return;
    const ng = ev.target.closest('.node'), eg = ev.target.closest('.edge');
    const [wx, wy] = toWorld(ev);
    if (ng) {
      const id = ng.dataset.id;
      if (connectMode) { clickConnect(id); return; }
      const now = performance.now();
      const dbl = lastTap.id === id && now - lastTap.t < 380;
      lastTap = { id, t: now };
      if (!sel || sel.id !== id) select({ kind: 'node', id });
      if (dbl) { const ta = $('#nodeText'); if (ta) { ta.focus(); ta.select(); } return; }
      const n = node(id);
      drag = { kind: 'node', n, dx: wx - n.x, dy: wy - n.y, before: JSON.stringify(model), moved: false };
    } else if (eg) {
      select({ kind: 'edge', id: eg.dataset.id });
      return;
    } else {
      if (sel) select(null);
      drag = { kind: 'pan', sx: ev.clientX, sy: ev.clientY, vx: view.x, vy: view.y };
    }
    svg.setPointerCapture(ev.pointerId);
  });
  svg.addEventListener('pointermove', ev => {
    if (!drag) return;
    if (drag.kind === 'node') {
      const [wx, wy] = toWorld(ev);
      const x = grid(wx - drag.dx), y = grid(wy - drag.dy);
      if (x !== drag.n.x || y !== drag.n.y) { drag.n.x = x; drag.n.y = y; drag.moved = true; drawCanvas(); }
    } else {
      view.x = drag.vx - (ev.clientX - drag.sx) / view.k;
      view.y = drag.vy - (ev.clientY - drag.sy) / view.k;
      applyView();
    }
  });
  const endDrag = () => {
    if (drag && drag.kind === 'node' && drag.moved) { undo.push(drag.before); save(); }
    drag = null;
  };
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', endDrag);
  svg.addEventListener('wheel', ev => {
    ev.preventDefault();
    const [wx, wy] = toWorld(ev);
    zoomAt(view.k * (ev.deltaY < 0 ? 1.12 : 1 / 1.12), wx, wy, ev);
  }, { passive: false });
  function zoomAt(k, wx, wy, ev) {
    k = Math.min(2.5, Math.max(0.3, k));
    const r = svg.getBoundingClientRect();
    const px = ev ? ev.clientX - r.left : W() / 2, py = ev ? ev.clientY - r.top : H() / 2;
    if (wx === undefined) { wx = view.x + px / view.k; wy = view.y + py / view.k; }
    view.k = k;
    view.x = wx - px / k;
    view.y = wy - py / k;
    applyView();
  }
  new ResizeObserver(() => { if ($('#tab-ve').classList.contains('on')) applyView(); }).observe(svg);

  // ---- Thanh công cụ ----
  document.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => addNode(b.dataset.add)));
  $('#btnConnect').addEventListener('click', () => setConnect(!connectMode));
  $('#btnUndo').addEventListener('click', doUndo);
  $('#btnDel').addEventListener('click', deleteSel);
  $('#btnFit').addEventListener('click', fitView);
  $('#btnZoomIn').addEventListener('click', () => zoomAt(view.k * 1.2));
  $('#btnZoomOut').addEventListener('click', () => zoomAt(view.k / 1.2));
  $('#btnCheck').addEventListener('click', () => { checked = true; runCheck(true); drawCanvas(); renderPanel(); });
  $('#btnClear').addEventListener('click', () => {
    if (!model.nodes.length) return;
    if (!confirm(T('clearAsk'))) return;
    snap(); model = { nodes: [], edges: [] }; checked = false; badIds = new Set(); select(null);
  });
  $('#btnPng').addEventListener('click', async () => {
    if (!model.nodes.length) return toast(T('empty'));
    try {
      const blob = await FC.toPng(model);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = T('pngName');
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      toast(T('pngDone'));
    } catch (e) { toast(T('pngFail')); }
  });
  const tpl = $('#tpl');
  const renderTpl = () => {
    tpl.innerHTML = `<option value="">${esc(T('tplOpen'))}</option>`;
    LESSONS.forEach((L, i) => { if (L.chart) tpl.insertAdjacentHTML('beforeend', `<option value="${i}">${esc(L.title)}</option>`); });
  };
  renderTpl();
  tpl.addEventListener('change', () => {
    const i = tpl.value;
    tpl.value = '';
    if (i !== '') openInEditor(LESSONS[+i].chart, LESSONS[+i].title);
  });

  function doUndo() {
    if (!undo.length) return toast(T('noUndo'));
    model = JSON.parse(undo.pop());
    if (sel && !(sel.kind === 'node' ? node(sel.id) : model.edges.some(e => e.id === sel.id))) sel = null;
    renderPanel(); drawCanvas();
  }

  function openInEditor(chart, name) {
    if (model.nodes.length && !confirm(T('replaceAsk', name))) return;
    snap();
    model = clone(chart);
    model.nodes.forEach(n => delete n.ln);
    sel = null; checked = false; badIds = new Set();
    drawReady = false;
    location.hash = 've';
    if (location.hash === '#ve') showTab('ve');
    renderPanel();
  }

  document.addEventListener('keydown', ev => {
    if (!$('#tab-ve').classList.contains('on')) return;
    const typing = /TEXTAREA|INPUT|SELECT/.test(document.activeElement.tagName);
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'z' && !typing) { ev.preventDefault(); doUndo(); }
    else if ((ev.key === 'Delete' || ev.key === 'Backspace') && !typing && sel) { ev.preventDefault(); deleteSel(); }
    else if (ev.key === 'Escape') { if (connectMode) setConnect(false); else if (sel) select(null); }
  });

  // ---- Bảng bên phải ----
  const COLOR = { term: 'var(--terminal)', io: 'var(--amp)', proc: 'var(--brand)', dec: 'var(--lamp)', sub: 'var(--desk)' };
  function renderPanel() {
    const p = $('#panel');
    let h = '';
    const n = sel && sel.kind === 'node' ? node(sel.id) : null;
    const e = sel && sel.kind === 'edge' ? model.edges.find(x => x.id === sel.id) : null;
    if (n) {
      const S = shapesNow()[n.type];
      h += `<div class="kind"><span class="dot" style="background:${COLOR[n.type]}"></span><h3 style="margin:0">${esc(S.name)}</h3></div>
        <label for="nodeText">${T('textLabel')}</label>
        <textarea id="nodeText" rows="3">${esc(n.text)}</textarea>
        <div class="btn-row"><button id="pDel">${T('delBlock')}</button></div>
        <div class="hint"><b>${T('inC')}</b> <code>${esc(S.c)}</code><br>${esc(S.tip)}</div>`;
    } else if (e) {
      const a = node(e.from), b = node(e.to);
      const opts = [...new Set([T('yes'), T('no'), e.label].filter(Boolean))];
      h += `<h3>${T('arrow')}</h3><p class="small muted">${esc(T('fromTo', a ? a.text : '?', b ? b.text : '?'))}</p>
        <label for="edgeLabel">${T('label')}</label>
        <select id="edgeLabel"><option value="">${T('noLabel')}</option>${opts.map(o => `<option>${esc(o)}</option>`).join('')}</select>
        <div class="btn-row"><button id="pFlip">${T('flip')}</button><button id="pDel">${T('delArrow')}</button></div>
        <div class="hint">${T('arrowHint')}</div>`;
    } else {
      h += `<h3>${T('howUse')}</h3><ol>${T('use').map(x => `<li>${x}</li>`).join('')}</ol>
        <p class="small muted" style="margin-top:10px">${T('saved')}</p>`;
    }
    if (checked) {
      h += `<hr><h3>${T('checkRes')}</h3><ul class="issues">${issues.map((it, i) =>
        `<li class="${it.lv}" data-i="${i}"><span class="ic">${it.lv === 'ok' ? '✓' : it.lv === 'bad' ? '✕' : '!'}</span>${esc(it.msg)}</li>`).join('')}</ul>`;
    }
    p.innerHTML = h;
    const ta = $('#nodeText');
    if (ta) {
      let snapped = false;
      ta.addEventListener('focus', () => { snapped = false; });
      ta.addEventListener('input', () => {
        if (!snapped) { snap(); snapped = true; }
        n.text = ta.value;
        drawCanvas();
      });
    }
    $('#pDel')?.addEventListener('click', deleteSel);
    const lab = $('#edgeLabel');
    if (lab) {
      lab.value = e.label || '';
      lab.addEventListener('change', () => { snap(); e.label = lab.value; drawCanvas(); });
      $('#pFlip').addEventListener('click', () => { snap(); [e.from, e.to] = [e.to, e.from]; delete e.fs; delete e.ts; drawCanvas(); });
    }
    p.querySelectorAll('.issues li').forEach(li => li.addEventListener('click', () => {
      const it = issues[+li.dataset.i];
      if (!it.id) return;
      const t = node(it.id);
      if (!t) return;
      view.x = t.x - W() / view.k / 2; view.y = t.y - H() / view.k / 2;
      select({ kind: 'node', id: t.id });
    }));
  }

  // ---- Kiểm tra quy tắc ----
  function runCheck(announce) {
    const I = [];
    const add = (lv, msg, id) => I.push({ lv, msg, id });
    const N = model.nodes;
    const name = n => `"${String(n.text).replace(/\n/g, ' ').trim() || T('blank')}"`;
    if (!N.length) add('bad', T('cEmpty'));
    const starts = N.filter(n => n.type === 'term' && /^\s*(bắt đầu|bat dau|begin|start)/i.test(n.text));
    const ends = N.filter(n => n.type === 'term' && /kết thúc|ket thuc|end|stop|trả về|tra ve|return/i.test(n.text));
    if (N.length) {
      if (!starts.length) add('bad', T('cNoStart'));
      // Lưu đồ chính có 1 khối "Bắt đầu"; mỗi hàm có thêm 1 khối "Bắt đầu tênHàm(...)".
      const plainStarts = starts.filter(n => /^\s*(bắt đầu|bat dau|begin|start)\s*$/i.test(n.text));
      if (plainStarts.length > 1) plainStarts.slice(1).forEach(n => add('bad', T('cTwoStart'), n.id));
      if (!ends.length) add('bad', T('cNoEnd'));
    }
    for (const n of N) {
      const o = outs(n.id), i = ins(n.id);
      if (!String(n.text).trim()) add('warn', T('cNoText'), n.id);
      if (n.type === 'term') {
        if (starts.includes(n)) {
          if (i.length) add('bad', T('cStartIn'), n.id);
          if (o.length !== 1) add('bad', T('cStartOut'), n.id);
        } else if (ends.includes(n)) {
          if (o.length) add('bad', T('cEndOut'), n.id);
          if (!i.length) add('bad', T('cEndIn'), n.id);
        } else add('warn', T('cTermName', name(n)), n.id);
        continue;
      }
      if (!i.length) add('bad', T('cNoIn', name(n)), n.id);
      if (n.type === 'dec') {
        if (o.length !== 2) add('bad', T('cDecOuts', name(n), o.length), n.id);
        else {
          const ls = o.map(e => (e.label || '').trim().toLowerCase());
          const y = ls.some(l => ['đúng', 'true', 'yes', 'có'].includes(l)), f = ls.some(l => ['sai', 'false', 'no', 'không'].includes(l));
          if (!(y && f)) add('warn', T('cDecLabels', name(n)), n.id);
        }
        if (!/[<>=!]|&&|\|\|/.test(n.text)) add('warn', T('cDecCmp', name(n)), n.id);
      } else {
        if (!o.length) add('bad', T('cNoOut', name(n)), n.id);
        if (o.length > 1) add('bad', T('cManyOut', name(n), o.length), n.id);
      }
      if (n.type === 'proc' && /printf|scanf|\bnhập\b|\bxuất\b|\bin ra\b|^\s*(input|output|print|read|display)\b/i.test(n.text)) add('warn', T('cProcIo', name(n)), n.id);
      if (n.type === 'proc' && /^\s*([\w.]+\s*=\s*)?[A-Za-z_]\w*\s*\([^)]*\)\s*$/.test(n.text) && !/sqrt|abs|pow/.test(n.text)) add('warn', T('cProcCall', name(n)), n.id);
      if (n.type === 'sub' && !/\(/.test(n.text)) add('warn', T('cSubParen', name(n)), n.id);
      if (n.type === 'proc' && /^\s*(if|while|for|nếu)\b/i.test(n.text)) add('warn', T('cProcIf', name(n)), n.id);
      if (n.type === 'io' && !/^\s*(nhập|xuất|in|đọc|ghi|hiển thị|printf|scanf|input|output|print|read|display|write)/i.test(n.text)) add('warn', T('cIoWord', name(n)), n.id);
    }
    for (const e of model.edges) if (e.from === e.to) add('warn', T('cSelf'), e.from);
    if (starts.length) {
      const seen = new Set([starts[0].id]), q = [starts[0].id];
      while (q.length) for (const e of outs(q.shift())) if (!seen.has(e.to)) { seen.add(e.to); q.push(e.to); }
      for (const n of N) if (!seen.has(n.id) && !starts.includes(n)) add('bad', T('cUnreach', name(n)), n.id);
    }
    if (ends.length) {
      const seen = new Set(ends.map(n => n.id)), q = ends.map(n => n.id);
      while (q.length) for (const e of ins(q.shift())) if (!seen.has(e.from)) { seen.add(e.from); q.push(e.from); }
      for (const n of N) if (!seen.has(n.id)) add('warn', T('cNoEndPath', name(n)), n.id);
    }
    const order = { bad: 0, warn: 1 };
    I.sort((a, b) => order[a.lv] - order[b.lv]);
    if (!I.length) I.push({ lv: 'ok', msg: T('cOk') });
    issues = I;
    badIds = new Set(I.filter(x => x.id && x.lv !== 'ok').map(x => x.id));
    if (announce) {
      const nb = I.filter(x => x.lv === 'bad').length, nw = I.filter(x => x.lv === 'warn').length;
      toast(I[0].lv === 'ok' ? T('cOkToast') : T('cSum', nb, nw));
    }
    if (checked && $('#panel .issues')) {
      // cập nhật danh sách lỗi mà không vẽ lại ô đang gõ
      const ul = $('#panel .issues');
      ul.innerHTML = I.map((it, i) => `<li class="${it.lv}" data-i="${i}"><span class="ic">${it.lv === 'ok' ? '✓' : it.lv === 'bad' ? '✕' : '!'}</span>${esc(it.msg)}</li>`).join('');
      ul.querySelectorAll('li').forEach(li => li.addEventListener('click', () => {
        const it = issues[+li.dataset.i];
        const t = it.id && node(it.id);
        if (!t) return;
        view.x = t.x - W() / view.k / 2; view.y = t.y - H() / view.k / 2;
        select({ kind: 'node', id: t.id });
      }));
    }
  }

  // ================= Đổi ngôn ngữ =================
  function rerenderAll() {
    I18N.apply();
    LESSONS = lessonsNow();
    renderLessonList();
    renderTpl();
    renderExamples();
    showLesson(Math.min(curLesson, LESSONS.length - 1));
    renderPanel();
    if (checked) { runCheck(false); renderPanel(); }
    if ($('#tab-ve').classList.contains('on')) drawCanvas();
    if (lastAna && $('#deBai').value.trim()) runAnalyze(true);
  }
  $('#btnLang').addEventListener('click', () => { I18N.set(I18N.lang === 'vi' ? 'en' : 'vi'); rerenderAll(); });

  // ================= Khởi động =================
  I18N.apply();
  if (!model.nodes.length) model = clone(LESSONS[1].chart), model.nodes.forEach(n => delete n.ln);
  showLesson(0);
  renderPanel();
  showTab(location.hash.slice(1));
  document.fonts && document.fonts.ready.then(() => {
    showLesson(curLesson);
    if (lastAna) runAnalyze(true);
    if ($('#tab-ve').classList.contains('on')) drawCanvas();
  });
})();
