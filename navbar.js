// hideNav.js
let lastScrollTop = 0;
const nav = document.querySelector('.nav');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

// Hamburger toggle
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});

// Hide navbar on scroll down
window.addEventListener('scroll', () => {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

// Transparent --> opaque background
  if (scrollTop > 20) {
  nav.classList.add('scrolled');
} else {
  nav.classList.remove('scrolled');
}

// Hide on scroll down/ show on scroll up
  if (scrollTop > lastScrollTop && scrollTop > 50) {
    nav.style.top = '${nav.offsetHeight}px'; // fully hide
  } else {
    nav.style.top = "0"; // show
  }
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});
