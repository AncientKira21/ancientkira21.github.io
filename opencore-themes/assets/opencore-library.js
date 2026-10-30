/* Fetch public source metadata only; never execute upstream scripts or HTML. */
(() => {
  const grid = document.getElementById('themeGrid');
  const search = document.getElementById('search');
  const author = document.getElementById('themeAuthor');
  const sort = document.getElementById('themeSort');
  const status = document.getElementById('themeSourceStatus');
  const sourceUrls = {
    release: 'https://api.github.com/repos/chris1111/My-Simple-OC-Themes/releases/tags/Archive_New-Themes',
    previews: 'https://api.github.com/repos/chris1111/My-Simple-OC-Themes/contents/View%20Boot%200.7',
    blackosx: 'https://raw.githubusercontent.com/dortania/OpenCanopy-Gallery/main/blackosx.md',
  };
  const validUrl = value => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && ['github.com', 'raw.githubusercontent.com', 'dortania.github.io'].includes(url.hostname);
    } catch { return false; }
  };
  function isTheme(theme) {
    return theme && typeof theme.id === 'string' && typeof theme.name === 'string' && typeof theme.author === 'string' &&
      typeof theme.tag === 'string' && typeof theme.description === 'string' && validUrl(theme.source) && validUrl(theme.download) && (!theme.image || validUrl(theme.image));
  }
  let themes = window.openCoreThemes.filter(isTheme);
  let currentFilter = 'all';
  const filters = [
    ['all', 'All Themes', 'fa-layer-group'], ['Flavours', 'Flavours', 'fa-palette'],
    ['Apple', 'Apple', 'fa-apple-whole'], ['Minimal', 'Minimal', 'fa-minus'],
    ['Dark', 'Dark', 'fa-moon'], ['Tahoe', 'Tahoe', 'fa-mountain-sun'], ['Bsx', 'Bsx', 'fa-display'],
  ];
  function icon(name) {
    const i = document.createElement('i'); i.className = 'fa-solid ' + name; i.setAttribute('aria-hidden', 'true'); return i;
  }
  const filterButtons = filters.map(([id, label, glyph]) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'chip' + (id === 'all' ? ' active' : '');
    button.dataset.filter = id; button.setAttribute('aria-pressed', String(id === 'all'));
    button.append(icon(glyph), document.createTextNode(' ' + label));
    button.addEventListener('click', () => { currentFilter = id; updateFilters(); render(); });
    document.getElementById('themeFilters').append(button); return button;
  });
  function updateFilters() {
    filterButtons.forEach(button => {
      const active = button.dataset.filter === currentFilter;
      button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
    });
  }
  function link(label, glyph, href, className) {
    const a = document.createElement('a'); a.className = className; a.href = href; a.target = '_blank'; a.rel = 'noopener';
    a.append(icon(glyph), document.createTextNode(' ' + label)); return a;
  }
  function createCard(theme, index) {
    const card = document.createElement('article'); card.className = 'theme-card'; card.dataset.themeId = theme.id;
    card.style.animationDelay = Math.min(index * .02, .6) + 's';
    const preview = document.createElement('div'); preview.className = 'theme-preview';
    const badge = document.createElement('span'); badge.className = 'theme-tag'; badge.dataset.noTranslate = ''; badge.textContent = theme.tag;
    const fallback = document.createElement('div'); fallback.className = 'theme-preview-fallback';
    const fallbackLabel = document.createElement('span'); fallbackLabel.textContent = 'Preview unavailable';
    fallback.append(icon('fa-image'), fallbackLabel);
    if (theme.image) fallback.setAttribute('aria-hidden', 'true');
    preview.append(fallback, badge);
    if (theme.image) {
      const image = document.createElement('img'); image.loading = 'lazy'; image.decoding = 'async'; image.src = theme.image; image.alt = theme.name;
      image.dataset.noTranslate = ''; image.addEventListener('error', () => { image.remove(); fallback.removeAttribute('aria-hidden'); }, { once: true }); preview.append(image);
    }
    const info = document.createElement('div'); info.className = 'theme-info';
    const name = document.createElement('h3'); name.className = 'theme-name'; name.textContent = theme.name; name.dataset.noTranslate = '';
    const byline = document.createElement('a'); byline.className = 'theme-creator'; byline.textContent = theme.author; byline.dataset.noTranslate = ''; byline.href = 'https://github.com/' + theme.author; byline.target = '_blank'; byline.rel = 'noopener';
    const description = document.createElement('p'); description.className = 'theme-description'; description.textContent = theme.description;
    const actions = document.createElement('div'); actions.className = 'theme-actions';
    actions.append(link('Download on GitHub', 'fa-download', theme.download, 'btn-download'), link('GitHub Source', 'fa-code', theme.source, 'btn-view'));
    info.append(name, byline, description, actions); card.append(preview, info); return card;
  }
  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const filtered = themes.filter(theme => {
      const text = [theme.name, theme.author, theme.tag, theme.description].join(' ').toLocaleLowerCase();
      return (currentFilter === 'all' || text.includes(currentFilter.toLocaleLowerCase())) && (author.value === 'all' || theme.author === author.value) && (!query || text.includes(query));
    });
    filtered.sort((a, b) => {
      if (sort.value === 'az') return a.name.localeCompare(b.name);
      if (sort.value === 'za') return b.name.localeCompare(a.name);
      if (sort.value === 'author') return a.author.localeCompare(b.author) || a.name.localeCompare(b.name);
      return a.order - b.order;
    });
    const fragment = document.createDocumentFragment(); filtered.forEach((theme, i) => fragment.append(createCard(theme, i))); grid.replaceChildren(fragment);
    document.getElementById('themeCount').textContent = themes.length;
    document.getElementById('themeResultCount').textContent = `${filtered.length} themes available`;
    document.getElementById('themeEmpty').hidden = filtered.length !== 0;
  }
  search.addEventListener('input', render); author.addEventListener('change', render); sort.addEventListener('change', render);
  document.getElementById('clearThemeSearch').addEventListener('click', () => {
    search.value = ''; author.value = 'all'; currentFilter = 'all'; updateFilters(); author.dispatchEvent(new Event('change')); search.focus();
  });
  const cacheKey = 'lucily-opencore-catalog-v1';
  let cached;
  try {
    cached = JSON.parse(localStorage.getItem(cacheKey));
    if (cached && Array.isArray(cached.themes) && cached.themes.length && cached.themes.every(isTheme)) themes = cached.themes;
  } catch {}
  render();
  if (cached?.updated && Date.now() - cached.updated < 6 * 60 * 60 * 1000) {
    status.textContent = 'Showing the latest saved catalogue.'; return;
  }
  async function get(url, json) {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error('Source unavailable');
      return await (json ? response.json() : response.text());
    } finally { clearTimeout(timer); }
  }
  function merge(newThemes) {
    const map = new Map(themes.map(theme => [theme.id, theme]));
    for (const theme of newThemes.filter(isTheme)) map.set(theme.id, theme);
    themes = Array.from(map.values());
  }
  const refreshChris = Promise.all([get(sourceUrls.release, true), get(sourceUrls.previews, true)]).then(([release, previews]) => {
    if (!Array.isArray(release.assets) || !Array.isArray(previews)) throw new Error('Invalid source data');
    const images = new Map(previews.filter(item => typeof item.name === 'string' && /\.(png|jpe?g)$/i.test(item.name)).map(item => [item.name.replace(/\.[^.]+$/, '').toLocaleLowerCase(), item.download_url]));
    const previous = new Map(themes.filter(theme => theme.author === 'chris1111').map(theme => [theme.id, theme]));
    const entries = release.assets.filter(asset => typeof asset.name === 'string' && /\.zip$/i.test(asset.name)).map((asset, i) => {
      const name = asset.name.replace(/\.zip$/i, ''); const id = 'chris1111/' + name.toLocaleLowerCase(); const old = previous.get(id);
      return { id, name: old?.name || name, author: 'chris1111', tag: old?.tag || ['Minimal','Tahoe','Apple','Dark','Flavours','Natural','Primitive','iOS'].find(tag => name.toLocaleLowerCase().includes(tag.toLocaleLowerCase())) || 'Theme', image: images.get(name.toLocaleLowerCase()) || old?.image || '', download: asset.browser_download_url, source: 'https://github.com/chris1111/My-Simple-OC-Themes', description: 'OpenCanopy theme by chris1111.', order: old?.order ?? i };
    });
    if (!entries.length) throw new Error('Empty catalogue'); merge(entries);
  });
  const refreshBlackosx = get(sourceUrls.blackosx, false).then(markdown => {
    const section = markdown.split('## OpenCanopyIcons Repo')[0];
    const matches = section.matchAll(/!\[[^\]]*\]\((https:\/\/raw\.githubusercontent\.com\/blackosx\/([^/]+)\/([^/]+)\/preview_ui\.jpg)\)/g);
    const entries = Array.from(matches, ([, image, repo, branch], i) => ({ id: 'blackosx/' + repo.toLocaleLowerCase(), name: repo, author: 'blackosx', tag: 'Bsx', image, download: `https://github.com/blackosx/${repo}/archive/refs/heads/${branch}.zip`, source: `https://github.com/blackosx/${repo}`, description: 'OpenCanopy theme by Blackosx.', order: 1000 + i }));
    if (!entries.length) throw new Error('Empty catalogue'); merge(entries);
  });
  Promise.allSettled([refreshChris, refreshBlackosx]).then(results => {
    const successes = results.filter(result => result.status === 'fulfilled').length;
    status.textContent = successes === 2 ? 'Updated from the original sources.' : successes ? 'Some sources are unavailable. Saved themes are still included.' : 'Sources are unavailable. Showing the saved catalogue.';
    if (successes === 2) { try { localStorage.setItem(cacheKey, JSON.stringify({ updated: Date.now(), themes })); } catch {} }
    render();
  });
})();
