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
  if (scrollTop > lastScrollTop) {
    nav.style.top = "-60px"; // hide
  } else {
    nav.style.top = "0"; // show
  }
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});
