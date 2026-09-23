/* ==========================================================================
   LANE CHANGE — theme behaviour
   Cart drawer (Shopify AJAX Cart API), predictive search, variant picker,
   wishlist, menus and scroll reveals. No dependencies.
   ========================================================================== */
(() => {
  'use strict';

  const LC = window.LC || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  /* ---------------------------------------------------------------- money */
  function formatMoney(cents) {
    const format = LC.moneyFormat || '${{amount}}';
    const value = (Number(cents) || 0) / 100;
    const fmt = (n, dec, thousands = ',', decimal = '.') => {
      const [i, d] = n.toFixed(dec).split('.');
      return i.replace(/\B(?=(\d{3})+(?!\d))/g, thousands) + (d ? decimal + d : '');
    };
    const out = format.replace(/\{\{\s*(\w+)\s*\}\}/, (_, key) => {
      switch (key) {
        case 'amount_no_decimals': return fmt(value, 0);
        case 'amount_with_comma_separator': return fmt(value, 2, '.', ',');
        case 'amount_no_decimals_with_comma_separator': return fmt(value, 0, '.', ',');
        case 'amount_with_apostrophe_separator': return fmt(value, 2, "'", '.');
        default: return fmt(value, 2);
      }
    }).replace(/[.,]00(?!\d)/, '');
    const plain = out.replace(/<[^>]+>/g, '');
    return LC.showCurrency && LC.currency && !plain.includes(LC.currency) ? `${plain} ${LC.currency}` : plain;
  }

  /* ---------------------------------------------------------------- scroll lock + focus trap */
  let locks = 0;
  const lock = (on) => {
    locks = Math.max(0, locks + (on ? 1 : -1));
    document.body.classList.toggle('is-locked', locks > 0);
  };
  function trapFocus(el) {
    const handler = (e) => {
      if (e.key !== 'Tab') return;
      const f = $$('a[href], button:not([disabled]), input:not([type=hidden]), select, textarea, [tabindex]:not([tabindex="-1"])', el)
        .filter((n) => n.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }

  /* ---------------------------------------------------------------- toast */
  const toastEl = $('[data-toast]');
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2600);
  }

  /* ---------------------------------------------------------------- header */
  const header = $('[data-header]');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------------------------------------------------------- mobile menu */
  const menu = $('[data-menu]');
  const menuBtn = $('[data-menu-open]');
  if (menu && menuBtn) {
    let release = () => {};
    const open = () => {
      menu.hidden = false;
      menuBtn.setAttribute('aria-expanded', 'true');
      lock(true);
      release = trapFocus(menu);
      $('[data-menu-close]', menu)?.focus();
    };
    const close = () => {
      if (menu.hidden) return;
      menu.hidden = true;
      menuBtn.setAttribute('aria-expanded', 'false');
      lock(false);
      release();
      menuBtn.focus();
    };
    menuBtn.addEventListener('click', open);
    $$('[data-menu-close]', menu).forEach((b) => b.addEventListener('click', close));
    document.addEventListener('keydown', (e) => e.key === 'Escape' && close());
    window.matchMedia('(min-width: 901px)').addEventListener('change', (m) => m.matches && close());
  }

  /* ---------------------------------------------------------------- reveals */
  const revealables = $$('.reveal, .reveal-img');
  if ('IntersectionObserver' in window && revealables.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
  }
  // anything revealed later (recommendations, wishlist) gets shown immediately
  const revealNow = (root) => $$('.reveal, .reveal-img', root).forEach((el) => el.classList.add('is-in'));

  /* ================================================================ CART */
  const drawer = $('[data-cart-drawer]');
  const scrim = $('[data-cart-scrim]');
  const itemsEl = $('[data-cart-items]');
  const useDrawer = LC.cartType === 'drawer' && drawer;
  let cart = null;

  async function fetchCart() {
    const res = await fetch(`${LC.routes.cart}.js`, { headers: { Accept: 'application/json' } });
    cart = await res.json();
    renderCart();
    return cart;
  }

  function lineHTML(item, index) {
    const img = item.image ? `${item.image}${item.image.includes('?') ? '&' : '?'}width=240` : '';
    const variant = item.product_has_only_default_variant ? '' : `<p class="micro muted">${esc(item.variant_title || '')}</p>`;
    return `
      <li class="cart-line" data-line="${index + 1}" data-qty-now="${item.quantity}">
        <a class="cart-line__img" href="${esc(item.url)}">${img ? `<img src="${esc(img)}" alt="${esc(item.product_title)}" width="84" height="105" loading="lazy">` : ''}</a>
        <div class="cart-line__info">
          <a class="cart-line__name" href="${esc(item.url)}">${esc(item.product_title)}</a>
          ${variant}
          <div class="qty" role="group" aria-label="Quantity">
            <button type="button" data-qty="-1" aria-label="Decrease quantity">−</button>
            <span aria-live="polite">${item.quantity}</span>
            <button type="button" data-qty="1" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="cart-line__end">
          <p class="micro">${formatMoney(item.final_line_price)}</p>
          <button type="button" class="micro muted u-link" data-remove>${esc(LC.strings.remove)}</button>
        </div>
      </li>`;
  }

  function renderCart() {
    if (!cart) return;
    const count = cart.item_count;
    $$('[data-cart-count], [data-cart-count-inline]').forEach((el) => (el.textContent = `(${count})`));
    $$('[data-cart-open]').forEach((el) => el.classList.toggle('has-items', count > 0));
    $$('[data-cart-subtotal]').forEach((el) => (el.textContent = formatMoney(cart.total_price)));

    const ship = $('[data-ship-progress]');
    if (ship && LC.freeShipping > 0) {
      const left = LC.freeShipping - cart.total_price;
      $('[data-ship-text]', ship).textContent = left > 0
        ? LC.strings.freeShippingAway.replace('[amount]', formatMoney(left))
        : LC.strings.freeShippingUnlocked;
      $('[data-ship-bar]', ship).style.width = `${Math.min(100, (cart.total_price / LC.freeShipping) * 100)}%`;
    }
    if (drawer) drawer.classList.toggle('is-empty', count === 0);
    if (itemsEl) itemsEl.innerHTML = cart.items.map(lineHTML).join('');
  }

  async function changeLine(line, quantity) {
    const res = await fetch(`${LC.routes.cartChange}.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ line, quantity }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast(err.description || LC.strings.error);
      return fetchCart();
    }
    cart = await res.json();
    renderCart();
  }

  itemsEl?.addEventListener('click', async (e) => {
    const li = e.target.closest('.cart-line');
    if (!li) return;
    const line = Number(li.dataset.line);
    const now = Number(li.dataset.qtyNow);
    if (e.target.closest('[data-remove]')) {
      await changeLine(line, 0);
      $('[data-cart-close]', drawer)?.focus();
      return;
    }
    const q = e.target.closest('[data-qty]');
    if (q) {
      const dir = q.dataset.qty;
      await changeLine(line, Math.max(0, now + Number(dir)));
      ($(`.cart-line[data-line="${line}"] [data-qty="${dir}"]`, itemsEl) || $('[data-cart-close]', drawer))?.focus();
    }
  });

  let releaseCart = () => {};
  let lastFocus = null;
  function openCart() {
    if (!drawer || !drawer.hidden) return;
    lastFocus = document.activeElement;
    drawer.hidden = false; scrim.hidden = false;
    requestAnimationFrame(() => { drawer.classList.add('is-open'); scrim.classList.add('is-open'); });
    lock(true);
    releaseCart = trapFocus(drawer);
    $('[data-cart-close]', drawer)?.focus();
  }
  function closeCart() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove('is-open'); scrim.classList.remove('is-open');
    lock(false);
    releaseCart();
    setTimeout(() => { drawer.hidden = true; scrim.hidden = true; }, 450);
    lastFocus?.focus();
  }
  if (useDrawer) {
    $$('[data-cart-open]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); openCart(); }));
    $$('[data-cart-close]').forEach((b) => b.addEventListener('click', closeCart));
    scrim?.addEventListener('click', closeCart);
    document.addEventListener('keydown', (e) => e.key === 'Escape' && closeCart());
    fetchCart();
  }

  // cart page: quantity inputs submit the form
  const cartPage = $('[data-cart-page]');
  cartPage?.addEventListener('change', (e) => {
    if (e.target.matches('.qty__input')) cartPage.requestSubmit ? cartPage.requestSubmit() : cartPage.submit();
  });

  /* ================================================================ PRODUCT */
  $$('[data-product-section]').forEach((section) => {
    const form = $('[data-product-form]', section);
    const jsonEl = section.parentElement.querySelector('[data-product-json]') || $('[data-product-json]');
    if (!form || !jsonEl) return;
    const product = JSON.parse(jsonEl.textContent);
    const idInput = $('[data-variant-id]', form);
    const msg = $('[data-buy-msg]', form);
    const addBtn = $('[data-add-button]', form);
    const priceEl = $('[data-price]', section);

    const selected = () => {
      const opts = [];
      product.options.forEach((_, i) => {
        const fixed = $(`[data-option-fixed][data-option-index="${i}"]`, form);
        const checked = $(`input[type=radio][data-option-index="${i}"]:checked`, form);
        opts[i] = fixed ? fixed.value : checked ? checked.value : null;
      });
      return opts;
    };
    const findVariant = (opts) => product.variants.find((v) => v.options.every((o, i) => opts[i] === o));

    form.addEventListener('change', (e) => {
      const t = e.target;
      if (!t.matches('input[type=radio][data-option-index]')) return;
      const group = t.closest('[data-option-group]');
      const label = group && $('[data-option-label]', group);
      if (label) label.textContent = `— ${t.value}`;
      if (msg) msg.textContent = '';
      const v = findVariant(selected());
      if (!v) return;
      idInput.value = v.id;
      if (priceEl) {
        priceEl.innerHTML = formatMoney(v.price) +
          (v.compare_at_price > v.price ? ` <s class="muted">${formatMoney(v.compare_at_price)}</s>` : '');
      }
      if (addBtn) {
        addBtn.disabled = !v.available;
        addBtn.firstChild.textContent = `${v.available ? LC.strings.addToCart : LC.strings.soldOut} `;
      }
      const url = new URL(location.href);
      url.searchParams.set('variant', v.id);
      history.replaceState(null, '', url);
    });

    form.addEventListener('submit', async (e) => {
      const opts = selected();
      if (opts.some((o) => o === null)) {
        e.preventDefault();
        if (msg) msg.textContent = LC.strings.selectSize;
        $('input[type=radio][data-option-index]:not(:disabled)', form)?.focus();
        return;
      }
      const v = findVariant(opts);
      if (v) idInput.value = v.id;
      if (!useDrawer) return; // cart page mode: let the form post normally
      e.preventDefault();
      addBtn?.setAttribute('aria-busy', 'true');
      try {
        const res = await fetch(`${LC.routes.cartAdd}.js`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ items: [{ id: Number(idInput.value), quantity: 1 }] }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          if (msg) msg.textContent = err.description || LC.strings.error;
          return;
        }
        await fetchCart();
        openCart();
      } finally {
        addBtn?.removeAttribute('aria-busy');
      }
    });

    // gallery counter on phones
    const track = $('[data-gallery-track]', section);
    const count = $('[data-gallery-count]', section);
    const label = $('[data-gallery-label]', section);
    if (track && count && label) {
      const shots = Array.from(track.children);
      const pad = (n) => String(n).padStart(2, '0');
      label.textContent = shots[0]?.dataset.view || '';
      track.addEventListener('scroll', () => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        count.textContent = `${pad(i + 1)} / ${pad(shots.length)}`;
        label.textContent = shots[i]?.dataset.view || '';
      }, { passive: true });
    }

    // size guide
    const guide = section.parentElement.querySelector('[data-guide]');
    $('[data-size-guide]', section)?.addEventListener('click', () => guide?.showModal());
    guide?.querySelector('[data-guide-close]')?.addEventListener('click', () => guide.close());
    guide?.addEventListener('click', (e) => e.target === guide && guide.close());
  });

  /* recommendations are rendered by Shopify's section API */
  $$('[data-recommendations]').forEach(async (el) => {
    if (el.children.length) return;
    try {
      const html = await (await fetch(el.dataset.url)).text();
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const fresh = tmp.querySelector('[data-recommendations]');
      if (fresh && fresh.innerHTML.trim()) {
        el.innerHTML = fresh.innerHTML;
        revealNow(el);
        syncWish();
      }
    } catch { /* recommendations are optional */ }
  });

  /* collection sort */
  $$('[data-sort]').forEach((sel) => sel.addEventListener('change', () => {
    const url = new URL(location.href);
    url.searchParams.set('sort_by', sel.value);
    url.searchParams.delete('page');
    location.href = url.toString();
  }));

  /* ================================================================ SEARCH */
  const search = $('[data-search]');
  const sInput = $('[data-search-input]');
  const sResults = $('[data-search-results]');
  let releaseSearch = () => {};
  function openSearch(e) {
    if (!search) return;
    e?.preventDefault();
    lastFocus = document.activeElement;
    search.hidden = false;
    lock(true);
    releaseSearch = trapFocus(search);
    sInput?.focus();
  }
  function closeSearch() {
    if (!search || search.hidden) return;
    search.hidden = true;
    lock(false);
    releaseSearch();
    lastFocus?.focus();
  }
  $$('[data-search-open]').forEach((b) => b.addEventListener('click', openSearch));
  $$('[data-search-close]', search || document).forEach((b) => b.addEventListener('click', closeSearch));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
    if (e.key === '/' && !e.target.closest('input, textarea, select')) openSearch(e);
  });
  let searchTimer;
  let searchController;
  sInput?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      const q = sInput.value.trim();
      if (!q) { sResults.innerHTML = ''; return; }
      searchController?.abort();
      searchController = new AbortController();
      try {
        const url = `${LC.routes.predictiveSearch}.json?q=${encodeURIComponent(q)}&resources[type]=product&resources[limit]=8`;
        const data = await (await fetch(url, { signal: searchController.signal })).json();
        const items = data?.resources?.results?.products || [];
        sResults.innerHTML = items.length
          ? items.map((p) => `
            <li><a href="${esc(p.url)}">
              ${p.image ? `<img src="${esc(p.image)}${p.image.includes('?') ? '&' : '?'}width=320" alt="${esc(p.title)}" loading="lazy" width="320" height="320">` : ''}
              <span class="micro">${esc(p.title)}</span>
              <span class="micro muted">${formatMoney(Math.round(parseFloat(p.price) * 100))}</span>
            </a></li>`).join('')
          : `<li class="micro muted">${esc(LC.strings.noResults)}</li>`;
      } catch (err) {
        if (err.name !== 'AbortError') sResults.innerHTML = '';
      }
    }, 180);
  });

  /* ================================================================ WISHLIST */
  const WISH_KEY = 'lc-wishlist-v1';
  const loadWish = () => { try { return JSON.parse(localStorage.getItem(WISH_KEY) || '[]'); } catch { return []; } };
  let wish = loadWish();
  const saveWish = () => { try { localStorage.setItem(WISH_KEY, JSON.stringify(wish)); } catch { /* private mode */ } };
  function syncWish() {
    $$('[data-wish]').forEach((b) => {
      const on = wish.includes(b.dataset.wish);
      b.setAttribute('aria-pressed', String(on));
      b.classList.toggle('is-on', on);
    });
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-wish]');
    if (!b) return;
    e.preventDefault();
    const h = b.dataset.wish;
    wish = wish.includes(h) ? wish.filter((x) => x !== h) : [...wish, h];
    saveWish();
    syncWish();
    toast(wish.includes(h) ? LC.strings.savedToWishlist : LC.strings.removedFromWishlist);
    renderWishlist();
  });
  const wishGrid = $('[data-wish-grid]');
  const wishEmpty = $('[data-wish-empty]');
  async function renderWishlist() {
    if (!wishGrid) return;
    const products = (await Promise.all(wish.map((h) =>
      fetch(`${LC.routes.root.replace(/\/$/, '')}/products/${encodeURIComponent(h)}.js`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ))).filter(Boolean);
    wishGrid.innerHTML = products.map((p) => `
      <li>
        <a href="${esc(p.url)}">
          ${p.featured_image ? `<img src="${esc(p.featured_image)}${p.featured_image.includes('?') ? '&' : '?'}width=600" alt="${esc(p.title)}" loading="lazy" width="600" height="600">` : ''}
          <span class="micro">${esc(p.title)}</span>
          <span class="micro muted">${formatMoney(p.price)}</span>
        </a>
        <button class="micro muted u-link wish-remove" type="button" data-wish="${esc(p.handle)}" aria-pressed="true">${esc(LC.strings.remove)}</button>
      </li>`).join('');
    if (wishEmpty) wishEmpty.hidden = products.length > 0;
  }
  syncWish();
  renderWishlist();
  window.addEventListener('storage', (e) => { if (e.key === WISH_KEY) { wish = loadWish(); syncWish(); renderWishlist(); } });

  // theme editor: re-run reveals when sections reload
  document.addEventListener('shopify:section:load', (e) => revealNow(e.target));
})();
