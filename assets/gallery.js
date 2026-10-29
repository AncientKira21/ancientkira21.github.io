const grid = document.getElementById('projects');
const cards = Array.from(grid.querySelectorAll('.project-card'));
const search = document.getElementById('search');
const sort = document.getElementById('sort');
const filterContainer = document.querySelector('.filters');
function categoryIcon(category) {
  if (category.svg) {
    const template = document.createElement('template');
    template.innerHTML = category.svg;
    return template.content.firstElementChild.cloneNode(true);
  }
  const icon = document.createElement(category.image ? 'img' : 'i');
  if (category.image) {
    icon.src = category.image;
    icon.alt = '';
    icon.className = category.tint ? 'category-icon tinted-profile' : 'category-icon';
  } else {
    icon.className = category.icon;
  }
  icon.setAttribute('aria-hidden', 'true');
  return icon;
}
const categories = [
  { id: 'all', name: 'All Projects', icon: 'fa-solid fa-layer-group' },
  ...projectCategories,
];
filterContainer.replaceChildren(...categories.map(category => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = category.id === 'all' ? 'chip active' : 'chip';
  button.dataset.filter = category.id;
  button.setAttribute('aria-pressed', String(category.id === 'all'));
  button.append(categoryIcon(category), document.createTextNode(' ' + category.name));
  return button;
}));
for (const card of cards) {
  const category = projectCategories.find(category => category.id === card.dataset.category);
  if (!category) continue;
  const badge = card.querySelector('.theme-tag');
  badge.replaceChildren(categoryIcon(category), document.createTextNode(' ' + category.name));
  const previewIcon = card.querySelector('.project-art i, .project-art img, .project-art svg');
  const projectIcon = projectIcons[card.dataset.icon] || category;
  if (previewIcon) previewIcon.replaceWith(categoryIcon(projectIcon));
}
const filters = Array.from(filterContainer.querySelectorAll('[data-filter]'));
let category = 'all';
function updateGallery() {
  const query = search.value.trim().toLocaleLowerCase();
  const ordered = [...cards].sort((a, b) => {
    if (sort.value === 'az') return a.dataset.name.localeCompare(b.dataset.name);
    if (sort.value === 'za') return b.dataset.name.localeCompare(a.dataset.name);
    if (sort.value === 'status') return Number(b.dataset.active === 'true') - Number(a.dataset.active === 'true');
    return Number(a.dataset.order) - Number(b.dataset.order);
  });
  let count = 0;
  for (const card of ordered) {
    card.hidden = !(category === 'all' || card.dataset.category === category) || !card.textContent.toLocaleLowerCase().includes(query);
    if (!card.hidden) count++;
    grid.append(card);
  }
  document.getElementById('resultCount').textContent = `${count} project${count === 1 ? '' : 's'} available`;
  document.getElementById('noResults').hidden = count !== 0;
}
search.addEventListener('input', updateGallery);
sort.addEventListener('change', updateGallery);
filters.forEach(button => button.addEventListener('click', () => {
  category = button.dataset.filter;
  filters.forEach(filter => {
    const active = filter === button;
    filter.classList.toggle('active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  updateGallery();
}));

// Apply the selected default order on the initial page load.
updateGallery();
