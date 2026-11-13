/* Phân tích đề bài bằng từ khóa (chạy trên máy, không gửi đề đi đâu).
   Kết quả: đề cho gì, hỏi gì, các nhánh, vòng lặp, hướng vẽ, lưu đồ và code C gợi ý. */
window.Analyzer = (() => {
  // ---------- Câu lệnh của "chương trình có cấu trúc" ----------
  const io = text => ({ t: 'io', text });
  const pr = text => ({ t: 'proc', text });
  const SUB = text => ({ t: 'sub', text }); // gọi hàm: khối chữ nhật 2 vạch đứng
  const simple = s => s.t === 'io' || s.t === 'proc' || s.t === 'sub';
  const IF = (cond, yes, no = []) => ({ t: 'if', cond, yes, no });
  const WHILE = (cond, body) => ({ t: 'while', cond, body });
  const FOR = (init, cond, step, body) => ({ t: 'for', init, cond, step, body });
  const DO = (body, cond) => ({ t: 'do', body, cond });
  // switch (expr) { case v: ...; default: ... }. Mỗi case có thể gộp nhiều giá trị: { vals: [1, 3], body }.
  const SWITCH = (expr, cases, def = []) => ({ t: 'switch', expr, cases, def });
  const caseCond = (expr, vals) => vals.map(v => `${expr} == ${v}`).join(' || ');
  const caseLabel = (expr, vals) => vals.length === 1 ? `${expr} == ${vals[0]}`
    : `${expr} == ` + vals.reduce((a, v, i) => a + (i ? (i % 4 ? ', ' : ',\n') : '') + v, '');
  function swIf(s) {
    let tail = s.def;
    for (let i = s.cases.length - 1; i >= 0; i--) tail = [IF(caseLabel(s.expr, s.cases[i].vals), s.cases[i].body, tail)];
    return tail[0] || IF(`${s.expr} == ${s.expr}`, [], []);
  }
  // Các danh sách lệnh con của một câu lệnh (dùng khi duyệt cây).
  const kids = s => s.t === 'if' ? [s.yes, s.no] : s.t === 'switch' ? [...s.cases.map(c => c.body), s.def] : s.body ? [s.body] : [];

  // Bỏ dấu, giữ nguyên độ dài để vị trí khớp với đề gốc.
  const strip = s => [...s].map(ch => {
    if (ch === 'đ') return 'd';
    if (ch === 'Đ') return 'D';
    const b = ch.normalize('NFD').replace(/[̀-ͯ]/g, '');
    return b.length === 1 ? b : ch;
  }).join('');
  const plainOf = s => strip(s).toLowerCase();

  const uniq = a => [...new Set(a)];

  // Các biến 1 chữ cái (a, b, n, x1...) viết không dấu trong đề.
  function letterVars(orig) {
    const out = [];
    const re = /(?<![\p{L}\d_])([a-z]\d?)(?![\p{L}\d_])/gu;
    let m;
    while ((m = re.exec(orig.toLowerCase()))) if (m[1] !== 'o') out.push(m[1]);
    return uniq(out);
  }

  // ---------- Dựng lưu đồ từ chương trình ----------
  const GAP = 40;
  const sz = (type, text) => FC.size({ type, text });

  function width(list) { return Math.max(0, ...list.map(swidth)); }
  function ifOff(s) {
    const d = sz('dec', s.cond).w;
    const wy = width(s.yes), wn = width(s.no);
    if (!s.no.length) {
      const oy = Math.max(wy / 2 + 34, d / 2 + 34);
      return { oy: -oy, on: 0, w: 2 * (oy + wy / 2) };
    }
    const oy = Math.max(wy / 2 + 26, d / 2 + 34), on = Math.max(wn / 2 + 26, d / 2 + 34);
    return { oy: -oy, on, w: 2 * Math.max(oy + wy / 2, on + wn / 2) };
  }
  // Chuỗi if / else if / else: xếp bậc thang dọc cho gọn.
  const isChain = s => s.t === 'if' && s.no.length === 1 && s.no[0].t === 'if';
  function chainOf(s) {
    const conds = [];
    let cur = s;
    while (cur && cur.t === 'if') {
      conds.push(cur);
      cur = cur.no.length === 1 && cur.no[0].t === 'if' ? cur.no[0] : null;
    }
    return { conds, last: conds[conds.length - 1].no };
  }
  function chainGeo(s) {
    const { conds, last } = chainOf(s);
    const dw = Math.max(...conds.map(c => sz('dec', c.cond).w));
    const yw = Math.max(0, ...conds.map(c => width(c.yes)));
    const off = dw / 2 + 50 + yw / 2;
    return { conds, last, off, w: 2 * (off + yw / 2) + 60 };
  }
  function swidth(s) {
    if (s.t === 'switch') s = swIf(s);
    if (simple(s)) return sz(s.t, s.text).w;
    if (isChain(s)) return chainGeo(s).w;
    if (s.t === 'if') return ifOff(s).w;
    if (s.t === 'for') return Math.max(sz('proc', s.init).w, sz('dec', s.cond).w, width(s.body), sz('proc', s.step).w) + 90;
    return Math.max(sz('dec', s.cond).w, width(s.body)) + 90;
  }

  function build(prog, opt = {}) {
    const P = opt.prefix || 'g';
    const nodes = [], edges = [];
    let k = 0;
    const add = (type, text, x, y) => {
      const n = { id: P + (++k), type, text, x: Math.round(x), y: Math.round(y + sz(type, text).h / 2) };
      nodes.push(n);
      return n;
    };
    const link = (exits, to, extra = {}) => {
      for (const ex of exits) {
        const e = { id: P + 'e' + (++k), from: ex.from, to };
        if (ex.label) e.label = ex.label;
        if (ex.fs) { e.fs = ex.fs; e.ts = ex.ts; }
        Object.assign(e, extra);
        edges.push(e);
      }
    };
    function place(list, x, y, exits) {
      for (let s of list) {
        if (s.t === 'switch') s = swIf(s); // switch vẽ thành chuỗi khối thoi "biến == giá trị"
        if (simple(s)) {
          const n = add(s.t, s.text, x, y);
          link(exits, n.id);
          exits = [{ from: n.id }];
          y += sz(s.t, s.text).h + GAP;
        } else if (isChain(s)) {
          // Khối thoi xếp dọc. Đúng: rẽ phải ra khối kết quả. Sai: đi thẳng xuống khối thoi kế.
          const g = chainGeo(s);
          const done = [];
          for (const c of g.conds) {
            const dh = sz('dec', c.cond).h;
            const d = add('dec', c.cond, x, y);
            link(exits, d.id);
            let yy = y, hh = dh;
            const f = c.yes[0];
            if (f && simple(f)) yy = y + dh / 2 - sz(f.t, f.text).h / 2;
            const r = c.yes.length ? place(c.yes, x + g.off, yy, [{ from: d.id, label: 'Đúng' }]) : { exits: [{ from: d.id, label: 'Đúng' }], y: yy };
            hh = Math.max(dh, r.y - GAP - y);
            done.push(...r.exits.map(ex => ({ ...ex, fs: 'right', ts: 'right' })));
            exits = [{ from: d.id, label: 'Sai' }];
            y += hh + GAP;
          }
          if (g.last.length) {
            const r = place(g.last, x, y, exits);
            exits = r.exits;
            y = r.y;
          }
          exits = [...done, ...exits];
        } else if (s.t === 'if') {
          const d = add('dec', s.cond, x, y);
          link(exits, d.id);
          const y0 = y + sz('dec', s.cond).h + GAP;
          const o = ifOff(s);
          const r1 = s.yes.length ? place(s.yes, x + o.oy, y0, [{ from: d.id, label: 'Đúng' }]) : { exits: [{ from: d.id, label: 'Đúng' }], y: y0 };
          const r2 = s.no.length ? place(s.no, x + o.on, y0, [{ from: d.id, label: 'Sai' }]) : { exits: [{ from: d.id, label: 'Sai' }], y: y0 };
          exits = [...r1.exits, ...r2.exits];
          y = Math.max(r1.y, r2.y);
        } else if (s.t === 'while' || s.t === 'for') {
          if (s.t === 'for') {
            const n = add('proc', s.init, x, y);
            link(exits, n.id);
            exits = [{ from: n.id }];
            y += sz('proc', s.init).h + GAP;
          }
          const d = add('dec', s.cond, x, y);
          link(exits, d.id);
          const body = s.t === 'for' ? [...s.body, pr(s.step)] : s.body;
          const r = place(body, x, y + sz('dec', s.cond).h + GAP, [{ from: d.id, label: 'Đúng' }]);
          link(r.exits, d.id, { fs: 'left', ts: 'left' });
          exits = [{ from: d.id, label: 'Sai', fs: 'right', ts: 'right' }];
          y = r.y;
        } else if (s.t === 'do') {
          const first = nodes.length;
          const r = place(s.body, x, y, exits);
          const d = add('dec', s.cond, x, r.y);
          link(r.exits, d.id);
          if (nodes[first]) link([{ from: d.id, label: 'Đúng' }], nodes[first].id);
          exits = [{ from: d.id, label: 'Sai' }];
          y = r.y + sz('dec', s.cond).h + GAP;
        }
      }
      return { exits, y };
    }
    const sText = opt.start || 'Bắt đầu', eText = opt.end || 'Kết thúc';
    const st = add('term', sText, 0, 0);
    const r = place(prog, 0, sz('term', sText).h + GAP, [{ from: st.id }]);
    const end = add('term', eText, 0, r.y);
    link(r.exits, end.id);
    return { nodes, edges };
  }

  // ---------- Diễn giải chương trình thành lời ----------
  const short = t => t.replace(/\n/g, '; ');
  function brief(list) {
    if (!list.length) return 'đi tiếp';
    return list.map(s => simple(s) ? short(s.text) : s.t === 'if' ? `xét tiếp "${s.cond}"` : s.t === 'switch' ? `switch theo ${s.expr}` : 'lặp').join(', ');
  }
  function steps(prog, opt = {}) {
    const out = [`Vẽ khối ${opt.start ? '"' + opt.start + '"' : 'Bắt đầu'} (hình viên thuốc).`];
    const walk = (list, pre) => {
      for (const s of list) {
        if (s.t === 'io') out.push(`${pre}Khối Nhập/Xuất (bình hành): ${short(s.text)}.`);
        else if (s.t === 'proc') out.push(`${pre}Khối Xử lý (chữ nhật): ${short(s.text)}.`);
        else if (s.t === 'sub') out.push(`${pre}Khối Gọi hàm (chữ nhật có 2 vạch đứng): ${short(s.text)}.`);
        else if (s.t === 'switch') {
          out.push(`${pre}switch (${s.expr}): lưu đồ không có hình riêng cho switch, vẽ thành ${s.cases.length} khối thoi xếp dọc:`);
          s.cases.forEach((c, i) => {
            out.push(`${pre}   Khối thoi ${i + 1}: ${short(caseLabel(s.expr, c.vals))} ?  (case ${c.vals.join(', case ')})`);
            out.push(`${pre}      → Đúng (rẽ phải): ${brief(c.body)}, rồi break (nhảy ra cuối switch).`);
            out.push(`${pre}      → Sai (đi xuống): ${i < s.cases.length - 1 ? 'tới khối thoi ' + (i + 2) : s.def.length ? 'default: ' + brief(s.def) : 'ra khỏi switch'}.`);
          });
          out.push(`${pre}   Các nhánh gom về một đường rồi đi tiếp.`);
        } else if (isChain(s)) {
          const { conds, last } = chainOf(s);
          out.push(`${pre}Xếp ${conds.length} khối Điều kiện (thoi) thành một cột dọc, xét từ trên xuống:`);
          conds.forEach((c, i) => {
            out.push(`${pre}   Khối thoi ${i + 1}: ${c.cond} ?`);
            out.push(`${pre}      → Đúng (rẽ phải): ${brief(c.yes)}.`);
            out.push(`${pre}      → Sai (đi xuống): ${i < conds.length - 1 ? 'tới khối thoi ' + (i + 2) : last.length ? brief(last) : 'đi tiếp'}.`);
          });
          out.push(`${pre}   Các nhánh gom về một đường rồi đi tiếp.`);
        } else if (s.t === 'if') {
          out.push(`${pre}Khối Điều kiện (thoi): ${s.cond} ?`);
          out.push(`${pre}   → Nhánh Đúng:${s.yes.length ? '' : ' đi thẳng xuống khối tiếp theo.'}`);
          walk(s.yes, pre + '      ');
          out.push(`${pre}   → Nhánh Sai:${s.no.length ? '' : ' đi thẳng xuống khối tiếp theo.'}`);
          walk(s.no, pre + '      ');
          out.push(`${pre}   Hai nhánh nhập lại rồi đi tiếp.`);
        } else if (s.t === 'while' || s.t === 'for') {
          if (s.t === 'for') out.push(`${pre}Khối Xử lý: ${s.init} (khởi tạo biến đếm).`);
          out.push(`${pre}Khối Điều kiện lặp (thoi): ${s.cond} ?`);
          out.push(`${pre}   → Đúng: chạy thân lặp:`);
          walk(s.t === 'for' ? [...s.body, pr(s.step)] : s.body, pre + '      ');
          out.push(`${pre}   → Vẽ mũi tên quay ngược lên khối "${s.cond}".`);
          out.push(`${pre}   → Sai: thoát vòng lặp, đi tiếp.`);
        } else if (s.t === 'do') {
          out.push(`${pre}Thân lặp (chạy ít nhất 1 lần):`);
          walk(s.body, pre + '      ');
          out.push(`${pre}Khối Điều kiện (thoi) đặt SAU thân lặp: ${s.cond} ?`);
          out.push(`${pre}   → Đúng: quay ngược lên đầu thân lặp. Sai: đi tiếp.`);
        }
      }
    };
    walk(prog, '');
    out.push(`Vẽ khối ${opt.end ? '"' + opt.end + '"' : 'Kết thúc'}.`);
    return out;
  }
  function branches(prog) {
    const out = [];
    const walk = list => {
      for (const s of list) {
        if (s.t === 'if') {
          out.push(`Nếu ${s.cond} → ${brief(s.yes)}` + (s.no.length ? `; ngược lại → ${brief(s.no)}` : '; ngược lại → bỏ qua'));
        } else if (s.t === 'switch') {
          s.cases.forEach(c => out.push(`case ${c.vals.join(', ')} (${short(caseLabel(s.expr, c.vals))}) → ${brief(c.body)}`));
          out.push(`default (không khớp case nào) → ${s.def.length ? brief(s.def) : 'bỏ qua'}`);
        }
        kids(s).forEach(walk);
      }
    };
    walk(prog);
    return out;
  }
  function loops(prog) {
    const out = [];
    const walk = list => {
      for (const s of list) {
        if (s.t === 'for') out.push(`Vòng lặp for: ${s.init}; lặp khi ${s.cond}; mỗi vòng ${s.step}.`);
        if (s.t === 'while') out.push(`Vòng lặp while: lặp khi ${s.cond}.`);
        if (s.t === 'do') out.push(`Vòng lặp do-while: làm trước, lặp lại khi ${s.cond}.`);
        kids(s).forEach(walk);
      }
    };
    walk(prog);
    return out;
  }

  // ---------- Sinh code C gợi ý ----------
  const KW = new Set(['sqrt', 'abs', 'fabs', 'pow', 'if', 'else', 'while', 'for', 'do', 'int', 'float', 'return', 'printf', 'scanf']);
  function collectVars(prog) {
    const vs = [];
    const ids = t => (t.replace(/"[^"]*"/g, '').match(/[A-Za-z_][A-Za-z0-9_]*/g) || []).filter(w => !KW.has(w));
    const walk = list => {
      for (const s of list) {
        if (s.t === 'io') { const m = s.text.match(/^(Nhập|Xuất)\s+(.*)$/s); if (m) vs.push(...ids(m[2])); }
        else if (s.t === 'proc' || s.t === 'sub') vs.push(...ids(s.text));
        else {
          if (s.cond) vs.push(...ids(s.cond));
          if (s.expr) vs.push(...ids(s.expr));
          if (s.init) vs.push(...ids(s.init), ...ids(s.step));
          kids(s).forEach(walk);
        }
      }
    };
    walk(prog);
    return uniq(vs);
  }
  // Tên mảng: biến đứng ngay trước dấu [ , ví dụ a[i].
  function arraysOf(prog) {
    const out = new Set();
    const scan = t => { for (const m of String(t || '').replace(/"[^"]*"/g, '').matchAll(/([A-Za-z_]\w*)\s*\[/g)) out.add(m[1]); };
    const walk = list => {
      for (const s of list) {
        scan(s.text); scan(s.cond); scan(s.expr); scan(s.init); scan(s.step);
        kids(s).forEach(walk);
      }
    };
    walk(prog);
    return out;
  }
  function splitItems(s) {
    const out = []; let cur = '', q = false;
    for (const ch of s) {
      if (ch === '"') q = !q;
      if (ch === ',' && !q) { out.push(cur.trim()); cur = ''; } else cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  // ---------- Các dạng bài quen thuộc ----------
  const pick = (vs, n, def) => (vs.length >= n ? vs.slice(0, n) : def);
  const has = (p, re) => re.test(p);
  const range = p => { const m = p.match(/tu\s+(-?\d+)\s+(?:den|toi)\s+(-?\d+)/); return m ? [m[1], m[2]] : null; };

  // Đọc các mức xếp loại trong đề, ví dụ "Học lực giỏi: 9 > điểm >= 8".
  // Trả về [{ name, low: { op, n } | null }] theo thứ tự trong đề.
  function gradeTiers(orig) {
    const p = plainOf(orig); // cùng độ dài với orig
    const OP = '(?:>=|<=|=>|=<|≥|≤|>|<)';
    const NUM = '\\d+(?:[.,]\\d+)?';
    const re = new RegExp(`([a-z][a-z ]{0,30}?)\\s*:\\s*((?:${NUM}\\s*${OP}\\s*)?diem(?:\\s*${OP}\\s*${NUM})?)`, 'g');
    const norm = op => ({ '≥': '>=', '≤': '<=', '=>': '>=', '=<': '<=' }[op] || op);
    const out = [];
    let m;
    while ((m = re.exec(p))) {
      let name = orig.substr(m.index, m[1].length).trim()
        .replace(/^(học\s+lực|hoc\s+luc|xếp\s+loại|xep\s+loai|loại|loai|mức|muc)\s+/i, '').trim();
      if (!name) continue;
      name = name[0].toUpperCase() + name.slice(1).toLowerCase();
      const expr = m[2];
      const at = expr.indexOf('diem');
      const L = expr.slice(0, at).match(new RegExp(`(${NUM})\\s*(${OP})\\s*$`));
      const R = expr.slice(at + 4).match(new RegExp(`^\\s*(${OP})\\s*(${NUM})`));
      const num = s => parseFloat(s.replace(',', '.'));
      let low = null, hi = null;
      if (L) {
        const op = norm(L[2]), n = num(L[1]);
        if (op === '<=') low = { op: '>=', n }; else if (op === '<') low = { op: '>', n };
        else if (op === '>') hi = { op: '<', n }; else if (op === '>=') hi = { op: '<=', n };
      }
      if (R) {
        const op = norm(R[1]), n = num(R[2]);
        if (op === '>=' || op === '>') low = { op, n }; else hi = { op, n };
      }
      const st = m.index + m[0].length - m[2].length;
      const raw = orig.substr(st, m[2].length).trim();
      if (!out.some(t => t.name === name)) out.push({ name, low, hi, raw });
    }
    return out;
  }

  // ---------- Xếp loại điểm theo mốc trong đề ----------
  const numOf = s => parseFloat(String(s).replace(',', '.'));
  function scoreRange(p) {
    const m = p.match(/\(\s*(\d+(?:[.,]\d+)?)\s*(?:-|–|den|toi)\s*(\d+(?:[.,]\d+)?)\s*\)/)
      || p.match(/diem[^.]{0,40}?tu\s+(\d+(?:[.,]\d+)?)\s+(?:den|toi)\s+(\d+(?:[.,]\d+)?)/);
    return m ? [numOf(m[1]), numOf(m[2])] : null;
  }
  function rangeText(t) {
    const lo = t.low ? `${t.low.n} ${t.low.op === '>=' ? '≤' : '<'} điểm` : '';
    if (lo && t.hi) return `${lo} ${t.hi.op === '<' ? '<' : '≤'} ${t.hi.n}`;
    if (lo) return `điểm ${t.low.op === '>=' ? '≥' : '>'} ${t.low.n}`;
    if (t.hi) return `điểm ${t.hi.op === '<' ? '<' : '≤'} ${t.hi.n}`;
    return 'còn lại';
  }
  function gradeProgram(p, orig) {
    let tiers = gradeTiers(orig);
    const fromText = tiers.length >= 2;
    if (!fromText) {
      tiers = [
        { name: 'Giỏi', low: { op: '>=', n: 8 }, hi: null, raw: '' },
        { name: 'Khá', low: { op: '>=', n: 6.5 }, hi: { op: '<', n: 8 }, raw: '' },
        { name: 'Trung bình', low: { op: '>=', n: 5 }, hi: { op: '<', n: 6.5 }, raw: '' },
        { name: 'Yếu', low: null, hi: { op: '<', n: 5 }, raw: '' }
      ];
    }
    const rg = scoreRange(p);
    const withLow = tiers.filter(t => t.low).sort((a, b) => b.low.n - a.low.n);
    const rest = tiers.filter(t => !t.low);
    let tail = rest.length ? [io(`Xuất "${rest[0].name}"`)] : [];
    for (let i = withLow.length - 1; i >= 0; i--) {
      const t = withLow[i];
      tail = [IF(`diem ${t.low.op} ${t.low.n}`, [io(`Xuất "${t.name}"`)], tail)];
    }
    const prog = [io('Nhập diem')];
    if (rg) prog.push(IF(`diem < ${rg[0]} || diem > ${rg[1]}`, [io('Xuất "Điểm không hợp lệ"')], tail));
    else prog.push(...tail);

    // Soát mốc: mức dưới phải bắt đầu đúng chỗ mức trên kết thúc.
    const checks = [];
    for (let i = 0; i < withLow.length; i++) {
      const up = withLow[i], lo = withLow[i + 1] || rest[0];
      if (!lo) continue;
      if (!lo.hi) { checks.push({ lv: 'info', msg: `Mức ${lo.name} không ghi mốc trên, hiểu là dưới ${up.low.n}.` }); continue; }
      const want = up.low.op === '>=' ? '<' : '<=';
      if (lo.hi.n < up.low.n) checks.push({ lv: 'warn', msg: `Hở mốc: điểm từ ${lo.hi.n} đến ${up.low.n} không thuộc mức nào (giữa ${lo.name} và ${up.name}).` });
      else if (lo.hi.n > up.low.n) checks.push({ lv: 'warn', msg: `Chồng mốc: điểm từ ${up.low.n} đến ${lo.hi.n} thuộc cả ${up.name} và ${lo.name}. Lưu đồ xét mức cao trước nên sẽ ra ${up.name}.` });
      else if (lo.hi.op !== want) checks.push({ lv: 'warn', msg: lo.hi.op === '<=' ? `Điểm đúng bằng ${up.low.n} thuộc cả ${up.name} và ${lo.name}.` : `Điểm đúng bằng ${up.low.n} không thuộc mức nào.` });
    }
    if (rest.length > 1) checks.push({ lv: 'warn', msg: `Có ${rest.length} mức không có mốc dưới (${rest.map(t => t.name).join(', ')}). Chỉ 1 mức được là "còn lại".` });
    if (rg && withLow.length && withLow[0].low.n > rg[1]) checks.push({ lv: 'warn', msg: `Mức ${withLow[0].name} cần điểm ${withLow[0].low.op} ${withLow[0].low.n}, lớn hơn điểm tối đa ${rg[1]}.` });
    if (fromText && !checks.some(c => c.lv === 'warn')) checks.unshift({ lv: 'ok', msg: `${tiers.length} mức nối liền nhau, không hở, không chồng: mỗi điểm thuộc đúng 1 mức.` });
    if (!fromText) checks.unshift({ lv: 'warn', msg: 'Đề không ghi mốc điểm, đang dùng mốc thường gặp. Nếu đề có mốc khác, sửa số trong khối thoi.' });
    checks.push(rg
      ? { lv: 'info', msg: `Đề giới hạn điểm từ ${rg[0]} đến ${rg[1]} → khối thoi đầu tiên kiểm tra điểm hợp lệ.` }
      : { lv: 'info', msg: 'Đề không nói giới hạn điểm. Có thể thêm khối thoi kiểm tra điểm nằm trong 0 đến 10.' });

    const order = [...withLow, ...rest];
    const table = order.map(t => ({
      name: t.name, raw: t.raw || '—', range: rangeText(t),
      block: t.low ? `diem ${t.low.op} ${t.low.n}` : 'nhánh Sai cuối cùng'
    }));
    const vals = new Set();
    if (rg) { vals.add(rg[0] - 1); vals.add(rg[0]); vals.add(rg[1]); vals.add(rg[1] + 1); }
    for (const t of withLow) { vals.add(t.low.op === '>=' ? t.low.n : t.low.n + 0.5); vals.add(+(t.low.n - 0.1).toFixed(2)); }
    const tests = [...vals].filter(v => !rg || (v >= rg[0] - 1 && v <= rg[1] + 1)).sort((a, b) => a - b).map(v => [v]);
    return {
      given: [`diem: điểm của sinh viên${rg ? ` (từ ${rg[0]} đến ${rg[1]})` : ''}`],
      asked: [`In ra học lực: ${order.map(t => t.name).join(', ')}`],
      floats: ['diem'], prog, table, checks, tests,
      note: 'Xét từ mốc cao xuống thấp. Đã đi qua nhánh Sai của khối trên thì chắc chắn điểm nhỏ hơn mốc trên, nên mỗi khối thoi chỉ cần so với mốc dưới.'
    };
  }

  // ---------- Mảng ----------
  function arrayProgram(p) {
    const prog = [io('Nhập n'), FOR('i = 0', 'i < n', 'i++', [io('Nhập a[i]')])];
    const asked = [], floats = [];
    const loop = body => FOR('i = 0', 'i < n', 'i++', body);
    let x = false;
    if (has(p, /trung\s+binh/)) {
      prog.push(pr('s = 0'), loop([pr('s = s + a[i]')]), pr('tb = s / n'), io('Xuất tb'));
      floats.push('tb'); asked.push('Trung bình cộng các phần tử');
    } else if (has(p, /\btong\b|cong\s+cac/)) {
      prog.push(pr('s = 0'), loop([pr('s = s + a[i]')]), io('Xuất s')); asked.push('Tổng các phần tử');
    }
    if (has(p, /lon\s+nhat|\bmax\b/)) {
      prog.push(pr('max = a[0]'), FOR('i = 1', 'i < n', 'i++', [IF('a[i] > max', [pr('max = a[i]')])]), io('Xuất max'));
      asked.push('Phần tử lớn nhất');
    }
    if (has(p, /nho\s+nhat|\bmin\b/)) {
      prog.push(pr('min = a[0]'), FOR('i = 1', 'i < n', 'i++', [IF('a[i] < min', [pr('min = a[i]')])]), io('Xuất min'));
      asked.push('Phần tử nhỏ nhất');
    }
    if (has(p, /\bdem\b/)) {
      const c = has(p, /\bchan\b/) ? ['a[i] % 2 == 0', 'chẵn'] : has(p, /\ble\b/) ? ['a[i] % 2 != 0', 'lẻ'] : has(p, /\bam\b/) ? ['a[i] < 0', 'âm'] : ['a[i] > 0', 'dương'];
      prog.push(pr('dem = 0'), loop([IF(c[0], [pr('dem = dem + 1')])]), io('Xuất dem'));
      asked.push(`Số phần tử ${c[1]}`);
    }
    if (has(p, /tim\s+(kiem\s+)?(x|phan\s+tu|so|gia\s+tri)|co\s+xuat\s+hien|co\s+trong\s+mang/)) {
      x = true;
      prog.push(io('Nhập x'), pr('vt = -1'), loop([IF('a[i] == x', [pr('vt = i')])]),
        IF('vt != -1', [io('Xuất "Có, ở vị trí", vt')], [io('Xuất "Không có"')]));
      asked.push('x có trong mảng không, ở vị trí nào');
    }
    const sort = has(p, /sap\s+xep|tang\s+dan|giam\s+dan/);
    if (sort) {
      const op = has(p, /giam\s+dan/) ? '<' : '>';
      prog.push(FOR('i = 0', 'i < n - 1', 'i++', [FOR('j = i + 1', 'j < n', 'j++',
        [IF(`a[i] ${op} a[j]`, [pr('tam = a[i]\na[i] = a[j]\na[j] = tam')])])]));
      asked.push(`Sắp xếp mảng ${op === '>' ? 'tăng' : 'giảm'} dần`);
    }
    if (sort || !asked.length || has(p, /\b(in|xuat)\s+(ra\s+)?(mang|cac\s+phan\s+tu)/)) {
      prog.push(loop([io('Xuất a[i]')]));
      if (!sort) asked.push('In các phần tử của mảng');
    }
    const t = [5, 3, 8, -1, 6, 2];
    return {
      given: ['n: số phần tử', 'a[0], a[1], ..., a[n-1]: các phần tử của mảng'],
      asked, floats, prog,
      tests: [x ? [...t, 6] : t, x ? [3, 1, 2, 3, 9] : [1, 7]],
      note: 'Mảng đánh số từ 0 nên vòng lặp chạy i = 0 đến i < n. Nhập mảng = một vòng lặp, mỗi vòng nhập 1 phần tử a[i].'
    };
  }

  // ---------- switch - case ----------
  const THU = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const CHU_SO = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  function menuItems(orig) {
    const out = [];
    const re = /(?:^|[\s,;(])(\d{1,2})\s*[.:)\-]\s*([^\d\n,;.]{2,40}?)(?=\s*[,;.]?\s*\d{1,2}\s*[.:)\-]|[\n.;]|$)/g;
    let m;
    while ((m = re.exec(orig))) out.push({ k: +m[1], text: m[2].trim() });
    const ok = out.length >= 2 && out.every((o, i) => i === 0 || o.k === out[i - 1].k + 1);
    return ok ? out : [];
  }
  function switchProgram(p, orig) {
    // Số ngày của tháng
    if (has(p, /thang/) && has(p, /so\s+ngay|bao\s+nhieu\s+ngay|co\s+may\s+ngay/)) {
      const nhuan = has(p, /nam\s+nhuan|\bnam\b/);
      const feb = nhuan ? [IF('(nam % 4 == 0 && nam % 100 != 0) || nam % 400 == 0', [io('Xuất 29')], [io('Xuất 28')])] : [io('Xuất 28')];
      return {
        name: 'switch: số ngày của tháng',
        given: [nhuan ? 'thang, nam: tháng và năm' : 'thang: số tháng (1 đến 12)'],
        asked: ['Tháng đó có bao nhiêu ngày'],
        prog: [io(nhuan ? 'Nhập thang, nam' : 'Nhập thang'), SWITCH('thang', [
          { vals: [1, 3, 5, 7, 8, 10, 12], body: [io('Xuất 31')] },
          { vals: [4, 6, 9, 11], body: [io('Xuất 30')] },
          { vals: [2], body: feb }
        ], [io('Xuất "Tháng không hợp lệ"')])],
        tests: nhuan ? [[1, 2023], [4, 2023], [2, 2024], [2, 2023], [13, 2023]] : [[1], [4], [2], [13]],
        note: 'Nhiều case dùng chung một việc (case 1: case 3: ...) gộp vào cùng một khối thoi.'
      };
    }
    // Đọc chữ số
    if (has(p, /doc\s+(so|chu\s+so)|bang\s+chu|thanh\s+chu/)) {
      return {
        name: 'switch: đọc chữ số',
        given: ['n: một chữ số từ 0 đến 9'], asked: ['Cách đọc của n bằng chữ'],
        prog: [io('Nhập n'), SWITCH('n', CHU_SO.map((w, i) => ({ vals: [i], body: [io(`Xuất "${w}"`)] })), [io('Xuất "Không phải chữ số"')])],
        tests: [[0], [5], [9], [12]]
      };
    }
    // Máy tính / chọn phép toán
    const items = menuItems(orig);
    const calc = has(p, /phep\s+(toan|tinh)|may\s+tinh|cong.{0,20}tru.{0,20}nhan.{0,20}chia/);
    const repeat = has(p, /lap\s+lai|cho\s+den\s+khi|den\s+khi|thoat/);
    if (calc || items.length) {
      const opts = items.length ? items : [{ k: 1, text: 'Cộng' }, { k: 2, text: 'Trừ' }, { k: 3, text: 'Nhân' }, { k: 4, text: 'Chia' }];
      const quit = opts.find(o => /thoat|ket\s+thuc|exit/.test(plainOf(o.text)));
      const bodyOf = o => {
        const t = plainOf(o.text);
        if (/cong|tong/.test(t)) return [io('Xuất a + b')];
        if (/tru|hieu/.test(t)) return [io('Xuất a - b')];
        if (/nhan|tich/.test(t)) return [io('Xuất a * b')];
        if (/chia|thuong/.test(t)) return [IF('b != 0', [io('Xuất a / b')], [io('Xuất "Không chia được cho 0"')])];
        if (o === quit) return [io('Xuất "Tạm biệt"')];
        return [io(`Xuất "Bạn chọn: ${o.text}"`)];
      };
      const needAB = opts.some(o => /cong|tru|nhan|chia|tong|hieu|tich|thuong/.test(plainOf(o.text)));
      const sw = SWITCH('chon', opts.map(o => ({ vals: [o.k], body: bodyOf(o) })), [io('Xuất "Lựa chọn không hợp lệ"')]);
      const menu = [io('Xuất menu'), io('Nhập chon'), sw];
      const body = needAB ? [io('Nhập a, b'), ...menu] : menu;
      const prog = repeat && quit ? [DO(body, `chon != ${quit.k}`)] : body;
      const first = opts[0].k;
      const tin = needAB ? [8, 2] : [];
      const tests = repeat && quit
        ? [[...tin, first, ...tin, quit.k]]
        : [...opts.slice(0, 4).map(o => [...tin, o.k]), [...tin, 99]];
      return {
        name: 'switch: menu lựa chọn',
        given: [needAB ? 'a, b: hai số' : '', 'chon: số người dùng chọn trong menu'].filter(Boolean),
        asked: ['Làm việc tương ứng với lựa chọn'],
        floats: needAB ? ['a', 'b'] : [], prog, tests,
        note: repeat && quit ? `Đề muốn lặp lại menu nên bọc trong do-while: chạy đến khi chọn ${quit.k} (${quit.text}).` : ''
      };
    }
    // Thứ trong tuần
    if (has(p, /\bthu\b/) && has(p, /tuan|chu\s+nhat/)) {
      const from2 = has(p, /\b8\b/);
      const cases = THU.map((w, i) => ({ vals: [from2 ? (i === 0 ? 8 : i + 1) : i + 1], body: [io(`Xuất "${w}"`)] }));
      if (from2) cases.push(cases.shift());
      return {
        name: 'switch: thứ trong tuần',
        given: [`n: số từ ${from2 ? '2 đến 8' : '1 đến 7'}`], asked: ['Thứ tương ứng'],
        prog: [io('Nhập n'), SWITCH('n', cases, [io('Xuất "Không hợp lệ"')])],
        tests: from2 ? [[2], [7], [8], [0]] : [[1], [2], [7], [9]],
        note: from2 ? '' : 'Đang hiểu 1 là Chủ nhật, 2 là Thứ hai... Nếu đề quy ước khác thì sửa lại các khối thoi.'
      };
    }
    return null;
  }

  // ---------- struct ----------
  const camel = s => {
    const w = plainOf(s).replace(/[^a-z0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean);
    return w.length ? w[0] + w.slice(1).map(x => x[0].toUpperCase() + x.slice(1)).join('') : '';
  };
  function structProgram(p, orig) {
    const ent = has(p, /hoc\s+sinh/) ? ['hs', 'học sinh'] : has(p, /nhan\s+vien/) ? ['nv', 'nhân viên'] : has(p, /san\s+pham|mat\s+hang/) ? ['sp', 'sản phẩm'] : has(p, /cuon\s+sach|quyen\s+sach/) ? ['s', 'cuốn sách'] : ['sv', 'sinh viên'];
    let fields = [];
    const m = p.match(/(gom|bao\s+gom|co\s+cac\s+thong\s+tin|thong\s+tin)(\s+co)?\s*:?\s*([^.\n]+)/);
    if (m) {
      const st = m.index + m[0].length - m[3].length;
      fields = orig.substr(st, m[3].length).split(/,|;|\svà\s|\sva\s/).map(f => f.replace(/\(.*?\)/g, '').trim()).filter(f => f && f.length < 30);
    }
    if (fields.length < 2) fields = ent[0] === 'sp' ? ['mã', 'tên', 'giá'] : ['mã', 'họ tên', 'điểm'];
    const ids = fields.map(camel).map(f => f === 'hoTen' ? 'ten' : f);
    const many = has(p, /danh\s+sach|\bn\s+(sinh|hoc|nhan|san|cuon|mat)|mang|nhieu/);
    const diem = ids.find(f => /diem|gia|luong/.test(f));
    const R = { name: 'struct: ' + ent[1], floats: [], given: [], asked: [] };
    if (!many) {
      const v = ent[0];
      R.given = [`${v}: một ${ent[1]}, gồm ${ids.map(f => v + '.' + f).join(', ')}`];
      R.asked = [`In ra thông tin ${ent[1]}`];
      R.prog = [io(`Nhập ${ids.map(f => v + '.' + f).join(', ')}`), io(`Xuất ${ids.map(f => v + '.' + f).join(', ')}`)];
      R.tests = [ids.map((f, i) => f === diem ? 8.5 : i === 0 ? 'SV01' : 'An')];
    } else {
      const f = i => ids.map(x => `ds[${i}].${x}`).join(', ');
      R.given = ['n: số ' + ent[1], `ds[0..n-1]: mảng ${ent[1]}, mỗi phần tử có ${ids.join(', ')}`];
      R.prog = [io('Nhập n'), FOR('i = 0', 'i < n', 'i++', [io(`Nhập ${f('i')}`)])];
      R.asked = [`In danh sách ${ent[1]}`];
      if (diem && has(p, /cao\s+nhat|lon\s+nhat|max/)) {
        R.prog.push(pr('vt = 0'), FOR('i = 1', 'i < n', 'i++', [IF(`ds[i].${diem} > ds[vt].${diem}`, [pr('vt = i')])]), io(`Xuất ${f('vt')}`));
        R.asked = [`${ent[1]} có ${diem} cao nhất`];
      } else R.prog.push(FOR('i = 0', 'i < n', 'i++', [io(`Xuất ${f('i')}`)]));
      const one = k => ids.map((x, i) => x === diem ? [7, 9, 6][k] : i === 0 ? `SV0${k + 1}` : ['An', 'Bình', 'Chi'][k]);
      R.tests = [[3, ...one(0), ...one(1), ...one(2)]];
    }
    R.note = `struct gom nhiều thông tin của một ${ent[1]} vào một biến. Trong lưu đồ ghi bằng dấu chấm: ${(many ? 'ds[i].' : ent[0] + '.') + ids[0]}. Không có hình riêng cho struct.`;
    return R;
  }

  // ---------- Đề yêu cầu loại vòng lặp cụ thể ----------
  function wantLoop(p) {
    const d = /do\s*[-–]?\s*while/.test(p);
    const q = p.replace(/do\s*[-–]?\s*while/g, ' ');
    const k = [d && 'do', /\bwhile\b/.test(q) && 'while', /\bfor\b/.test(q) && 'for'].filter(Boolean);
    return k.length === 1 ? k[0] : null;
  }
  function convertLoops(list, kind) {
    let changed = false;
    const conv = l => {
      const out = [];
      for (const s0 of l) {
        const s = { ...s0 };
        if (s.yes) { s.yes = conv(s.yes); s.no = conv(s.no); }
        if (s.body) s.body = conv(s.body);
        if (s.cases) { s.cases = s.cases.map(c => ({ ...c, body: conv(c.body) })); s.def = conv(s.def); }
        if (s.t === 'for' && kind === 'while') { out.push(pr(s.init), WHILE(s.cond, [...s.body, pr(s.step)])); changed = true; }
        else if (s.t === 'for' && kind === 'do') { out.push(pr(s.init), DO([...s.body, pr(s.step)], s.cond)); changed = true; }
        else out.push(s);
      }
      return out;
    };
    const prog = conv(list);
    return { prog, changed };
  }

  // ---------- Đề yêu cầu viết hàm ----------
  const FNAME = {
    'giai-thua': 'giaiThua', 'nguyen-to': 'laNguyenTo', 'chan-le': 'kiemTraChanLe', 'tong-day': 'tinhTong', 'max2': 'timMax',
    'max3': 'timMax', 'ptb1': 'giaiPTB1', 'ptb2': 'giaiPTB2', 'nam-nhuan': 'laNamNhuan', 'xep-loai': 'xepLoai',
    'chu-so': 'tongChuSo', 'am-duong': 'kiemTraDau', 'hinh-tron': 'dienTichHinhTron', 'hcn': 'dienTichHCN',
    'trung-binh': 'trungBinh', 'in-day': 'inDay', 'cuu-chuong': 'inBangCuuChuong', 'tam-giac': 'laTamGiac',
    'chia-het': 'chiaHet', 'nhiet-do': 'doiNhietDo', 'phep-tinh': 'tinhToan'
  };
  const hasInput = list => list.some(s => (s.t === 'io' && /^Nhập/.test(s.text)) || kids(s).some(hasInput));
  function wantFunc(p, orig) {
    if (!/\bham\b|chuong\s+trinh\s+con/.test(p)) return null;
    const m = orig.match(/hàm\s+([A-Za-z_]\w*)\s*\(/i) || plainOf(orig).match(/ham\s+([a-z_]\w*)\s*\(/);
    return { name: m ? m[1] : null, voidish: /khong\s+tra\s+ve|\bvoid\b|thu\s+tuc/.test(p), ret: /tra\s+ve/.test(p) };
  }
  function toFunc(r, want, id) {
    const prog = r.prog;
    let i = 0;
    const inputs = [];
    while (i < prog.length && prog[i].t === 'io' && /^Nhập/.test(prog[i].text)) inputs.push(prog[i++]);
    let j = prog.length;
    const outs = [];
    while (j > i && prog[j - 1].t === 'io' && /^Xuất/.test(prog[j - 1].text)) outs.unshift(prog[--j]);
    const mid = prog.slice(i, j);
    if (!mid.length || hasInput(mid)) return null;
    const params = inputs.flatMap(s => splitItems(s.text.replace(/^Nhập\s+/, '')));
    const name = want.name || FNAME[id] || 'xuLy';
    const call = `${name}(${params.join(', ')})`;
    const sig = `Bắt đầu ${call}`;
    // 1) Một giá trị kết quả → hàm trả về giá trị đó.
    if (!want.voidish && outs.length === 1) {
      const items = splitItems(outs[0].text.replace(/^Xuất\s+/, ''));
      const ex = items.filter(x => !x.startsWith('"'));
      if (ex.length === 1) {
        return {
          prog: [...inputs, SUB(`kq = ${call}`), io('Xuất ' + items.map(x => x === ex[0] ? 'kq' : x).join(', '))],
          funcs: [{ name, params, ret: ex[0], body: mid, start: sig, end: `Trả về ${ex[0]}` }],
          kind: 'ret'
        };
      }
    }
    // 2) Câu hỏi đúng/sai (khối thoi cuối chỉ in 2 câu) → hàm trả về 1/0, main in kết quả.
    const last = mid[mid.length - 1];
    if (!want.voidish && !outs.length && last && last.t === 'if' && last.yes.length === 1 && last.no.length === 1
      && last.yes[0].t === 'io' && last.no[0].t === 'io' && (want.ret || /^la|^kiemTra|^chiaHet/.test(name))) {
      return {
        prog: [...inputs, SUB(`kq = ${call}`), IF('kq == 1', last.yes, last.no)],
        funcs: [{ name, params, ret: `(${last.cond}) ? 1 : 0`, retShow: '1 nếu đúng, 0 nếu sai', body: mid.slice(0, -1), start: sig, end: `Trả về (${last.cond})` }],
        kind: 'ret'
      };
    }
    // 3) Còn lại → hàm không trả về (void), tự in kết quả.
    return {
      prog: [...inputs, SUB(call)],
      funcs: [{ name, params, ret: null, body: [...mid, ...outs], start: sig, end: 'Kết thúc hàm' }],
      kind: 'void'
    };
  }

  // ---------- Đọc đề: tô màu từ khóa ----------
  const HL = [
    ['rule', /\(\s*-?\d+(?:[.,]\d+)?\s*[-–]\s*-?\d+(?:[.,]\d+)?\s*\)|nguyen\s+duong|so\s+nguyen|so\s+thuc|khac\s+0|hop\s+le|biet\s+rang/g],
    ['loop', /\b(tu\s+\S+\s+(den|toi)\s+[^\s.,;]+|cho\s+den\s+khi|den\s+khi|lap\s+lai|nhap\s+lai|cac\s+so|day\s+so|moi\s+(so|phan\s+tu)|tung\s+(so|phan\s+tu)|vong\s+lap|do\s*-?\s*while|while|for)\b/g],
    ['data', /\b(mang|phan\s+tu|danh\s+sach|struct|cau\s+truc|ham|tra\s+ve|void|switch|case|menu|lua\s+chon)\b/g],
    ['in', /\b(nhap(\s+vao)?|doc\s+vao|input|dau\s+vao|cho\s+(truoc|so|mot|hai|ba))\b/g],
    ['out', /\b(in\s+ra|xuat(\s+ra)?|hien\s+thi|output|dau\s+ra|tinh|tim|cho\s+biet|kiem\s+tra|dem|thong\s+bao|sap\s+xep)\b/g],
    ['cond', /\b(neu|thi|nguoc\s+lai|con\s+lai|hay|hoac)\b|>=|<=|!=|==|≥|≤|>|</g]
  ];
  function highlight(orig) {
    const p = plainOf(orig);
    const tag = new Array(p.length).fill('');
    for (const [c, re] of HL) for (const m of p.matchAll(re)) for (let i = m.index; i < m.index + m[0].length; i++) if (!tag[i]) tag[i] = c;
    const segs = [];
    for (let i = 0; i < orig.length; i++) {
      const last = segs[segs.length - 1];
      if (last && last.c === tag[i]) last.t += orig[i]; else segs.push({ c: tag[i], t: orig[i] });
    }
    return segs;
  }
  function rulesOf(orig) {
    const p = plainOf(orig), out = [];
    for (const m of p.matchAll(/\(\s*(-?\d+(?:[.,]\d+)?)\s*[-–]\s*(-?\d+(?:[.,]\d+)?)\s*\)|tu\s+(-?\d+(?:[.,]\d+)?)\s+den\s+(-?\d+(?:[.,]\d+)?)/g)) {
      const a = m[1] || m[3], b = m[2] || m[4];
      out.push(`Giá trị trong khoảng ${a} đến ${b} ("${orig.substr(m.index, m[0].length).trim()}"). Nên có khối thoi kiểm tra dữ liệu hợp lệ.`);
    }
    if (/nguyen\s+duong/.test(p)) out.push('Số nguyên dương: phải lớn hơn 0. Có thể kiểm tra n > 0, hoặc nhập lại bằng do-while.');
    if (/khac\s+0/.test(p)) out.push('Có giá trị phải khác 0 (thường là số chia).');
    if (/so\s+thuc/.test(p)) out.push('Số thực: có thể có phần thập phân.');
    return uniq(out);
  }
  function varsOf(R) {
    const out = [];
    const seen = new Set();
    const add = (v, role) => { if (!seen.has(v)) { seen.add(v); out.push(`${v}: ${role}`); } };
    const walk = list => {
      for (const s of list) {
        if (s.t === 'io' && /^Nhập/.test(s.text)) splitItems(s.text.replace(/^Nhập\s+/, '')).forEach(v => add(v.replace(/\[.*$/, '[]'), 'nhập từ bàn phím'));
        if (s.t === 'for' && s.init) { const m = s.init.match(/^\s*(\w+)/); if (m) add(m[1], 'biến đếm của vòng lặp'); }
        if ((s.t === 'proc' || s.t === 'sub') && s.text) for (const l of s.text.split('\n')) { const m = l.match(/^\s*([\w.]+)(?:\[[^\]]*\])?\s*=/); if (m) add(m[1], 'biến tính toán / kết quả'); }
        kids(s).forEach(walk);
      }
    };
    walk(R.prog);
    (R.funcs || []).forEach(f => f.params.forEach(v => add(`${v} (trong hàm ${f.name})`, 'tham số, nhận giá trị từ lời gọi hàm')));
    return out;
  }

  // ---------- Chạy thử lưu đồ ----------
  const SAFE = /^[\w\s+\-*/%().<>=!&|,\[\]?:]*$/;
  function evalE(expr, env) {
    if (!SAFE.test(expr)) throw new Error('unsafe');
    const ks = Object.keys(env);
    return Function(...ks, 'sqrt', 'fabs', `"use strict"; return (${expr});`)(...ks.map(k => env[k]), Math.sqrt, Math.abs);
  }
  const fmtV = v => typeof v === 'number' ? (Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100)) : String(v);
  function runProg(R, inputs) {
    const fl = new Set(R.floats || []);
    const funcs = new Map((R.funcs || []).map(f => [f.name, f]));
    const q = [...inputs], out = [], path = [];
    let steps = 0, depth = 0;
    const envOf = prog => {
      const e = {};
      collectVars(prog).forEach(v => { e[v] = 0; });
      arraysOf(prog).forEach(a => { e[a] = []; });
      return e;
    };
    const setv = (env, lhs, v) => {
      const m = lhs.trim().match(/^([A-Za-z_]\w*)(?:\[(.+?)\])?(?:\.(\w+))?$/);
      if (!m) throw new Error('lhs');
      if (typeof v === 'number' && !fl.has(m[1]) && !m[3]) v = Math.trunc(v);
      if (m[2] !== undefined) {
        if (!Array.isArray(env[m[1]])) env[m[1]] = [];
        const k = evalE(m[2], env);
        if (m[3]) { env[m[1]][k] = env[m[1]][k] || {}; env[m[1]][k][m[3]] = v; } else env[m[1]][k] = v;
      } else if (m[3]) {
        if (!env[m[1]] || typeof env[m[1]] !== 'object') env[m[1]] = {};
        env[m[1]][m[3]] = v;
      } else env[m[1]] = v;
    };
    const assign = (line, env) => {
      if (!line.trim()) return;
      const m = line.match(/^\s*([\w.]+(?:\[[^\]]+\])?(?:\.\w+)?)\s*(\+\+|--|\+=|-=|\*=|=)\s*(.*)$/);
      if (!m) throw new Error('assign');
      const cur = () => evalE(m[1], env);
      if (m[2] === '++') setv(env, m[1], cur() + 1);
      else if (m[2] === '--') setv(env, m[1], cur() - 1);
      else if (m[2] === '+=') setv(env, m[1], cur() + evalE(m[3], env));
      else if (m[2] === '-=') setv(env, m[1], cur() - evalE(m[3], env));
      else if (m[2] === '*=') setv(env, m[1], cur() * evalE(m[3], env));
      else setv(env, m[1], evalE(m[3], env));
    };
    const call = (text, env) => {
      const m = text.match(/^(?:([\w.\[\]]+)\s*=\s*)?([A-Za-z_]\w*)\s*\((.*)\)$/);
      const f = m && funcs.get(m[2]);
      if (!f) throw new Error('call');
      const args = m[3].trim() ? splitItems(m[3]).map(a => evalE(a, env)) : [];
      const fe = envOf(f.body);
      f.params.forEach((p, i) => { fe[p] = args[i]; });
      if (!depth) path.push(`gọi ${f.name}(${args.map(fmtV).join(', ')})`);
      depth++;
      exec(f.body, fe);
      depth--;
      if (m[1]) setv(env, m[1], f.ret ? evalE(f.ret, fe) : 0);
    };
    const loopRun = (cond, body, env, step, isDo) => {
      depth++;
      let k = 0;
      if (isDo) { do { if (++steps > 20000) throw new Error('loop'); k++; exec(body, env); } while (evalE(cond, env)); }
      else while (evalE(cond, env)) { if (++steps > 20000) throw new Error('loop'); k++; exec(body, env); if (step) assign(step, env); }
      depth--;
      if (!depth) path.push(`lặp ${k} lần`);
    };
    function exec(list, env) {
      for (const s of list) {
        if (s.t === 'io') {
          const m = s.text.match(/^(Nhập|Xuất)\s+(.*)$/s);
          if (!m) continue;
          const items = splitItems(m[2]);
          if (m[1] === 'Nhập') {
            for (const it of items) { if (!q.length) throw new Error('input'); setv(env, it, q.shift()); }
          } else if (items.length === 1 && items[0] === 'menu') {
            // chỉ là in menu, không cần ghi ra
          } else out.push(items.map(it => it.startsWith('"') ? it.slice(1, -1) : fmtV(evalE(it, env))).join(' '));
        } else if (s.t === 'proc') s.text.split('\n').forEach(l => assign(l, env));
        else if (s.t === 'sub') call(s.text.trim(), env);
        else if (s.t === 'if') {
          const r = !!evalE(s.cond, env);
          if (!depth) path.push(`${s.cond.replace(/\n/g, ' ')}: ${r ? 'Đúng' : 'Sai'}`);
          exec(r ? s.yes : s.no, env);
        } else if (s.t === 'switch') {
          const c = s.cases.find(c => c.vals.some(v => evalE(`${s.expr} == ${v}`, env)));
          if (!depth) path.push(`switch ${s.expr}: ${c ? 'case ' + c.vals.find(v => evalE(`${s.expr} == ${v}`, env)) : 'default'}`);
          exec(c ? c.body : s.def, env);
        } else if (s.t === 'while') loopRun(s.cond, s.body, env);
        else if (s.t === 'for') { if (s.init) assign(s.init, env); loopRun(s.cond, s.body, env, s.step); }
        else if (s.t === 'do') loopRun(s.cond, s.body, env, null, true);
      }
    }
    exec(R.prog, envOf(R.prog));
    if (q.length) throw new Error('extra');
    return { out, path };
  }
  function autoTests(R) {
    const first = R.prog.find(s => s.t === 'io' && /^Nhập/.test(s.text));
    if (!first) return [];
    const vars = splitItems(first.text.replace(/^Nhập\s+/, ''));
    if (vars.length !== 1) return [];
    const v = vars[0], nums = new Set();
    const walk = list => list.forEach(s => {
      if (s.cond && new RegExp(`\\b${v}\\b`).test(s.cond)) for (const m of s.cond.matchAll(/-?\d+(?:\.\d+)?/g)) nums.add(+m[0]);
      kids(s).forEach(walk);
    });
    walk(R.prog);
    if (!nums.size) return [];
    const fl = (R.floats || []).includes(v);
    const vals = new Set();
    for (const n of nums) { vals.add(n); vals.add(fl ? n - 0.5 : n - 1); vals.add(fl ? n + 0.5 : n + 1); }
    return [...vals].sort((a, b) => a - b).slice(0, 8).map(x => [x]);
  }
  function runTests(R) {
    const sets = (R.tests && R.tests.length ? R.tests : autoTests(R)).slice(0, 16);
    const rows = [];
    for (const inp of sets) {
      try {
        const r = runProg(R, inp);
        rows.push({ input: inp.map(fmtV).join(', '), output: r.out.length > 4 ? [...r.out.slice(0, 3), `… (${r.out.length} dòng)`] : r.out, path: r.path });
      } catch (e) { return []; }
    }
    return rows;
  }

  const PATTERNS = [
    {
      id: 'struct', name: 'struct',
      test: p => has(p, /\bstruct\b|cau\s+truc|kieu\s+du\s+lieu\s+(sinh|hoc|nhan)|thong\s+tin\s+(cua\s+)?(mot\s+|n\s+|cac\s+)?(sinh\s+vien|hoc\s+sinh|nhan\s+vien|san\s+pham|cuon\s+sach)|(sinh\s+vien|hoc\s+sinh|nhan\s+vien|san\s+pham)\s+(gom|bao\s+gom)/),
      make: (p, vs, low, orig) => structProgram(p, orig)
    },
    {
      id: 'switch', name: 'switch - case',
      test: p => has(p, /switch|\bcase\b|menu|lua\s+chon|chon\s+(1|so)|thu\s+(trong|cua)\s+tuan|ngay\s+trong\s+tuan|so\s+ngay|bao\s+nhieu\s+ngay|co\s+may\s+ngay|doc\s+(so|chu\s+so)|may\s+tinh|phep\s+toan/),
      make: (p, vs, low, orig) => switchProgram(p, orig)
    },
    {
      id: 'mang', name: 'Mảng',
      test: p => has(p, /\bmang\b|phan\s+tu|day\s+(gom\s+)?n\s+so|nhap\s+n\s+so|day\s+so\s+nguyen/),
      make: p => arrayProgram(p)
    },
    {
      id: 'ptb2', name: 'Giải phương trình bậc 2',
      test: p => has(p, /bac\s*(2|hai)|ax\s*\^?\s*2|ax²/),
      make: () => ({
        given: ['a, b, c: ba hệ số của phương trình ax² + bx + c = 0 (số thực)'],
        asked: ['Nghiệm của phương trình (vô nghiệm, nghiệm kép, hoặc 2 nghiệm)'],
        floats: ['a', 'b', 'c', 'delta', 'x', 'x1', 'x2'],
        prog: [
          io('Nhập a, b, c'),
          IF('a == 0', [io('Xuất "Không phải PT bậc 2"')], [
            pr('delta = b*b - 4*a*c'),
            IF('delta < 0', [io('Xuất "Vô nghiệm"')], [
              IF('delta == 0', [pr('x = -b / (2*a)'), io('Xuất "Nghiệm kép", x')], [
                pr('x1 = (-b + sqrt(delta)) / (2*a)\nx2 = (-b - sqrt(delta)) / (2*a)'), io('Xuất x1, x2')
              ])
            ])
          ])
        ]
      })
    },
    {
      id: 'ptb1', name: 'Giải phương trình bậc 1',
      test: p => has(p, /bac\s*(1|nhat)|ax\s*\+\s*b\s*=\s*0/),
      make: () => ({
        given: ['a, b: hai hệ số của phương trình ax + b = 0'],
        asked: ['Nghiệm x, hoặc báo vô nghiệm / vô số nghiệm'],
        floats: ['a', 'b', 'x'],
        prog: [
          io('Nhập a, b'),
          IF('a == 0', [IF('b == 0', [io('Xuất "Vô số nghiệm"')], [io('Xuất "Vô nghiệm"')])],
            [pr('x = -b / a'), io('Xuất x')])
        ]
      })
    },
    {
      id: 'nam-nhuan', name: 'Kiểm tra năm nhuận',
      test: p => has(p, /nam\s+nhuan/),
      make: () => ({
        given: ['nam: một năm (số nguyên)'],
        asked: ['Năm đó có phải năm nhuận không'],
        prog: [io('Nhập nam'), IF('(nam % 4 == 0 && nam % 100 != 0) || nam % 400 == 0',
          [io('Xuất "Năm nhuận"')], [io('Xuất "Không nhuận"')])],
        note: 'Năm nhuận: chia hết cho 4 nhưng không chia hết cho 100, hoặc chia hết cho 400.'
      })
    },
    {
      id: 'tam-giac', name: 'Kiểm tra 3 cạnh tam giác',
      test: p => has(p, /tam\s+giac/) && has(p, /canh|kiem tra|co phai|hop le|tao thanh/),
      make: () => ({
        given: ['a, b, c: độ dài 3 cạnh'],
        asked: ['3 cạnh có tạo thành tam giác không'],
        floats: ['a', 'b', 'c'],
        prog: [io('Nhập a, b, c'), IF('a + b > c && a + c > b && b + c > a',
          [io('Xuất "Là tam giác"')], [io('Xuất "Không phải tam giác"')])],
        note: 'Điều kiện: tổng 2 cạnh bất kỳ luôn lớn hơn cạnh còn lại.'
      })
    },
    {
      id: 'nguyen-to', name: 'Kiểm tra số nguyên tố',
      test: p => has(p, /nguyen\s+to/),
      make: () => ({
        given: ['n: một số nguyên dương'],
        asked: ['n có phải số nguyên tố không'],
        prog: [io('Nhập n'), pr('dem = 0'),
          FOR('i = 1', 'i <= n', 'i++', [IF('n % i == 0', [pr('dem = dem + 1')])]),
          IF('dem == 2', [io('Xuất "Là số nguyên tố"')], [io('Xuất "Không là số nguyên tố"')])],
        note: 'Số nguyên tố có đúng 2 ước: 1 và chính nó. Đếm số ước rồi so với 2.'
      })
    },
    {
      id: 'giai-thua', name: 'Tính giai thừa',
      test: p => has(p, /giai\s+thua|\bn\s*!/),
      make: () => ({
        given: ['n: số nguyên không âm'],
        asked: ['n! = 1 × 2 × ... × n'],
        prog: [io('Nhập n'), pr('gt = 1'), FOR('i = 1', 'i <= n', 'i++', [pr('gt = gt * i')]), io('Xuất gt')]
      })
    },
    {
      id: 'cuu-chuong', name: 'In bảng cửu chương',
      test: p => has(p, /cuu\s+chuong|bang\s+nhan/),
      make: () => ({
        given: ['n: bảng cửu chương cần in'],
        asked: ['Các dòng n × i với i từ 1 đến 10'],
        prog: [io('Nhập n'), FOR('i = 1', 'i <= 10', 'i++', [io('Xuất n, "x", i, "=", n * i')])]
      })
    },
    {
      id: 'chu-so', name: 'Xử lý các chữ số của n',
      test: p => has(p, /chu\s+so/),
      make: p => {
        const dem = has(p, /dem|bao nhieu/) && !has(p, /tong/);
        return {
          given: ['n: một số nguyên dương'],
          asked: [dem ? 'Số lượng chữ số của n' : 'Tổng các chữ số của n'],
          prog: [io('Nhập n'), pr(dem ? 'dem = 0' : 's = 0'),
            WHILE('n > 0', [pr(dem ? 'dem = dem + 1' : 's = s + n % 10'), pr('n = n / 10')]), io(dem ? 'Xuất dem' : 'Xuất s')],
          note: 'n % 10 lấy chữ số cuối, n / 10 bỏ chữ số cuối.'
        };
      }
    },
    {
      id: 'nhap-den-khi', name: 'Nhập lại cho đến khi hợp lệ',
      test: p => has(p, /den\s+khi|nhap\s+lai|bat\s+nhap|yeu\s+cau\s+nhap\s+lai/),
      make: (p, vs) => {
        const v = has(p, /diem/) ? 'diem' : (vs[0] || 'n');
        const r = range(p);
        let cond = `${v} <= 0`, what = `${v} > 0`;
        if (r) { cond = `${v} < ${r[0]} || ${v} > ${r[1]}`; what = `${v} nằm trong ${r[0]}..${r[1]}`; }
        else if (has(p, /khong am|>=\s*0/)) { cond = `${v} < 0`; what = `${v} >= 0`; }
        return {
          given: [`${v}: giá trị người dùng nhập`],
          asked: [`Nhập lại đến khi ${what}, rồi xuất ${v}`],
          prog: [DO([io(`Nhập ${v}`)], cond), io(`Xuất ${v}`)],
          tests: r ? [[+r[0] - 1, +r[1] + 1, +r[0]], [+r[1]]] : [[-3, 0, 4], [5]],
          note: 'Dùng do-while: phải nhập ít nhất 1 lần rồi mới kiểm tra.'
        };
      }
    },
    {
      id: 'tong-day', name: 'Tính tổng từ 1 đến n',
      test: p => has(p, /tong/) && has(p, /tu\s+1\s+(den|toi)\s+n|1\s*\+\s*2|den\s+n\b|n\s+so\s+tu\s+nhien/),
      make: p => {
        const chan = has(p, /\bchan\b/), le = has(p, /\ble\b/);
        const body = chan ? [IF('i % 2 == 0', [pr('s = s + i')])] : le ? [IF('i % 2 != 0', [pr('s = s + i')])] : [pr('s = s + i')];
        return {
          given: ['n: số nguyên dương'],
          asked: [`Tổng các số ${chan ? 'chẵn ' : le ? 'lẻ ' : ''}từ 1 đến n`],
          prog: [io('Nhập n'), pr('s = 0'), FOR('i = 1', 'i <= n', 'i++', body), io('Xuất s')]
        };
      }
    },
    {
      id: 'in-day', name: 'In dãy số từ 1 đến n',
      test: p => has(p, /\bin\b|xuat|liet\s+ke|hien\s+thi/) && has(p, /tu\s+1\s+(den|toi)\s+n|cac\s+so.*(den|toi)\s+n/),
      make: p => {
        const chan = has(p, /\bchan\b/), le = has(p, /\ble\b/);
        const body = chan ? [IF('i % 2 == 0', [io('Xuất i')])] : le ? [IF('i % 2 != 0', [io('Xuất i')])] : [io('Xuất i')];
        return {
          given: ['n: số nguyên dương'],
          asked: [`In các số ${chan ? 'chẵn ' : le ? 'lẻ ' : ''}từ 1 đến n`],
          prog: [io('Nhập n'), FOR('i = 1', 'i <= n', 'i++', body)]
        };
      }
    },
    {
      id: 'xep-loai', name: 'Xếp loại điểm',
      test: p => has(p, /xep\s+loai|hoc\s+luc|loai\s+gioi|gioi.*kha/),
      make: (p, vs, low, orig) => gradeProgram(p, orig)
    },
    {
      id: 'max3', weak: true, name: 'Tìm số lớn nhất / nhỏ nhất trong 3 số',
      test: (p, vs) => has(p, /lon\s+nhat|nho\s+nhat|\bmax\b|\bmin\b/) && (vs.length >= 3 || has(p, /\b(3|ba)\s+so/)),
      make: (p, vs) => {
        const [a, b, c] = pick(vs, 3, ['a', 'b', 'c']);
        const min = has(p, /nho\s+nhat|\bmin\b/);
        const k = min ? 'min' : 'max', op = min ? '<' : '>';
        return {
          given: [`${a}, ${b}, ${c}: ba số`],
          asked: [`Số ${min ? 'nhỏ' : 'lớn'} nhất trong 3 số`],
          prog: [io(`Nhập ${a}, ${b}, ${c}`), pr(`${k} = ${a}`),
            IF(`${b} ${op} ${k}`, [pr(`${k} = ${b}`)]), IF(`${c} ${op} ${k}`, [pr(`${k} = ${c}`)]), io(`Xuất ${k}`)],
          note: `Mẹo: coi ${a} là ${k} trước, rồi so lần lượt với từng số còn lại.`
        };
      }
    },
    {
      id: 'max2', weak: true, name: 'So sánh 2 số',
      test: p => has(p, /lon\s+hon|nho\s+hon|lon\s+nhat|nho\s+nhat|so\s+sanh|\bmax\b|\bmin\b/),
      make: (p, vs) => {
        const [a, b] = pick(vs, 2, ['a', 'b']);
        if (has(p, /so\s+sanh/) || has(p, /bang\s+nhau/)) {
          return {
            given: [`${a}, ${b}: hai số`],
            asked: [`${a} lớn hơn, nhỏ hơn hay bằng ${b}`],
            prog: [io(`Nhập ${a}, ${b}`), IF(`${a} > ${b}`, [io(`Xuất "${a} lớn hơn"`)], [
              IF(`${a} < ${b}`, [io(`Xuất "${b} lớn hơn"`)], [io('Xuất "Bằng nhau"')])])]
          };
        }
        const min = has(p, /nho/);
        return {
          given: [`${a}, ${b}: hai số`],
          asked: [`Số ${min ? 'nhỏ' : 'lớn'} hơn trong 2 số`],
          prog: [io(`Nhập ${a}, ${b}`), IF(`${a} ${min ? '<' : '>'} ${b}`, [io(`Xuất ${a}`)], [io(`Xuất ${b}`)])]
        };
      }
    },
    {
      id: 'chan-le', weak: true, name: 'Kiểm tra chẵn / lẻ',
      test: p => has(p, /\bchan\b|\ble\b/),
      make: (p, vs) => {
        const n = vs[0] || 'n';
        return {
          given: [`${n}: một số nguyên`],
          asked: [`${n} là số chẵn hay số lẻ`],
          prog: [io(`Nhập ${n}`), IF(`${n} % 2 == 0`, [io('Xuất "Số chẵn"')], [io('Xuất "Số lẻ"')])],
          note: 'Số chẵn là số chia 2 dư 0. Trong C: n % 2 == 0.'
        };
      }
    },
    {
      id: 'chia-het', weak: true, name: 'Kiểm tra chia hết',
      test: p => has(p, /chia\s+het\s+cho/),
      make: (p, vs) => {
        const n = vs[0] || 'n';
        const k = (p.match(/chia\s+het\s+cho\s+(\d+|[a-z])/) || [])[1] || 'k';
        return {
          given: [`${n}: số cần kiểm tra` + (/\d/.test(k) ? '' : `; ${k}: số chia`)],
          asked: [`${n} có chia hết cho ${k} không`],
          prog: [io(/\d/.test(k) ? `Nhập ${n}` : `Nhập ${n}, ${k}`),
            IF(`${n} % ${k} == 0`, [io(`Xuất "Chia hết"`)], [io(`Xuất "Không chia hết"`)])]
        };
      }
    },
    {
      id: 'am-duong', weak: true, name: 'Kiểm tra số âm / dương',
      test: (p, vs, low) => /âm|dương/.test(low) || has(p, /so\s+am|so\s+duong|\bam\b.*\bduong\b/),
      make: (p, vs) => {
        const n = vs[0] || 'n';
        return {
          given: [`${n}: một số`],
          asked: [`${n} là số dương, số âm hay bằng 0`],
          prog: [io(`Nhập ${n}`), IF(`${n} > 0`, [io('Xuất "Số dương"')], [
            IF(`${n} < 0`, [io('Xuất "Số âm"')], [io('Xuất "Bằng 0"')])])]
        };
      }
    },
    {
      id: 'trung-binh', name: 'Tính trung bình cộng',
      test: p => has(p, /trung\s+binh/),
      make: (p, vs) => {
        const v = pick(vs, 3, has(p, /\b(2|hai)\s+so/) ? ['a', 'b'] : ['a', 'b', 'c']);
        return {
          given: [`${v.join(', ')}: các số cần tính`],
          asked: ['Trung bình cộng'],
          floats: ['tb', ...v],
          prog: [io(`Nhập ${v.join(', ')}`), pr(`tb = (${v.join(' + ')}) / ${v.length}`), io('Xuất tb')]
        };
      }
    },
    {
      id: 'hinh-tron', name: 'Hình tròn: diện tích, chu vi',
      test: p => has(p, /hinh\s+tron|ban\s+kinh/),
      make: () => ({
        given: ['r: bán kính (số thực)'],
        asked: ['Diện tích S và chu vi C của hình tròn'],
        floats: ['r', 'S', 'C'],
        prog: [io('Nhập r'), pr('S = 3.14 * r * r\nC = 2 * 3.14 * r'), io('Xuất S, C')]
      })
    },
    {
      id: 'hcn', name: 'Hình chữ nhật: diện tích, chu vi',
      test: p => has(p, /chu\s+nhat|chieu\s+dai|chieu\s+rong/),
      make: () => ({
        given: ['dai, rong: chiều dài, chiều rộng'],
        asked: ['Diện tích S và chu vi P'],
        floats: ['dai', 'rong', 'S', 'P'],
        prog: [io('Nhập dai, rong'), pr('S = dai * rong\nP = (dai + rong) * 2'), io('Xuất S, P')]
      })
    },
    {
      id: 'nhiet-do', name: 'Đổi nhiệt độ C sang F',
      test: p => has(p, /nhiet\s+do|do\s+c\b|do\s+f\b|fahrenheit|celsius/),
      make: () => ({
        given: ['C: nhiệt độ theo độ C'],
        asked: ['Nhiệt độ F tương ứng'],
        floats: ['C', 'F'],
        prog: [io('Nhập C'), pr('F = C * 9 / 5 + 32'), io('Xuất F')]
      })
    },
    {
      id: 'phep-tinh', weak: true, name: 'Tính toán với 2 số',
      test: p => has(p, /\btong\b|\bhieu\b|\btich\b|\bthuong\b|cong|tru|nhan|chia/),
      make: (p, vs) => {
        const [a, b] = pick(vs, 2, ['a', 'b']);
        const ops = [];
        if (has(p, /tong|cong/)) ops.push(['tong', `${a} + ${b}`]);
        if (has(p, /hieu|tru/)) ops.push(['hieu', `${a} - ${b}`]);
        if (has(p, /tich|nhan/)) ops.push(['tich', `${a} * ${b}`]);
        const div = has(p, /thuong|chia/);
        const prog = [io(`Nhập ${a}, ${b}`)];
        if (ops.length) prog.push(pr(ops.map(o => `${o[0]} = ${o[1]}`).join('\n')), io(`Xuất ${ops.map(o => o[0]).join(', ')}`));
        if (div) prog.push(IF(`${b} != 0`, [pr(`thuong = ${a} / ${b}`), io('Xuất thuong')], [io('Xuất "Không chia được cho 0"')]));
        return {
          given: [`${a}, ${b}: hai số`],
          asked: [[...ops.map(o => o[0]), div ? 'thuong' : ''].filter(Boolean).join(', ').replace('tong', 'tổng').replace('hieu', 'hiệu').replace('tich', 'tích').replace('thuong', 'thương')],
          floats: div ? [a, b, 'thuong'] : [],
          prog,
          note: div ? 'Phép chia phải kiểm tra số chia khác 0 → có thêm 1 khối thoi.' : ''
        };
      }
    }
  ];

  // ---------- Phân tích chung khi không nhận ra dạng bài ----------
  const WORD_OPS = [
    [/lon\s+hon\s+hoac\s+bang/g, '>='], [/nho\s+hon\s+hoac\s+bang/g, '<='], [/khong\s+nho\s+hon/g, '>='], [/khong\s+lon\s+hon/g, '<='],
    [/lon\s+hon/g, '>'], [/nho\s+hon/g, '<'], [/khac/g, '!='], [/bang/g, '=='], [/\bva\b/g, '&&'], [/\bhoac\b/g, '||'],
    [/la\s+so\s+chan|\bchan\b/g, '% 2 == 0'], [/la\s+so\s+le|\ble\b/g, '% 2 != 0'], [/chia\s+het\s+cho\s+(\S+)/g, '% $1 == 0'],
    [/la\s+so\s+am|\bam\b/g, '< 0'], [/la\s+so\s+duong|\bduong\b/g, '> 0'], [/\bla\b/g, '']
  ];
  function toCond(plain) {
    let c = plain.trim();
    for (const [re, rep] of WORD_OPS) c = c.replace(re, rep);
    return c.replace(/\s+/g, ' ').trim();
  }
  function action(origPart, plainPart) {
    const m = plainPart.match(/(in\s+ra|xuat|thong\s+bao|hien\s+thi|in)\s+/);
    if (m) {
      let rest = origPart.slice(m.index + m[0].length).trim().replace(/^["“]|["”]$/g, '');
      return io(`Xuất "${rest}"`);
    }
    return pr(origPart.trim());
  }
  function generic(orig, plain, vs) {
    const found = [];
    const prog = [];
    // Đầu vào
    const inM = plain.match(/(nhap(\s+vao)?|cho|doc(\s+vao)?)\s+([^.;:?!\n]*)/);
    let ins = vs.slice(0, 4);
    if (!ins.length && inM) {
      const STOP = new Set(['vao', 'mot', 'so', 'nguyen', 'thuc', 'cac', 'gia', 'tri', 'hai', 'ba', 'tu', 'ban', 'phim', 'nguoi', 'dung', 'duong', 'am', 'cua', 'la']);
      const w = inM[4].split(/[^a-z0-9_]+/).filter(x => x && !STOP.has(x) && !/^\d+$/.test(x));
      if (w.length) ins = [w[0]];
    }
    if (!ins.length) ins = ['x'];
    if (inM) found.push(`"${orig.substr(inM.index, inM[0].length).trim()}" → khối Nhập`);
    prog.push(io('Nhập ' + ins.join(', ')));
    // Vòng lặp
    let loopNote = '';
    if (/tu\s+1\s+(den|toi)\s+n|cac\s+so|n\s+so|lap\s+lai|nhieu\s+lan/.test(plain)) loopNote = 'Đề có ý lặp lại (từ 1 đến n / nhiều số) → cần vòng lặp for hoặc while.';
    // Điều kiện "nếu ... thì ..."
    const conds = [];
    const re = /neu\s+(.+?)\s+thi\s+(.+?)(?=(?:[,;.]\s*)?(?:nguoc\s+lai|con\s+lai|neu\s+khong|trai\s+lai|nguoc\s+lai\s+thi)|[;.\n]|neu\s|$)/g;
    let m;
    while ((m = re.exec(plain))) {
      const cOrig = orig.substr(m.index + m[0].indexOf(m[1]), m[1].length);
      const aStart = m.index + m[0].lastIndexOf(m[2]);
      conds.push({ cond: toCond(m[1]) || cOrig, act: action(orig.substr(aStart, m[2].length), m[2]) });
      found.push(`"${orig.substr(m.index, m[0].length).trim()}" → khối Điều kiện`);
    }
    const elseM = [...plain.matchAll(/(nguoc\s+lai|con\s+lai|neu\s+khong|trai\s+lai)(\s+thi)?\s*,?\s*([^.;\n]*?)(?=\s*,?\s*(?:nguoc\s+lai|con\s+lai|trai\s+lai)|[.;\n]|$)/g)]
      .filter(x => x[3].trim() && !/^neu\b/.test(x[3].trim())).pop();
    let elseAct = null;
    if (elseM) {
      const st = elseM.index + elseM[0].length - elseM[3].length;
      elseAct = action(orig.substr(st, elseM[3].length), elseM[3]);
      found.push(`"${orig.substr(elseM.index, elseM[0].length).trim()}" → nhánh Sai`);
    }
    if (conds.length) {
      const chain = /nguoc\s+lai\s*,?\s*neu|con\s+neu|neu\s+khong\s*,?\s*neu|trai\s+lai\s*,?\s*neu/.test(plain);
      if (chain || conds.length === 1) {
        let tail = elseAct ? [elseAct] : [];
        for (let i = conds.length - 1; i >= 0; i--) tail = [IF(conds[i].cond, [conds[i].act], tail)];
        prog.push(...tail);
      } else {
        conds.forEach((c, i) => prog.push(IF(c.cond, [c.act], i === conds.length - 1 && elseAct ? [elseAct] : [])));
      }
    }
    // Đầu ra
    const outM = plain.match(/(tinh|tim|in\s+ra|xuat|cho\s+biet|hien\s+thi|dem)\s+([^.;:?!\n]*)/);
    let asked = 'Chưa rõ. Tìm các chữ: "tính", "tìm", "in ra", "cho biết".';
    if (outM) {
      asked = orig.substr(outM.index, outM[0].length).trim();
      found.push(`"${asked}" → khối Xử lý + khối Xuất`);
      if (!conds.length) {
        if (/^(tinh|tim|dem)/.test(outM[1])) prog.push(pr('kq = ...'), io('Xuất kq'));
        else prog.push(io('Xuất ...'));
      }
    }
    return {
      given: [inM ? `${ins.join(', ')}: lấy từ "${orig.substr(inM.index, inM[0].length).trim()}"` : 'Đề không nói rõ. Thường là các số cần nhập.'],
      asked: [asked],
      prog,
      found,
      note: [loopNote, 'Không nhận ra dạng bài quen thuộc, đây là khung gợi ý. Hãy mở trong Bảng vẽ và sửa lại cho đúng đề.'].filter(Boolean).join(' ')
    };
  }

  // Bộ dữ liệu chạy thử cho các dạng bài quen thuộc (theo thứ tự các ô Nhập).
  const TESTS = {
    ptb2: [[0, 2, 1], [1, 2, 5], [1, 2, 1], [1, -3, 2]], ptb1: [[0, 0], [0, 3], [2, -4]],
    'nam-nhuan': [[2024], [2023], [1900], [2000]], 'tam-giac': [[3, 4, 5], [1, 2, 3]],
    'nguyen-to': [[7], [9], [2], [1]], 'giai-thua': [[5], [0]], 'cuu-chuong': [[3]], 'chu-so': [[1234], [7]],
    'tong-day': [[5], [1]], 'in-day': [[5]], max3: [[3, 1, 2], [1, 3, 2], [1, 2, 3], [2, 2, 2]],
    max2: [[5, 3], [3, 5], [4, 4]], 'chan-le': [[4], [7], [0]], 'am-duong': [[5], [-3], [0]],
    'trung-binh': [[4, 5, 6], [4, 5]], 'hinh-tron': [[2]], hcn: [[3, 4]], 'nhiet-do': [[100], [0]], 'phep-tinh': [[7, 2], [5, 0]]
  };

  // Lưu đồ chính + lưu đồ riêng của từng hàm (đặt bên dưới).
  function buildAll(r) {
    const main = build(r.prog);
    if (!r.funcs || !r.funcs.length) return main;
    const all = { nodes: [...main.nodes], edges: [...main.edges] };
    let y = FC.bbox(main, 0);
    y = y.y + y.h + 90;
    r.funcs.forEach((f, i) => {
      const c = build(f.body, { start: f.start, end: f.end, prefix: 'f' + i + '_' });
      const b = FC.bbox(c, 0);
      c.nodes.forEach(n => { n.y = Math.round(n.y + y - b.y); });
      all.nodes.push(...c.nodes);
      all.edges.push(...c.edges);
      y += b.h + 90;
    });
    return all;
  }

  function analyze(text) {
    const orig = text.normalize('NFC').trim();
    if (!orig) return null;
    const plain = plainOf(orig), low = orig.toLowerCase();
    const vs = letterVars(orig);
    // Đề tự viết "nếu ... thì ..." thì đọc theo câu chữ, trừ khi là dạng bài rõ ràng.
    const hasIf = /\bneu\b.+\bthi\b/.test(plain);
    let pat = null, r = null;
    for (const P of PATTERNS) {
      if (P.weak && hasIf) continue;
      if (!P.test(plain, vs, low)) continue;
      const x = P.make(plain, vs, low, orig);
      if (x) { pat = P; r = x; break; }
    }
    if (!r) r = generic(orig, plain, vs);
    if (pat && !r.tests && TESTS[pat.id]) r.tests = TESTS[pat.id];
    const notes = [r.note].filter(Boolean);
    const lk = wantLoop(plain);
    if (lk) {
      const c = convertLoops(r.prog, lk);
      if (c.changed) { r.prog = c.prog; notes.push(`Đề yêu cầu dùng ${lk === 'do' ? 'do-while' : lk} nên vòng lặp được vẽ theo kiểu ${lk === 'do' ? 'do-while (khối thoi nằm cuối thân lặp)' : 'while'}.`); }
    }
    const wf = pat ? wantFunc(plain, orig) : null;
    if (wf) {
      const f = toFunc(r, wf, pat.id);
      if (f) {
        r.prog = f.prog; r.funcs = f.funcs;
        const fn = f.funcs[0];
        notes.push(f.kind === 'ret'
          ? `Đề yêu cầu viết hàm. Hàm ${fn.name} có trả về giá trị: vẽ lưu đồ riêng cho hàm, khối cuối ghi "${fn.end}". Ở lưu đồ chính, lời gọi hàm là khối chữ nhật có 2 vạch đứng.`
          : `Hàm ${fn.name} không trả về giá trị (void): hàm tự làm và tự in kết quả, khối cuối ghi "Kết thúc hàm". Ở lưu đồ chính, lời gọi hàm là khối chữ nhật có 2 vạch đứng.`);
      } else notes.push('Đề có nhắc tới hàm, nhưng dạng bài này nhập dữ liệu ở giữa chương trình nên vẫn vẽ trong lưu đồ chính.');
    }
    const funcs = r.funcs || [];
    const allSteps = steps(r.prog);
    for (const f of funcs) allSteps.push(`Lưu đồ riêng của hàm ${f.name} (vẽ bên dưới lưu đồ chính):`, ...steps(f.body, { start: f.start, end: f.end }).map(x => '   ' + x));
    return {
      pattern: r.name || (pat ? pat.name : null),
      given: r.given, asked: r.asked, note: notes.join(' '), found: r.found || [],
      branches: [...branches(r.prog), ...funcs.flatMap(f => branches(f.body))],
      loops: [...loops(r.prog), ...funcs.flatMap(f => loops(f.body))],
      steps: allSteps, chart: buildAll(r),
      highlight: highlight(orig), rules: rulesOf(orig), vars: varsOf(r),
      table: r.table || null, checks: r.checks || [], tests: pat ? runTests(r) : [],
      funcs: funcs.map(f => ({ name: f.name, params: f.params, ret: f.ret ? (f.retShow || f.ret) : null }))
    };
  }

  return { analyze, plainOf };
})();
