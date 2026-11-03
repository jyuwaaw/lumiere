// SINGULARITY — a deterministic, seekable short film. seek(t) renders time t.
const W = 2560, H = 1440, DURATION = 162;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);
const sm = (a, b, t) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fmt = n => Math.round(n).toLocaleString('en-US');
const $ = (s, r = document) => r.querySelector(s);
const SFX = [];

// ---------- scheduling helpers
function typer(t0, text, cps = 11, kind = 'key', jit = .8) {
  const times = []; let tt = t0;
  for (let i = 0; i < text.length; i++) {
    tt += (1 / cps) * (1 - jit / 2 + jit * hash(i * 7.31 + t0 * 3.17));
    times.push(tt); SFX.push({ t: tt, type: kind });
  }
  return { t0, end: tt, text,
    n(t) { let k = 0; while (k < times.length && times[k] <= t) k++; return k; },
    at(t) { return text.slice(0, this.n(t)); } };
}
function composer(t0, segs, cps = 12, kind = 'key') {
  let tt = t0; const parts = [];
  for (const s of segs) {
    if (s.py) {
      const ty = typer(tt, s.py, cps, kind);
      const commit = ty.end + .26 + .18 * hash(tt);
      SFX.push({ t: commit, type: kind === 'key' ? 'space' : kind });
      parts.push({ ime: 1, ty, commit, hz: s.hz, cands: s.cands || [s.hz] });
      tt = commit + .12;
    } else { const ty = typer(tt, s.lit, cps * .8, kind); parts.push({ ty }); tt = ty.end + .1; }
  }
  return { end: tt, state(t) {
    let text = '', comp = '', cands = null;
    for (const p of parts) {
      if (!p.ime) text += p.ty.at(t);
      else if (t >= p.commit) text += p.hz;
      else if (p.ty.n(t) > 0) { comp = p.ty.at(t); cands = p.cands; }
    }
    return { text, comp, cands };
  } };
}
function blink(t, last = -9) { return (t - last < .5) ? 1 : (Math.floor(t * 1.9) % 2 === 0 ? 1 : 0); }
function inputHTML(st, t, ph = '', caret = true) {
  let h = esc(st.text);
  if (st.comp) h += `<span class="comp">${esc(st.comp)}</span>`;
  if (!st.text && !st.comp && ph) h = `<span class="ph">${ph}</span>` + h;
  const cand = st.cands ? `<div class="cand">${st.cands.map((c, i) => `<span class="${i ? '' : 'sel'}"><span class="n">${i + 1}</span>${c}</span>`).join('')}<span style="color:#888">›</span></div>` : '';
  const c = caret ? `<span class="cw2"><span class="caret" style="opacity:${blink(t)}"></span>${cand}</span>` : '';
  return (st.text || st.comp || !ph) ? h + c : c + h;
}

// ---------- icons
function star(sz, col = '#d97757') {
  let p = '';
  for (let i = 0; i < 12; i++) { const l = i % 2 ? .74 : 1; p += `<rect x="-4.6" y="${-47 * l}" width="9.2" height="${42 * l}" rx="4.6" transform="rotate(${i * 30 + (hash(i) - .5) * 9})"/>`; }
  return `<svg width="${sz}" height="${sz}" viewBox="-50 -50 100 100"><g fill="${col}">${p}</g></svg>`;
}
const MAG = (s = 34, c = '#9aa0a6') => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path fill="none" stroke="${c}" stroke-width="2.3" stroke-linecap="round" d="M10.5 3.5a7 7 0 1 0 0 14a7 7 0 0 0 0-14zM15.8 15.8L21 21"/></svg>`;
const BELL = s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path fill="none" stroke="#eee" stroke-width="1.7" d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/></svg>`;
const ARROW = `<svg viewBox="0 0 12 19" width="44" height="66"><path d="M1 1 L1 15.6 L4.7 12.3 L7.2 17.9 L9.4 16.9 L7 11.4 L11.7 11.4 Z" fill="#fff" stroke="#000" stroke-width=".9" stroke-linejoin="round"/></svg>`;
const HAND = `<svg viewBox="0 0 16 22" width="48" height="66" style="margin-left:-12px"><path d="M5 1.5c.8 0 1.5.7 1.5 1.5v5.2l.5-.1c.8-.1 1.5.5 1.6 1.2l.3-.1c.8-.1 1.5.4 1.7 1.1c.8-.2 1.6.3 1.8 1.1l.6 3.6c.3 2-.9 3.9-2.8 4.4l-2.2.5c-1.5.4-3.1-.2-4-1.4L1.3 14.6c-.5-.6-.4-1.5.2-2c.6-.5 1.4-.4 1.9.1l.1.1V3c0-.8.7-1.5 1.5-1.5z" fill="#fff" stroke="#000" stroke-width=".8"/></svg>`;
const ICONS = {
  win: `<svg width="34" height="34" viewBox="0 0 20 20"><g fill="#4cc2ff"><rect x="0" y="0" width="9.4" height="9.4" rx="1"/><rect x="10.6" y="0" width="9.4" height="9.4" rx="1"/><rect x="0" y="10.6" width="9.4" height="9.4" rx="1"/><rect x="10.6" y="10.6" width="9.4" height="9.4" rx="1"/></g></svg>`,
  folder: `<svg width="40" height="40" viewBox="0 0 24 24"><path d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" fill="#f4c542"/><path d="M2 9h20v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" fill="#ffd96a"/></svg>`,
  edge: `<div style="width:40px;height:40px;border-radius:50%;background:conic-gradient(from 200deg,#0c59a4,#1fb3d6,#56d06a,#0c59a4)"></div>`,
  chrome: `<div style="width:40px;height:40px;border-radius:50%;background:conic-gradient(from -30deg,#db4437 0 120deg,#f4c20d 0 240deg,#0f9d58 0);display:flex;align-items:center;justify-content:center"><div style="width:18px;height:18px;border-radius:50%;background:#4285f4;border:3px solid #fff"></div></div>`,
  claude: `<div style="width:44px;height:44px;border-radius:11px;background:#262624;display:flex;align-items:center;justify-content:center">${star(34)}</div>`,
  term: `<div style="width:42px;height:36px;border-radius:7px;background:#1e1e1e;border:2px solid #555;color:#ddd;font:600 17px JBM;display:flex;align-items:center;justify-content:center">&gt;_</div>`,
};
function taskbar(time, date, active = '') {
  const ic = (k, cls = 'on') => `<div class="ic ${active === k ? 'act' : cls}" id="tb_${k}">${ICONS[k]}</div>`;
  return `<div class="tb"><div class="ic">${ICONS.win}</div><div class="srch">${MAG(26, '#bbb')}搜索</div>${ic('folder', '')}${ic('edge', '')}${ic('chrome')}${ic('claude')}${ic('term')}
  <div class="clock"><div class="tbt">${time}</div><div class="tbd">${date}</div></div><div class="bell">${BELL(30)}</div></div>`;
}
function chromeWin({ tabs = [{ t: '新标签页', a: 1 }], url = '', info = '', page = '', id = '' }) {
  return `<div class="cw">
  <div class="cw-top"><div class="cw-tabs" ${id ? `id="${id}_tabs"` : ''}>${tabs.map(tabHTML).join('')}</div><div class="cw-new">+</div><div class="cw-btns"><span>—</span><span>☐</span><span>✕</span></div></div>
  <div class="cw-bar"><span class="nav">←</span><span class="nav">→</span><span class="nav">⟳</span><div class="omni" ${id ? `id="${id}_url"` : ''}>${url}</div><span class="nav" style="font-size:26px">⧉</span><div class="avatar">林</div><span class="nav">⋮</span></div>
  ${info ? `<div class="cw-info">${info}</div>` : ''}
  <div class="cw-page">${page}</div></div>`;
}
function tabHTML(tb) {
  const fav = tb.load ? `<span class="fav" style="background:none;border:3px solid #8ab4f8;border-right-color:transparent;transform:rotate(${tb.load}deg)"></span>` : `<span class="fav" style="${tb.fc ? 'background:' + tb.fc : ''}"></span>`;
  return `<div class="tab ${tb.a ? 'active' : ''}" style="${tb.w ? 'width:' + tb.w + 'px' : ''}">${fav}<span class="tt">${tb.t}</span><span class="x">✕</span></div>`;
}
const URL_G = q => `<span class="dim">ⓘ</span><span>www.google.com/search?q=<span>${q}</span></span>`;

// ---------- wallpaper
function makeWall(w, h, seed = 1, warm = 0) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, w, h); bg.addColorStop(0, '#03051a'); bg.addColorStop(1, '#0a0820'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  const cx = w * .6, cy = h * .58;
  const petals = 9;
  for (let pass = 0; pass < 2; pass++) {
    g.filter = pass === 0 ? `blur(${w / 40}px)` : `blur(${w / 900}px)`;
    for (let i = 0; i < petals; i++) {
      const a = -2.6 + i * .52 + (hash(i + seed) - .5) * .2, L = w * (.32 + .18 * hash(i * 3 + seed)), wd = L * (.28 + .1 * hash(i + 9));
      g.save(); g.translate(cx, cy); g.rotate(a);
      const gr = g.createLinearGradient(0, -wd, L, wd);
      const cols = warm && i % 4 === 1 ? ['#ff9a6b', '#d9577a', '#5a2bd6'] : [['#1c3fd8', '#5f8dff', '#c2d6ff'], ['#3a1fb8', '#7b5cff', '#d6c8ff'], ['#0d2a9e', '#2f7bff', '#9fd0ff']][i % 3];
      gr.addColorStop(0, cols[2]); gr.addColorStop(.45, cols[1]); gr.addColorStop(1, cols[0]);
      g.fillStyle = gr; g.globalAlpha = pass === 0 ? .55 : .92;
      g.beginPath(); g.moveTo(0, 0);
      g.bezierCurveTo(L * .3, -wd * 1.2, L * .85, -wd * .9, L, -wd * .1);
      g.bezierCurveTo(L * .8, wd * .5, L * .35, wd * .55, 0, 0); g.fill();
      g.globalAlpha = pass === 0 ? 0 : .35; g.strokeStyle = '#e8eeff'; g.lineWidth = w / 1400;
      g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(L * .3, -wd * 1.2, L * .85, -wd * .9, L, -wd * .1); g.stroke();
      g.restore();
    }
  }
  g.filter = 'none'; g.globalAlpha = 1;
  const rg = g.createRadialGradient(cx, cy, 0, cx, cy, w * .5); rg.addColorStop(0, 'rgba(160,190,255,.25)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(0, 0, w, h);
  return c;
}

// ---------- subpixel clock (extreme close-up of an LCD)
function subpixelCanvas(time, date) {
  const sw = 256, sh = 144, cell = 10;
  const s = document.createElement('canvas'); s.width = sw; s.height = sh; const g = s.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, sw, sh);
  g.fillStyle = '#fff'; g.textAlign = 'right'; g.textBaseline = 'alphabetic';
  g.font = '500 33px Inter'; g.fillText(time, 196, 64);
  g.font = '400 27px Inter'; g.fillText(date, 196, 104);
  g.strokeStyle = '#fff'; g.lineWidth = 2.6; g.beginPath();
  g.moveTo(214, 92); g.lineTo(214, 80); g.arc(226, 80, 12, Math.PI, 0); g.lineTo(238, 92); g.lineTo(242, 97); g.lineTo(210, 97); g.closePath(); g.stroke();
  g.beginPath(); g.arc(226, 101, 4, 0, Math.PI); g.stroke();
  const src = g.getImageData(0, 0, sw, sh).data;
  const big = document.createElement('canvas'); big.width = W; big.height = H; const bg = big.getContext('2d');
  const out = bg.createImageData(W, H); const d = out.data;
  for (let y = 0; y < H; y++) {
    const sy = Math.floor(y / cell), fy = (y % cell) / cell;
    const rowOn = fy > .08 && fy < .9;
    for (let x = 0; x < W; x++) {
      const sx = Math.floor(x / cell), fx = (x % cell) / cell;
      const v = src[(sy * sw + sx) * 4] / 255;
      const i = (y * W + x) * 4; const ch = fx < .333 ? 0 : fx < .666 ? 1 : 2;
      const inSub = ((fx * 3) % 1) > .12 && ((fx * 3) % 1) < .86 && rowOn;
      const base = .07, val = inSub ? Math.min(1, 1.25 * Math.pow(base + (1 - base) * v, 1.0)) : .012;
      d[i] = ch === 0 ? 255 * Math.min(1, val * 1.2) : 20 * val; d[i + 1] = ch === 1 ? 235 * val : 18 * val; d[i + 2] = ch === 2 ? 255 * Math.min(1, val * 1.3) : 24 * val; d[i + 3] = 255;
    }
  }
  bg.putImageData(out, 0, 0);
  return big;
}

// ---------- Cayley–Dickson in JS (for the multiplication table stream)
function cdMul(a, b) {
  const n = a.length; if (n === 1) return [a[0] * b[0]];
  const h = n / 2, p = a.slice(0, h), q = a.slice(h), r = b.slice(0, h), s = b.slice(h);
  const conj = v => v.map((x, i) => i ? -x : x), add = (u, v) => u.map((x, i) => x + v[i]), sub = (u, v) => u.map((x, i) => x - v[i]);
  return sub(cdMul(p, r), cdMul(conj(s), q)).concat(add(cdMul(s, p), cdMul(q, conj(r))));
}
function basisProd(i, j, n) { const e = k => { const v = new Array(n).fill(0); v[k] = 1; return v; }; const r = cdMul(e(i), e(j)); const k = r.findIndex(x => x !== 0); return (r[k] > 0 ? '+' : '−') + 'e' + String(k).padStart(2, '0'); }

// ---------- stage + views
const stage = document.getElementById('stage');
const V = {};
function view(id, html, bg) { const d = document.createElement('div'); d.className = 'screen'; d.id = id; d.innerHTML = html; if (bg) d.style.background = bg; stage.appendChild(d); V[id] = d; return d; }
const cur = document.createElement('div'); cur.id = 'cur';

const WALL = makeWall(W * 2, H * 2, 1).toDataURL('image/jpeg', .93);
const WALL2 = makeWall(W * 2, H * 2, 4, 1).toDataURL('image/jpeg', .93);
const wallBG = `url(${WALL}) center/cover`;

// clock
view('v_clock', '<canvas id="clk" width="2560" height="1440"></canvas>', '#000');
const CLK = { a: subpixelCanvas('23:57', '2028/12/31'), b: subpixelCanvas('23:59', '2028/12/31'), c: subpixelCanvas('0:00', '2029/1/1') };
let clkState = '';
function drawClock(k) { if (clkState === k) return; clkState = k; $('#clk').getContext('2d').drawImage(CLK[k], 0, 0); }

// google new tab
view('v_gnew', chromeWin({ url: '<span class="dim">在 Google 中搜索，或输入网址</span>', page: `
  <div class="ab glogo" style="left:0;right:0;top:330px;text-align:center;font-size:150px">Google</div>
  <div class="sb" id="g_sb" style="left:700px;top:560px;width:1160px;height:96px">${MAG()}<div id="g_inp" style="flex:1;white-space:nowrap"></div><span style="font-size:30px">🎤</span></div>
  <div class="sugg" id="g_sugg" style="left:700px;top:656px;width:1160px;display:none"></div>
  <div class="ab" style="left:0;right:0;top:760px;display:flex;justify-content:center;gap:60px">${['YouTube', 'Gmail', 'arXiv', 'MathOverflow', '添加快捷方式'].map(s => `<div style="width:150px;text-align:center;font-size:20px;color:#ccc"><div style="width:84px;height:84px;margin:0 auto 14px;border-radius:50%;background:#35363a;display:flex;align-items:center;justify-content:center;font-size:30px">${s[0]}</div>${s}</div>`).join('')}</div>`
}) + taskbar('23:57', '2028/12/31', 'chrome'));

// results page
const RES = q => `<div class="res">
  <div class="rhead"><div class="glogo" style="font-size:56px;letter-spacing:-1px">Google</div>
   <div class="sb" style="position:relative;width:1240px;height:80px" id="${q.id}_sb"><div id="${q.id}_inp" style="flex:1;white-space:nowrap">${q.q}</div><span style="color:#9aa0a6;font-size:30px">✕ &nbsp;│&nbsp; 🎤 &nbsp; ${MAG(30, '#8ab4f8')}</span></div></div>
  <div class="rtabs"><span>AI 模式</span><span class="on">全部</span><span>图片</span><span>视频</span><span>短视频</span><span>新闻</span><span>网页</span><span>更多 ⌄</span><span style="margin-left:60px">工具 ⌄</span></div>
  <div class="rbody" id="${q.id}_body">${q.body}</div></div>`;
view('v_gres', chromeWin({ url: URL_G('三十二元数+六十四元数'), tabs: [{ t: '三十二元数 六十四元数 - Google 搜索', a: 1, fc: '#4285f4' }], page: RES({ id: 'r', q: '三十二元数 六十四元数', body: `
  <div class="stat" id="r_stat">找到约 812 条结果（用时 0.41 秒）</div>
  <div class="r"><div class="site"><span class="fv">W</span><div>维基百科<div class="url">https://zh.wikipedia.org › wiki › 三十二元数</div></div></div>
    <div class="ttl">三十二元数 - 维基百科，自由的百科全书</div><div class="sn">三十二元数（trigintaduonion）是实数上的 32 维非结合代数，通过凯莱–迪克森构造由十六元数得到。它既不是交错代数，也不是可除代数，但仍是幂结合与柔性的……</div></div>
  <div class="r" id="r_se"><div class="site"><span class="fv">Σ</span><div>Mathematics Stack Exchange<div class="url">https://math.stackexchange.com › questions</div></div></div>
    <div class="ttl" id="r_se_t">What is lost going from the 32-ions to the 64-ions? [closed]</div><div class="sn">Closed. This question needs details or clarity. It is not currently accepting answers. Each doubling loses something: order, commutativity, associativity, alternativity …</div><div class="meta" id="r_se_m">0 个回答 · 2 人关注 · 2028年11月提问</div></div>
  <div class="r" id="r_mo"><div class="site"><span class="fv">M</span><div>MathOverflow<div class="url">https://mathoverflow.net › questions</div></div></div>
    <div class="ttl">Is there a polynomial identity of the sedenions that fails in the 32-ions?</div><div class="sn">Yes — an octic identity A_x(A_x(y)·A_x(z)) = 0, found in October 2028. Does the pattern continue? Nobody knows …</div></div>
  <div class="r" id="r_nlab"><div class="site"><span class="fv">n</span><div>nLab<div class="url">https://ncatlab.org › nlab › show › Cayley-Dickson+construction</div></div></div>
    <div class="ttl"><span id="r_nlab_a">Cayley-Dickson construction in nLab</span></div><div class="sn">The Cayley–Dickson construction produces a sequence of algebras ℝ, ℂ, ℍ, 𝕆, 𝕊, … each of twice the dimension of the previous one …</div></div>` })
}) + taskbar('23:57', '2028/12/31', 'chrome'));

// wiki
const yn = s => s.split('').map(c => c === '是' ? '<td class="y">是</td>' : '<td class="n">否</td>').join('');
view('v_wiki', chromeWin({ url: '<span class="dim">🔒</span> zh.wikipedia.org/wiki/六十四元数', tabs: [{ t: '六十四元数 - 维基百科', a: 1, fc: '#eee' }], page: `<div class="wk">
  <h1>六十四元数</h1><div class="sub">维基百科，自由的百科全书</div>
  <p><b>六十四元数</b>是实数上的 64 维代数，由三十二元数经<a>凯莱–迪克森构造</a>得到。与三十二元数一样，它是幂结合的、柔性的，并含有零因子。</p>
  <table id="w_tab"><tr><th>代数</th><th>维数</th><th>交换</th><th>结合</th><th>交错</th><th>幂结合</th><th>可除</th><th>翻倍时失去</th></tr>
  <tr><td>四元数</td><td>4</td>${yn('否是是是是')}<td>结合律</td></tr>
  <tr><td>八元数</td><td>8</td>${yn('否否是是是')}<td>交错律</td></tr>
  <tr><td>十六元数</td><td>16</td>${yn('否否否是否')}<td>八次恒等式<sup>[3]</sup></td></tr>
  <tr><td>三十二元数</td><td>32</td>${yn('否否否是否')}<td class="q" id="w_q">？</td></tr>
  <tr><td>六十四元数</td><td>64</td>${yn('否否否是否')}<td class="q">？</td></tr></table>
  <p id="w_cite">三十二元数与六十四元数之间是否存在可区分的多项式恒等式，<span style="background:#fef6e7">尚无可靠来源。</span><sup>[来源请求]</sup></p></div>`
}) + taskbar('23:57', '2028/12/31', 'chrome'));

// no results
view('v_gnone', chromeWin({ url: URL_G('三十二元数+六十四元数'), tabs: [{ t: '三十二元数 六十四元数 - Google 搜索', a: 1, fc: '#4285f4' }], page: RES({ id: 'n', q: '', body: `<div id="n_msg" style="font-size:29px;line-height:52px;margin-top:60px;color:#e8eaed">
  <div>找不到和您查询的“<b>从三十二元数到六十四元数</b>”相符的内容或信息。</div><div style="margin-top:34px">建议：</div>
  <div style="padding-left:30px;color:#bdc1c6">· 请检查输入字词有无错误。<br>· 请换用另外的查询字词。<br>· 请改用较常见的字词。</div></div>` })
}) + taskbar('23:58', '2028/12/31', 'chrome'));

// taskbar on desktop
view('v_task', `<div class="ab" style="left:600px;top:200px;width:1400px;height:900px;background:#202124;border-radius:12px;border:1px solid #444;opacity:.9"></div>
  <div class="ab" id="tip" style="left:0;top:1260px;background:#2b2b2b;border:1px solid #444;border-radius:10px;padding:14px 24px;font-size:24px;color:#eee;display:none">Claude</div>` + taskbar('23:58', '2028/12/31', 'chrome'), wallBG);

// claude app
view('v_claude', `<div class="cl">
  <div class="side"><div style="display:flex;align-items:center;gap:16px;font-size:30px;color:#f0eee6;margin-bottom:30px">${star(40)} Claude</div>
   <div style="background:#2c2b28;color:#f0eee6">＋ 新对话</div><div>对话</div><div>项目</div><div style="margin-top:40px;color:#8e8c84;font-size:20px">最近</div>
   <div>Lean 4 归纳证明</div><div>八元数乘法表</div><div>年终总结草稿</div><div>为什么 2⁴ⁿ 元数…</div></div>
  <div id="c_home"><div class="greet">${star(70)}<span>夜深了，林</span></div>
   <div class="compo"><div class="inp" id="c_inp"></div>
    <div class="crow"><div class="btn" style="font-size:30px">＋</div><div class="btn">⚙ 工具</div><div class="model" id="c_model"></div><div class="send">↑</div></div></div>
   <div class="dd" id="c_dd" style="left:1400px;top:820px;display:none">
    <div class="it" id="dd_opus"><div class="nm">Claude Opus 7</div><div class="ds">研究级智能</div><div class="ck" id="dd_ck">✓</div></div>
    <div class="it" id="dd_son"><div class="nm">Claude Sonnet 7</div><div class="ds">适合日常任务</div></div>
    <div class="it" id="dd_hai"><div class="nm">Claude Haiku 6</div><div class="ds">最快的模型</div></div><hr>
    <div class="it" id="dd_sing"><div class="nm">Claude Singularity <span class="badge" id="dd_badge">研究预览</span></div><div class="ds" id="dd_desc">可完全接管你的设备，进行无上限检索与推理</div></div></div></div>
  <div id="c_conv" style="display:none">
   <div class="ab" style="left:380px;right:0;top:0;height:90px;border-bottom:1px solid #33322f;display:flex;align-items:center;padding-left:40px;gap:20px;font-size:25px;color:#c2c0b6">从三十二元数到六十四元数 <span style="margin-left:auto;margin-right:40px;display:flex;gap:14px;align-items:center;color:#f0eee6">Claude Singularity <span class="badge">研究预览</span> ⌄</span></div>
   <div class="thread"><div class="ubub">从三十二元数到六十四元数，具体失去了什么？</div><div id="c_think" class="think" style="margin-top:50px"></div><div class="ans" id="c_ans"></div></div></div>
  </div>` + taskbar('23:58', '2028/12/31', 'claude'), '#262624');

// uac
view('v_uac', `<div class="ab" style="inset:0;background:rgba(0,0,0,.55)"></div><div class="uac" id="u_box"><div class="hd">用户账户控制</div><div class="bd">
  <h2>你要允许此应用完全接管<br>你的设备吗？</h2>
  <div class="app"><div style="width:76px;height:76px;border-radius:16px;background:#262624;display:flex;align-items:center;justify-content:center">${star(56)}</div><div><div class="n1">Claude Singularity</div><div class="n2">Claude · 研究预览</div></div></div>
  <div class="kv">已验证的发布者：Anthropic, PBC<br>文件源：此计算机上的硬盘驱动器</div>
  <div class="perm" id="u_perm"><div style="color:#aaa;margin-left:-4px">请求的权限：</div><div>控制鼠标与键盘</div><div>打开、排列和关闭所有窗口</div><div>读取和写入你的所有文件</div><div>不受限制地访问网络</div></div>
  <div class="more">显示更多详细信息</div></div>
  <div class="bts"><div class="yes" id="u_yes">是</div><div class="no">否</div></div></div>` + taskbar('23:58', '2028/12/31', 'claude'), wallBG);

// takeover chrome
const BANNER = id => `<div class="bn" id="${id}">${star(40)}<span>Claude Singularity 正在控制此设备</span><span class="ct" id="${id}_ct"></span><span class="stop">停止</span></div>`;
view('v_take', chromeWin({ id: 'tk', url: URL_G('Cayley-Dickson+32+64+identity'), info: '<span style="color:#8ab4f8">ⓘ</span> Chrome 正受到自动测试软件的控制。', page: `<div class="res"><div class="rbody" style="padding-top:60px">${[1, 2, 3, 4, 5].map(i => `<div class="r"><div class="ttl" style="width:${700 + 300 * hash(i)}px;height:30px;background:#2a3b57;border-radius:6px"></div><div class="ln" style="width:${1100 + 200 * hash(i + 3)}px;background:#35363a"></div><div class="ln" style="width:${900 + 300 * hash(i + 5)}px;background:#35363a"></div></div>`).join('')}</div></div>` }) + BANNER('tk_bn') + taskbar('23:58', '2028/12/31', 'chrome'));
const TK_TITLES = ['Cayley–Dickson construction', 'Sedenion - Wikipedia', 'Trigintaduonion - Wikipedia', 'arXiv:2810.04417 Octic id…', 'MathOverflow · sedenion', 'nLab: alternative algebra', 'Power-associative algebra', 'Associator - Wikipedia', 'GitHub · cayley-dickson', 'arXiv:2712.11028 Zero div…', 'Flexible algebra - Wiki', 'Spectral theory of non-as…'];

// wall of windows
const WALLWIN = [];
let wallHTML = '';
for (let i = 0; i < 16; i++) {
  const c = i % 4, r = Math.floor(i / 4);
  const x = 90 + c * 615 + (hash(i * 3) - .5) * 40, y = 120 + r * 318 + (hash(i * 5) - .5) * 30;
  WALLWIN.push({ x, y, t: 58.05 + i * .14 + hash(i) * .1, rate: 1.35, ph: hash(i * 11) * 10 });
  wallHTML += `<div class="mw" id="mw${i}" style="left:${x}px;top:${y}px"><div class="bar"></div><div class="pg"></div></div>`;
}
view('v_wall', wallHTML + BANNER('wl_bn') + taskbar('23:58', '2028/12/31', 'chrome'), wallBG);
const PAGES = [
  { k: 'wiki', t: 'Sedenion - Wikipedia', h: 'Sedenion', w: ['zero divisors', 'power-associative', 'flexible'] },
  { k: 'arxiv', t: 'arXiv:2810.04417', h: 'An octic identity of the sedenions', w: ['A_x(A_x(y)A_x(z)) = 0', '32-ions'] },
  { k: 'so', t: 'MathOverflow', h: 'Identities of Cayley–Dickson algebras', w: ['open', 'degree 8'] },
  { k: 'code', t: 'GitHub · cdlab', h: 'cdlab/spectrum.py', w: ['def assoc_matrix(x):', 'charpoly'] },
  { k: 'wiki', t: 'Trigintaduonion - Wikipedia', h: 'Trigintaduonion', w: ['32-dimensional', 'Cayley–Dickson'] },
  { k: 'arxiv', t: 'arXiv:2712.11028', h: 'Spectra of associators in non-associative algebras', w: ['eigenvalues', 'multiplicity'] },
  { k: 'nlab', t: 'nLab: Cayley-Dickson', h: 'Cayley-Dickson construction', w: ['doubling', 'normed division'] },
  { k: 'so', t: 'Math.SE', h: 'What is lost going from the 32-ions to the 64-ions?', w: ['[closed]', '0 answers'] },
];
function pageHTML(p, s) {
  const light = p.k === 'wiki' || p.k === 'arxiv' || p.k === 'nlab';
  const bg = light ? '#b9bcc1' : (p.k === 'code' ? '#0d1117' : '#2d2d2d'), fg = light ? '#1d1f22' : '#ddd', lc = light ? '#a3a6ab' : '#444';
  let h = `<div style="position:absolute;inset:0;background:${bg};padding:14px 18px;color:${fg}"><div style="font-size:${p.k === 'arxiv' ? 19 : 22}px;font-family:${light ? 'NSerif,serif' : 'Inter'};margin-bottom:10px">${p.h}</div>`;
  for (let j = 0; j < 9; j++) {
    const wv = 40 + 55 * hash(s * 13 + j);
    if (j === 3 || j === 6) h += `<div style="font-size:15px;margin:6px 0"><span style="background:${light ? '#ffe066' : '#5a4a00'};padding:0 4px">${p.w[j === 3 ? 0 : 1 % p.w.length] || p.w[0]}</span></div>`;
    else h += `<div class="ln" style="width:${wv}%;background:${p.k === 'code' ? ['#7ee787', '#79c0ff', '#ff7b72', '#d2a8ff'][j % 4] + '55' : lc}"></div>`;
  }
  return h + '</div>';
}

// paper close-ups
view('v_paper', chromeWin({ url: '<span class="dim">🔒</span> arxiv.org/pdf/2810.04417', tabs: [{ t: 'arXiv:2810.04417', a: 1, fc: '#b31b1b' }], info: '<span style="color:#8ab4f8">ⓘ</span> Chrome 正受到自动测试软件的控制。', page: `<div class="pp">
  <div class="find" id="pp_find"><span class="q">power-associative</span><span class="c">1/3</span><span>⌃</span><span>⌄</span><span>✕</span></div>
  <div class="blk" style="top:40px"><h3>1&nbsp;&nbsp;The Cayley–Dickson construction</h3>Starting from ℝ, the <mark id="pp_cd">Cayley–Dickson construction</mark> doubles the dimension at every step, producing ℂ, ℍ, 𝕆, the sedenions 𝕊 and then the 32-ions 𝕋. Each doubling loses something: order, commutativity, associativity, alternativity.</div>
  <div class="blk" style="top:390px"><b>Proposition 3.2.</b> Every Cayley–Dickson algebra is <mark class="cur" id="pp_pa">power-associative</mark> and flexible. In particular (x, x, x) = 0, and the associator (x, x, y) depends quadratically on x. Neither property says anything about <mark>power-associative</mark> identities of higher degree.</div>
  <div class="blk" style="top:690px"><h3>5&nbsp;&nbsp;The next doubling</h3>A degree-eight identity separates the sedenions from the 32-ions [BigBang, 2028]. Whether anything separates the 32-ions from the 64-ions is <mark id="pp_open">open</mark>. A natural place to look is the <mark id="pp_spec">spectrum of the associator</mark> A<sub>x</sub>(y) = (xx)y − x(xy), about which nothing seems to be known.</div></div>`
}) + taskbar('23:58', '2028/12/31', 'chrome'));

// notepad
view('v_note', `<div class="np"><div class="tl">📝 无标题 - 记事本<span style="margin-left:auto;margin-right:30px;letter-spacing:40px">—☐✕</span></div><div class="mn"><span>文件</span><span>编辑</span><span>查看</span></div><div class="tx" id="np_tx"></div></div>` + BANNER('np_bn') + taskbar('23:59', '2028/12/31', 'claude'), wallBG);

// terminal
view('v_term', `<div class="wt"><div class="tl"><div class="t">${ICONS.term.replace('42px', '30px').replace('36px', '26px').replace('17px', '12px')} Windows PowerShell <span style="margin-left:auto;margin-right:18px">✕</span></div><div style="color:#ccc;font-size:30px;padding:0 0 14px 20px">+ ⌄</div></div><div class="body mono" id="wt_body"></div></div>` + BANNER('wt_bn') + taskbar('23:59', '2028/12/31', 'term'));

// spectrum
view('v_spec', '<canvas id="spc" width="5120" height="2880" style="width:2560px;height:1440px"></canvas>', '#04050a');
// title
view('v_title', `<canvas id="ti_c" width="5120" height="2880" style="position:absolute;left:0;top:0;width:2560px;height:1440px"></canvas>
  <div class="ab" id="ti_small" style="left:0;right:0;top:985px;text-align:center;font:300 30px Inter;letter-spacing:30px;color:rgba(240,236,230,.6);padding-left:30px">CLAUDE</div>
  <div class="ab" id="ti_big" style="left:0;right:0;top:1030px;text-align:center;font:200 104px Inter;letter-spacing:40px;color:#f0ece6;white-space:nowrap;padding-left:40px"></div>
  <div class="ab" id="ti_sub" style="left:0;right:0;top:1190px;text-align:center;font:300 26px 'Noto Sans CJK SC';letter-spacing:18px;color:rgba(240,236,230,.45);padding-left:18px">研究预览</div>`, '#000');
const STARS = []; for (let i = 0; i < 1400; i++) { const a = hash(i * 1.7) * Math.PI * 2, r = 40 + Math.pow(hash(i * 2.3), .7) * 1500; STARS.push({ a, r, s: 1.1 + 2.6 * Math.pow(hash(i * 3.1), 5), b: .4 + .6 * hash(i * 5.9), tw: hash(i * 7.7) * 6 }); }
function drawTitle(lt) {
  const g = $('#ti_c').getContext('2d'), cx = 1280, cy = 600; g.setTransform(2, 0, 0, 2, 0, 0);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const R = 215 * easeOut(clamp(lt / 1.4)) + 6, rot = lt * .012;
  // stars, lensed outward around the shadow (Einstein-ring style displacement)
  for (const st of STARS) {
    const r = st.r + (R * R * 1.15) / Math.max(st.r, 30), a = st.a + rot * (300 / (st.r + 200));
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * .98;
    const near = Math.exp(-Math.pow((r - R * 1.25) / (R * .5 + 1), 2));
    const al = Math.min(1, st.b * (.55 + .45 * Math.sin(lt * 1.3 + st.tw)) + near * .6) * sm(0, .6, lt);
    g.fillStyle = `rgba(${215 + 40 * near},${222 + 20 * near},255,${al})`;
    g.fillRect(x, y, st.s * (1 + near * 1.6), st.s * (1 + near * .4));
  }
  // accretion glow + photon ring
  const glow = g.createRadialGradient(cx, cy, R * .9, cx, cy, R * 3.2);
  glow.addColorStop(0, `rgba(255,170,120,${.38 * sm(0, .8, lt)})`); glow.addColorStop(.25, `rgba(217,119,87,${.16 * sm(0, .8, lt)})`); glow.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = glow; g.beginPath(); g.arc(cx, cy, R * 3.2, 0, Math.PI * 2); g.fill();
  for (const [w, al, col] of [[26, .22, '255,150,100'], [9, .55, '255,205,170'], [2.6, .95, '255,246,236']]) {
    g.lineWidth = w; g.shadowBlur = w * 2.4; g.shadowColor = `rgba(${col},${al})`;
    const rg = g.createLinearGradient(cx, cy - R, cx, cy + R); rg.addColorStop(0, `rgba(${col},${al * .55})`); rg.addColorStop(1, `rgba(${col},${al})`); // brighter lower limb
    g.strokeStyle = rg; g.beginPath(); g.arc(cx, cy, R * 1.04, 0, Math.PI * 2); g.stroke();
  }
  g.shadowBlur = 0;
  g.fillStyle = '#000'; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
  // the bang: a local burst at the centre instead of a full-frame white flash
  const fb = Math.exp(-lt * 3.2);
  if (fb > .01) { const bg = g.createRadialGradient(cx, cy, 0, cx, cy, 900 * (1 - fb * .5)); bg.addColorStop(0, `rgba(255,248,240,${fb})`); bg.addColorStop(.18, `rgba(255,190,150,${.6 * fb})`); bg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = bg; g.fillRect(0, 0, W, H); }
}
// end card
view('v_end', `<div class="ab" style="left:0;right:0;top:560px;text-align:center;color:#ddd;font:300 50px Inter,'Noto Sans CJK SC';line-height:92px" id="end_tx"></div>`, '#000');

// ---------- camera
function resolve(v, el, axis, frac) {
  if (typeof v === 'number') return v;
  if (typeof v === 'function') return v();
  const e = $(v, el); if (!e) return 0;
  let x = 0, y = 0, n = e; while (n && n !== el) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
  return axis === 'x' ? x + e.offsetWidth * frac : y + e.offsetHeight * frac;
}
function camAt(keys, u, el) {
  let a = keys[0], b = keys[0], v = 0;
  for (let i = 0; i < keys.length - 1; i++) if (u >= keys[i].u) { a = keys[i]; b = keys[i + 1]; v = (b.e || ease)((u - a.u) / (b.u - a.u)); }
  if (u >= keys[keys.length - 1].u) { a = b = keys[keys.length - 1]; v = 0; }
  const g = (k, d) => (k[d] === undefined ? (d === 'z' ? 1 : 0) : k[d]);
  const P = k => ({ x: resolve(k.x, el, 'x', k.fx ?? .5) + (k.dx || 0), y: resolve(k.y, el, 'y', k.fy ?? .5) + (k.dy || 0) });
  const pa = P(a), pb = a === b ? pa : P(b);
  return { x: lerp(pa.x, pb.x, v), y: lerp(pa.y, pb.y, v), z: lerp(g(a, 'z'), g(b, 'z'), v), rx: lerp(g(a, 'rx'), g(b, 'rx'), v), ry: lerp(g(a, 'ry'), g(b, 'ry'), v), rz: lerp(g(a, 'rz'), g(b, 'rz'), v) };
}
function cursorPath(keys) {
  for (const k of keys) if (k.click) SFX.push({ t: k.t, type: 'click' });
  return t => {
    if (t <= keys[0].t) return { ...keys[0] };
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (t < b.t) { const u = ease((t - a.t) / (b.t - a.t)); return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), hand: u > .8 ? b.hand : a.hand, press: 0 }; }
    }
    const l = keys[keys.length - 1]; return { ...l };
  };
}
function clickPress(t, keys) { for (const k of keys) if (k.click && t >= k.t - .06 && t < k.t + .12) return 1; return 0; }

// ---------- shots
const SHOTS = [];
function shot(t0, t1, v, cam, up, o = {}) { SHOTS.push({ t0, t1, v, cam, up, o }); }

// 1–2. clock
shot(2, 6, 'v_clock', [{ u: 0, x: 1380, y: 520, z: 2.3, rx: 10, ry: -16 }, { u: 1, x: 1720, y: 500, z: 2.5, rx: 8, ry: -12, e: t => t }], () => drawClock('a'), { focus: 1.4, fadeIn: 1.2 });
shot(6, 9, 'v_clock', [{ u: 0, x: 1650, y: 760, z: 1.05, rx: 6, ry: 22 }, { u: 1, x: 1820, y: 800, z: 1.18, rx: 5, ry: 16, e: t => t }], () => drawClock('a'), { focus: .5 });

// 3–4. google typing
const gIn = composer(11.9, [
  { py: "san'shi'er'yuan'shu", hz: '三十二元数', cands: ['三十二元数', '三十二元', '三十二', '三十'] }, { lit: ' ' },
  { py: "liu'shi'si'yuan'shu", hz: '六十四元数', cands: ['六十四元数', '六十四元', '六十四', '六十'] }], 13);
const gEnter = gIn.end + .45; SFX.push({ t: gEnter, type: 'enter' });
const gCurK = [{ t: 9, x: 1500, y: 980 }, { t: 10.5, x: 980, y: 612, hand: 0, click: 1 }, { t: 11.5, x: 960, y: 640 }];
const gCur = cursorPath(gCurK);
function updG(t) {
  const st = t >= 10.6 ? gIn.state(t) : { text: '', comp: '' };
  $('#g_inp').innerHTML = inputHTML(st, t, t < 10.6 ? '<span style="color:#9aa0a6">在 Google 中搜索，或输入网址</span>' : '', t >= 10.6);
  const sg = $('#g_sugg'), on = st.text.length > 0;
  $('#g_sb').classList.toggle('open', on); sg.style.display = on ? 'block' : 'none';
  if (on) {
    const L = st.text.includes('六') ? [st.text, '三十二元数 六十四元数 区别', '三十二元数 六十四元数 性质', '三十二元数 六十四元数 恒等式'] : [st.text, '三十二元数 乘法表', '三十二元数 性质', '三十二元数 十六元数 区别'];
    sg.innerHTML = L.map((s, i) => `<div class="${i === 0 && t > gEnter - .2 ? 'hl' : ''}">${MAG(28)}<span>${s}</span>${i === 0 ? '<span class="g">- Google 搜索</span>' : ''}</div>`).join('');
  }
  return gCur(t);
}
shot(9, 11.6, 'v_gnew', [{ u: 0, x: 1280, y: 560, z: 1.0, rx: 4, ry: -8 }, { u: 1, x: 1100, y: 610, z: 1.45, rx: 3, ry: -6 }], updG, { cur: gCur, ck: gCurK, focus: .4 });
shot(11.6, gEnter + .35, 'v_gnew', [{ u: 0, x: 900, y: 650, z: 2.6, rx: 6, ry: -14 }, { u: 1, x: 1080, y: 700, z: 2.3, rx: 5, ry: -10, e: t => t }], updG, { focus: .3 });
const T5 = gEnter + .35; // ≈ 17.4

// 5–6. results, wiki
const rCurK = [{ t: T5, x: 1500, y: 900 }, { t: T5 + 4.2, x: 640, y: 1240, hand: 1 }, { t: T5 + 5.4, x: 600, y: 1238, hand: 1, click: 1 }, { t: T5 + 6, x: 600, y: 1238, hand: 1 }];
const rCur = cursorPath(rCurK);
shot(T5, T5 + 4, 'v_gres', [{ u: 0, x: '#r_stat', fx: .3, y: '#r_stat', z: 2.0, rx: 8, ry: -10, dx: 120 }, { u: 1, x: '#r_se_t', fx: .45, y: '#r_se_t', dy: 50, z: 1.75, rx: 6, ry: -6, e: t => ease(t) }], () => rCur(0), { focus: .3 });
shot(T5 + 4, T5 + 5.6, 'v_gres', [{ u: 0, x: '#r_nlab_a', fx: .25, y: '#r_nlab_a', z: 3.0, rx: 4, ry: 14 }, { u: 1, x: '#r_nlab_a', fx: .4, y: '#r_nlab_a', z: 3.2, rx: 4, ry: 12 }], () => {}, { cur: rCur, ck: rCurK });
const T6 = T5 + 5.6;
shot(T6, T6 + 2.6, 'v_wiki', [{ u: 0, x: '#w_q', y: '#w_q', z: 2.4, rx: 6, ry: 16, dx: -160 }, { u: 1, x: '#w_cite', fx: .45, y: '#w_cite', z: 2.0, rx: 4, ry: 10, dy: -20 }], () => {}, { focus: .3 });
const T7 = T6 + 2.6; // ≈ 25.6

// 7. second search, no results
const nIn = composer(T7 + .3, [{ lit: '“' }, { py: "cong'san'shi'er'yuan'shu'dao'liu'shi'si'yuan'shu", hz: '从三十二元数到六十四元数', cands: ['从三十二元数到六十四元数', '从三十二元数', '从三十二', '从'] }, { lit: '”' }], 15);
const nEnter = nIn.end + .35; SFX.push({ t: nEnter, type: 'enter' });
function updN(t) {
  const st = nIn.state(t);
  $('#n_inp').innerHTML = inputHTML(st, t, '', t < nEnter);
  $('#n_msg').style.visibility = t >= nEnter + .25 ? 'visible' : 'hidden';
}
shot(T7, nEnter + .2, 'v_gnone', [{ u: 0, x: '#n_inp', fx: .02, y: '#n_inp', z: 2.5, rx: 8, ry: -12, dx: 140 }, { u: 1, x: '#n_inp', fx: .02, y: '#n_inp', z: 2.3, rx: 6, ry: -10, dx: 520, e: t => t }], updN, { focus: .3 });
const T8a = nEnter + .2;
shot(T8a, T8a + 3.2, 'v_gnone', [{ u: 0, x: '#n_msg', fx: .2, y: '#n_msg', fy: .1, z: 2.2, rx: 8, ry: -14 }, { u: 1, x: '#n_msg', fx: .55, y: '#n_msg', fy: .35, z: 1.9, rx: 6, ry: -8 }], updN, { focus: .25 });
const T8 = T8a + 3.2; // ≈ 34.4

// 8. taskbar → Claude
const tCurK = [{ t: T8, x: 1150, y: 1400 }, { t: T8 + 1.0, x: 1290, y: 1405 }, { t: T8 + 1.6, x: 1395, y: 1408 }, { t: T8 + 2.4, x: 1398, y: 1406, click: 1 }, { t: T8 + 3, x: 1398, y: 1406 }];
const tCur = cursorPath(tCurK);
shot(T8, T8 + 2.9, 'v_task', [{ u: 0, x: 1200, y: 1380, z: 2.6, rx: 10, ry: -12 }, { u: 1, x: 1390, y: 1360, z: 3.0, rx: 8, ry: -6 }], t => {
  const c = tCur(t); const tip = $('#tip'); const tc = $('#tb_claude');
  const on = Math.abs(c.x - 1398) < 40 && t > T8 + 1.7; tip.style.display = on ? 'block' : 'none';
  if (on) { tip.style.left = (1398 - 60) + 'px'; }
  tc.style.background = Math.abs(c.x - 1398) < 40 ? 'rgba(255,255,255,.1)' : '';
  for (const k of ['chrome', 'edge']) { const e = $('#tb_' + k); const ex = e.offsetLeft + 30; e.style.background = Math.abs(c.x - ex) < 34 ? 'rgba(255,255,255,.1)' : ''; }
}, { cur: tCur, ck: tCurK, focus: .3 });
const T9 = T8 + 2.9; // ≈ 37.3

// 9–10. Claude: model picker, prompt
const ddOpen = T9 + .45, ddClick = T9 + 5.0;
const cCurK = [{ t: T9, x: 2150, y: 900 }, { t: T9 + .4, x: 1990, y: 760, click: 1 }, { t: T9 + 1.2, x: 1900, y: 900 }, { t: T9 + 1.9, x: 1920, y: 1020 }, { t: T9 + 2.9, x: 1960, y: 1262 }, { t: ddClick, x: 1965, y: 1265, click: 1 }, { t: ddClick + 1, x: 2250, y: 1100 }];
const cCur = cursorPath(cCurK);
const cIn = composer(ddClick + .9, [{ py: "cong'san'shi'er'yuan'shu'dao'liu'shi'si'yuan'shu", hz: '从三十二元数到六十四元数', cands: ['从三十二元数到六十四元数', '从三十二元数', '从三十二'] }, { lit: '，' },
  { py: "ju'ti'shi'qu'le'shen'me", hz: '具体失去了什么', cands: ['具体失去了什么', '具体失去了', '具体'] }, { lit: '？' }], 14);
const cSend = cIn.end + .5; SFX.push({ t: cSend, type: 'enter' });
function updC(t) {
  const conv = t >= T24 - .01;
  $('#c_home').style.display = conv ? 'none' : 'block'; $('#c_conv').style.display = conv ? 'block' : 'none';
  if (!conv) {
    const st = t > ddClick + .8 ? cIn.state(t) : { text: '', comp: '' };
    $('#c_inp').innerHTML = inputHTML(st, t, '今天想聊点什么？', t > ddClick + .8);
    const sing = t >= ddClick;
    $('#c_model').innerHTML = sing ? `Claude Singularity <span class="badge">研究预览</span> ⌄` : 'Claude Opus 7 ⌄';
    const dd = $('#c_dd'); const open = t >= ddOpen && t < ddClick + .08;
    dd.style.display = open ? 'block' : 'none';
    if (open) { const a = easeOut((t - ddOpen) / .18); dd.style.opacity = a; dd.style.transform = `translateY(${(1 - a) * -14}px)`; }
    const c = cCur(t);
    for (const id of ['dd_opus', 'dd_son', 'dd_hai', 'dd_sing']) { const e = $('#' + id); const y0 = e.offsetTop + dd.offsetTop; e.classList.toggle('hv', c.y > y0 && c.y < y0 + e.offsetHeight && c.x > 1400 && c.x < 2160); }
    $('#c_model').style.background = (c.x > 1820 && c.x < 2160 && c.y > 730 && c.y < 790) ? '#3c3b37' : '';
  }
}
shot(T9, T9 + 1.6, 'v_claude', [{ u: 0, x: 1800, y: 830, z: 1.25, rx: 5, ry: -10 }, { u: 1, x: 1820, y: 960, z: 1.45, rx: 5, ry: -8 }], updC, { cur: cCur, ck: cCurK, focus: .3 });
shot(T9 + 1.6, ddClick + .5, 'v_claude', [{ u: 0, x: '#dd_sing', fx: .3, y: '#dd_sing', z: 2.6, rx: 8, ry: 14 }, { u: 1, x: '#dd_badge', fx: .2, y: '#dd_sing', z: 3.0, rx: 6, ry: 10 }], updC, { cur: cCur, ck: cCurK, focus: .25 });
shot(ddClick + .5, cSend + .35, 'v_claude', [{ u: 0, x: '#c_inp', fx: 0, dx: 260, y: '#c_inp', z: 2.4, rx: 8, ry: -12 }, { u: 1, x: '#c_inp', fx: 0, dx: 760, y: '#c_inp', z: 2.2, rx: 6, ry: -8, e: t => t }], updC, { focus: .3 });
const T11 = cSend + .35; // ≈ 49

// 11. UAC
SFX.push({ t: T11 + .05, type: 'chime' });
const uCurK = [{ t: T11 + 2.4, x: 1500, y: 1250 }, { t: T11 + 4.4, x: 1030, y: 1240, click: 0 }, { t: T11 + 5.2, x: 1022, y: 1236, click: 1 }, { t: T11 + 6, x: 1022, y: 1236 }];
const uCur = cursorPath(uCurK);
function updU(t) { const a = easeOut((t - T11) / .25); $('#u_box').style.opacity = a; $('#u_box').style.transform = `scale(${.96 + .04 * a})`; $('#u_yes').style.filter = t > T11 + 4.3 ? 'brightness(1.12)' : ''; }
shot(T11, T11 + 3.2, 'v_uac', [{ u: 0, x: 1280, y: 680, z: 1.15, rx: 4, ry: 10 }, { u: 1, x: 1260, y: 640, z: 1.6, rx: 3, ry: 6 }], updU, {});
shot(T11 + 3.2, T11 + 5.6, 'v_uac', [{ u: 0, x: '#u_yes', y: '#u_yes', z: 2.8, rx: 10, ry: -16, dy: -40 }, { u: 1, x: '#u_yes', y: '#u_yes', z: 3.2, rx: 8, ry: -12, dy: -30 }], updU, { cur: uCur, ck: uCurK, focus: .2 });
const T12 = T11 + 5.6; // ≈ 54.6

// takeover counters
const pagesRead = t => t < T12 ? 0 : t < T12 + 17 ? 1928 * Math.pow((t - T12) / 17, 1.6) : 1928;
const sources = t => 3107 * clamp((t - (T12 + 17)) / 1.4);
function bannerSet(id, t) {
  const e = $('#' + id + '_ct'); if (!e) return;
  if (t < T12 + 17.6) e.textContent = `已读取 ${fmt(pagesRead(t))} 页`;
  else if (t < 84) e.textContent = `已检索 ${fmt(Math.max(1928, sources(t)))} 个来源`;
  else if (t < 104) e.textContent = `已构造 ${fmt(Math.min(4096, 4096 * clamp((t - 86) / 7)))} 个算子`;
  else e.textContent = `已验证 12,288 个随机点 · 1 条精确证书`;
  const b = $('#' + id); const a = easeOut((t - T12 - .1) / .4); b.style.opacity = a; b.style.top = (16 - (1 - a) * 60) + 'px';
}
// 12. tabs spawning
const tabTimes = TK_TITLES.map((_, i) => T12 + .35 + i * .2);
tabTimes.forEach(t => SFX.push({ t, type: 'tick' }));
function updTake(t) {
  bannerSet('tk_bn', t);
  const n = tabTimes.filter(x => x <= t).length;
  const tabs = [{ t: 'Cayley-Dickson 32 64 identity - G…', a: n === 0, w: 300, fc: '#4285f4' }].concat(TK_TITLES.slice(0, n).map((s, i) => ({ t: s, a: i === n - 1, w: Math.max(150, 300 - n * 12), load: (t - tabTimes[i] < 1.2) ? ((t * 720) % 360) : 0, fc: ['#eee', '#b31b1b', '#4285f4', '#f48024'][i % 4] })));
  $('#tk_tabs').innerHTML = tabs.map(tabHTML).join('');
}
SFX.push({ t: T12 + .1, type: 'whoosh' });
shot(T12, T12 + 3.4, 'v_take', [{ u: 0, x: 700, y: 140, z: 2.0, rx: 10, ry: 12 }, { u: 1, x: 1500, y: 120, z: 1.7, rx: 8, ry: 6, e: t => t }], updTake, { focus: .2 });
const T13 = T12 + 3.4; // ≈ 58

// 13. wall of windows
WALLWIN.forEach(w => { w.t += T13 - 58; SFX.push({ t: w.t, type: 'whoosh2' }); });
function updWall(t) {
  bannerSet('wl_bn', t);
  WALLWIN.forEach((w, i) => {
    const e = $('#mw' + i); const a = easeOut((t - w.t) / .3);
    e.style.opacity = a; e.style.transform = `scale(${.9 + .1 * a})`;
    const k = Math.floor((t + w.ph) * w.rate); if (e._k === k) return; e._k = k;
    const p = PAGES[(i * 3 + k) % PAGES.length];
    e.querySelector('.bar').innerHTML = `<span style="width:14px;height:14px;border-radius:50%;background:#8ab4f8;display:inline-block"></span>${p.t}`;
    e.querySelector('.pg').innerHTML = pageHTML(p, k * 31 + i);
  });
}
shot(T13, T13 + 8, 'v_wall', [{ u: 0, x: 1040, y: 520, z: 2.2, rx: 6, ry: -12 }, { u: .35, x: 1150, y: 640, z: 1.3, rx: 4, ry: -6 }, { u: 1, x: 1280, y: 720, z: .86, rx: 3, ry: 4, e: t => ease(t) }], updWall, {});
const T14 = T13 + 8; // ≈ 66

// 14. paper close-ups
function updPaper(t) { $('#pp_find').style.display = (t > T14 + 2 && t < T14 + 4) ? 'flex' : 'none'; }
shot(T14, T14 + 2, 'v_paper', [{ u: 0, x: '#pp_cd', fx: .2, y: '#pp_cd', z: 2.6, rx: 8, ry: -14 }, { u: 1, x: '#pp_cd', fx: .7, y: '#pp_cd', z: 2.5, rx: 6, ry: -10 }], updPaper, { focus: .2 });
shot(T14 + 2, T14 + 4, 'v_paper', [{ u: 0, x: 1960, y: 120, z: 2.4, rx: 10, ry: 12 }, { u: 1, x: '#pp_pa', y: '#pp_pa', z: 2.6, rx: 6, ry: 8 }], updPaper, { focus: .2 });
shot(T14 + 4, T14 + 6.4, 'v_paper', [{ u: 0, x: '#pp_open', y: '#pp_open', z: 3.0, rx: 8, ry: -12 }, { u: 1, x: '#pp_spec', fx: .4, y: '#pp_spec', z: 2.6, rx: 6, ry: -8 }], updPaper, { focus: .2 });
const T15 = T14 + 6.4; // ≈ 72.4

// 15. banner close-up
shot(T15, T15 + 3.2, 'v_take', [{ u: 0, x: 1200, y: 55, z: 3.2, rx: 12, ry: -16 }, { u: 1, x: 1460, y: 55, z: 3.0, rx: 10, ry: -10, e: t => t }], updTake, {});
const T16 = T15 + 3.2; // ≈ 75.6

// 16. notepad
const np1 = typer(T16 + .5, '检索 3,107 个来源。', 13, 'akey');
const np2 = typer(np1.end + .45, '现有文献没有给出答案。', 12, 'akey');
const np3 = typer(np2.end + 2.0, '→ 由我来证明。', 5.5, 'akey', .3);
const T17 = np3.end + 1.6;
function updNote(t) {
  bannerSet('np_bn', t);
  const car = `<span style="display:inline-block;width:3px;height:52px;background:#fff;vertical-align:-8px;opacity:${blink(t)}"></span>`;
  let s = esc(np1.at(t)); if (t >= np1.end + .2) s += '\n' + esc(np2.at(t));
  if (t >= np2.end + 1.2) { const a = np3.at(t); s += '\n' + `<span id="np_l3">${esc(a)}${car}<span style="visibility:hidden">${esc(np3.text.slice(a.length))}</span></span>`; }
  else s += car;
  $('#np_tx').innerHTML = s;
}
shot(T16, np2.end + 1.4, 'v_note', [{ u: 0, x: 960, y: 420, z: 1.7, rx: 6, ry: -14 }, { u: 1, x: 1120, y: 470, z: 2.0, rx: 4, ry: -8 }], updNote, { focus: .3 });
shot(np2.end + 1.4, T17, 'v_note', [{ u: 0, x: '#np_l3', y: '#np_l3', dx: -40, z: 2.6, rx: 10, ry: 14 }, { u: 1, x: '#np_l3', y: '#np_l3', z: 3.1, rx: 8, ry: 10, e: t => t }], updNote, { focus: .5 });

// 17–20. terminal
const LINES = []; // {t, h, sec}
const PS = '<span class="c-w">PS C:\\Users\\lin&gt; </span>';
const cmd = typer(T17 + .5, 'python -m cdlab.spectrum --dims 8 16 32 64 128 --exact', 34, 'akey');
const S1 = T17;
const tStream = cmd.end + .5; SFX.push({ t: cmd.end + .15, type: 'enter' });
LINES.push({ t: S1, sec: 1, f: t => PS + esc(cmd.at(t)) + (t < cmd.end + .15 ? `<span style="background:#ccc;opacity:${blink(t)}"> </span>` : '') });
LINES.push({ t: tStream, sec: 1, h: '<span class="c-d">cdlab 0.9 · Cayley–Dickson laboratory</span>' });
LINES.push({ t: tStream + .2, sec: 1, h: '<span class="c-c">构造乘法表</span>  dim = 32  (1,024 项)' });
let k = 0;
for (let i = 1; i < 32 && k < 150; i++) for (let j0 = 1; j0 < 32 && k < 150; j0 += 4) {
  let s = '';
  for (let j = j0; j < j0 + 4 && j < 32; j++) s += `e${String(i).padStart(2, '0')}·e${String(j).padStart(2, '0')} = ${basisProd(i, j, 32)}   `;
  LINES.push({ t: tStream + .45 + k * .021, sec: 1, h: `<span class="c-d">${s}</span>` }); k++;
}
const tA = tStream + .45 + k * .021 + .2;
LINES.push({ t: tA, sec: 1, h: '<span class="c-g">✓</span> 乘法表  1,024 项' });
LINES.push({ t: tA + .35, sec: 1, h: '<span class="c-c">构造</span> A<sub>x</sub> : ℝ³² → ℝ³²     y ↦ (xx)y − x(xy)' });
LINES.push({ t: tA + .7, sec: 1, h: '对称性    ‖A<sub>x</sub> − A<sub>x</sub>ᵀ‖ = 0   <span class="c-g">✓</span>' });
const tProg = tA + 1.0, tProgE = tProg + 2.4;
LINES.push({ t: tProg, sec: 1, f: t => { const p = clamp((t - tProg) / (tProgE - tProg)); const n = Math.round(p * 28); return `随机样本  <span class="c-c">${'█'.repeat(n)}</span><span class="c-d">${'░'.repeat(28 - n)}</span>  ${fmt(4096 * p)}/4,096`; } });
for (let i = 0; i < 40; i++) SFX.push({ t: tProg + i * .06, type: 'tick2' });
const S2 = tProgE + .7; // table section
const tbl = [['  维数', '不同本征值', '本征空间维数'], ['     8', '         1', '8'], ['    16', '         3', '4 · 8 · 4'], ['    32', '         8', '4 × 8'], ['    64', '        16', '4 × 16'], ['   128', '        32', '4 × 32']];
tbl.forEach((r, i) => LINES.push({ t: S2 + .3 + i * (i < 3 ? .55 : .8), sec: 2, h: i === 0 ? `<span class="c-d">${r[0]}      ${r[1]}      ${r[2]}</span>` : `<span class="${i >= 3 ? 'c-w' : ''}">${r[0]}      ${r[1]}         <span class="${i >= 3 ? 'c-c' : ''}">${r[2]}</span></span>`, row: i }));
tbl.forEach((r, i) => SFX.push({ t: S2 + .3 + i * (i < 3 ? .55 : .8), type: 'blip' }));
const tR1 = S2 + .3 + 5 * .8 + .8;
LINES.push({ t: tR1, sec: 2, h: '' });
LINES.push({ t: tR1 + .1, sec: 2, h: '<span class="c-c">→ 从 32 维起，每个本征空间都恰好是 4 维。</span>' });
LINES.push({ t: tR1 + 1.1, sec: 2, h: '<span class="c-y">→ 32 元数中 A<sub>x</sub> 只有 8 个本征值 ⇒ 存在 8 次恒等式？</span>' });
SFX.push({ t: tR1 + .1, type: 'blip2' }); SFX.push({ t: tR1 + 1.1, type: 'blip2' });
const S3 = tR1 + 2.6; // REPL section
let tt = S3 + .2;
function repl(inp, out, cps = 55, wait = .35) {
  const ty = typer(tt, inp, cps, 'akey'); const t0 = tt;
  LINES.push({ t: t0, sec: 3, f: t => `<span class="c-w">&gt;&gt;&gt; </span>${esc(ty.at(t))}` });
  SFX.push({ t: ty.end + .08, type: 'enter' });
  tt = ty.end + wait;
  if (out) { LINES.push({ t: tt, sec: 3, h: out }); SFX.push({ t: tt, type: 'blip' }); tt += .5; } else tt += .1;
}
LINES.push({ t: S3, sec: 3, h: PS + 'python' });
repl('from cdlab import *', '', 40);
repl('x = Z32(-1,0,0,-1,1,-1,-1,0,1,-1,-1,-1,-1,1,-1,1,0,-1,1,-1,-1,-1,0,0,-1,0,1,-1,1,0,0,1)', '', 90);
repl('M = assoc_matrix(x)      # 32×32 整数矩阵', '', 50);
repl('M.charpoly().factor()', '<span class="c-w">t^4 · (t^7 − 1560t^5 − 14224t^4 + 456496t^3 + 4521280t^2 − 29042048t − 179931136)^4</span>', 40, .9);
const tFac = tt - .5;
repl('q7 = _.factors[1];  (M * q7(M)).is_zero()', '<span class="c-g">True</span>', 50, .7);
const tTrue = tt - .5;
repl('minpoly(assoc_matrix(Z64.random())).degree()', '<span class="c-o">16</span>', 50, 1.1);
const t16 = tt - .5;
repl('# 32 元数：8 次律成立（ℤ 上精确）   64 元数：失效', '', 45);
const TEND = tt + .6;
function updTerm(t) {
  bannerSet('wt_bn', t);
  const sec = t < S2 ? 1 : t < S3 ? 2 : 3;
  const vis = LINES.filter(l => l.sec === sec && l.t <= t);
  const max = 28; const sl = vis.slice(-max);
  $('#wt_body').innerHTML = sl.map(l => `<div class="${l.row >= 3 && t > tR1 ? 'hlrow' : ''}">${l.f ? l.f(t) : l.h}</div>`).join('');
}
const lineY = i => 96 + 44 * i + 22;
shot(S1, tStream + .3, 'v_term', [{ u: 0, x: 500, y: lineY(0), z: 2.6, rx: 8, ry: -16 }, { u: 1, x: 1250, y: lineY(0), z: 2.4, rx: 6, ry: -10, e: t => t }], updTerm, { focus: .3 });
shot(tStream + .3, S2, 'v_term', [{ u: 0, x: 900, y: 500, z: 1.4, rx: 18, ry: 14, rz: -2 }, { u: .6, x: 1100, y: 1000, z: 1.6, rx: 14, ry: 8, rz: -1 }, { u: 1, x: 900, y: lineY(27), z: 2.2, rx: 10, ry: 4 }], updTerm, {});
shot(S2, S3, 'v_term', [{ u: 0, x: 560, y: lineY(1), z: 2.4, rx: 10, ry: -12 }, { u: .45, x: 640, y: lineY(4), z: 2.2, rx: 8, ry: -8 }, { u: .75, x: 700, y: lineY(6), z: 2.0, rx: 6, ry: -6 }, { u: 1, x: 760, y: lineY(7.5), z: 2.3, rx: 6, ry: -4 }], updTerm, { focus: .25 });
const rIdx = (S3, 0);
shot(S3, tFac + .1, 'v_term', [{ u: 0, x: 700, y: lineY(2), z: 1.8, rx: 8, ry: -12 }, { u: 1, x: 900, y: lineY(4.5), z: 1.75, rx: 6, ry: -8 }], updTerm, { focus: .25 });
shot(tFac + .1, TEND, 'v_term', [{ u: 0, x: 1000, y: lineY(5), z: 2.0, rx: 10, ry: 14 }, { u: .45, x: 600, y: lineY(6.5), z: 2.6, rx: 8, ry: 10 }, { u: 1, x: 520, y: lineY(8.3), z: 2.8, rx: 6, ry: 8 }], updTerm, { focus: .2 });
const T21 = TEND; // spectrum viz

// 21. spectrum
const DIMS = [8, 16, 32, 64, 128];
let emin = 1e9, emax = -1e9; DIMS.forEach(d => SPEC[d].forEach(([v]) => { emin = Math.min(emin, v); emax = Math.max(emax, v); }));
const ex = v => 560 + (v - emin) / (emax - emin) * 1640, ey = k => 260 + k * 215;
const rowT = k => T21 + .5 + k * 1.15;
DIMS.forEach((d, k) => SFX.push({ t: rowT(k), type: 'chime2', k }));
function drawSpec(t) {
  const c = $('#spc'), g = c.getContext('2d'); g.setTransform(2, 0, 0, 2, 0, 0); g.clearRect(0, 0, W, H);
  g.fillStyle = '#04050a'; g.fillRect(0, 0, W, H);
  // axis zero
  g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 2; g.beginPath(); g.moveTo(ex(0), 160); g.lineTo(ex(0), 1240); g.stroke();
  DIMS.forEach((d, k) => {
    const a = clamp((t - rowT(k)) / .9); if (a <= 0) return;
    const p = easeOut(a);
    g.globalAlpha = p; g.strokeStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(520, ey(k)); g.lineTo(2240, ey(k)); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.font = '300 44px Inter'; g.textAlign = 'right'; g.fillText(['𝕆  8', '𝕊  16', '𝕋  32', '64', '128'][k], 470, ey(k) + 15);
    g.textAlign = 'left'; g.fillStyle = k >= 2 ? '#f0a184' : 'rgba(255,255,255,.8)'; g.font = '300 60px Inter'; g.fillText(String(SPEC[d].length), 2300, ey(k) + 21);
    SPEC[d].forEach(([v, m], j) => {
      let px = ex(v), py = ey(k);
      if (k > 0) { const par = SPEC[DIMS[k - 1]]; let best = par[0][0]; par.forEach(([pv]) => { if (Math.abs(pv - v) < Math.abs(best - v)) best = pv; }); const ox = ex(best), oy = ey(k - 1);
        g.globalAlpha = .18 * p; g.strokeStyle = '#9fb7ff'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(ox, oy); g.lineTo(lerp(ox, px, p), lerp(oy, py, p)); g.stroke();
        px = lerp(ox, px, p); py = lerp(oy, py, p); }
      g.globalAlpha = p; g.shadowColor = k >= 2 ? '#ff9a6b' : '#9fb7ff'; g.shadowBlur = 34; g.fillStyle = k >= 2 ? '#ffd2bf' : '#dfe7ff';
      g.beginPath(); g.arc(px, py, 5 + 2.6 * Math.sqrt(m), 0, Math.PI * 2); g.fill(); g.shadowBlur = 0;
    });
  });
  g.globalAlpha = sm(rowT(4) + 1.2, rowT(4) + 2.2, t); g.fillStyle = 'rgba(255,255,255,.8)'; g.font = "300 46px 'Noto Sans CJK SC'"; g.textAlign = 'center';
  g.fillText('每翻倍一次，谱就分裂一次。每个本征空间：4 维。', 1380, 1330); g.globalAlpha = 1;
}
const T22 = rowT(4) + 3.4;
shot(T21, T22, 'v_spec', [{ u: 0, x: 1380, y: 520, z: 1.05, rx: 14, ry: -6 }, { u: 1, x: 1380, y: 760, z: .86, rx: 6, ry: 2, e: t => t }], drawSpec, { focus: .6 });

// 22. clock flips to midnight
const TMID = T22 + 1.8;
SFX.push({ t: TMID, type: 'tickmid' });
shot(T22, T22 + 3, 'v_clock', [{ u: 0, x: 1560, y: 500, z: 2.0, rx: 8, ry: 14 }, { u: 1, x: 1600, y: 560, z: 1.6, rx: 6, ry: 10, e: t => t }], t => drawClock(t < TMID ? 'b' : 'c'), { focus: .3 });
const TT = T22 + 3; // title hit
SFX.push({ t: TT, type: 'hit' });

// 23. title
const TITLE = 'SINGULARITY';
function updTitle(t) {
  const lt = t - TT; drawTitle(lt);
  $('#ti_big').innerHTML = TITLE.split('').map((ch, i) => { const d = Math.abs(i - 5) * .07; const a = easeOut((lt - .9 - d) / 1.4); return `<span style="opacity:${a};filter:blur(${(1 - a) * 12}px);display:inline-block">${ch}</span>`; }).join('');
  $('#ti_small').style.opacity = sm(1.9, 2.9, lt); $('#ti_sub').style.opacity = sm(2.6, 3.6, lt);
}
shot(TT, TT + 7.5, 'v_title', [{ u: 0, x: 1280, y: 830, z: .8, rx: 0, ry: 0 }, { u: 1, x: 1280, y: 815, z: .88, e: t => t }], updTitle, {});
const T24 = TT + 7.5;

// 24–25. answer
const ANS = [
  { c: 'p', parts: ['从三十二元数到六十四元数，失去的不是乘法表里任何一条有名字的性质，而是一条', { m: '<b>谱律</b>', w: 2 }, '。'] },
  { c: 'p', parts: ['考虑结合子算子 ', { m: '<span class="m">A<sub>x</sub></span>(<span class="m">y</span>) = (<span class="m">xx</span>)<span class="m">y</span> − <span class="m">x</span>(<span class="m">xy</span>)', w: 8 }, '。它是对称的；在三十二元数中，它只有 ', { m: '<b>8</b>', w: 1 }, ' 个不同的本征值，于是对任意 x, y 都满足一条八次恒等式：'] },
  { c: 'dm', parts: [{ m: '<span class="m">A<sub>x</sub></span><sup>8</sup>(<span class="m">y</span>) + <span class="m">c</span><sub>1</sub>(<span class="m">x</span>) <span class="m">A<sub>x</sub></span><sup>7</sup>(<span class="m">y</span>) + ⋯ + <span class="m">c</span><sub>7</sub>(<span class="m">x</span>) <span class="m">A<sub>x</sub></span>(<span class="m">y</span>) = 0', w: 20 }] },
  { c: 'p', parts: ['其中系数 ', { m: '<span class="m">c<sub>k</sub></span>(<span class="m">x</span>)', w: 2 }, ' 是 x 的多项式（由 tr ', { m: '<span class="m">A<sub>x</sub></span><sup><span class="m">k</span></sup>', w: 2 }, ' 给出）。到了六十四元数，本征值分裂成 16 个，这条八次律随之失效。'] },
  { c: 'p', parts: ['每翻倍一次，谱就分裂一次：', { m: '<b>1 → 3 → 8 → 16 → 32</b>', w: 6 }, '。'] },
  { c: 'p', parts: ['只有一样东西从未改变：从三十二元数开始，每一个本征空间都恰好是 4 维的。'] },
  { c: 'p muted', parts: ['像是四元数留下的回声。'] },
  { c: 'small', parts: ['精确验证：charpoly(A_x) = t⁴ · q₇(t)⁴，A_x · q₇(A_x) = 0（ℤ 上）· 六十四元数极小多项式 16 次 · 一般性证明：进行中'] },
];
const partLen = p => typeof p === 'string' ? p.length : p.w;
const blockLen = b => b.parts.reduce((s, p) => s + partLen(p), 0);
const ANS_T0 = T24 + 3.4;
const CPS = 17;
const ANS_PAUSE = [0, .5, .3, .6, .3, .4, 1.2, .8];
const blockStart = []; { let acc = 0; ANS.forEach((b, i) => { acc += ANS_PAUSE[i]; blockStart.push(acc); acc += blockLen(b) / CPS; }); }
function charsIn(i, t) { const lt = t - ANS_T0 - blockStart[i]; if (lt <= 0) return 0; const f = CPS * lt + 1.6 * Math.sin(lt * 7); return Math.min(blockLen(ANS[i]), 2 * Math.floor(Math.max(0, f) / 2)); }
function blockHTML(b, n) {
  let h = '';
  for (const p of b.parts) { if (n <= 0) break; if (typeof p === 'string') { h += esc(p.slice(0, n)); n -= p.length; } else { if (n >= p.w) h += p.m; else h += `<span style="opacity:.35">${p.m}</span>`; n -= p.w; } }
  return h;
}
const ANS_END = ANS_T0 + blockStart[ANS.length - 1] + blockLen(ANS[ANS.length - 1]) / CPS;
for (let i = 0; i < ANS.length; i++) { const bl = blockLen(ANS[i]); for (let c = 0; c < bl; c += 6) SFX.push({ t: ANS_T0 + blockStart[i] + c / CPS, type: 'stream' }); }
let ansMeasured = null;
function updAns(t) {
  updC(t);
  const th = $('#c_think');
  if (t < ANS_T0 - .4) th.innerHTML = `<span style="display:inline-flex;align-items:center;gap:16px"><span style="display:inline-block;transform:rotate(${t * 90}deg)">${star(36)}</span><span style="background:linear-gradient(90deg,#8e8c84 ${((t * 60) % 160) - 30}%,#f0eee6 ${((t * 60) % 160) - 10}%,#8e8c84 ${((t * 60) % 160) + 10}%);-webkit-background-clip:text;color:transparent">正在整理答案……</span></span>`;
  else th.innerHTML = `<b>已思考 4 分 12 秒</b> ›<br><span style="font-size:22px">检索 3,107 个来源 · 验证 12,288 个随机点 · 1 条精确证书</span>`;
  const ans = $('#c_ans');
  if (!ansMeasured) { ans.innerHTML = ANS.map(b => `<div class="${b.c}">${blockHTML(b, 1e9)}</div>`).join(''); ansMeasured = [...ans.children].map(e => ({ y: e.offsetTop, h: e.offsetHeight })); }
  ans.innerHTML = ANS.map((b, i) => { const n = charsIn(i, t); return n > 0 ? `<div class="${b.c.split(' ').map(c => c === 'p' ? '' : c).join(' ')}" style="margin-bottom:${b.c === 'dm' ? 40 : 30}px">${blockHTML(b, n)}</div>` : ''; }).join('');
}
function ansFollowY(t) {
  if (!ansMeasured) return 700;
  let y = 0; ANS.forEach((b, i) => { const n = charsIn(i, t); if (n > 0) y = ansMeasured[i].y + ansMeasured[i].h * (n / blockLen(b)); });
  const base = $('.thread').offsetTop;
  return Math.max(560, base + y - 40);
}
shot(T24, ANS_T0 + 1.2, 'v_claude', [{ u: 0, x: 1720, y: 300, z: 1.7, rx: 6, ry: -8 }, { u: 1, x: 1250, y: 430, z: 1.9, rx: 5, ry: -5 }], updAns, { focus: .4 });
const ansShotT0 = ANS_T0 + 1.2;
let lastY = null;
shot(ansShotT0, ANS_END + 3, 'v_claude', [{ u: 0, x: 1460, y: () => ansFollowY(CUR_T), z: 1.68, rx: 4, ry: -6 }, { u: 1, x: 1460, y: () => ansFollowY(CUR_T), z: 1.55, rx: 3, ry: -2, e: t => t }], updAns, { focus: .3 });
const TEND_CARD = ANS_END + 3;
// end card
function updEnd(t) {
  const lt = t - TEND_CARD;
  const L = [['片中的数学结果均为真实计算', .3], ['32 元数：charpoly(A<sub>x</sub>) = t⁴·q₇(t)⁴，A<sub>x</sub>·q₇(A<sub>x</sub>) = 0（ℤ 上精确）　64 元数：极小多项式 16 次', .8], ['<span style="color:#888;font-size:36px">Made with Claude · 致敬 TakayamaMaria《我瘫坐在奇点，仿佛看见宇宙大爆炸爆炸》</span>', 2.2]];
  $('#end_tx').innerHTML = L.map(([s, d]) => `<div style="opacity:${sm(d, d + .8, lt) * (1 - sm(6.2, 7.2, lt))}">${s}</div>`).join('');
}
shot(TEND_CARD, TEND_CARD + 7.6, 'v_end', [{ u: 0, x: 1280, y: 680, z: .75 }, { u: 1, x: 1280, y: 680, z: .75 }], updEnd, {});
const FILM_END = TEND_CARD + 7.6;

// ---------- render
let CUR_T = 0;
function seek(t) {
  CUR_T = t;
  const s = SHOTS.find(s => t >= s.t0 && t < s.t1);
  for (const k in V) V[k].style.display = 'none';
  let fade = 1;
  if (s) {
    const el = V[s.v]; el.style.display = 'block';
    const lt = t - s.t0, u = clamp(lt / (s.t1 - s.t0));
    const cr = s.up ? s.up(t, lt, u) : null;
    // cursor
    const cfn = s.o.cur;
    if (cfn) { const c = cfn(t); el.appendChild(cur); cur.style.display = 'block'; cur.innerHTML = c.hand ? HAND : ARROW; cur.style.left = c.x + 'px'; cur.style.top = c.y + 'px'; cur.style.transform = `scale(${clickPress(t, s.o.ck || []) ? .88 : 1})`; }
    else if (cur.parentNode) cur.parentNode.removeChild(cur);
    const c = camAt(s.cam, u, el);
    const nx = 5 * Math.sin(t * .63) + 3 * Math.sin(t * 1.71 + 1), ny = 4 * Math.sin(t * .81 + 2) + 2.4 * Math.sin(t * 1.33);
    const rz = c.rz + .14 * Math.sin(t * .4);
    el.style.transform = `translate(${960 + nx}px,${540 + ny}px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) rotateZ(${rz}deg) scale(${c.z}) translate(${-c.x}px,${-c.y}px)`;
    const fb = s.o.focus ? Math.pow(1 - clamp(lt / s.o.focus), 2) * 10 : 0;
    el.style.filter = fb > .05 ? `blur(${fb}px)` : 'none';
    fade = 0;
    if (s.o.fadeIn) fade = Math.max(fade, 1 - clamp(lt / s.o.fadeIn));
  }
  // global fades
  if (t > ANS_END + 1.6 && t < TEND_CARD) fade = Math.max(fade, sm(ANS_END + 1.6, TEND_CARD, t));
  if (t > TEND_CARD && t < TEND_CARD + 1) fade = Math.max(fade, 1 - sm(TEND_CARD, TEND_CARD + .6, t));
  if (t >= TT - .25 && t < TT) fade = Math.max(fade, sm(TT - .25, TT - .02, t));
  document.getElementById('fade').style.opacity = fade;
  document.getElementById('flash').style.opacity = 0;
}
SFX.sort((a, b) => a.t - b.t);
window.FILM = { seek, duration: FILM_END, SFX, marks: { T5, T7, T8, T9, ddClick, cSend, T11, T12, T13, T14, T15, T16, np3: np3.t0, T17, S2, S3, tFac, tTrue, t16, T21, T22, TMID, TT, T24, ANS_T0, ANS_END, TEND_CARD, FILM_END } };
document.fonts.ready.then(() => { window.READY = true; });
