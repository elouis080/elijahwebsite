// sidebar.js
// Controls the hamburger sidebar toggle and accordion behavior.
// Safe to include on pages that may not have sidebar elements.

(function () {
  'use strict';

  function qs(selector, ctx = document) { return ctx.querySelector(selector); }
  function qsa(selector, ctx = document) { return Array.from(ctx.querySelectorAll(selector)); }

  document.addEventListener('DOMContentLoaded', function () {
    var sidebar = qs('#sidebar');
    // fallback: prefer #sidebarToggle but accept .sidebar-toggle if id missing
    var toggle = qs('#sidebarToggle') || qs('.sidebar-toggle');
    var accordionHeaders = qsa('.accordion-header');

    // If no sidebar or toggle found, warn and exit.
    if (!sidebar) {
      console.warn('sidebar element not found on this page; sidebar functionality will be disabled.');
      return;
    }
    if (!toggle) {
      console.warn('sidebar toggle not found on this page; sidebar functionality will be disabled.');
      return;
    }

    // Initialize aria-expanded from current class state if not present
    if (!toggle.hasAttribute('aria-expanded')) {
      var expanded = !sidebar.classList.contains('collapsed');
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }

    // Toggle sidebar open/closed
    function setSidebarOpen(isOpen) {
      if (isOpen) {
        sidebar.classList.remove('collapsed');
        toggle.setAttribute('aria-expanded', 'true');
      } else {
        sidebar.classList.add('collapsed');
        toggle.setAttribute('aria-expanded', 'false');
      }
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setSidebarOpen(!isOpen);
    });

    // Close sidebar when clicking outside it (but ignore clicks on the toggle)
    document.addEventListener('click', function (e) {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (!isOpen) return;
      if (!sidebar.contains(e.target) && e.target !== toggle) {
        setSidebarOpen(false);
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        setSidebarOpen(false);
      }
    });

   // Accordion behavior for headers
accordionHeaders.forEach(function (header) {
  // content is expected to be the nested .accordion-content inside the same list item
  var li = header.closest('li');
  if (!li) return;
  var content = li.querySelector('.accordion-content');
  if (!content) return;

  // Ensure ARIA attributes exist
  var contentId = content.id || ('accordion-content-' + Math.random().toString(36).slice(2, 9));
  content.id = contentId;

  if (!header.hasAttribute('aria-controls')) header.setAttribute('aria-controls', contentId);
  if (!header.hasAttribute('aria-expanded')) header.setAttribute('aria-expanded', 'false');

  // Ensure CSS-driven state: use the .open class to show/hide content (styles.css provides .accordion-content.open)
  // Initialize state: remove hidden attribute to avoid conflicts, and set .open if aria says expanded
  content.removeAttribute('hidden');
  if (header.getAttribute('aria-expanded') === 'true') {
    content.classList.add('open');
  } else {
    content.classList.remove('open');
  }

  function toggleAccordion() {
    var expanded = header.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      header.setAttribute('aria-expanded', 'false');
      content.classList.remove('open');
      // allow CSS transition to collapse
      content.style.maxHeight = null;
    } else {
      header.setAttribute('aria-expanded', 'true');
      content.classList.add('open');
      // optional: set explicit maxHeight to allow smooth transition if desired
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  }

  header.addEventListener('click', function (ev) {
    ev.preventDefault();
    toggleAccordion();
  });

  // Support Enter/Space on non-button elements (defensive)
  header.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      toggleAccordion();
    }
  });

  // If CSS transition was used, clear inline maxHeight after transition to be flexible
  content.addEventListener('transitionend', function () {
    if (content.classList.contains('open')) {
      content.style.maxHeight = null;
    }
  });
});

      header.addEventListener('click', function (ev) {
        ev.preventDefault();
        toggleAccordion();
      });

      // Support Enter/Space on non-button elements (defensive)
      header.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          toggleAccordion();
        }
      });
    });
  });
})();
