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

   // Accordion behavior for headers (defensive)
accordionHeaders.forEach(function (header) {
  var li = header.closest('li');
  if (!li) {
    // Not inside an li — skip and warn for easier debugging
    console.warn('accordion-header not inside <li>, skipping:', header);
    return;
  }

  var content = li.querySelector('.accordion-content');
  if (!content) {
    console.warn('accordion-header has no .accordion-content sibling, skipping:', header);
    return;
  }

  // Ensure ARIA attributes exist
  var contentId = content.id || ('accordion-content-' + Math.random().toString(36).slice(2, 9));
  content.id = contentId;
  if (!header.hasAttribute('aria-controls')) header.setAttribute('aria-controls', contentId);
  if (!header.hasAttribute('aria-expanded')) header.setAttribute('aria-expanded', 'false');

  // Remove hidden to avoid conflicts between hidden and CSS-driven transitions
  if (content.hasAttribute('hidden')) content.removeAttribute('hidden');

  // Helper to safely measure scrollHeight even if content is temporarily set to display:none
  function measureContentHeight(el) {
    var prevDisplay = el.style.display || '';
    var prevVisibility = el.style.visibility || '';
    // If computed display is 'none', temporarily make it measurable off-screen
    if (getComputedStyle(el).display === 'none') {
      el.style.display = 'block';
      el.style.visibility = 'hidden';
    }
    var h = el.scrollHeight;
    // restore
    el.style.display = prevDisplay;
    el.style.visibility = prevVisibility;
    return h;
  }

  // Initialize visual state to match aria-expanded
  if (header.getAttribute('aria-expanded') === 'true') {
    content.classList.add('open');
    content.style.maxHeight = null; // let CSS handle it
  } else {
    content.classList.remove('open');
    content.style.maxHeight = null;
  }

  var transitionClearTimer = null;
  function clearInlineMaxHeight() {
    if (transitionClearTimer) clearTimeout(transitionClearTimer);
    transitionClearTimer = setTimeout(function () {
      if (content.classList.contains('open')) {
        content.style.maxHeight = null;
      }
    }, 200); // small buffer after transitionend
  }

  function toggleAccordion() {
    var expanded = header.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      header.setAttribute('aria-expanded', 'false');
      // collapse
      // set maxHeight to current height to allow smooth transition to 0
      var currentH = measureContentHeight(content);
      content.style.maxHeight = currentH + 'px';
      // force reflow then collapse
      requestAnimationFrame(function () {
        content.classList.remove('open');
        content.style.maxHeight = '0px';
      });
    } else {
      header.setAttribute('aria-expanded', 'true');
      // expand
      content.classList.add('open');
      // measure and set maxHeight to animate
      var targetH = measureContentHeight(content);
      content.style.maxHeight = targetH + 'px';
      // clear after transition to be flexible
      clearInlineMaxHeight();
    }
  }

  header.addEventListener('click', function (ev) {
    ev.preventDefault();
    toggleAccordion();
  });

  header.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      toggleAccordion();
    }
  });

  content.addEventListener('transitionend', function (ev) {
    // ensure only handle max-height transitions
    if (ev.propertyName !== 'max-height') return;
    if (content.classList.contains('open')) {
      // open finished — clear inline maxHeight
      content.style.maxHeight = null;
    } else {
      // collapsed — keep maxHeight 0 so it's collapsed
      content.style.maxHeight = '0px';
    }
  });
});

  }); // End DOMContentLoaded
})(); // End IIFE
