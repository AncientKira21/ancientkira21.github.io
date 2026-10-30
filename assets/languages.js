(() => {
  const supported = ['en', 'es', 'zh-Hans', 'my', 'ja'];
  const normalize = value => value.replace(/\s+/g, ' ').trim();
  const textSources = new WeakMap();
  const attributeSources = new WeakMap();
  const attributes = ['placeholder', 'aria-label', 'aria-valuetext', 'title', 'alt'];
  let language = 'en';
  const browserLanguage = (navigator.languages || [navigator.language]).find(value => /^(en|es|zh|my|ja)(-|$)/i.test(value)) || 'en';
  language = browserLanguage.startsWith('zh') ? 'zh-Hans' : browserLanguage.split('-')[0];
  try {
    const saved = localStorage.getItem('lucily-language');
    if (supported.includes(saved)) language = saved;
  } catch {}
  function translate(source, values = {}) {
    let key = normalize(source);
    const count = key.match(/^(\d+) projects? available$/);
    if (count) {
      values = { ...values, count: count[1] };
      key = count[1] === '1' ? '{count} project available' : '{count} projects available';
    }
    let result;
    if (key.startsWith('Lucily | ')) {
      const page = key.slice(9);
      const title = page === 'Page Not Found' ? 'not available!' : page === 'MCArem AI Guide' ? 'MCArem AI Guide' : page;
      result = 'Lucily | ' + (window.siteTranslations[title]?.[language] || title);
    } else result = window.siteTranslations[key]?.[language] || key;
    return result.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
  }
  function update() {
    document.documentElement.lang = language;
    document.querySelectorAll('.language-select').forEach(select => { select.value = language; });
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || parent.closest('script, style, svg, [data-no-translate]')) continue;
      const raw = node.nodeValue;
      if (!normalize(raw)) continue;
      let record = textSources.get(node);
      if (!record || (raw !== record.output && raw !== record.source)) record = { source: raw };
      const translated = translate(record.source);
      // Preserve whitespace separating links and inline icons from surrounding text.
      const leading = record.source.match(/^\s*/)[0];
      const trailing = record.source.match(/\s*$/)[0];
      record.output = leading + translated + trailing;
      textSources.set(node, record);
      if (raw !== record.output) node.nodeValue = record.output;
    }
    document.querySelectorAll('[placeholder], [aria-label], [aria-valuetext], [title], img[alt]').forEach(element => {
      if (element.closest('svg, [data-no-translate]')) return;
      let records = attributeSources.get(element);
      if (!records) { records = {}; attributeSources.set(element, records); }
      for (const name of attributes) {
        if (!element.hasAttribute(name)) continue;
        const raw = element.getAttribute(name);
        let record = records[name];
        if (!record || (raw !== record.output && raw !== record.source)) record = { source: raw };
        record.output = translate(record.source);
        records[name] = record;
        if (raw !== record.output) element.setAttribute(name, record.output);
      }
    });
    document.querySelectorAll('.guide-language-notice').forEach(notice => { notice.hidden = language === 'en'; });
  }
  function setLanguage(next) {
    if (!supported.includes(next)) return;
    language = next;
    try { localStorage.setItem('lucily-language', language); } catch {}
    update();
    document.dispatchEvent(new CustomEvent('languagechange'));
  }
  window.siteI18n = { t: translate, setLanguage, get language() { return language; } };
  document.querySelectorAll('.language-select').forEach(select => select.addEventListener('change', () => {
    if (!supported.includes(select.value)) return;
    language = select.value;
    try { localStorage.setItem('lucily-language', language); } catch {}
    update();
    document.dispatchEvent(new CustomEvent('languagechange'));
  }));
  update();
  let scheduled = false;
  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; update(); });
  }).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attributes });
  document.dispatchEvent(new CustomEvent('languagechange'));
})();
