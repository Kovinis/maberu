const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', scrollY > 20);
onScroll();
addEventListener('scroll', onScroll, { passive: true });

const nav = document.getElementById('nav');
const btn = document.getElementById('menuBtn');
btn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
});
nav.addEventListener('click', e => {
  if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', false); }
});

const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.section .reveal').forEach(el => io.observe(el));

document.querySelectorAll('[data-count]').forEach(el => {
  const target = +el.dataset.count, suffix = el.dataset.suffix || '';
  const start = performance.now(), dur = 1400;
  const tick = t => {
    const p = Math.min((t - start - 1000) / dur, 1);
    el.textContent = Math.round(target * Math.max(p, 0)) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

document.getElementById('year').textContent = new Date().getFullYear();

document.getElementById('lead').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const body = [
    `Name: ${data.get('name')}`,
    `Email: ${data.get('email')}`,
    '',
    'Question / situation:',
    data.get('message')
  ].join('\n');
  const mailto = `mailto:info@maberusolutions.com?subject=${encodeURIComponent('Free consultation request')}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
});

/* Live dashboard mockup */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const $ = id => document.getElementById(id);
  const line = $('chartLine'), area = $('chartArea'), rows = $('rows');
  if (!line || !area || !rows) return;

  // KPIs
  const kpis = [
    { el: $('kOpen'), v: 128, fmt: v => Math.round(v), step: () => Math.round(Math.random() * 6 - 3), min: 110, max: 150 },
    { el: $('kAvg'),  v: 3.2, fmt: v => v.toFixed(1) + 'h', step: () => (Math.random() * .4 - .2), min: 2.6, max: 3.8 },
    { el: $('kAuto'), v: 92,  fmt: v => Math.round(v) + '%', step: () => Math.round(Math.random() * 2 - 1), min: 88, max: 97 }
  ];
  const bump = k => {
    const next = Math.min(k.max, Math.max(k.min, k.v + k.step()));
    if (k.fmt(next) === k.fmt(k.v)) return;
    const from = k.v, start = performance.now();
    k.v = next;
    k.el.classList.add('bump');
    const tick = t => {
      const p = Math.min((t - start) / 600, 1);
      k.el.textContent = k.fmt(from + (next - from) * p);
      if (p < 1) requestAnimationFrame(tick); else setTimeout(() => k.el.classList.remove('bump'), 400);
    };
    requestAnimationFrame(tick);
  };

  // Chart: scrolling series that trends upward
  let pts = [70, 58, 64, 38, 44, 24, 30, 8];
  const path = (a, close) => {
    const d = a.map((y, i) => `${i ? 'L' : 'M'}${(i * 300 / (a.length - 1)).toFixed(1)} ${y.toFixed(1)}`).join(' ');
    return close ? d + ' V90 H0Z' : d;
  };
  const shiftChart = () => {
    const last = pts[pts.length - 1];
    const nextY = Math.min(78, Math.max(6, last + (Math.random() * 36 - 18)));
    const from = pts.slice(), to = pts.slice(1).concat(nextY), start = performance.now();
    const tick = t => {
      const p = Math.min((t - start) / 900, 1), e = p < .5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
      const cur = from.map((y, i) => y + (to[i] - y) * e);
      line.setAttribute('d', path(cur)); area.setAttribute('d', path(cur, true));
      if (p < 1) requestAnimationFrame(tick); else pts = to;
    };
    requestAnimationFrame(tick);
  };

  // Request feed
  const feed = [
    ['Expense claim · Sales', 'Pending', 'wait'], ['Invoice #7732', 'Approved', 'ok'],
    ['New laptop request', 'Approved', 'ok'], ['Contract renewal · Legal', 'Pending', 'wait'],
    ['Travel booking · Ops', 'Approved', 'ok'], ['Purchase order #2042', 'Pending', 'wait'],
    ['Access request · IT', 'Approved', 'ok'], ['Leave request · HR', 'Approved', 'ok']
  ];
  let fi = 0;
  const addRow = () => {
    // Approve a pending row first, if any
    const pending = rows.querySelector('.dot.wait');
    if (pending && Math.random() < .5) {
      pending.className = 'dot ok';
      const em = pending.parentElement.querySelector('em');
      em.textContent = 'Approved'; em.classList.add('flash');
      setTimeout(() => em.classList.remove('flash'), 1200);
      return;
    }
    const [name, status, cls] = feed[fi++ % feed.length];
    const li = document.createElement('li');
    li.className = 'new';
    li.innerHTML = `<span class="dot ${cls}"></span>${name}<em>${status}</em>`;
    rows.prepend(li);
    while (rows.children.length > 3) rows.lastElementChild.remove();
  };

  const chip = $('chipFlow');
  const pingChip = () => { chip.classList.remove('ping'); void chip.offsetWidth; chip.classList.add('ping'); };

  let n = 0, timer;
  const loop = () => {
    shiftChart();
    bump(kpis[n % 3]);
    if (n % 2 === 0) { addRow(); pingChip(); }
    n++;
  };
  const start = () => { if (!timer) timer = setInterval(loop, 2600); };
  const stop = () => { clearInterval(timer); timer = null; };
  setTimeout(start, 2000);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
})();
