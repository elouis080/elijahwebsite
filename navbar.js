// =========================
// navbar.js (defensive, combined handlers + draggable overlay scrollbar)
// =========================

document.addEventListener('DOMContentLoaded', () => {
  // =========================
  // Hide navbar on scroll + show-scrollbar logic
  // =========================
  const nav = document.querySelector('.nav');
  let lastScrollTop = 0;
  let scrollbarTimeout;

  // --- Create custom scrollbar overlay (if missing) ---
  const createCustomScrollbar = () => {
    const existing = document.querySelector('.custom-scrollbar');
    if (existing) return existing;

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-scrollbar';
    wrapper.setAttribute('aria-hidden', 'true');

    const thumb = document.createElement('div');
    thumb.className = 'custom-scrollbar-thumb';
    thumb.setAttribute('role', 'presentation');

    wrapper.appendChild(thumb);
    document.body.appendChild(wrapper);
    return wrapper;
  };

  const scrollbar = createCustomScrollbar();
  const thumb = scrollbar.querySelector('.custom-scrollbar-thumb');

  // state for dragging
  let dragging = false;
  let dragStartY = 0;
  let startThumbTop = 0;

  // Helper to compute document metrics
  const getMetrics = () => {
    const doc = document.documentElement;
    const body = document.body;
    const viewportH = window.innerHeight;
    const docH = Math.max(
      body.scrollHeight, doc.scrollHeight,
      body.offsetHeight, doc.offsetHeight,
      body.clientHeight, doc.clientHeight
    );
    const scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
    return { viewportH, docH, scrollTop };
  };

  // Update thumb size and position based on the document scroll state.
  const updateCustomScrollbar = () => {
    const { viewportH, docH, scrollTop } = getMetrics();

    if (docH <= viewportH) {
      scrollbar.style.opacity = '0';
      scrollbar.style.pointerEvents = 'none';
      thumb.style.transform = 'translateY(0)';
      thumb.style.height = `${Math.max(24, Math.round(viewportH * 0.05))}px`;
      return;
    }

    const trackHeight = viewportH;
    const minThumbHeight = Math.max(24, Math.round(viewportH * 0.05));
    const thumbHeight = Math.max(minThumbHeight, Math.round((viewportH / docH) * trackHeight));
    const maxThumbTop = trackHeight - thumbHeight;
    const scrollRatio = scrollTop / (docH - viewportH);
    const thumbTop = Math.round(scrollRatio * maxThumbTop);

    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${thumbTop}px)`;
  };

  // Show scrollbar and make interactive; hide after timeout and make non-interactive.
  const showCustomScrollbar = () => {
    // make visible and interactive
    scrollbar.classList.add('visible');
    scrollbar.style.opacity = '1';
    scrollbar.style.pointerEvents = 'auto';
    // ensure thumb is interactive
    thumb.style.pointerEvents = 'auto';

    clearTimeout(scrollbarTimeout);
    scrollbarTimeout = setTimeout(() => {
      // fade out and disable pointer events after transition
      scrollbar.classList.remove('visible');
      scrollbar.style.opacity = '0';
      // Delay disabling pointer-events until opacity transition ends for smoother UX
      setTimeout(() => {
        if (!scrollbar.classList.contains('visible') && !dragging) {
          scrollbar.style.pointerEvents = 'none';
          thumb.style.pointerEvents = 'none';
        }
      }, 480);
    }, 900); // fade out after 900ms of inactivity
  };

  // Convert a thumb top position to document scroll position and apply it
  const thumbTopToScroll = (thumbTop) => {
    const { viewportH, docH } = getMetrics();
    const thumbHeight = parseInt(window.getComputedStyle(thumb).height, 10) || Math.max(24, Math.round(viewportH * 0.05));
    const maxThumbTop = viewportH - thumbHeight;
    const ratio = Math.max(0, Math.min(1, thumbTop / Math.max(1, maxThumbTop)));
    const targetScroll = Math.round(ratio * (docH - viewportH));
    window.scrollTo({ top: targetScroll, behavior: 'auto' });
    // update transform immediately for visual sync
    thumb.style.transform = `translateY(${Math.round(ratio * maxThumbTop)}px)`;
  };

  // Track click handler: jump to clicked position
  const onTrackClick = (e) => {
    // ignore if click originated from the thumb (handled by drag)
    if (e.target === thumb) return;

    const rect = scrollbar.getBoundingClientRect();
    const clickY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    const thumbHeight = parseInt(window.getComputedStyle(thumb).height, 10) || 30;
    const desiredTop = clickY - (thumbHeight / 2);
    const maxThumbTop = rect.height - thumbHeight;
    const clamped = Math.max(0, Math.min(maxThumbTop, desiredTop));
    thumbTopToScroll(clamped);
    showCustomScrollbar();
  };

  // Drag handlers
  const startDrag = (clientY) => {
    if (!thumb) return;
    dragging = true;
    dragStartY = clientY;
    // compute current thumb top from its transform (translateY)
    const transform = window.getComputedStyle(thumb).transform;
    let currentTop = 0;
    if (transform && transform !== 'none') {
      try {
        const matrix = new DOMMatrix(transform);
        currentTop = matrix.m42; // translateY
      } catch (err) {
        // fallback parsing
        const match = transform.match(/matrix.*\((.+)\)/);
        if (match) {
          const values = match[1].split(',').map(s => parseFloat(s.trim()));
          currentTop = values.length >= 6 ? values[5] : 0;
        }
      }
    }
    startThumbTop = isNaN(currentTop) ? 0 : currentTop;

    // add no-select class to body to avoid text selection while dragging
    document.body.classList.add('no-select');

    // ensure visible and interactive while dragging
    scrollbar.style.pointerEvents = 'auto';
    thumb.style.pointerEvents = 'auto';

    // cancel the hide timeout while dragging
    clearTimeout(scrollbarTimeout);
  };

  const duringDrag = (clientY) => {
    if (!dragging) return;
    const delta = clientY - dragStartY;
    const { viewportH } = getMetrics();
    const thumbHeight = parseInt(window.getComputedStyle(thumb).height, 10) || Math.max(24, Math.round(viewportH * 0.05));
    const maxThumbTop = viewportH - thumbHeight;
    const newTop = Math.max(0, Math.min(maxThumbTop, Math.round(startThumbTop + delta)));
    thumbTopToScroll(newTop);
  };

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    document.body.classList.remove('no-select');
    // restart the hide timeout
    showCustomScrollbar();
  };

  // Mouse events
  thumb.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startDrag(e.clientY);
    const onMouseMove = (ev) => duringDrag(ev.clientY);
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      endDrag();
    };
    document.addEventListener('mousemove', onMouseMove, { passive: false });
    document.addEventListener('mouseup', onMouseUp, { passive: true });
  });

  // Touch events for mobile
  thumb.addEventListener('touchstart', (e) => {
    if (!e.touches || e.touches.length === 0) return;
    startDrag(e.touches[0].clientY);
    const onTouchMove = (ev) => {
      if (!ev.touches || ev.touches.length === 0) return;
      duringDrag(ev.touches[0].clientY);
    };
    const onTouchEnd = () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      endDrag();
    };
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
  }, { passive: false });

  // Track click for jumping (support both mouse and touch)
  scrollbar.addEventListener('click', onTrackClick);
  scrollbar.addEventListener('touchstart', (e) => {
    // if touch target is thumb, ignore (handled by touchstart on thumb)
    if (e.target === thumb) return;
    onTrackClick(e);
  }, { passive: true });

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

    // legacy native scrollbar show class (for browsers that still use ::-webkit-scrollbar)
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

  // Accessibility: update custom scrollbar on load (anchor links etc.)
  requestAnimationFrame(updateCustomScrollbar);
});
