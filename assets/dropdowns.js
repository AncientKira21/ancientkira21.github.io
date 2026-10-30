/* Enchanted Chris dropdowns, shared by language and sorting controls. */
(() => {
  const controls = [];
  document.querySelectorAll('select').forEach((select, index) => {
    const isLanguage = select.classList.contains('language-select');
    const options = Array.from(select.options, option => ({ value: option.value, label: option.textContent }));
    const wrapper = document.createElement('div');
    wrapper.className = 'enchanted-dropdown';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'dropdown-trigger';
    trigger.id = `dropdown-trigger-${index}`;
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', select.getAttribute('aria-label') || 'Sort');
    const value = document.createElement('span');
    value.className = 'dropdown-value';
    if (isLanguage) value.dataset.noTranslate = '';
    const chevron = document.createElement('i');
    chevron.className = 'fa-solid fa-chevron-down';
    chevron.setAttribute('aria-hidden', 'true');
    trigger.append(value, chevron);
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu';
    menu.hidden = true;
    menu.id = `dropdown-menu-${index}`;
    trigger.setAttribute('aria-controls', menu.id);
    let search;
    const searchWrap = document.createElement('div');
    searchWrap.className = 'dropdown-search';
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-magnifying-glass';
    icon.setAttribute('aria-hidden', 'true');
    search = document.createElement('input');
    search.type = 'search';
    search.placeholder = isLanguage ? 'Search languages...' : 'Search options...';
    search.setAttribute('aria-label', isLanguage ? 'Search languages' : 'Search options');
    searchWrap.append(icon, search);
    menu.append(searchWrap);
    let isOpen = false;
    let motion;
    let motionId = 0;
    const list = document.createElement('div');
    list.className = 'dropdown-options';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', isLanguage ? 'Language' : 'Sort');
    menu.append(list);
    const names = { en: 'English', es: 'Spanish Español', 'zh-Hans': 'Chinese Simplified Chinese 中文 简体中文', my: 'Burmese Myanmar မြန်မာ', ja: 'Japanese 日本語' };
    const buttons = options.map(option => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'dropdown-option';
      button.setAttribute('role', 'option');
      button.dataset.value = option.value;
      if (isLanguage) button.dataset.noTranslate = '';
      const text = document.createElement('span');
      text.textContent = option.label;
      const check = document.createElement('i');
      check.className = 'fa-solid fa-check';
      check.setAttribute('aria-hidden', 'true');
      button.append(text, check);
      function choose() {
        if (!isOpen) return;
        select.value = option.value;
        if (isLanguage && window.siteI18n) window.siteI18n.setLanguage(option.value);
        else select.dispatchEvent(new Event('change', { bubbles: true }));
        update(); close(); trigger.focus({ preventScroll: true });
      }
      // Keep mouse focus from leaving the search field before selection completes.
      button.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse') event.preventDefault();
      });
      let pointerStart;
      button.addEventListener('pointerdown', event => { pointerStart = { x: event.clientX, y: event.clientY }; });
      button.addEventListener('pointerup', event => {
        if (pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) < 10) choose();
        pointerStart = null;
      });
      button.addEventListener('pointercancel', () => { pointerStart = null; });
      button.addEventListener('click', choose);
      list.append(button);
      return button;
    });
    function update() {
      value.textContent = options.find(option => option.value === select.value)?.label || '';
      buttons.forEach(button => button.setAttribute('aria-selected', String(button.dataset.value === select.value)));
    }
    function close() {
      if (!isOpen) return;
      isOpen = false;
      trigger.setAttribute('aria-expanded', 'false');
      menu.inert = true;
      const id = ++motionId;
      motion?.cancel();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { menu.hidden = true; return; }
      motion = menu.animate([
        { opacity: 1, transform: 'translateY(0) scale(1)' },
        { opacity: 0, transform: 'translateY(-8px) scale(.98)' }
      ], { duration: 150, easing: 'ease-in', fill: 'forwards' });
      motion.finished.then(() => { if (id === motionId && !isOpen) menu.hidden = true; }).catch(() => {});
    }
    function visibleOptions() { return buttons.filter(button => !button.hidden); }
    function open() {
      controls.forEach(control => control.close());
      ++motionId;
      motion?.cancel();
      search.value = '';
      buttons.forEach(button => button.hidden = false);
      isOpen = true;
      menu.hidden = false;
      menu.inert = false;
      trigger.setAttribute('aria-expanded', 'true');
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        motion = menu.animate([
          { opacity: 0, transform: 'translateY(-8px) scale(.98)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' }
        ], { duration: 180, easing: 'ease-out' });
      }
      search.focus({ preventScroll: true });
    }
    trigger.addEventListener('click', () => isOpen ? close() : open());
    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); open(); }
    });
    wrapper.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); close(); trigger.focus(); }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (!isOpen) return;
        event.preventDefault();
        const visible = visibleOptions();
        const current = visible.indexOf(document.activeElement);
        const next = event.key === 'ArrowDown' ? (current + 1) % visible.length : (current - 1 + visible.length) % visible.length;
        visible[next]?.focus();
      }
    });
    wrapper.addEventListener('focusout', event => {
      if (event.relatedTarget && !wrapper.contains(event.relatedTarget)) close();
    });
    search?.addEventListener('input', () => {
      const query = search.value.trim().toLocaleLowerCase();
      buttons.forEach((button, i) => { const label = window.siteI18n ? window.siteI18n.t(options[i].label) : options[i].label;
        button.hidden = ![names[options[i].value] || '', options[i].label, label].join(' ').toLocaleLowerCase().includes(query); });
    });
    select.after(wrapper);
    wrapper.append(trigger, menu);
    select.hidden = true;
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');
    if (select.id) document.querySelectorAll(`label[for="${select.id}"]`).forEach(label => label.htmlFor = trigger.id);
    select.addEventListener('change', update);
    update();
    controls.push({ wrapper, close, update });
  });
  document.addEventListener('languagechange', () => controls.forEach(control => control.update()));
  document.addEventListener('pointerdown', event => controls.forEach(control => { if (!control.wrapper.contains(event.target)) control.close(); }));
})();
