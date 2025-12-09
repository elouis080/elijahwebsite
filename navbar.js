// hideNav.js
let lastScrollTop = 0;
const nav = document.querySelector('.nav');
const navLinks = document.getElementById('nav-links');

// Hide navbar on scroll down
window.addEventListener('scroll', () => {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

// Hide on scroll down/ show on scroll up
  if (scrollTop > lastScrollTop && scrollTop > 20) {
    nav.style.top = `-${nav.offsetHeight}px`; // fully hide
  } else {
    nav.style.top = "0"; // show
  }
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

let timeout;
window.addEventListener("scroll", () => {
  document.body.classList.add("show-scrollbar");
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    document.body.classList.remove("show-scrollbar");
  }, 800);
});

// ========== Accordion ==========
document.querySelectorAll(".accordion-header").forEach(btn => {
  btn.addEventListener("click", () => {
    const content = btn.nextElementSibling;

    content.style.display =
      content.style.display === "block" ? "none" : "block";

    // Toggle arrow
    btn.innerHTML = btn.innerHTML.includes("▾")
      ? btn.innerHTML.replace("▾", "▸")
      : btn.innerHTML.replace("▸", "▾");
  });
});

// ========== Sidebar Collapse ==========
const sidebar = document.getElementById("sidebar");
const toggle = document.getElementById("sidebarToggle");

toggle.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  document.body.classList.toggle("sidebar-collapsed");
});
