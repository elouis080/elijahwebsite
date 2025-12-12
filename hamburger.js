// Lightweight, defensive hamburger script — safe to include on every page.
//
// Usage:
// 1) Place <button class="hamburger-toggle" data-controls="site-menu" aria-expanded="false" type="button">☰</button>
// 2) The menu should have id matching data-controls (e.g., <div id="site-menu" class="menu">…</div>)
// 3) Include this script with `defer` on every page: <script src="hamburger.js" defer></script>

(function () {
  'use strict';

  function onDOMReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onDOMReady(function () {
    // Find all toggles on the page (safe to include everywhere)
    var toggles = Array.from(document.querySelectorAll('.hamburger-toggle'));
    if (!toggles.length) return; // nothing to do

    toggles.forEach(function (btn) {
      // Ensure button is accessible and won't submit forms
      if (!btn.hasAttribute('type')) btn.setAttribute('type', 'button');
      if (!btn.hasAttribute('aria-label')) btn.setAttribute('aria-label', 'Toggle menu');

      // Determine controlled menu: data-controls preferred, then aria-controls, then a default id
      var menuId = btn.getAttribute('data-controls') || btn.getAttribute('aria-controls') || btn.dataset.controls;
      if (!menuId) {
        // fallback: try common id
        menuId = 'site-menu';
      }
      var menu = document.getElementById(menuId);

      if (!menu) {
        console.warn('hamburger: menu element not found for toggle', btn, 'expected id:', menuId);
        return;
      }

      // Initialize aria-expanded
      if (!btn.hasAttribute('aria-expanded')) {
        btn.setAttribute('aria-expanded', 'false');
      }

      // Ensure the menu is toggleable via a class, but do not modify inline styles here.
      function setOpen(open) {
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        menu.classList.toggle('open', !!open);
      }

      // Click toggles open state
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var isOpen = btn.getAttribute('aria-expanded') === 'true';
        setOpen(!isOpen);
      });

      // Close the menu if clicking outside (but ignore clicks inside the menu or on the toggle)
      document.addEventListener('click', function (ev) {
        if (btn.getAttribute('aria-expanded') !== 'true') return;
        if (!menu.contains(ev.target) && ev.target !== btn) {
          setOpen(false);
        }
      });

      // Close on Escape
      document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape' || ev.key === 'Esc') {
          setOpen(false);
        }
      });
    });
  });
})();
