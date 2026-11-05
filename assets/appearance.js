/* Restore before first paint. Material variants inherit their base appearance. */
(() => {
  const choices = ['enchanted', 'chrisglass', 'material', 'materialglass'];
  window.lucilyApplyAppearance = function (value) {
    const appearance = choices.includes(value) ? value : 'enchanted';
    const root = document.documentElement;
    root.dataset.appearance = appearance;
    root.dataset.glass = String(appearance === 'chrisglass' || appearance === 'materialglass');
    root.dataset.material = String(appearance === 'material' || appearance === 'materialglass');
    // Web content can only use the accent the browser elects to expose.
    // It cannot obtain Android wallpaper palettes or Chrome extension theme colors.
    const googleOS = /Android|CrOS|ChromiumOS|FydeOS/i.test(navigator.userAgent);
    const chromium = /Chrome|Chromium|CriOS|Edg|OPR/i.test(navigator.userAgent) || navigator.userAgentData?.brands?.some(item => /Chromium|Google Chrome|Microsoft Edge|Opera/i.test(item.brand));
    const available = (googleOS || chromium) && CSS.supports('color', 'AccentColor');
    root.style.setProperty('--material-seed', available ? 'AccentColor' : '#4285f4');
    root.dataset.accentSource = available ? 'browser' : 'blue';
  };
  let saved;
  try { saved = localStorage.getItem('lucily-appearance'); } catch {}
  window.lucilyApplyAppearance(saved);
})();
