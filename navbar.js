// =========================
// navbar.js (defensive, combined handlers + custom overlay scrollbar)
// =========================

document.addEventListener('DOMContentLoaded', () => {
  // =========================
  // Hide navbar on scroll + show-scrollbar logic
  // =========================
  const nav = document.querySelector('.nav');
  let lastScrollTop = 0;
  let scrollbarTimeout;

  // --- Custom overlay scrollbar element ---
  // This creates a lightweight custom scrollbar thumb that fades in on scroll
  // and fades out after a short delay. It mirrors the project's existing thumb
  // styling (keeps colors) and avoids relying on browser-specific pseudo-elements.
  const createCustomScrollbar = () => {
    const existing = document.querySelector('.custom-scrollbar');
    if (existing) return existing;

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-scrollbar';
    wrapper.setAttribute('aria-hidden', 'true');

    const thumb = document.createElement('div');
    thumb.className = 'custom-scrollbar-thumb';

    wrapper.appendChild(thumb);
    document.body.appendChild(wrapper);
    return wrapper;
  };

  const scrollbar = createCustomScrollbar();
  const thumb = scrollbar.querySelector('.custom-scrollbar-thumb');

  // Update thumb size and position based on the document scroll state.
  const updateCustomScrollbar = () => {
    const doc = document.documentElement;
    const body = document.body;
    const scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
    const viewportH = window.innerHeight;
    const docH = Math.max(
      body.scrollHeight, doc.scrollHeight,
      body.offsetHeight, doc.offsetHeight,
      body.clientHeight, doc.clientHeight
    );

    if (docH <= viewportH) {
      // No scrollbar needed for short pages
      scrollbar.style.opacity = '0';
      scrollbar.style.pointerEvents = 'none';
      return;
    }

    // Track height equals viewport height minus a small gap so thumb never touches edges
    const trackHeight = viewportH;
    const minThumbHeight = Math.max(24, Math.round(viewportH * 0.05)); // at least 24px or 5% of viewport
    const thumbHeight = Math.max(minThumbHeight, Math.round((viewportH / docH) * trackHeight));
    const maxThumbTop = trackHeight - thumbHeight;
    const scrollRatio = scrollTop / (docH - viewportH);
    const thumbTop = Math.round(scrollRatio * maxThumbTop);

    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${thumbTop}px)`;
  };

  const showCustomScrollbar = () => {
    scrollbar.classList.add('visible');
    scrollbar.style.opacity = '1';
    scrollbar.style.pointerEvents = 'none'; // keep it non-interactive (visual only)
    clearTimeout(scrollbarTimeout);
    scrollbarTimeout = setTimeout(() => {
      scrollbar.classList.remove('visible');
      scrollbar.style.opacity = '0';
    }, 900); // fade out after 900ms of inactivity
  };

  // Initial sizing
  updateCustomScrollbar();

  window.addEventListener('resize', () => {
    updateCustomScrollbar();
  }, { passive: true });

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // hide/show navbar if present
    if (nav) {
      if (scrollTop > lastScrollTop && scrollTop > 20) {
        nav.style.top = `-${nav.offsetHeight}px`; // hide navbar
      } else {
        nav.style.top = '0'; // show navbar
      }
    }

    // native show-scrollbar class (keeps legacy behavior for browsers supporting ::-webkit-scrollbar)
    document.body.classList.add('show-scrollbar');
    clearTimeout(window._nav_show_scrollbar_timeout);
    window._nav_show_scrollbar_timeout = setTimeout(() => {
      document.body.classList.remove('show-scrollbar');
    }, 800);

    // update and show custom scrollbar
    updateCustomScrollbar();
    showCustomScrollbar();

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }, { passive: true });

  // =========================
  // Accordion
  // =========================
  document.querySelectorAll('.accordion-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      if (!content) return;
      content.classList.toggle('open');

      // Toggle arrow character safely using textContent
      const text = btn.textContent || '';
      if (text.includes('▾')) {
        btn.textContent = text.replace('▾', '▸');
      } else if (text.includes('▸')) {
        btn.textContent = text.replace('▸', '▾');
      }
    });
  });

  // =========================
  // Sidebar Collapse (defensive)
  // =========================
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarToggle');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      document.body.classList.toggle('sidebar-collapsed');

      // update aria-expanded if present
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', (!expanded).toString());
    });
  }

  // Also update custom scrollbar once on load (in case of anchor linking)
  requestAnimationFrame(updateCustomScrollbar);
});
