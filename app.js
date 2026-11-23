(() => {
  'use strict';
  const app = document.getElementById('app');
  const places = window.PLACE_QUEST_PLACES || [];
  const demoReviews = window.PLACE_QUEST_DEMO_REVIEWS || [];
  const STORAGE_KEY = 'placeQuest';
  const DEFAULT_STORE = {
    version: 1,
    city: 'Элиста',
    favorites: [],
    visited: [],
    recentlyViewed: [],
    collections: [{ id: 'weekend', title: 'Идеи на выходные', places: [] }],
    reviews: [],
    serviceReviews: [],
    profile: { name: 'Исследователь', note: 'Открываю город по-своему', authorized: false }
  };
  let store = loadStore();
  let homeMode = 'random';
  let homeTags = [];
  let catalogState = { query: '', category: 'all', tags: [], sort: 'recommended', price: 'any', view: 'list' };
  let activeAccountTab = 'favorites';
  let toastTimer = null;
  let searchTimer = null;
  const mapRegistry = new Map();

  function loadStore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!saved || typeof saved !== 'object') return structuredClone(DEFAULT_STORE);
      return {
        ...structuredClone(DEFAULT_STORE), ...saved,
        favorites: Array.isArray(saved.favorites) ? saved.favorites : [],
        visited: Array.isArray(saved.visited) ? saved.visited : [],
        recentlyViewed: Array.isArray(saved.recentlyViewed) ? saved.recentlyViewed : [],
        collections: Array.isArray(saved.collections) ? saved.collections : structuredClone(DEFAULT_STORE.collections),
        reviews: Array.isArray(saved.reviews) ? saved.reviews : [],
        serviceReviews: Array.isArray(saved.serviceReviews) ? saved.serviceReviews : [],
        profile: { ...DEFAULT_STORE.profile, ...(saved.profile || {}) }
      };
    } catch (error) {
      console.warn('ILU QUEST: localStorage is unavailable; temporary session mode is active.', error);
      return structuredClone(DEFAULT_STORE);
    }
  }
  function saveStore() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }
    catch (error) { showToast('Браузер не смог сохранить данные. Проверь настройки хранилища.'); }
  }
  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function money(value) { return value == null ? 'Бесплатно' : `${value.toLocaleString('ru-RU')} ₽`; }
  function getPlace(id) { return places.find(p => p.id === id); }
  function isFavorite(id) { return store.favorites.includes(id); }
  function toggleFavorite(id) {
    store.favorites = isFavorite(id) ? store.favorites.filter(x => x !== id) : [...store.favorites, id];
    saveStore();
    showToast(isFavorite(id) ? 'Место добавлено в избранное ❤️' : 'Место убрано из избранного');
    render();
  }
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }
  function parseRoute() {
    const raw = location.hash.replace(/^#/, '') || '/';
    const [path, query = ''] = raw.split('?');
    const parts = path.split('/').filter(Boolean);
    return { path: path || '/', parts, params: new URLSearchParams(query) };
  }
  function go(path) { location.hash = path.startsWith('#') ? path : `#${path}`; }
  function setNavActive(route) {
    document.querySelectorAll('.main-nav a').forEach(a => a.classList.remove('active'));
    if (route.parts[0] === 'places' && route.parts.length === 1) {
      const active = route.params.get('view') === 'map' ? 'map' : 'places';
      document.querySelector(`[data-nav="${active}"]`)?.classList.add('active');
    } else if (route.parts[0] === 'account') {
      document.querySelector(`[data-nav="collections"]`)?.classList.add('active');
    } else if (route.parts[0] === 'reviews') {
      document.querySelector(`[data-nav="reviews"]`)?.classList.add('active');
    }
  }
  function cardTemplate(place, compact = false) {
    const fav = isFavorite(place.id);
    const tags = place.tags.slice(0, compact ? 2 : 3).map(tag => `<span class="mini-tag">${esc(tag)}</span>`).join('');
    return `<article class="place-card" data-place-card="${esc(place.id)}">
      <div class="card-image-wrap">
        <a href="#/places/${esc(place.id)}" aria-label="Открыть ${esc(place.name)}"><img class="card-image" src="${esc(place.image)}" alt="${esc(place.name)}" loading="lazy" onerror="this.onerror=null;this.src='assets/photo-placeholder.svg'"></a>
        <div class="image-overlay"></div>
        <button class="favorite-btn ${fav ? 'active' : ''}" data-action="favorite" data-id="${esc(place.id)}" aria-label="${fav ? 'Убрать из избранного' : 'Добавить в избранное'}">${fav ? '♥' : '♡'}</button>
        <span class="rating-pill"><span>★</span> ${place.rating.toFixed(1)}</span>
      </div>
      <div class="card-body">
        <div class="card-title-row"><a class="card-title" href="#/places/${esc(place.id)}">${esc(place.name)}</a><span class="category-label">${esc(place.categoryLabel)}</span></div>
        <p class="card-address">⌖ ${esc(place.address)}</p>
        <div class="card-meta"><span>◷ ${esc(place.hours)}</span><span>${esc(place.priceLabel)}</span></div>
        <div class="card-tags">${tags}</div>
      </div>
    </article>`;
  }
  function bannerMapArt() {
    return `<div class="promo-map" aria-hidden="true"><svg viewBox="0 0 180 130" fill="none"><path d="M5 20L160 110M-5 90L160 20M35 0L75 130M125 0L100 130" stroke="#162F5C" stroke-width="3" stroke-linecap="round" opacity=".48"/><path d="M22 100L65 30L142 44L150 93L90 112Z" fill="#fff" stroke="#162F5C" stroke-width="2"/><path d="M45 78L76 55L118 78" stroke="#54BDE1" stroke-width="6" stroke-linecap="round"/><g fill="#FF6840" stroke="#142C55" stroke-width="2"><path d="M54 24C54 16 60 10 68 10S82 16 82 24C82 35 68 48 68 48S54 35 54 24Z"/><circle cx="68" cy="24" r="5" fill="#fff"/></g><g fill="#FF6840" stroke="#142C55" stroke-width="2"><path d="M116 68C116 60 122 54 130 54S144 60 144 68C144 79 130 92 130 92S116 79 116 68Z"/><circle cx="130" cy="68" r="5" fill="#fff"/></g></svg></div>`;
  }
  function renderHome() {
    const featured = ['marko-polo','park-druzhba','the-baza','tulpan'].map(getPlace).filter(Boolean);
    const popular = [...places].sort((a,b) => b.rating - a.rating).slice(0,4);
    const tagChoices = ['до поздна','вай-фай','веранда','с ноутбуком','караоке','настолки','живая музыка','парковка','бизнес-ланч'];
    
    app.innerHTML = `<section class="hero" aria-label="Главный баннер ILU QUEST">
      <video class="hero-video" autoplay muted loop playsinline poster="assets/hero-poster.jpg">
        <source src="assets/compbg_compross.mp4" type="video/mp4">
      </video>
    </section>
      <div class="page-wrap">
        <section class="home-search" aria-label="Быстрый поиск мест">
          <div class="search-modes">
            <div class="section-kicker">Твой город ждёт</div><h2>Выбери свой режим</h2>
            <div class="mode-grid">
              <button class="mode-card ${homeMode==='solo'?'selected':''}" data-action="home-mode" data-mode="solo"><span>Один</span><span class="mode-caption">Перезагрузиться</span></button>
              <button class="mode-card ${homeMode==='company'?'selected':''}" data-action="home-mode" data-mode="company"><span>С людьми</span><span class="mode-caption">Найти своих</span></button>
              <button class="mode-card ${homeMode==='discover'?'selected':''}" data-action="home-mode" data-mode="discover"><span>Удиви меня</span><span class="mode-caption">Открыть новое</span></button>
              <button class="mode-card ${homeMode==='random'?'selected':''}" data-action="home-mode" data-mode="random"><span>Рандом</span><span class="mode-caption">Случайное место</span></button>
            </div>
          </div>
          <div class="tag-search"><div class="tag-search-head">Или ищи по тегам</div>
            <div class="tag-cloud">${tagChoices.map(t=>`<button class="tag-chip ${homeTags.includes(t)?'selected':''}" data-action="home-tag" data-tag="${esc(t)}">${esc(t)}</button>`).join('')}</div>
            <div class="search-bottom"><span class="small-hint">Можно выбрать несколько</span><button class="button-primary" data-action="home-search">Найти <span>→</span></button></div>
          </div>
        </section>
        <section class="banner-grid home-section">
          <article class="promo-banner bg-quest">
            <button class="button-dark button-small banner-btn" data-action="start-quest">Пройти квест →</button>
          </article>
          <article class="promo-banner bg-places">
            <button class="button-dark button-small banner-btn" data-action="show-popular">Смотреть подборку →</button>
          </article>
        </section>
        <section class="home-section"><div class="section-head"><div><div class="section-kicker">Начни исследовать</div><h2>Места рядом с тобой</h2><p>Небольшие открытия могут быть совсем рядом.</p></div><a class="text-link" href="#/places">Смотреть все →</a></div><div class="places-grid">${featured.map(p=>cardTemplate(p,true)).join('')}</div></section>
        <section class="home-lower-grid home-section">
  <article class="promo-banner bg-quest-lower">
    <button class="button-dark button-small banner-btn" data-action="start-quest">Начать исследовать →</button>
  </article>
  <article class="promo-banner bg-collection-lower">
    <a class="button-dark button-small banner-btn" href="#/account?tab=collections">Мои коллекции →</a>
  </article>
</section>
        <section class="home-section"><div class="section-head"><div><div class="section-kicker">Выбор огонька</div><h2>Места с высоким рейтингом</h2></div><a class="text-link" href="#/places?sort=rating">Все места →</a></div><div class="places-grid">${popular.map(p=>cardTemplate(p,true)).join('')}</div></section>
      </div>`;
  }

  function parseCatalogQuery(route) {
    if (route.params.has('category')) catalogState.category = route.params.get('category');
    if (route.params.has('tags')) catalogState.tags = route.params.get('tags').split(',').filter(Boolean);
    if (route.params.has('sort')) catalogState.sort = route.params.get('sort');
    if (route.params.get('view') === 'map') catalogState.view = 'map';
  }
  function getFilteredPlaces() {
    let list = [...places];
    const q = catalogState.query.trim().toLowerCase();
    if (q) list = list.filter(p => [p.name,p.address,p.categoryLabel,p.description,...p.tags].join(' ').toLowerCase().includes(q));
    if (catalogState.category !== 'all') list = list.filter(p => p.category === catalogState.category);
    if (catalogState.tags.length) list = list.filter(p => catalogState.tags.every(t => p.tags.includes(t)));
    if (catalogState.price === 'under600') list = list.filter(p => p.price == null || p.price <= 600);
    if (catalogState.price === '600to1000') list = list.filter(p => p.price != null && p.price > 600 && p.price <= 1000);
    if (catalogState.price === 'over1000') list = list.filter(p => p.price != null && p.price > 1000);
    if (catalogState.sort === 'rating') list.sort((a,b)=>b.rating-a.rating);
    else if (catalogState.sort === 'price-up') list.sort((a,b)=>(a.price ?? 0)-(b.price ?? 0));
    else if (catalogState.sort === 'price-down') list.sort((a,b)=>(b.price ?? 0)-(a.price ?? 0));
    else if (catalogState.sort === 'name') list.sort((a,b)=>a.name.localeCompare(b.name,'ru'));
    return list;
  }
  function yandexSearchLink(place) { return `https://yandex.ru/maps/?text=${encodeURIComponent(`${place.name}, ${place.address}, Элиста`)}`; }
  function renderMapFallback(ids, compact = false) {
    const selected = ids.map(getPlace).filter(Boolean);
    const links = selected.slice(0, compact ? 3 : 7).map(p=>`<a href="${yandexSearchLink(p)}" target="_blank" rel="noopener">${esc(p.name)}</a>`).join('');
    return `<div class="map-fallback" id="${compact?'detail-map-fallback':'catalog-map-fallback'}"><div class="map-fallback-card"><div class="big-pin">📍</div><h3>Карта ILU QUEST</h3><p>Чтобы показывать интерактивные метки заведений прямо здесь, добавь свой API-ключ Яндекс Карт в файл <b>config.js</b>. Пока можно открыть конкретное место в Яндекс Картах.</p><a class="button-dark button-small" href="https://developer.tech.yandex.ru/" target="_blank" rel="noopener">Получить API-ключ ↗</a><div class="map-link-list">${links}</div></div></div>`;
  }
  function renderCatalog() {
    const filtered = getFilteredPlaces();
    const cats = [{id:'all',label:'Все места'},{id:'food',label:'Еда'},{id:'fun',label:'Развлечения'},{id:'walk',label:'Прогулки'}];
    const allTags = [...new Set(places.flatMap(p=>p.tags))].sort((a,b)=>a.localeCompare(b,'ru'));
    const isMap = catalogState.view === 'map';
    app.innerHTML = `<div class="page-wrap">
      <section class="page-heading"><div><div class="section-kicker">Исследуй Элисту</div><h1>Найди своё место</h1><p>Выбирай настроение, фильтруй по тегам и открывай новые точки города.</p></div><div class="heading-mascot">🔥</div></section>
      <div class="catalog-toolbar">
        <input class="search-input" id="catalog-search" data-action="catalog-search" value="${esc(catalogState.query)}" placeholder="⌕  Найти место или тег…" aria-label="Поиск по названию или тегу">
        <select class="select-control" id="catalog-sort" data-action="catalog-sort" aria-label="Сортировка"><option value="recommended" ${catalogState.sort==='recommended'?'selected':''}>Рекомендуемые</option><option value="rating" ${catalogState.sort==='rating'?'selected':''}>С высоким рейтингом</option><option value="price-up" ${catalogState.sort==='price-up'?'selected':''}>Сначала дешевле</option><option value="price-down" ${catalogState.sort==='price-down'?'selected':''}>Сначала дороже</option><option value="name" ${catalogState.sort==='name'?'selected':''}>По названию</option></select>
        <select class="select-control" id="catalog-price" data-action="catalog-price" aria-label="Цена"><option value="any" ${catalogState.price==='any'?'selected':''}>Любая цена</option><option value="under600" ${catalogState.price==='under600'?'selected':''}>До 600 ₽</option><option value="600to1000" ${catalogState.price==='600to1000'?'selected':''}>600–1 000 ₽</option><option value="over1000" ${catalogState.price==='over1000'?'selected':''}>От 1 000 ₽</option></select>
        <div class="select-control location-static" aria-label="Город">⌖ Элиста</div>
        <button class="button-dark button-small" data-action="clear-filters">Сбросить</button>
      </div>
      <div class="category-row">${cats.map(c=>`<button class="category-tab ${catalogState.category===c.id?'active':''}" data-action="category" data-category="${c.id}">${c.label}</button>`).join('')}</div>
      <div class="catalog-tags">${allTags.map(t=>`<button class="tag-chip ${catalogState.tags.includes(t)?'selected':''}" data-action="catalog-tag" data-tag="${esc(t)}">${esc(t)}</button>`).join('')}</div>
      <div class="catalog-subrow"><span class="results-count">Найдено мест: <b>${filtered.length}</b> из ${places.length} · ${catalogState.tags.length ? 'Выбраны все отмеченные теги' : 'Выбери фильтры под своё настроение'}</span><div class="view-switch"><button class="${!isMap?'active':''}" data-action="catalog-view" data-view="list">▦ Список</button><button class="${isMap?'active':''}" data-action="catalog-view" data-view="map">⌖ Карта</button></div></div>
      ${isMap ? `<div class="map-layout"><div class="map-list">${filtered.length ? filtered.map(p=>`<a class="map-list-item" href="#/places/${esc(p.id)}"><img src="${esc(p.image)}" alt="" onerror="this.onerror=null;this.src='assets/photo-placeholder.svg'"><span><strong>${esc(p.name)}</strong><small>★ ${p.rating.toFixed(1)} · ${esc(p.address)}</small></span></a>`).join('') : '<div class="empty-state"><div class="empty-icon">🧭</div><h3>Пока ничего не нашлось</h3><p>Попробуй убрать один из фильтров.</p></div>'}</div><div class="map-canvas-wrap"><span class="map-status">Элиста · ${filtered.length} ${plural(filtered.length,'место','места','мест')}</span><div id="catalog-map" class="map-canvas"></div>${renderMapFallback(filtered.map(p=>p.id))}</div></div>` : `<div class="places-grid">${filtered.map(p=>cardTemplate(p)).join('')}</div>${filtered.length===0?'<div class="empty-state"><div class="empty-icon">🧭</div><h3>Огонёк пока ничего не нашёл</h3><p>Попробуй изменить запрос или снять часть тегов.</p><button class="button-dark button-small" data-action="clear-filters">Сбросить фильтры</button></div>':''}`}
    </div>`;
    if (isMap && filtered.length) initYandexMap('catalog-map', filtered.map(p=>p.id), 'catalog-map-fallback');
  }
  function plural(n, one, few, many) { const m10=n%10,m100=n%100; if(m10===1&&m100!==11)return one;if(m10>=2&&m10<=4&&(m100<12||m100>14))return few;return many; }
  function reviewsFor(id) { return [...demoReviews.filter(r=>r.placeId===id), ...store.reviews.filter(r=>r.placeId===id)].sort((a,b)=>new Date(b.createdAt||b.date||0)-new Date(a.createdAt||a.date||0)); }
  function displayedRating(place) {
    const user = store.reviews.filter(r=>r.placeId===place.id);
    if (!user.length) return place.rating.toFixed(1);
    return ((place.rating + user.reduce((s,r)=>s+r.rating,0)) / (user.length+1)).toFixed(1);
  }
  function renderDetail(id) {
    const p = getPlace(id);
    if (!p) { app.innerHTML = `<div class="page-wrap"><div class="empty-state"><div class="empty-icon">🧭</div><h3>Такого места пока нет</h3><p>Вернись в каталог — там есть ещё что открыть.</p><a class="button-dark button-small" href="#/places">К местам →</a></div></div>`; return; }
    store.recentlyViewed = [id, ...store.recentlyViewed.filter(x=>x!==id)].slice(0,8); saveStore();
    const revs = reviewsFor(id);
    const fav = isFavorite(id);
    const visited = store.visited.includes(id);
    app.innerHTML = `<div class="page-wrap">
      <div class="breadcrumbs"><a href="#/">Главная</a> / <a href="#/places">Места</a> / <span>${esc(p.name)}</span></div>
      <section class="detail-hero">
        <div class="detail-main-photo"><img src="${esc(p.gallery[0]||p.image)}" alt="${esc(p.name)}" onerror="this.onerror=null;this.src='assets/photo-placeholder.svg'"><span class="detail-photo-badge">${esc(p.categoryLabel)} · Элиста</span></div>
        <div class="detail-gallery"><img src="${esc(p.gallery[1]||p.image)}" alt="Интерьер ${esc(p.name)}" onerror="this.onerror=null;this.src='assets/photo-placeholder.svg'"><img src="${esc(p.image)}" alt="${esc(p.name)}" onerror="this.onerror=null;this.src='assets/photo-placeholder.svg'"></div>
      </section>
      <section class="detail-info-card">
        <div class="detail-title-row"><div><div class="detail-category">${esc(p.categoryLabel)}</div><h1>${esc(p.name)}</h1><div class="detail-rating">★ ${displayedRating(p)} <span style="color:#8a9aaa;font-weight:700">· ${revs.length} ${plural(revs.length,'отзыв','отзыва','отзывов')}</span></div></div><button class="favorite-btn ${fav?'active':''}" style="position:static;width:46px;height:46px;font-size:24px" data-action="favorite" data-id="${esc(p.id)}" aria-label="Добавить в избранное">${fav?'♥':'♡'}</button></div>
        <div class="detail-stats"><span class="detail-stat">⌖ ${esc(p.address)}, Элиста</span><span class="detail-stat">◷ ${esc(p.hours)}</span><span class="detail-stat">₽ ${esc(p.priceLabel)}</span></div>
        <div class="detail-tags">${p.tags.map(t=>`<span class="mini-tag">${esc(t)}</span>`).join('')}</div>
        <div class="form-footer"><div><button class="button-dark button-small" data-action="visited" data-id="${esc(p.id)}">${visited?'✓ Уже посещено':'Отметить посещение'}</button> <button class="button-outline button-small" data-action="add-collection" data-id="${esc(p.id)}">＋ В коллекцию</button></div><a class="text-link" href="${yandexSearchLink(p)}" target="_blank" rel="noopener">Построить маршрут ↗</a></div>
      </section>
      <div class="detail-content-grid">
        <section class="content-card"><h2>О месте</h2><p>${esc(p.description)}</p><ul class="feature-list">${p.features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul></section>
        <section class="content-card"><h2>Как добраться</h2><p>Найди место на карте города и построй маршрут удобным способом.</p><div class="detail-map"><div id="detail-map" class="map-canvas"></div>${renderMapFallback([p.id],true)}</div><div style="margin-top:12px"><a href="${yandexSearchLink(p)}" target="_blank" rel="noopener" class="button-outline button-small">Открыть в Яндекс Картах ↗</a></div></section>
      </div>
      <section class="review-section"><div class="section-head"><div><div class="section-kicker">Опыт посетителей</div><h2>Отзывы о месте</h2></div><span class="detail-rating">★ ${displayedRating(p)}</span></div>
        <div class="review-list">${revs.length ? revs.map(r=>`<article class="review-item"><div class="review-head"><span class="review-author">${esc(r.author)} ${r.demo?'<small style="color:#97a3b0;font-weight:600">· пример</small>':''}</span><span class="review-date">${esc(r.date || new Date(r.createdAt).toLocaleDateString('ru-RU'))}</span></div><div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div><p class="review-text">${esc(r.text)}</p></article>`).join('') : '<div class="empty-state"><div class="empty-icon">💬</div><h3>Пока нет отзывов</h3><p>Стань первым, кто поделится впечатлением об этом месте.</p></div>'}</div>
        <form class="review-form" id="review-form" data-place-id="${esc(p.id)}"><h3>Оставить отзыв</h3><div class="star-picker" aria-label="Оценка">${[1,2,3,4,5].map(n=>`<button type="button" class="${n<=5?'active':''}" data-action="review-star" data-rating="${n}" aria-label="${n} из 5">★</button>`).join('')}</div><input type="hidden" name="rating" value="5"><label class="field-label">Твоё впечатление<textarea class="text-area" name="text" required minlength="4" maxlength="700" placeholder="Расскажи, что понравилось или что стоит знать другим…"></textarea></label><div class="form-footer"><span class="form-note">Отзыв сохранится в этом браузере.</span><button class="button-dark" type="submit">Опубликовать отзыв →</button></div></form>
      </section>
    </div>`;
    initYandexMap('detail-map',[p.id],'detail-map-fallback');
  }

  function renderServiceReviews() {
    const serviceReviews = store.serviceReviews || [];
    const demoServiceReviews = [
      { id: 's1', author: 'Мария К.', date: '15 марта 2025', rating: 5, text: 'Очень удобный сервис! Нашла классное место для встречи с друзьями за пару минут. Огонёк просто милашка 🔥' },
      { id: 's2', author: 'Алексей В.', date: '2 марта 2025', rating: 4, text: 'Хорошая идея с режимами поиска. Иногда правда не хватает некоторых заведений, но в целом супер.' },
      { id: 's3', author: 'Елена С.', date: '20 февраля 2025', rating: 5, text: 'Обожаю коллекции! Сохраняю места на выходные и потом хожу по списку. Очень удобно.' },
      { id: 's4', author: 'Дмитрий П.', date: '10 февраля 2025', rating: 5, text: 'Наконец-то не надо гуглить "куда сходить в Элисте". Всё в одном месте, с тегами и картой.' },
      { id: 's5', author: 'Ольга Н.', date: '28 января 2025', rating: 4, text: 'Понравился дизайн и то, как всё устроено. Было бы здорово видеть больше отзывов на места от реальных людей.' },
      { id: 's6', author: 'Иван Р.', date: '15 января 2025', rating: 5, text: 'Режим "Рандом" — это гениально. Открыл для себя пару мест, о которых даже не знал.' },
      { id: 's7', author: 'Анастасия Л.', date: '5 января 2025', rating: 5, text: 'Сайт очень лёгкий и приятный. Маскот поднимает настроение каждый раз, когда заходишь.' }
    ];
    
    const allReviews = [...demoServiceReviews, ...serviceReviews].sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));

    app.innerHTML = `<div class="page-wrap">
      <section class="page-heading">
        <div>
          <div class="section-kicker">Мнение сообщества</div>
          <h1>Отзывы о сервисе</h1>
          <p>Что говорят люди об ILU QUEST. Оставь свой отзыв — он поможет нам стать лучше.</p>
        </div>
        <div class="heading-mascot">💬</div>
      </section>
      
      <div class="service-reviews-grid">
        <div class="review-list" style="margin-top:0">
          ${allReviews.length ? allReviews.map(r => `
            <article class="review-item">
              <div class="review-head">
                <span class="review-author">${esc(r.author)} ${r.demo || r.id?.startsWith('s') ? '<small style="color:#97a3b0;font-weight:600">· пример</small>' : ''}</span>
                <span class="review-date">${esc(r.date || new Date(r.createdAt).toLocaleDateString('ru-RU'))}</span>
              </div>
              <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
              <p class="review-text">${esc(r.text)}</p>
            </article>
          `).join('') : '<div class="empty-state"><div class="empty-icon">💬</div><h3>Пока нет отзывов</h3><p>Стань первым, кто поделится впечатлением о сервисе.</p></div>'}
        </div>
        
        <div class="review-form" style="margin-top:0; height:max-content">
          <h3>Оставить отзыв о сервисе</h3>
          <form id="service-review-form">
            <div class="star-picker" aria-label="Оценка">
              ${[1,2,3,4,5].map(n => `<button type="button" class="${n <= 5 ? 'active' : ''}" data-action="service-review-star" data-rating="${n}" aria-label="${n} из 5">★</button>`).join('')}
            </div>
            <input type="hidden" name="rating" value="5">
            <label class="field-label">Твоё впечатление
              <textarea class="text-area" name="text" required minlength="4" maxlength="700" placeholder="Расскажи, что понравилось или что можно улучшить…"></textarea>
            </label>
            <div class="form-footer">
              <span class="form-note">Отзыв сохранится в этом браузере.</span>
              <button class="button-dark" type="submit">Опубликовать →</button>
            </div>
          </form>
        </div>
      </div>
    </div>`;
  }

  function accountPlaceCard(p, section = 'favorites') {
    const removeAction = section === 'visited' ? 'remove-visited' : 'favorite';
    return `<article class="account-place"><a href="#/places/${esc(p.id)}"><img src="${esc(p.image)}" alt="${esc(p.name)}" onerror="this.onerror=null;this.src='assets/photo-placeholder.svg'"></a><div class="account-place-body"><strong>${esc(p.name)}</strong><small>★ ${displayedRating(p)} · ${esc(p.categoryLabel)}</small><div class="account-place-actions"><a class="button-soft" href="#/places/${esc(p.id)}">Открыть</a><button class="button-outline" data-action="${removeAction}" data-id="${esc(p.id)}">Убрать</button></div></div></article>`;
  }
  function emptyState(icon, title, text, actionText, action) {
    return `<div class="empty-state"><div class="empty-icon">${icon}</div><h3>${title}</h3><p>${text}</p>${actionText?`<button class="button-dark button-small" data-action="${action}">${actionText}</button>`:''}</div>`;
  }
  function renderAccount(route) {
    const tab = route.params.get('tab') || activeAccountTab || 'favorites';
    activeAccountTab = tab;
    const favs = store.favorites.map(getPlace).filter(Boolean);
    const visited = store.visited.map(getPlace).filter(Boolean);
    const reviews = [...store.reviews].reverse();
    const sections = [
      ['favorites','♡','Мои места'],['visited','✓','Посещённые'],['reviews','☆','Мои отзывы'],['collections','▣','Мои коллекции'],['achievements','✦','Достижения'],['settings','⚙','Настройки']
    ];
    let content = '';
    let heading = 'Избранное';
    if (tab === 'favorites') content = favs.length ? `<div class="account-places">${favs.map(accountPlaceCard).join('')}</div>` : emptyState('♡','Пока пусто','Сохраняй места сердечком — они появятся здесь.','Найти места','go-places');
    else if (tab === 'visited') { heading='Посещённые места'; content = visited.length ? `<div class="account-places">${visited.map(p=>accountPlaceCard(p,'visited')).join('')}</div>` : emptyState('🧭','Путешествие только начинается','Отмечай места, которые уже посетил(а), и собирай свою карту открытий.','Исследовать','go-places'); }
    else if (tab === 'reviews') { heading='Мои отзывы'; content = reviews.length ? `<div class="review-list">${reviews.map(r=>{const p=getPlace(r.placeId);return `<article class="review-item"><div class="review-head"><a class="review-author" href="#/places/${esc(r.placeId)}">${esc(p?.name||'Место')}</a><span class="review-date">${esc(r.date||'Только что')}</span></div><div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div><p class="review-text">${esc(r.text)}</p></article>`}).join('')}</div>` : emptyState('☆','Твои впечатления здесь появятся','Оставь первый отзыв на странице любого места.','Выбрать место','go-places'); }
    else if (tab === 'collections') { heading='Мои коллекции'; content = `<div class="collection-grid">${store.collections.map(c=>`<article class="collection-card"><div class="collection-icon">${c.id==='weekend'?'🌈':'✦'}</div><h3>${esc(c.title)}</h3><p>${c.places.length} ${plural(c.places.length,'место','места','мест')}</p><button class="button-outline button-small" data-action="open-collection" data-id="${esc(c.id)}">Открыть →</button></article>`).join('')}<button class="collection-card collection-add" data-action="create-collection"><span class="plus">＋</span><strong>Создать коллекцию</strong></button></div><div id="collection-detail" style="margin-top:18px"></div>`; }
    else if (tab === 'achievements') { heading='Достижения'; const ach=[['🧭','Исследователь города','Посмотри хотя бы одно место',store.recentlyViewed.length>0],['❤️','Коллекционер','Сохрани 3 места',favs.length>=3],['✍️','Голос города','Оставь первый отзыв',reviews.length>0],['🌿','На свежем воздухе','Отметь посещение парка',visited.some(p=>p.category==='walk')],['✦','Свой маршрут','Собери коллекцию из 3 мест',store.collections.some(c=>c.places.length>=3)],['🔥','Искра любопытства','Открой 5 разных мест',store.recentlyViewed.length>=5]]; content=`<div class="achievement-grid">${ach.map(a=>`<div class="achievement"><div class="medal">${a[0]}</div><strong>${a[1]}</strong><small>${a[3]?'Получено ✓':a[2]}</small></div>`).join('')}</div>`; }
    else {
      heading='Настройки профиля';
      const disabledAttr = store.profile.authorized ? '' : 'disabled';
      const authNote = store.profile.authorized
        ? ''
        : '<p class="form-note" style="margin-top:8px;color:#c0392b">Ты не авторизован(а). Пока имя — «Исследователь». Войди, чтобы изменить профиль.</p>';
      content=`<form id="profile-form" class="profile-edit-form"><label class="field-label">Имя<input class="text-input" name="name" maxlength="32" value="${esc(store.profile.name)}" required ${disabledAttr}></label><label class="field-label">О себе<input class="text-input" name="note" maxlength="80" value="${esc(store.profile.note)}" ${disabledAttr}></label><div class="field-full"><button type="submit" class="button-dark" ${disabledAttr}>Сохранить профиль</button></div></form>${authNote}<div style="margin-top:28px"><button class="button-outline button-small" data-action="clear-local">Очистить локальные данные</button><p class="form-note" style="margin-top:8px">Это удалит избранное, коллекции, отзывы и настройки из текущего браузера.</p></div>`;
    }
    const totalCount = favs.length + visited.length + reviews.length;
    app.innerHTML = `<div class="page-wrap"><section class="account-hero"><div><div class="section-kicker">Твоя личная территория</div><h1>Привет,<br>${esc(store.profile.name)}!</h1><p>${esc(store.profile.note)} · уже ${totalCount} ${plural(totalCount,'активность','активности','активностей')}</p></div><div class="account-mascot">🔥</div></section><div class="account-layout"><aside class="account-sidebar"><div class="profile-summary"><div class="profile-avatar">🔥</div><div><strong>${esc(store.profile.name)}</strong><small>Исследователь города ✦</small></div></div><nav class="account-menu">${sections.map(s=>`<button class="${tab===s[0]?'active':''}" data-action="account-tab" data-tab="${s[0]}">${s[1]} &nbsp; ${s[2]}</button>`).join('')}</nav></aside><section class="account-content"><div class="account-content-head"><h2>${heading}</h2>${tab==='collections'?'<button class="button-dark button-small" data-action="create-collection">＋ Создать</button>':''}</div>${content}</section></div></div>`;
  }
  function render() {
    const route = parseRoute();
    setNavActive(route);
    if (route.parts.length === 0 || route.parts[0] === '') renderHome();
    else if (route.parts[0] === 'places' && route.parts.length === 1) { parseCatalogQuery(route); if (route.params.get('view')==='map') catalogState.view='map'; renderCatalog(); }
    else if (route.parts[0] === 'places' && route.parts[1]) renderDetail(route.parts[1]);
    else if (route.parts[0] === 'account') renderAccount(route);
    else if (route.parts[0] === 'reviews') renderServiceReviews();
    else renderHome();
    const av = document.querySelector('.avatar-mini'); if (av) av.textContent = '🔥';
  }
  
  let yandexLoading = null;
  function loadYandexApi() {
    if (window.ymaps) return Promise.resolve(window.ymaps);
    if (yandexLoading) return yandexLoading;
    const key = window.PLACE_QUEST_CONFIG?.yandexMapsApiKey?.trim();
    if (!key) return Promise.reject(new Error('Yandex Maps API key is missing'));
    yandexLoading = new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=`https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(key)}&lang=ru_RU`;
      script.async=true;
      script.onload=()=>window.ymaps.ready(()=>resolve(window.ymaps));
      script.onerror=()=>reject(new Error('Yandex Maps API failed to load'));
      document.head.appendChild(script);
    });
    return yandexLoading;
  }
  const geocodeCache = new Map();
  async function resolveCoordinates(place, ymaps) {
    if (Number.isFinite(place.lat) && Number.isFinite(place.lon)) return [place.lat,place.lon];
    if (geocodeCache.has(place.id)) return geocodeCache.get(place.id);
    const cached = localStorage.getItem(`pq_geo_${place.id}`);
    if (cached) { try { const coords=JSON.parse(cached); geocodeCache.set(place.id,coords); return coords; } catch {} }
    const result = await ymaps.geocode(`${place.address}, Элиста, Республика Калмыкия, Россия`, { results: 1 });
    const first = result.geoObjects.get(0);
    if (!first) throw new Error(`Address not found: ${place.name}`);
    const coords = first.geometry.getCoordinates();
    geocodeCache.set(place.id,coords);
    try { localStorage.setItem(`pq_geo_${place.id}`,JSON.stringify(coords)); } catch {}
    return coords;
  }
  async function initYandexMap(containerId, ids, fallbackId) {
    const container=document.getElementById(containerId);
    const fallback=document.getElementById(fallbackId);
    if (!container || !fallback) return;
    if (!window.PLACE_QUEST_CONFIG?.yandexMapsApiKey?.trim()) return;
    try {
      const ymaps=await loadYandexApi();
      if (!document.getElementById(containerId)) return;
      if (mapRegistry.has(containerId)) { try { mapRegistry.get(containerId).destroy(); } catch {} mapRegistry.delete(containerId); }
      const map=new ymaps.Map(containerId,{center:[46.3077,44.2558],zoom:13,controls:['zoomControl','fullscreenControl','geolocationControl']},{suppressMapOpenBlock:true});
      mapRegistry.set(containerId,map);
      const geoObjects=[];
      for (const id of ids) {
        const place=getPlace(id); if (!place) continue;
        try {
          const coords=await resolveCoordinates(place,ymaps);
          if (!document.getElementById(containerId)) { map.destroy(); return; }
          const balloon=`<div style="font-family:Arial,sans-serif;min-width:170px"><b>${esc(place.name)}</b><br><span style="color:#65758a;font-size:12px">${esc(place.address)}</span><br><b>★ ${place.rating.toFixed(1)} · ${esc(place.priceLabel)}</b><br><a href="#/places/${encodeURIComponent(place.id)}" onclick="window.placeQuestNavigate('/places/${encodeURIComponent(place.id)}');return false;">Подробнее о месте →</a></div>`;
          const preset=place.category==='food'?'islands#orangeCircleDotIcon':place.category==='fun'?'islands#blueCircleDotIcon':'islands#greenCircleDotIcon';
          const marker=new ymaps.Placemark(coords,{balloonContent:balloon,iconCaption:place.name},{preset});
          map.geoObjects.add(marker); geoObjects.push(marker);
        } catch (err) { console.warn('ILU QUEST geocoding skipped:',place.name,err); }
        await new Promise(r=>setTimeout(r,120));
      }
      if (geoObjects.length) {
        if (geoObjects.length===1) map.setCenter(geoObjects[0].geometry.getCoordinates(),16);
        else map.setBounds(map.geoObjects.getBounds(),{checkZoomRange:true,zoomMargin:35});
        fallback.style.display='none';
      } else {
        fallback.querySelector('p').textContent='Не удалось определить координаты мест. Проверь адреса и попробуй снова.';
      }
    } catch (err) {
      console.warn('ILU QUEST map fallback:',err);
      fallback.style.display='grid';
    }
  }
  window.placeQuestNavigate = path => go(path);

  document.addEventListener('click', event => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;
    if (action === 'home-mode') { homeMode=actionEl.dataset.mode; render(); }
    else if (action === 'home-tag') { const t=actionEl.dataset.tag; homeTags=homeTags.includes(t)?homeTags.filter(x=>x!==t):[...homeTags,t]; render(); }
    else if (action === 'home-search') {
      if (homeMode === 'random' || homeMode === 'discover') {
        const pool = homeMode === 'discover' ? [...places].sort((a,b)=>b.rating-a.rating).slice(0,6) : places;
        const pick = pool[Math.floor(Math.random()*pool.length)];
        go(`/places/${pick.id}`);
        return;
      }
      const tags = [...homeTags];
      let category = 'all';
      if (homeMode === 'solo' && !tags.length) tags.push('вай-фай');
      if (homeMode === 'company' && !tags.length) category = 'fun';
      catalogState={...catalogState,query:'',category,tags,sort:'recommended',price:'any',view:'list'};
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category',category);
      if (tags.length) params.set('tags',tags.join(','));
      go('/places'+(params.toString()?`?${params.toString()}`:''));
    }
    else if (action === 'favorite') { event.preventDefault(); event.stopPropagation(); toggleFavorite(actionEl.dataset.id); }
    else if (action === 'category') { catalogState.category=actionEl.dataset.category; render(); }
    else if (action === 'catalog-tag') { const t=actionEl.dataset.tag; catalogState.tags=catalogState.tags.includes(t)?catalogState.tags.filter(x=>x!==t):[...catalogState.tags,t]; render(); }
    else if (action === 'catalog-view') { catalogState.view=actionEl.dataset.view; render(); }
    else if (action === 'clear-filters') { catalogState={query:'',category:'all',tags:[],sort:'recommended',price:'any',view:'list'}; render(); }
    else if (action === 'show-popular') { catalogState={...catalogState,category:'all',sort:'rating',view:'list'}; go('/places?sort=rating'); }
    else if (action === 'start-quest') { window.location.href = 'coming-soon.html'; }
    else if (action === 'visited') { const id=actionEl.dataset.id; store.visited=store.visited.includes(id)?store.visited.filter(x=>x!==id):[...store.visited,id]; saveStore(); showToast(store.visited.includes(id)?'Добавлено в посещённые ✓':'Убрано из посещённых'); render(); }
    else if (action === 'remove-visited') { store.visited=store.visited.filter(x=>x!==actionEl.dataset.id); saveStore(); render(); showToast('Убрано из посещённых'); }
    else if (action === 'add-collection') { const id=actionEl.dataset.id; const place=getPlace(id); if(!place)return; const title=window.prompt('В какую коллекцию добавить место? Введи название:',store.collections[0]?.title||'Мои находки'); if(!title)return; let col=store.collections.find(c=>c.title.toLowerCase()===title.trim().toLowerCase()); if(!col){col={id:`collection-${Date.now()}`,title:title.trim(),places:[]};store.collections.push(col);} if(!col.places.includes(id))col.places.push(id); saveStore();showToast(`«${place.name}» добавлено в «${col.title}»`); }
    else if (action === 'account-tab') { activeAccountTab=actionEl.dataset.tab; go(`/account?tab=${encodeURIComponent(activeAccountTab)}`); }
    else if (action === 'go-places') go('/places');
    else if (action === 'create-collection') { const title=window.prompt('Название новой коллекции:'); if(!title||!title.trim())return; store.collections.push({id:`collection-${Date.now()}`,title:title.trim(),places:[]});saveStore();activeAccountTab='collections';render();showToast('Коллекция создана ✦'); }
    else if (action === 'open-collection') { const col=store.collections.find(c=>c.id===actionEl.dataset.id); const target=document.getElementById('collection-detail'); if(!col||!target)return; const items=col.places.map(getPlace).filter(Boolean); target.innerHTML=`<div class="section-head"><div><h2>${esc(col.title)}</h2><p>${items.length} ${plural(items.length,'место','места','мест')}</p></div><button class="button-outline button-small" data-action="delete-collection" data-id="${esc(col.id)}">Удалить коллекцию</button></div>${items.length?`<div class="account-places">${items.map(accountPlaceCard).join('')}</div>`:emptyState('✦','Коллекция пока пустая','Добавляй места со страниц заведений.','','')}`; }
    else if (action === 'delete-collection') { if(!confirm('Удалить эту коллекцию?'))return; store.collections=store.collections.filter(c=>c.id!==actionEl.dataset.id);saveStore();render(); }
    else if (action === 'review-star') { const form=actionEl.closest('form'); if(!form)return;const n=Number(actionEl.dataset.rating);form.querySelector('[name="rating"]').value=String(n);form.querySelectorAll('[data-action="review-star"]').forEach(b=>b.classList.toggle('active',Number(b.dataset.rating)<=n)); }
    else if (action === 'service-review-star') { const form=actionEl.closest('form'); if(!form)return;const n=Number(actionEl.dataset.rating);form.querySelector('[name="rating"]').value=String(n);form.querySelectorAll('[data-action="service-review-star"]').forEach(b=>b.classList.toggle('active',Number(b.dataset.rating)<=n)); }
    else if (action === 'clear-local') { if(!confirm('Точно очистить все локальные данные ILU QUEST в этом браузере?'))return; localStorage.removeItem(STORAGE_KEY); Object.keys(localStorage).filter(k=>k.startsWith('pq_geo_')).forEach(k=>localStorage.removeItem(k)); store=structuredClone(DEFAULT_STORE);render();showToast('Локальные данные очищены'); }
    else if (action === 'mobile-menu') { const nav=document.querySelector('.main-nav'); if(nav){const visible=nav.style.display==='flex';nav.style.display=visible?'none':'flex';nav.style.position=visible?'':'absolute';nav.style.top=visible?'':'68px';nav.style.left=visible?'':'0';nav.style.right=visible?'':'0';nav.style.padding=visible?'':'18px';nav.style.background=visible?'':'white';nav.style.flexDirection=visible?'':'column';nav.style.alignItems=visible?'':'flex-start';nav.style.boxShadow=visible?'':'0 12px 22px #102d521a';} }
  });
  document.addEventListener('change', event => {
    const el=event.target;
    if(el.dataset.action==='catalog-sort'){catalogState.sort=el.value;render();}
    if(el.dataset.action==='catalog-price'){catalogState.price=el.value;render();}
  });
  document.addEventListener('input', event => {
    const el=event.target;
    if(el.dataset.action==='catalog-search'){
      catalogState.query=el.value;
      const start=el.selectionStart;
      clearTimeout(searchTimer);
      searchTimer=setTimeout(()=>{
        renderCatalog();
        const next=document.getElementById('catalog-search'); if(next){next.focus();next.setSelectionRange(start,start);}
      },180);
    }
  });
  document.addEventListener('submit', event => {
    if(event.target.id==='review-form'){
      event.preventDefault();const form=event.target;const id=form.dataset.placeId;const text=form.elements.text.value.trim();const rating=Number(form.elements.rating.value);
      if(text.length<4){showToast('Добавь немного больше впечатлений.');return;}
      const authorName = store.profile.authorized ? (store.profile.name || 'Исследователь') : 'Исследователь';
      store.reviews.push({id:`review-${Date.now()}`,placeId:id,author:authorName,date:new Date().toLocaleDateString('ru-RU'),createdAt:new Date().toISOString(),rating,text});saveStore();showToast('Спасибо! Отзыв сохранён в этом браузере ✨');renderDetail(id);document.querySelector('.review-section')?.scrollIntoView({behavior:'smooth'});
    }
    if(event.target.id==='service-review-form'){
      event.preventDefault();const form=event.target;const text=form.elements.text.value.trim();const rating=Number(form.elements.rating.value);
      if(text.length<4){showToast('Добавь немного больше впечатлений.');return;}
      const authorName = store.profile.authorized ? (store.profile.name || 'Исследователь') : 'Исследователь';
      store.serviceReviews.push({id:`service-review-${Date.now()}`,author:authorName,date:new Date().toLocaleDateString('ru-RU'),createdAt:new Date().toISOString(),rating,text});saveStore();showToast('Спасибо за отзыв о сервисе! ✨');renderServiceReviews();
    }
    if(event.target.id==='profile-form'){
      event.preventDefault();const form=event.target;
      if (!store.profile.authorized) { showToast('Войди, чтобы изменить профиль.'); return; }
      store.profile.name=form.elements.name.value.trim()||'Исследователь';store.profile.note=form.elements.note.value.trim();saveStore();render();showToast('Профиль обновлён ✨');
    }
  });
  window.addEventListener('hashchange', () => { render(); window.scrollTo({top:0,behavior:'smooth'}); });
  render();
})();