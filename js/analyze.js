/* Phân tích đề bài bằng từ khóa (chạy trên máy, không gửi đề đi đâu).
   Kết quả: đề cho gì, hỏi gì, các nhánh, vòng lặp, hướng vẽ, lưu đồ và code C gợi ý. */
window.Analyzer = (() => {
  // ---------- Câu lệnh của "chương trình có cấu trúc" ----------
  const io = text => ({ t: 'io', text });
  const pr = text => ({ t: 'proc', text });
  const IF = (cond, yes, no = []) => ({ t: 'if', cond, yes, no });
  const WHILE = (cond, body) => ({ t: 'while', cond, body });
  const FOR = (init, cond, step, body) => ({ t: 'for', init, cond, step, body });
  const DO = (body, cond) => ({ t: 'do', body, cond });

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
    if (s.t === 'io' || s.t === 'proc') return sz(s.t, s.text).w;
    if (isChain(s)) return chainGeo(s).w;
    if (s.t === 'if') return ifOff(s).w;
    if (s.t === 'for') return Math.max(sz('proc', s.init).w, sz('dec', s.cond).w, width(s.body), sz('proc', s.step).w) + 90;
    return Math.max(sz('dec', s.cond).w, width(s.body)) + 90;
  }

  function build(prog) {
    const nodes = [], edges = [];
    let k = 0;
    const add = (type, text, x, y) => {
      const n = { id: 'g' + (++k), type, text, x: Math.round(x), y: Math.round(y + sz(type, text).h / 2) };
      nodes.push(n);
      return n;
    };
    const link = (exits, to, extra = {}) => {
      for (const ex of exits) {
        const e = { id: 'ge' + (++k), from: ex.from, to };
        if (ex.label) e.label = ex.label;
        if (ex.fs) { e.fs = ex.fs; e.ts = ex.ts; }
        Object.assign(e, extra);
        edges.push(e);
      }
    };
    function place(list, x, y, exits) {
      for (const s of list) {
        if (s.t === 'io' || s.t === 'proc') {
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
            if (f && (f.t === 'io' || f.t === 'proc')) yy = y + dh / 2 - sz(f.t, f.text).h / 2;
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
    const st = add('term', 'Bắt đầu', 0, 0);
    const r = place(prog, 0, sz('term', 'Bắt đầu').h + GAP, [{ from: st.id }]);
    const end = add('term', 'Kết thúc', 0, r.y);
    link(r.exits, end.id);
    return { nodes, edges };
  }

  // ---------- Diễn giải chương trình thành lời ----------
  const short = t => t.replace(/\n/g, '; ');
  function brief(list) {
    if (!list.length) return 'đi tiếp';
    return list.map(s => s.t === 'io' || s.t === 'proc' ? short(s.text) : s.t === 'if' ? `xét tiếp "${s.cond}"` : 'lặp').join(', ');
  }
  function steps(prog) {
    const out = ['Vẽ khối Bắt đầu (hình viên thuốc).'];
    const walk = (list, pre) => {
      for (const s of list) {
        if (s.t === 'io') out.push(`${pre}Khối Nhập/Xuất (bình hành): ${short(s.text)}.`);
        else if (s.t === 'proc') out.push(`${pre}Khối Xử lý (chữ nhật): ${short(s.text)}.`);
        else if (isChain(s)) {
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
    out.push('Vẽ khối Kết thúc.');
    return out;
  }
  function branches(prog) {
    const out = [];
    const walk = list => {
      for (const s of list) {
        if (s.t === 'if') {
          out.push(`Nếu ${s.cond} → ${brief(s.yes)}` + (s.no.length ? `; ngược lại → ${brief(s.no)}` : '; ngược lại → bỏ qua'));
          walk(s.yes); walk(s.no);
        } else if (s.body) walk(s.body);
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
        if (s.t === 'if') { walk(s.yes); walk(s.no); }
        else if (s.body) walk(s.body);
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
        else if (s.t === 'proc') vs.push(...ids(s.text));
        else {
          if (s.cond) vs.push(...ids(s.cond));
          if (s.init) vs.push(...ids(s.init), ...ids(s.step));
          walk(s.yes || []); walk(s.no || []); walk(s.body || []);
        }
      }
    };
    walk(prog);
    return uniq(vs);
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
  function toC(prog, floats = []) {
    const fl = new Set(floats);
    const isF = expr => (expr.match(/[A-Za-z_]\w*/g) || []).some(v => fl.has(v)) || /\d\.\d/.test(expr);
    const lines = [];
    const emitIf = (s, ind, lead) => {
      const p = '    '.repeat(ind);
      lines.push(`${lead ?? p}if (${s.cond}) {`);
      emit(s.yes, ind + 1);
      if (s.no.length === 1 && s.no[0].t === 'if') { emitIf(s.no[0], ind, `${p}} else `); return; }
      if (s.no.length) { lines.push(`${p}} else {`); emit(s.no, ind + 1); }
      lines.push(`${p}}`);
    };
    const emit = (list, ind) => {
      const p = '    '.repeat(ind);
      for (const s of list) {
        if (s.t === 'io') {
          const m = s.text.match(/^(Nhập|Xuất)\s+(.*)$/s);
          if (!m) { lines.push(p + '// ' + s.text); continue; }
          const items = splitItems(m[2]);
          if (m[1] === 'Nhập') {
            lines.push(`${p}scanf("${items.map(v => fl.has(v) ? '%f' : '%d').join(' ')}", ${items.map(v => '&' + v).join(', ')});`);
          } else {
            let f = '', args = [];
            for (const it of items) {
              if (it.startsWith('"')) f += strip(it.slice(1, -1)).replace(/"/g, '') + ' ';
              else { f += (isF(it) ? '%.2f' : '%d') + ' '; args.push(it); }
            }
            lines.push(`${p}printf("${f.trim()}\\n"${args.map(a => ', ' + a).join('')});`);
          }
        } else if (s.t === 'proc') {
          for (const l of s.text.split('\n')) lines.push(p + l.trim() + ';');
        } else if (s.t === 'if') {
          emitIf(s, ind);
        } else if (s.t === 'while') {
          lines.push(`${p}while (${s.cond}) {`); emit(s.body, ind + 1); lines.push(`${p}}`);
        } else if (s.t === 'for') {
          lines.push(`${p}for (${s.init}; ${s.cond}; ${s.step}) {`); emit(s.body, ind + 1); lines.push(`${p}}`);
        } else if (s.t === 'do') {
          lines.push(`${p}do {`); emit(s.body, ind + 1); lines.push(`${p}} while (${s.cond});`);
        }
      }
    };
    emit(prog, 1);
    const vars = collectVars(prog);
    const ints = vars.filter(v => !fl.has(v)), fls = vars.filter(v => fl.has(v));
    const head = ['#include <stdio.h>'];
    if (/sqrt|fabs|pow\(/.test(lines.join('\n'))) head.push('#include <math.h>');
    const decl = [];
    if (ints.length) decl.push(`    int ${ints.join(', ')};`);
    if (fls.length) decl.push(`    float ${fls.join(', ')};`);
    return [...head, '', 'int main() {', ...decl, ...lines, '    return 0;', '}'].join('\n');
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
      let low = null;
      if (L) { const op = norm(L[2]); if (op === '<=') low = { op: '>=', n: num(L[1]) }; else if (op === '<') low = { op: '>', n: num(L[1]) }; }
      if (R) { const op = norm(R[1]); if (op === '>=' || op === '>') low = { op, n: num(R[2]) }; }
      if (!out.some(t => t.name === name)) out.push({ name, low });
    }
    return out;
  }

  const PATTERNS = [
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
      make: (p, vs, low, orig) => {
        const tiers = gradeTiers(orig);
        if (tiers.length >= 2) {
          // Mốc lấy từ đề: xét từ mốc cao xuống thấp, loại không có mốc dưới là nhánh "còn lại".
          const withLow = tiers.filter(t => t.low).sort((a, b) => b.low.n - a.low.n);
          const rest = tiers.find(t => !t.low);
          let tail = rest ? [io(`Xuất "${rest.name}"`)] : [];
          for (let i = withLow.length - 1; i >= 0; i--) {
            const t = withLow[i];
            tail = [IF(`diem ${t.low.op} ${t.low.n}`, [io(`Xuất "${t.name}"`)], tail)];
          }
          return {
            given: [`diem: điểm của sinh viên${/0\s*(-|đến|den)\s*10/i.test(orig) ? ' (0 đến 10)' : ''}`],
            asked: [`Xếp loại: ${tiers.map(t => t.name).join(', ')}`],
            floats: ['diem'],
            prog: [io('Nhập diem'), ...tail],
            note: `Đọc được ${tiers.length} mức từ đề. Xét từ mốc cao xuống thấp: đã qua nhánh Sai của mốc trên thì chắc chắn điểm nhỏ hơn mốc đó, nên mỗi khối thoi chỉ cần so mốc dưới.`
          };
        }
        return {
          given: ['diem: điểm trung bình (0 đến 10)'],
          asked: ['Xếp loại: Giỏi, Khá, Trung bình hoặc Yếu'],
          floats: ['diem'],
          prog: [io('Nhập diem'),
            IF('diem >= 8', [io('Xuất "Giỏi"')], [
              IF('diem >= 6.5', [io('Xuất "Khá"')], [
                IF('diem >= 5', [io('Xuất "Trung bình"')], [io('Xuất "Yếu"')])])])],
          note: 'Đề không ghi rõ mốc điểm nên dùng mốc thường gặp. Nếu đề cho mốc khác, sửa lại số trong khối thoi.'
        };
      }
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

  function analyze(text) {
    const orig = text.normalize('NFC').trim();
    if (!orig) return null;
    const plain = plainOf(orig), low = orig.toLowerCase();
    const vs = letterVars(orig);
    // Đề tự viết "nếu ... thì ..." thì đọc theo câu chữ, trừ khi là dạng bài rõ ràng.
    const hasIf = /\bneu\b.+\bthi\b/.test(plain);
    const pat = PATTERNS.find(P => (!P.weak || !hasIf) && P.test(plain, vs, low));
    const r = pat ? pat.make(plain, vs, low, orig) : generic(orig, plain, vs);
    return {
      pattern: pat ? pat.name : null,
      given: r.given, asked: r.asked, note: r.note || '', found: r.found || [],
      branches: branches(r.prog), loops: loops(r.prog), steps: steps(r.prog),
      chart: build(r.prog), code: pat ? toC(r.prog, r.floats || []) : ''
    };
  }

  return { analyze, plainOf };
})();
