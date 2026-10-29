const backTop = document.querySelector('.back-top');
function updateBackTop() {
  const visible = window.scrollY > 500;
  backTop.classList.toggle('visible', visible);
  backTop.tabIndex = visible ? 0 : -1;
}
window.addEventListener('scroll', updateBackTop, { passive: true });
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
updateBackTop();
