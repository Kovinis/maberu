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
  const mailto = `mailto:hello@maberusolutions.com?subject=${encodeURIComponent('Free consultation request')}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
});
