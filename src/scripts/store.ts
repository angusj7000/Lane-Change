// Client-side cart, wishlist and search. State lives in localStorage so it
// survives reloads; swap `persist`/`load` for Shopify cart API calls later.
import { lock, trapFocus, toast } from './ui';

export interface CatalogItem {
  slug: string; name: string; colour: string; price: number; priceLabel: string;
  thumb: string; category: string; status: string; keywords: string;
}
export interface CartLine { slug: string; size: string; qty: number }

const CART_KEY = 'lc-cart-v1';
const WISH_KEY = 'lc-wishlist-v1';
const MAX_QTY = 10;

const catalog: CatalogItem[] = JSON.parse(document.getElementById('lc-catalog')?.textContent || '[]');
const bySlug = new Map(catalog.map((p) => [p.slug, p]));

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export const money = (n: number) => `$${n.toFixed(n % 1 ? 2 : 0)} AUD`;

function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || '') ?? fallback; } catch { return fallback; }
}
function persist(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* private mode — keep in memory */ }
}

/* =========================== CART =========================== */
let cart: CartLine[] = load<CartLine[]>(CART_KEY, []).filter((l) => bySlug.has(l.slug));

export const cartApi = {
  lines: () => cart,
  count: () => cart.reduce((n, l) => n + l.qty, 0),
  subtotal: () => cart.reduce((n, l) => n + (bySlug.get(l.slug)?.price ?? 0) * l.qty, 0),
  add(slug: string, size: string, qty = 1) {
    const line = cart.find((l) => l.slug === slug && l.size === size);
    if (line) line.qty = Math.min(MAX_QTY, line.qty + qty);
    else cart.push({ slug, size, qty });
    commit();
  },
  set(slug: string, size: string, qty: number) {
    cart = cart
      .map((l) => (l.slug === slug && l.size === size ? { ...l, qty: Math.min(MAX_QTY, qty) } : l))
      .filter((l) => l.qty > 0);
    commit();
  },
  clear() { cart = []; commit(); },
};

function commit() {
  persist(CART_KEY, cart);
  renderCart();
  document.dispatchEvent(new CustomEvent('lc:cart', { detail: cart }));
}

export function lineHTML(l: CartLine) {
  const p = bySlug.get(l.slug)!;
  return `
  <li class="cart-line" data-slug="${esc(l.slug)}" data-size="${esc(l.size)}">
    <a class="cart-line__img" href="/products/${esc(p.slug)}"><img src="${esc(p.thumb)}" alt="${esc(p.name)} — ${esc(p.colour)}" width="96" height="120" loading="lazy" /></a>
    <div class="cart-line__info">
      <a class="cart-line__name" href="/products/${esc(p.slug)}">${esc(p.name)}</a>
      <p class="micro muted">${esc(p.colour)} / ${esc(l.size)}</p>
      <div class="qty" role="group" aria-label="Quantity">
        <button type="button" data-qty="-1" aria-label="Decrease quantity">−</button>
        <span aria-live="polite">${l.qty}</span>
        <button type="button" data-qty="1" aria-label="Increase quantity" ${l.qty >= MAX_QTY ? 'disabled' : ''}>+</button>
      </div>
    </div>
    <div class="cart-line__end">
      <p class="micro">${money(p.price * l.qty)}</p>
      <button type="button" class="micro muted u-link" data-remove>Remove</button>
    </div>
  </li>`;
}

function bindLineControls(root: HTMLElement) {
  root.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const li = t.closest<HTMLElement>('.cart-line');
    if (!li) return;
    const { slug = '', size = '' } = li.dataset;
    const line = cart.find((l) => l.slug === slug && l.size === size);
    if (!line) return;
    if (t.closest('[data-remove]')) {
      cartApi.set(slug, size, 0);
      root.closest<HTMLElement>('[role=dialog]')?.querySelector<HTMLElement>('[data-cart-close]')?.focus();
    }
    const q = t.closest<HTMLElement>('[data-qty]');
    if (q) {
      cartApi.set(slug, size, line.qty + Number(q.dataset.qty));
      // lines re-render; put focus back on the same control so keyboard users stay in place
      const sel = `.cart-line[data-slug="${CSS.escape(slug)}"][data-size="${CSS.escape(size)}"] [data-qty="${q.dataset.qty}"]`;
      (root.querySelector<HTMLElement>(sel) ?? root.closest<HTMLElement>('[role=dialog]')?.querySelector<HTMLElement>('[data-cart-close]'))?.focus();
    }
  });
}

const drawer = document.querySelector<HTMLElement>('[data-cart-drawer]');
const scrim = document.querySelector<HTMLElement>('[data-cart-scrim]');
const itemsEl = document.querySelector<HTMLElement>('[data-cart-items]');

function renderCart() {
  const count = cartApi.count();
  document.querySelectorAll('[data-cart-count]').forEach((el) => (el.textContent = `(${count})`));
  document.querySelectorAll('[data-cart-count-inline]').forEach((el) => (el.textContent = `(${count})`));
  document.querySelectorAll('[data-cart-open]').forEach((el) =>
    el.setAttribute('aria-label', `Shopping bag, ${count} item${count === 1 ? '' : 's'}`),
  );
  document.querySelectorAll<HTMLElement>('[data-cart-open]').forEach((el) => el.classList.toggle('has-items', count > 0));
  const subtotal = cartApi.subtotal();
  document.querySelectorAll('[data-cart-subtotal]').forEach((el) => (el.textContent = money(subtotal)));

  const ship = document.querySelector<HTMLElement>('[data-ship-progress]');
  if (ship) {
    const threshold = Number(ship.dataset.threshold || 150);
    const left = threshold - subtotal;
    ship.querySelector('[data-ship-text]')!.textContent =
      left > 0 ? `${money(left)} away from free AU shipping` : 'Free AU shipping unlocked';
    (ship.querySelector('[data-ship-bar]') as HTMLElement).style.width = `${Math.min(100, (subtotal / threshold) * 100)}%`;
  }

  drawer?.classList.toggle('is-empty', cart.length === 0);
  if (itemsEl) itemsEl.innerHTML = cart.map(lineHTML).join('');
}

let releaseTrap = () => {};
let lastFocus: HTMLElement | null = null;
export function openCart() {
  if (!drawer || !scrim || !drawer.hidden) return;
  lastFocus = document.activeElement as HTMLElement;
  drawer.hidden = false; scrim.hidden = false;
  requestAnimationFrame(() => { drawer.classList.add('is-open'); scrim.classList.add('is-open'); });
  lock(true);
  releaseTrap = trapFocus(drawer);
  drawer.querySelector<HTMLElement>('[data-cart-close]')?.focus();
}
function closeCart() {
  if (!drawer || !scrim || drawer.hidden) return;
  drawer.classList.remove('is-open'); scrim.classList.remove('is-open');
  lock(false);
  releaseTrap();
  window.setTimeout(() => { drawer.hidden = true; scrim.hidden = true; }, 450);
  lastFocus?.focus();
}
document.querySelectorAll('[data-cart-open]').forEach((b) => b.addEventListener('click', openCart));
document.querySelectorAll('[data-cart-close]').forEach((b) => b.addEventListener('click', closeCart));
scrim?.addEventListener('click', closeCart);
document.addEventListener('keydown', (e) => e.key === 'Escape' && closeCart());
if (itemsEl) bindLineControls(itemsEl);
export { bindLineControls, bySlug, catalog };

/* =========================== WISHLIST =========================== */
let wish: string[] = load<string[]>(WISH_KEY, []).filter((s) => bySlug.has(s));
export const wishApi = {
  has: (s: string) => wish.includes(s),
  list: () => wish,
  toggle(s: string) {
    wish = wish.includes(s) ? wish.filter((x) => x !== s) : [...wish, s];
    persist(WISH_KEY, wish);
    syncWish();
    document.dispatchEvent(new CustomEvent('lc:wish', { detail: wish }));
    return wish.includes(s);
  },
};
function syncWish() {
  document.querySelectorAll<HTMLElement>('[data-wish]').forEach((b) => {
    const on = wish.includes(b.dataset.wish!);
    b.setAttribute('aria-pressed', String(on));
    b.classList.toggle('is-on', on);
  });
}
document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-wish]');
  if (!b) return;
  e.preventDefault();
  const on = wishApi.toggle(b.dataset.wish!);
  const p = bySlug.get(b.dataset.wish!);
  toast(on ? `${p?.name ?? 'Item'} saved to wishlist` : 'Removed from wishlist');
});

/* =========================== SEARCH =========================== */
export function searchCatalog(q: string) {
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return catalog.filter((p) => terms.every((t) => p.keywords.includes(t) || p.keywords.includes(t.replace(/s$/, ''))));
}
export const resultHTML = (p: CatalogItem) => `
  <li><a href="/products/${esc(p.slug)}">
    <img src="${esc(p.thumb)}" alt="${esc(p.name)} — ${esc(p.colour)}" loading="lazy" width="320" height="400" />
    <span class="micro">${esc(p.name)}</span>
    <span class="micro muted">${esc(p.colour)} — ${esc(p.priceLabel)}</span>
  </a></li>`;

const search = document.querySelector<HTMLElement>('[data-search]');
const sInput = document.querySelector<HTMLInputElement>('[data-search-input]');
const sResults = document.querySelector<HTMLElement>('[data-search-results]');
let releaseSearch = () => {};
function openSearch() {
  if (!search) return;
  lastFocus = document.activeElement as HTMLElement;
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
document.querySelectorAll('[data-search-open]').forEach((b) => b.addEventListener('click', openSearch));
search?.querySelectorAll('[data-search-close]').forEach((b) => b.addEventListener('click', closeSearch));
document.addEventListener('keydown', (e) => e.key === 'Escape' && closeSearch());
sInput?.addEventListener('input', () => {
  if (!sResults) return;
  const q = sInput.value;
  const res = searchCatalog(q);
  sResults.innerHTML = q.trim()
    ? res.length ? res.map(resultHTML).join('') : `<li class="micro muted">No results for “${esc(q)}”.</li>`
    : '';
});
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && !(e.target as HTMLElement).closest('input, textarea')) { e.preventDefault(); openSearch(); }
});

/* =========================== boot =========================== */
renderCart();
syncWish();
window.addEventListener('storage', (e) => {
  if (e.key === CART_KEY) { cart = load(CART_KEY, []); renderCart(); }
  if (e.key === WISH_KEY) { wish = load(WISH_KEY, []); syncWish(); }
});
