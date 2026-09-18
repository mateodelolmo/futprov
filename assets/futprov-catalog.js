// Catalogo real: trae TODOS los productos de la tienda (paginado), permite
// filtrar por categoria y buscar por nombre. Cada tarjeta muestra la imagen
// de la camiseta con un enlace a su ficha y un boton "Comprar contacto
// proveedor" enlazado al producto global definido en Ajustes del tema.
(() => {
  const root = document.querySelector('[data-fp-catalog]');
  if (!root) return;

  const grid = root.querySelector('[data-fp-grid]');
  const search = root.querySelector('[data-fp-search]');
  const chipsWrap = root.querySelector('[data-fp-chips]');
  const loadMoreBtn = root.querySelector('[data-fp-loadmore]');
  const emptyEl = root.querySelector('[data-fp-empty]');
  const countEl = root.querySelector('[data-fp-count]');
  const pageSize = 24;
  const CACHE_KEY = 'fp-catalog-products-v2';
  const CACHE_TTL_MS = 10 * 60 * 1000;

  const CATEGORIES = [
    { key: 'LaLiga', label: 'LaLiga', test: (p) => p.tags.includes('laliga') },
    { key: 'Premier League', label: 'Premier League', test: (p) => p.tags.includes('premier-league') },
    { key: 'Serie A', label: 'Serie A', test: (p) => p.tags.includes('serie-a') || p.tags.includes('serie a') },
    { key: 'Bundesliga', label: 'Bundesliga', test: (p) => p.tags.includes('bundesliga') },
    { key: 'Ligue 1', label: 'Ligue 1', test: (p) => p.tags.includes('ligue-1') },
    { key: 'Retro', label: 'Retro', test: (p) => p.tags.includes('retro') },
    { key: 'Selecciones', label: 'Selecciones', test: (p) => p.tags.includes('tipo-selecciones') },
    { key: 'Espana', label: 'Espana', test: (p) => p.tags.includes('espana') },
    { key: 'MLS', label: 'MLS', test: (p) => p.tags.includes('mls') },
    { key: 'Liga MX', label: 'Liga MX', test: (p) => p.tags.includes('liga mx') || p.tags.includes('liga-mx') },
    {
      key: 'Brasileirao',
      label: 'Brasileirao',
      test: (p) => p.tags.includes('brasileirao') || p.tags.includes('brasileirao'),
    },
    {
      key: 'Primeira Liga',
      label: 'Primeira Liga',
      test: (p) => p.tags.includes('primeira liga') || p.tags.includes('primeira-liga'),
    },
    { key: 'Eredivisie', label: 'Eredivisie', test: (p) => p.tags.includes('eredivisie') },
    { key: 'Mujer', label: 'Mujer', test: (p) => p.tags.includes('mujer') },
    {
      key: 'Ninos',
      label: 'Ninos',
      test: (p) => /nin|kids|set infantil|infantil|conjunto/.test(p.title.toLowerCase()),
    },
    { key: 'Chandal', label: 'Chandal', test: (p) => p.tags.includes('chandal') || p.tags.includes('entrenamiento') },
    { key: 'Balones', label: 'Balones', test: (p) => p.tags.includes('balones') },
  ];

  let all = [];
  let filtered = [];
  let shown = 0;
  let activeCategory = 'all';
  let query = '';

  const LT = String.fromCharCode(60);
  const escapeHtml = (s) =>
    String(s).replace(
      /[<&>"]/g,
      (c) => ({ '<': LT, '>': String.fromCharCode(62), '&': String.fromCharCode(38), '"': String.fromCharCode(34) })[c],
    );

  const renderCard = (product) => {
    const wrap = document.createElement('div');
    wrap.className = 'fp-card';
    const providerUrl = root.dataset.fpProviderUrl || '';
    const title = escapeHtml(product.title);
    const img = escapeHtml(product.img);
    const url = escapeHtml(providerUrl || product.url);
    const ctaHtml = providerUrl
      ? '<a href="' + escapeHtml(providerUrl) + '" class="fp-card__cta">Comprar contacto proveedor</a>'
      : '';
    wrap.innerHTML =
      '<a href="' +
      url +
      '" class="fp-card__media" aria-label="Ver ficha de ' +
      title +
      '">' +
      '<div class="fp-card__inner">' +
      '<img src="' +
      img +
      '" alt="" loading="lazy" decoding="async" width="600" height="800" onerror="this.closest(&apos;.fp-card&apos;).remove()">' +
      LT +
      '/div>' +
      '<span class="fp-card__team">' +
      title +
      LT +
      '/span>' +
      LT +
      '/a>' +
      ctaHtml;
    return wrap;
  };

  const applyFilters = () => {
    filtered = all.filter((p) => {
      const cat = CATEGORIES.find((c) => c.key === activeCategory);
      const matchCategory = activeCategory === 'all' || (cat && cat.test(p));
      const matchQuery = !query || p.title.toLowerCase().includes(query);
      return matchCategory && matchQuery;
    });
    shown = 0;
    grid.innerHTML = '';
    renderNextPage();
    emptyEl.style.display = filtered.length ? 'none' : 'block';
    if (countEl) countEl.textContent = filtered.length + ' camisetas';
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
        setTimeout(() => card.classList.add('fp-in'), i * 20);
      });
    });
  };

  loadMoreBtn?.addEventListener('click', renderNextPage);

  const renderChips = () => {
    if (!chipsWrap) return;
    const frag = document.createDocumentFragment();
    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'fp-chip' + (activeCategory === 'all' ? ' fp-chip--active' : '');
    allBtn.textContent = 'Todas';
    allBtn.dataset.cat = 'all';
    frag.appendChild(allBtn);
    CATEGORIES.forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'fp-chip' + (activeCategory === c.key ? ' fp-chip--active' : '');
      b.textContent = c.label;
      b.dataset.cat = c.key;
      frag.appendChild(b);
    });
    chipsWrap.innerHTML = '';
    chipsWrap.appendChild(frag);
  };

  chipsWrap?.addEventListener('click', (e) => {
    const btn = e.target.closest('.fp-chip');
    if (!btn) return;
    activeCategory = btn.dataset.cat;
    renderChips();
    applyFilters();
    updateUrl();
  });

  const updateUrl = () => {
    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.set('categoria', activeCategory);
    if (query) params.set('q', query);
    const qs = params.toString();
    const url = qs ? '?' + qs : window.location.pathname;
    window.history.replaceState({}, '', url);
  };

  const readUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('categoria');
    if (cat) {
      const known = CATEGORIES.find((c) => c.key === cat);
      if (known) activeCategory = cat;
    }
    const q = params.get('q');
    if (q) {
      query = q;
      if (search) search.value = q;
    }
  };

  search?.addEventListener('input', (e) => {
    query = e.target.value.trim().toLowerCase();
    applyFilters();
    updateUrl();
  });

  const fetchAllProducts = async () => {
    const results = [];
    let page = 1;
    while (page <= 15) {
      try {
        const res = await fetch('/products.json?limit=250&page=' + page);
        if (!res.ok) break;
        const json = await res.json();
        const batch = (json.products || []).map((p) => ({
          title: p.title,
          url: '/products/' + p.handle,
          img: p.images && p.images[0] ? p.images[0].src : '',
          type: p.product_type || '',
          tags: (p.tags || []).map((t) => String(t).toLowerCase()),
        }));
        if (!batch.length) break;
        results.push(...batch);
        if (batch.length < 250) break;
        page++;
      } catch (err) {
        console.error('fp-catalog fetch error', err);
        break;
      }
    }
    return results;
  };

  const loadFromCache = () => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.ts || Date.now() - parsed.ts > CACHE_TTL_MS) return null;
      return parsed.data;
    } catch (_) {
      return null;
    }
  };

  const saveToCache = (data) => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch (_) {}
  };

  const init = async () => {
    readUrl();
    renderChips();
    let data = loadFromCache();
    if (!data) {
      data = await fetchAllProducts();
      saveToCache(data);
    }
    all = data.filter((p) => p.img && p.type.toLowerCase().includes('camiseta'));
    applyFilters();
  };

  init();
})();
