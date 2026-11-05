/* Settings and appearance choices. No account, tracking cookie, or fabricated totals. */
(() => {
  const panel = document.getElementById('siteSettings');
  const trigger = document.querySelector('.settings-trigger');
  const close = panel.querySelector('.settings-close');
  const slider = panel.querySelector('#appearanceSlider');
  const switcher = panel.querySelector('.appearance-switch');
  const buttons = [...panel.querySelectorAll('[data-appearance-choice]')];
  const countStatus = panel.querySelector('#appearanceCountStatus');
  document.addEventListener('pointerdown', () => document.documentElement.dataset.pointerFocus = 'true', true);
  document.addEventListener('keydown', () => { delete document.documentElement.dataset.pointerFocus; }, true);
  const names = { enchanted: 'Enchanted Chris', chrisglass: 'ChrisGlass', material: 'Material Chris', materialglass: 'Material ChrisGlass' };
  const appearances = Object.keys(names);
  const glassEnabled = () => document.documentElement.dataset.glass === 'true';
  const base = new URL('.', document.currentScript.src);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const configUrl = window.lucilyPreferencesConfig?.counterUrl?.replace(/\/$/, '') || '';
  let endpoint = '';
  try { const url = new URL(configUrl); if (url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname))) endpoint = url.href.replace(/\/$/, ''); } catch {}
  let lenses = [], library, closeTimer, busy = false, choiceRevision = 0;
  const lensKinds = new WeakMap();
  const navLinks = document.getElementById('navLinks');
  const navItems = [...navLinks.querySelectorAll('a')];
  const navCursor = document.createElement('span'); navCursor.className = 'nav-glass-cursor'; navCursor.setAttribute('aria-hidden', 'true'); navLinks.prepend(navCursor);
  let drag, suppressClick = false, holdTimer, edgeMotion, releaseTimer;
  const currentLink = () => navItems.find(link => link.getAttribute('aria-current') === 'page' || link.classList.contains('active')) || navItems[0];
  function moveNavCursor(link) {
    if (!glassEnabled() || !link || !navLinks.getBoundingClientRect().width) return;
    navLinks.style.setProperty('--nav-glass-x', link.offsetLeft + 'px');
    navLinks.style.setProperty('--nav-glass-y', link.offsetTop + 'px');
    navLinks.style.setProperty('--nav-glass-width', link.offsetWidth + 'px');
    navLinks.style.setProperty('--nav-glass-height', link.offsetHeight + 'px');
  }
  function syncNav() { if (!drag) moveNavCursor(currentLink()); }
  document.querySelectorAll('.appearance-switch,.theme-switch').forEach(track => {
    const thumb = document.createElement('span'); thumb.className = 'slider-glass-thumb'; thumb.setAttribute('aria-hidden', 'true'); track.prepend(thumb);
  });
  navItems.forEach(link => { link.draggable = false; });
  function closestLink(x, y) { return navItems.reduce((best, link) => { const box = link.getBoundingClientRect(); const distance = Math.hypot(x - (box.left + box.width / 2), y - (box.top + box.height / 2)); return !best || distance < best.distance ? { link, distance } : best; }, null)?.link; }
  navLinks.addEventListener('pointerdown', event => {
    if (!glassEnabled()  || event.button !== 0 || !event.target.closest('a')) return;
    event.preventDefault(); event.target.closest('a').focus({ preventScroll: true });
    clearTimeout(releaseTimer); clearTimeout(holdTimer); edgeMotion?.cancel();
    navCursor.style.scale = '1';
    drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastTime: event.timeStamp, edge: 0, moved: false, link: event.target.closest('a') };
    holdTimer = setTimeout(() => { if (drag && !reducedMotion.matches) navCursor.style.scale = '1.12'; }, 120);
    navLinks.setPointerCapture(event.pointerId);
  });
  navLinks.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 6) return;
    drag.moved = true; clearTimeout(holdTimer); if (!reducedMotion.matches) navCursor.style.scale = '1.12'; navLinks.classList.add('is-dragging'); navLinks.setPointerCapture(event.pointerId); event.preventDefault();
    const link = closestLink(event.clientX, event.clientY);
    moveNavCursor(link);
    const box = navLinks.getBoundingClientRect();
    const width = link.offsetWidth;
    const rawX = event.clientX - box.left - width / 2;
    const limit = Math.max(0, navLinks.clientWidth - width);
    const bounded = Math.max(0, Math.min(limit, rawX));
    const edge = rawX < 0 ? -1 : rawX > limit ? 1 : 0;
    const speed = Math.abs(event.clientX - drag.lastX) / Math.max(1, event.timeStamp - drag.lastTime);
    const resistance = reducedMotion.matches ? 0 : Math.sign(rawX - bounded) * Math.min(10, Math.sqrt(Math.abs(rawX - bounded)) * 1.2);
    navLinks.style.setProperty('--nav-glass-x', (bounded + resistance) + 'px');
    if (edge && edge !== drag.edge && !reducedMotion.matches) {
      edgeMotion?.cancel();
      const bump = Math.min(.2, .04 + speed * .045);
      edgeMotion = navCursor.animate([
        { scale: '1.12 1.12' },
        { scale: `${1.12 - bump} ${1.12 + bump * .6}`, offset: .22 },
        { scale: `${1.12 + bump * .45} ${1.12 - bump * .25}`, offset: .5 },
        { scale: '1.12 1.12' }
      ], { duration: 420, easing: 'ease-out' });
    }
    drag.edge = edge; drag.lastX = event.clientX; drag.lastTime = event.timeStamp;
  });
  navLinks.addEventListener('pointerup', event => {
    if (!drag || drag.id !== event.pointerId) return;
    clearTimeout(holdTimer); edgeMotion?.cancel(); navCursor.style.scale = '1';
    const moved = drag.moved, pressedLink = drag.link; drag = null; navLinks.classList.remove('is-dragging');
    if (navLinks.hasPointerCapture(event.pointerId)) navLinks.releasePointerCapture(event.pointerId);
    { suppressClick = true; const link = moved ? closestLink(event.clientX, event.clientY) : pressedLink; if (link && link !== currentLink()) { moveNavCursor(link); releaseTimer = setTimeout(() => location.assign(link.href), reducedMotion.matches ? 0 : 160); } else syncNav(); setTimeout(() => { suppressClick = false; }, 0); }
  });
  navLinks.addEventListener('pointercancel', () => { clearTimeout(holdTimer); edgeMotion?.cancel(); navCursor.style.scale = '1'; drag = null; navLinks.classList.remove('is-dragging'); syncNav(); });
  navLinks.addEventListener('click', event => { if (suppressClick) { event.preventDefault(); event.stopPropagation(); } }, true);
  new ResizeObserver(syncNav).observe(navLinks);
  new MutationObserver(syncNav).observe(navLinks, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('languagechange', syncNav);
  // The shared menu controller animates both appearances and both directions.
  const menuButton = document.querySelector('.nav-toggle');
  menuButton.innerHTML = '<span class="menu-strokes" aria-hidden="true"><i class="fa-solid fa-bars"></i><i class="fa-solid fa-xmark"></i></span>';
  let menuMotion, menuRevision = 0;
  menuButton.addEventListener('click', () => {
    const opening = menuButton.getAttribute('aria-expanded') !== 'true';
    const revision = ++menuRevision;
    const current = getComputedStyle(navLinks); const opacity = navLinks.classList.contains('open') ? current.opacity : '0';
    menuMotion?.cancel(); menuButton.setAttribute('aria-expanded', String(opening));
    navLinks.classList.add('open'); navLinks.inert = !opening;
    if (reducedMotion.matches) { navLinks.classList.toggle('open', opening); syncNav(); return; }
    menuMotion = navLinks.animate(opening
      ? [{ opacity, transform: 'translateY(-10px) scale(.97)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }]
      : [{ opacity, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: 'translateY(-10px) scale(.97)' }],
      { duration: opening ? 280 : 220, easing: opening ? 'cubic-bezier(.2,.8,.2,1)' : 'ease-in', fill: 'both' });
    menuMotion.finished.then(() => { if (revision === menuRevision) { navLinks.classList.toggle('open', opening); menuMotion.cancel(); syncNav(); } }).catch(() => {});
    syncNav();
  });
  matchMedia('(min-width:851px)').addEventListener('change', event => {
    if (!event.matches) return;
    ++menuRevision; menuMotion?.cancel(); navLinks.inert = false; navLinks.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); syncNav();
  });

  function read(key) { try { return localStorage.getItem(key); } catch { return null; } }
  function write(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } }
  function appearance() { const value = document.documentElement.dataset.appearance; return Object.hasOwn(names, value) ? value : 'enchanted'; }
  function updateControls() {
    const value = appearance();
    slider.value = String(appearances.indexOf(value));
    switcher.style.setProperty('--appearance-index', appearances.indexOf(value));
    slider.setAttribute('aria-valuetext', names[value]); switcher.dataset.appearance = value;
    switcher.querySelectorAll('[data-appearance-label]').forEach(label => label.dataset.current = String(label.dataset.appearanceLabel === value));
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.appearanceChoice === value)));
    requestAnimationFrame(syncNav);
  }
  function updateGlass() { requestAnimationFrame(syncNav); }
  const pane = document.createElement('div'); pane.className = 'chrisglass-pane'; pane.setAttribute('aria-hidden', 'true');
  document.querySelector('.nav').prepend(pane);
  function setAppearance(value, countChoice) {
    if (!Object.hasOwn(names, value)) return;
    const changed = value !== appearance(); window.lucilyApplyAppearance(value);
    write('lucily-appearance', value); updateControls();
    if (changed) updateGlass();
    if (countChoice) { write('lucily-appearance-pending', value); sendChoice(); }
  }
  async function request(path, options = {}) {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 8000);
    try { const response = await fetch(endpoint + path, { ...options, signal: controller.signal, credentials: 'omit', cache: 'no-store' }); if (!response.ok) throw new Error('Counter unavailable'); return await response.json(); }
    finally { clearTimeout(timer); }
  }
  function showCounts(data) {
    for (const choice of Object.keys(names)) {
      const number = data.counts?.[choice]; if (!Number.isSafeInteger(number) || number < 0) throw new Error('Invalid totals');
    }
    panel.querySelectorAll('[data-vote-count]').forEach(node => { node.textContent = new Intl.NumberFormat().format(data.counts[node.dataset.voteCount]); });
    countStatus.textContent = 'Community choices · one saved choice per browser.';
  }
  async function refreshCounts() {
    if (!endpoint) return;
    try { showCounts(await request('/counts')); } catch { countStatus.textContent = 'Community counts are unavailable. Your appearance is saved.'; }
  }
  async function sendChoice() {
    if (!endpoint || busy) return;
    const choice = read('lucily-appearance-pending'); if (!Object.hasOwn(names, choice)) return;
    let voter = read('lucily-appearance-voter');
    if (!/^[a-f0-9-]{36}$/i.test(voter || '')) { voter = crypto.randomUUID(); if (!write('lucily-appearance-voter', voter)) { countStatus.textContent = 'Allow browser storage to save your community choice.'; return; } }
    busy = true;
    let success = false;
    try {
      showCounts(await request('/choice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voter, choice }) }));
      if (read('lucily-appearance-pending') === choice) write('lucily-appearance-pending', ''); success = true;
    } catch { countStatus.textContent = 'Community counts are unavailable. Your appearance is saved.'; }
    finally { busy = false; if (success && read('lucily-appearance-pending')) sendChoice(); }
  }
  function closePanel() {
    if (!panel.open || closeTimer) return;
    panel.classList.add('closing');
    closeTimer = setTimeout(() => { panel.close(); panel.classList.remove('closing'); trigger.setAttribute('aria-expanded', 'false'); trigger.focus(); closeTimer = null; updateGlass(); }, reducedMotion.matches ? 0 : 160);
  }
  trigger.setAttribute('aria-expanded', 'false');
  trigger.addEventListener('click', () => {
    if (panel.open) { closePanel(); return; }
    panel.showModal(); panel.scrollTop = 0; trigger.setAttribute('aria-expanded', 'true'); close.focus(); updateGlass(); refreshCounts(); sendChoice();
  });
  close.addEventListener('click', closePanel);
  panel.addEventListener('cancel', event => { event.preventDefault(); closePanel(); });
  panel.addEventListener('click', event => { const box = panel.getBoundingClientRect(); if (event.target === panel && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) closePanel(); });
  slider.addEventListener('input', () => setAppearance(appearances[Number(slider.value)], false));
  slider.addEventListener('change', () => setAppearance(appearances[Number(slider.value)], true));
  buttons.forEach(button => button.addEventListener('click', () => setAppearance(button.dataset.appearanceChoice, true)));
  window.addEventListener('online', () => { refreshCounts(); sendChoice(); });
  window.addEventListener('storage', event => { if (event.key === 'lucily-appearance') setAppearance(event.newValue, false); });
  reducedMotion.addEventListener('change', updateGlass);
  updateControls(); updateGlass();
})();
