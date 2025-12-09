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

let lastScrollTop = 0;
const nav = document.querySelector(".nav");

window.addEventListener("scroll", () => {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  if (scrollTop > lastScrollTop) {
    // scrolling down
    nav.style.top = "-80px"; // adjust depending on navbar height
  } else {
    // scrolling up
    nav.style.top = "0";
  }
  
  lastScrollTop = scrollTop;
});
