/* Vẽ lưu đồ bằng SVG: đo khối, tìm đường mũi tên, xuất ảnh. */
window.FC = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const SLANT = 16;
  const FONT = '500 14px Saira, "Segoe UI", sans-serif';
  const DARK = {
    term: ['#86e28a', 'rgba(134,226,138,.12)'],
    io: ['#a9a4f5', 'rgba(169,164,245,.13)'],
    proc: ['#4fdcff', 'rgba(79,220,255,.10)'],
    dec: ['#f2c879', 'rgba(242,200,121,.12)'],
    sub: ['#9fd3ff', 'rgba(159,211,255,.10)'],
    text: '#dfe8f3', edge: '#c9d6e8', bg: '#0a1220', yes: '#86e28a', no: '#f2c879', sel: '#4fdcff'
  };
  const LIGHT = {
    term: ['#2e8f47', '#eefaf0'],
    io: ['#5b54c9', '#f1f0fd'],
    proc: ['#1a7fa3', '#eaf8fd'],
    dec: ['#b37a0c', '#fdf6e6'],
    sub: ['#2d6fa3', '#eef5fc'],
    text: '#14202e', edge: '#3a4a60', bg: '#ffffff', yes: '#2e8f47', no: '#b05a0c', sel: '#1a7fa3'
  };

  const cv = document.createElement('canvas').getContext('2d');
  const textW = t => { cv.font = FONT; return cv.measureText(t).width; };
  const linesOf = n => String(n.text ?? '').split('\n');

  function size(n) {
    const ls = linesOf(n);
    const w0 = Math.max(16, ...ls.map(textW));
    const h0 = ls.length * 18;
    let w, h;
    if (n.type === 'dec') { w = Math.max(150, w0 * 2 + 24); h = Math.max(76, h0 * 2 + 28); }
    else if (n.type === 'io') { w = Math.max(150, w0 + SLANT * 2 + 32); h = Math.max(48, h0 + 24); }
    else if (n.type === 'term') { w = Math.max(120, w0 + 48); h = Math.max(44, h0 + 22); }
    else if (n.type === 'sub') { w = Math.max(170, w0 + 52); h = Math.max(48, h0 + 24); }
    else { w = Math.max(150, w0 + 32); h = Math.max(48, h0 + 24); }
    return { w: Math.round(w / 2) * 2, h: Math.round(h / 2) * 2 };
  }

  function box(n) {
    const { w, h } = size(n);
    return { x: n.x, y: n.y, w, h, l: n.x - w / 2, r: n.x + w / 2, t: n.y - h / 2, b: n.y + h / 2 };
  }

  function anchor(B, side, type) {
    const inset = type === 'io' ? SLANT / 2 : 0;
    if (side === 'top') return [B.x, B.t];
    if (side === 'bottom') return [B.x, B.b];
    if (side === 'left') return [B.l + inset, B.y];
    return [B.r - inset, B.y];
  }

  const isNo = e => /^(sai|false|no|không)$/i.test((e.label || '').trim());

  function sides(s, A, B, e) {
    if (e.fs && e.ts) return [e.fs, e.ts];
    const dx = B.x - A.x;
    if (B.t - A.b >= 12) {
      if (s.type === 'dec' && Math.abs(dx) > A.w / 2) return [dx < 0 ? 'left' : 'right', 'top'];
      return ['bottom', 'top'];
    }
    if (A.t - B.b >= 12) return (s.type === 'dec' && isNo(e)) ? ['right', 'right'] : ['left', 'left'];
    return dx >= 0 ? ['right', 'left'] : ['left', 'right'];
  }

  function lane(boxes, y1, y2, side) {
    const lo = Math.min(y1, y2) - 4, hi = Math.max(y1, y2) + 4;
    let v = side === 'left' ? Infinity : -Infinity;
    for (const b of boxes) {
      if (b.b < lo || b.t > hi) continue;
      v = side === 'left' ? Math.min(v, b.l) : Math.max(v, b.r);
    }
    return side === 'left' ? v - 30 : v + 30;
  }

  function layout(model) {
    const boxes = new Map(model.nodes.map(n => [n.id, box(n)]));
    const all = [...boxes.values()];
    const byId = new Map(model.nodes.map(n => [n.id, n]));
    const edges = [];
    for (const e of model.edges) {
      const s = byId.get(e.from), t = byId.get(e.to);
      if (!s || !t || s === t) continue;
      const A = boxes.get(s.id), B = boxes.get(t.id);
      const [ss, ts] = sides(s, A, B, e);
      const p = anchor(A, ss, s.type), q = anchor(B, ts, t.type);
      const P = [p];
      if (ss === 'bottom' && ts === 'top') {
        if (Math.abs(p[0] - q[0]) > 0.5) {
          const my = q[1] - Math.min(22, Math.max(8, (q[1] - p[1]) / 2));
          P.push([p[0], my], [q[0], my]);
        }
      } else if (ss === ts) {
        const x = lane(all, p[1], q[1], ss);
        P.push([x, p[1]], [x, q[1]]);
      } else if (ts === 'top') {
        P.push([q[0], p[1]]);
      } else {
        const mx = (p[0] + q[0]) / 2;
        P.push([mx, p[1]], [mx, q[1]]);
      }
      P.push(q);
      edges.push({ e, P, ss, lane: ss === ts && ss !== 'top' && ss !== 'bottom' ? ss + '>' + t.id : null });
    }
    // Các mũi tên cùng gom vào một cạnh của một khối thì đi chung một đường dọc.
    const groups = new Map();
    for (const E of edges) if (E.lane) (groups.get(E.lane) || groups.set(E.lane, []).get(E.lane)).push(E);
    for (const [key, list] of groups) {
      if (list.length < 2) continue;
      const xs = list.map(E => E.P[1][0]);
      const x = key.startsWith('left') ? Math.min(...xs) : Math.max(...xs);
      for (const E of list) { E.P[1][0] = x; E.P[2][0] = x; }
    }
    return { boxes, edges };
  }

  function bbox(model, pad = 40) {
    if (!model.nodes.length) return { x: -200, y: -100, w: 400, h: 300 };
    const { boxes, edges } = layout(model);
    let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
    for (const B of boxes.values()) { l = Math.min(l, B.l); r = Math.max(r, B.r); t = Math.min(t, B.t); b = Math.max(b, B.b); }
    for (const { P } of edges) for (const [x, y] of P) { l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); b = Math.max(b, y); }
    return { x: l - pad, y: t - pad, w: r - l + pad * 2, h: b - t + pad * 2 };
  }

  function el(tag, attrs = {}) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  let uid = 0;
  function render(svg, model, o = {}) {
    const C = o.light ? LIGHT : DARK;
    svg.textContent = '';
    const mid = 'fc-arrow-' + (++uid);
    const defs = el('defs');
    const m = el('marker', { id: mid, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, orient: 'auto-start-reverse' });
    m.append(el('path', { d: 'M0,1 L10,5 L0,9 z', fill: C.edge }));
    defs.append(m);
    svg.append(defs);
    if (o.background) {
      const b = bbox(model);
      svg.append(el('rect', { x: b.x, y: b.y, width: b.w, height: b.h, fill: C.bg }));
    }
    const { boxes, edges } = layout(model);
    const gE = el('g', { class: 'edges' }), gN = el('g', { class: 'nodes' });
    svg.append(gE, gN);

    for (const { e, P, ss } of edges) {
      const selected = o.sel === e.id;
      const g = el('g', { class: 'edge' + (selected ? ' sel' : ''), 'data-id': e.id });
      const d = 'M' + P.map(p => p.join(',')).join(' L');
      if (o.editable) g.append(el('path', { d, class: 'hit', fill: 'none', stroke: 'transparent', 'stroke-width': 16 }));
      g.append(el('path', {
        d, class: 'line', fill: 'none', stroke: selected ? C.sel : C.edge,
        'stroke-width': selected ? 2.6 : 1.8, 'stroke-linejoin': 'round', 'marker-end': `url(#${mid})`
      }));
      if (e.label) {
        const p = P[0];
        const pos = ss === 'bottom' ? [p[0] + 8, p[1] + 16, 'start'] : ss === 'left' ? [p[0] - 6, p[1] - 8, 'end'] : [p[0] + 6, p[1] - 8, 'start'];
        const t = el('text', {
          x: pos[0], y: pos[1], 'text-anchor': pos[2], 'font-size': 13, 'font-weight': 600,
          'font-family': 'Saira, "Segoe UI", sans-serif', fill: isNo(e) ? C.no : C.yes,
          stroke: C.bg, 'stroke-width': 4, 'paint-order': 'stroke'
        });
        t.textContent = e.label;
        g.append(t);
      }
      gE.append(g);
    }

    for (const n of model.nodes) {
      const B = boxes.get(n.id);
      const [st, fl] = C[n.type];
      const cls = ['node', 't-' + n.type];
      if (o.sel === n.id) cls.push('sel');
      if (o.bad && o.bad.has(n.id)) cls.push('bad');
      if (o.from === n.id) cls.push('from');
      const g = el('g', { class: cls.join(' '), 'data-id': n.id, transform: `translate(${n.x},${n.y})` });
      if (n.ln) g.setAttribute('data-ln', n.ln.join(' '));
      const w = B.w / 2, h = B.h / 2;
      let shape;
      if (n.type === 'term') shape = el('rect', { x: -w, y: -h, width: B.w, height: B.h, rx: h });
      else if (n.type === 'proc' || n.type === 'sub') shape = el('rect', { x: -w, y: -h, width: B.w, height: B.h, rx: 4 });
      else if (n.type === 'io') shape = el('polygon', { points: `${-w + SLANT},${-h} ${w},${-h} ${w - SLANT},${h} ${-w},${h}` });
      else shape = el('polygon', { points: `0,${-h} ${w},0 0,${h} ${-w},0` });
      shape.setAttribute('fill', fl);
      shape.setAttribute('stroke', st);
      shape.setAttribute('stroke-width', 2);
      shape.setAttribute('class', 'shape');
      g.append(shape);
      if (n.type === 'sub') for (const vx of [-w + 11, w - 11]) g.append(el('line', { x1: vx, y1: -h, x2: vx, y2: h, stroke: st, 'stroke-width': 2 }));
      const ls = linesOf(n);
      const empty = !String(n.text ?? '').trim();
      ls.forEach((line, i) => {
        const t = el('text', {
          x: 0, y: (i - (ls.length - 1) / 2) * 18, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          'font-size': 14, 'font-weight': 500, 'font-family': 'Saira, "Segoe UI", sans-serif',
          fill: C.text, opacity: empty ? 0.45 : 1
        });
        t.textContent = empty ? '(trống)' : line;
        g.append(t);
      });
      gN.append(g);
    }
  }

  function fit(svg, model, pad) {
    const b = bbox(model, pad);
    svg.setAttribute('viewBox', `${b.x} ${b.y} ${b.w} ${b.h}`);
    return b;
  }

  function toPng(model, scale = 2) {
    return new Promise((resolve, reject) => {
      const svg = el('svg', { xmlns: NS });
      render(svg, model, { light: true, background: true });
      const b = bbox(model);
      svg.setAttribute('viewBox', `${b.x} ${b.y} ${b.w} ${b.h}`);
      svg.setAttribute('width', b.w);
      svg.setAttribute('height', b.h);
      const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = Math.ceil(b.w * scale); c.height = Math.ceil(b.h * scale);
        const g = c.getContext('2d');
        g.scale(scale, scale);
        g.drawImage(img, 0, 0);
        c.toBlob(blob => blob ? resolve(blob) : reject(new Error('png')), 'image/png');
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  return { render, fit, bbox, box, size, toPng, isNo };
})();
