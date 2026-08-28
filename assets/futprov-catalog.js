// Escaparate de catálogo: fetch, filtros, búsqueda, paginación y lightbox.
// No es un catálogo comprable — solo muestra lo que se puede conseguir vía el proveedor.
(() => {
  const root = document.querySelector('[data-fp-catalog]');
  if (!root) return;

  const grid = root.querySelector('[data-fp-grid]');
  const search = root.querySelector('[data-fp-search]');
  const chipsWrap = root.querySelector('[data-fp-chips]');
  const loadMoreBtn = root.querySelector('[data-fp-loadmore]');
  const emptyEl = root.querySelector('[data-fp-empty]');
  const lightbox = document.querySelector('[data-fp-lightbox]');
  const lightboxImg = lightbox?.querySelector('img');
  const catalogUrl = root.dataset.fpCatalogUrl;
  const pageSize = 24;

  let all = [];
  let filtered = [];
  let shown = 0;
  let activeLeague = 'all';
  let query = '';

  const cardImg = (src, isSecond) =>
    `<img src="${src}" alt="" loading="lazy" decoding="async" width="600" height="800" ${
      isSecond ? 'onerror="this.style.display=\'none\'"' : 'onerror="this.closest(\'.fp-card\').remove()"'
    }>`;

  const renderCard = (product) => {
    const el = document.createElement('a');
    el.href = root.dataset.fpProductUrl || '#';
    el.className = 'fp-card';
    el.innerHTML = `
      <div class="fp-card__inner">
        ${cardImg(product.img, false)}
        ${cardImg(product.img2, true)}
      </div>
      <div class="fp-card__meta">
        <span class="fp-card__team">${product.title}</span>
        <span class="fp-card__badge">${product.league}</span>
      </div>
    `;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(product);
    });
    return el;
  };

  const openLightbox = (product) => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = product.img;
    lightboxImg.alt = product.title;
    lightbox.classList.add('fp-open');
  };

  lightbox?.querySelector('[data-fp-lightbox-close]')?.addEventListener('click', () => {
    lightbox.classList.remove('fp-open');
  });
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.remove('fp-open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') lightbox?.classList.remove('fp-open');
  });

  const applyFilters = () => {
    filtered = all.filter((p) => {
      const matchLeague = activeLeague === 'all' || p.league === activeLeague;
      const matchQuery = !query || p.title.toLowerCase().includes(query);
      return matchLeague && matchQuery;
    });
    shown = 0;
    grid.innerHTML = '';
    renderNextPage();
    emptyEl.style.display = filtered.length ? 'none' : 'block';
  };

  const renderNextPage = () => {
    const next = filtered.slice(shown, shown + pageSize);
    const frag = document.createDocumentFragment();
    next.forEach((p) => frag.appendChild(renderCard(p)));
    grid.appendChild(frag);
    shown += next.length;
    loadMoreBtn.hidden = shown >= filtered.length;

    requestAnimationFrame(() => {
      grid.querySelectorAll('.fp-card:not(.fp-in)').forEach((card, i) => {
        setTimeout(() => card.classList.add('fp-in'), i * 25);
      });
    });
  };

  loadMoreBtn?.addEventListener('click', renderNextPage);

  search?.addEventListener('input', () => {
    query = search.value.trim().toLowerCase();
    applyFilters();
  });

  const buildChips = () => {
    const leagues = ['all', ...new Set(all.map((p) => p.league))];
    chipsWrap.innerHTML = leagues
      .map(
        (league) =>
          `<button type="button" class="fp-chip" data-league="${league}" aria-pressed="${
            league === 'all' ? 'true' : 'false'
          }">${league === 'all' ? 'Todos' : league}</button>`
      )
      .join('');
    chipsWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.fp-chip');
      if (!btn) return;
      activeLeague = btn.dataset.league;
      chipsWrap.querySelectorAll('.fp-chip').forEach((c) => c.setAttribute('aria-pressed', c === btn ? 'true' : 'false'));
      applyFilters();
    });
  };

  document.addEventListener('click', (e) => {
    const jump = e.target.closest('[data-fp-goto-league]');
    if (!jump) return;
    e.preventDefault();
    activeLeague = jump.dataset.fpGotoLeague;
    chipsWrap?.querySelectorAll('.fp-chip').forEach((c) => c.setAttribute('aria-pressed', c.dataset.league === activeLeague ? 'true' : 'false'));
    applyFilters();
    root.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

  fetch(catalogUrl)
    .then((r) => r.json())
    .then((data) => {
      all = data;
      buildChips();
      applyFilters();
    })
    .catch(() => {
      emptyEl.textContent = 'No se pudo cargar el catálogo. Inténtalo de nuevo más tarde.';
      emptyEl.style.display = 'block';
    });
})();
