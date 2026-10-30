(() => {
  const modes = ['system', 'light', 'dark'];
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let mode = 'system';
  try {
    const saved = localStorage.getItem('lucily-theme');
    if (modes.includes(saved)) mode = saved;
  } catch {}
  function apply() {
    document.documentElement.dataset.theme = mode === 'system' ? (system.matches ? 'dark' : 'light') : mode;
    document.querySelectorAll('.theme-switch input').forEach(input => {
      input.value = String(modes.indexOf(mode));
      input.setAttribute('aria-valuetext', mode[0].toUpperCase() + mode.slice(1));
      input.closest('.theme-switch').dataset.mode = mode;
    });
  }
  apply();
  system.addEventListener('change', () => { if (mode === 'system') apply(); });
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.querySelectorAll('.theme-switch input').forEach(input => {
      input.addEventListener('input', () => {
        mode = modes[Number(input.value)];
        try { localStorage.setItem('lucily-theme', mode); } catch {}
        apply();
      });
    });
  });
  window.addEventListener('storage', event => {
    if (event.key === 'lucily-theme') { mode = modes.includes(event.newValue) ? event.newValue : 'system'; apply(); }
  });
})();
