// Site-wide UI behaviour: header state, menus, overlays, reveals, newsletter.

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

/* ---------- body scroll lock shared by overlays ---------- */
let locks = 0;
export function lock(on: boolean) {
  locks = Math.max(0, locks + (on ? 1 : -1));
  document.body.classList.toggle('is-locked', locks > 0);
}

/* ---------- focus trap for dialogs ---------- */
export function trapFocus(el: HTMLElement) {
  const handler = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const f = $$<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', el)
      .filter((n) => n.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  el.addEventListener('keydown', handler);
  return () => el.removeEventListener('keydown', handler);
}

/* ---------- header: solid after scrolling past the hero top ---------- */
const header = $('[data-header]');
if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- mobile menu ---------- */
const menu = $('[data-menu]');
const menuBtn = $('[data-menu-open]');
if (menu && menuBtn) {
  let release = () => {};
  const open = () => {
    menu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    lock(true);
    release = trapFocus(menu);
    $<HTMLElement>('[data-menu-close]', menu)?.focus();
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
  menu.addEventListener('keydown', (e) => e.key === 'Escape' && close());
  window.matchMedia('(min-width: 901px)').addEventListener('change', (m) => m.matches && close());
}

/* ---------- reveal on scroll ---------- */
const revealables = $$('.reveal, .reveal-img');
if ('IntersectionObserver' in window && revealables.length) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  revealables.forEach((el) => io.observe(el));
} else {
  revealables.forEach((el) => el.classList.add('is-in'));
}

/* ---------- toast ---------- */
const toastEl = $('[data-toast]');
let toastTimer: number | undefined;
export function toast(msg: string) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('is-on');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.classList.remove('is-on'), 2600);
}

/* ---------- newsletter ---------- */
$$<HTMLFormElement>('[data-newsletter]').forEach((form) => {
  form.addEventListener('submit', async (e) => {
    const input = form.querySelector<HTMLInputElement>('input[type=email]')!;
    const msg = form.querySelector<HTMLElement>('[data-newsletter-msg]');
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
    e.preventDefault();
    if (!valid) {
      input.setAttribute('aria-invalid', 'true');
      if (msg) msg.textContent = 'Enter a valid email address.';
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    if (form.getAttribute('action')) {
      try {
        await fetch(form.action, { method: 'POST', body: new FormData(form), mode: 'no-cors' });
      } catch {
        if (msg) msg.textContent = 'Something went wrong. Try again.';
        return;
      }
    }
    form.reset();
    if (msg) msg.textContent = "You're in the lane. Watch your inbox.";
  });
});
