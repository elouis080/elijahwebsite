// =========================
// navbar.js (defensive, combined handlers)
// =========================

document.addEventListener('DOMContentLoaded', () => {
  // =========================
  // Hide navbar on scroll + show-scrollbar logic
  // =========================
  const nav = document.querySelector('.nav');
  let lastScrollTop = 0;
  let scrollbarTimeout;

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

    // scrollbar visibility toggling
    document.body.classList.add('show-scrollbar');
    clearTimeout(scrollbarTimeout);
    scrollbarTimeout = setTimeout(() => {
      document.body.classList.remove('show-scrollbar');
    }, 800);

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
});

// Minimal sidebar helper (non-visual, avoids 404s)
// Adds accessible aria-expanded behavior for the sidebar toggle.
// Does not change styling or colors.

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');

  if (!toggle) return;

  // set initial aria-expanded
  const isCollapsed = sidebar && sidebar.classList.contains('collapsed');
  toggle.setAttribute('aria-expanded', (!isCollapsed).toString());

  // update aria-expanded attribute on click (keeps in sync with other scripts)
  toggle.addEventListener('click', () => {
    const current = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', (!current).toString());
  });
});
