// =========================
// hideNav.js
// =========================

// Top navbar hide on scroll
let lastScrollTop = 0;
const nav = document.querySelector('.nav');
const navLinks = document.getElementById('nav-links');


window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop && scrollTop > 20) {
    nav.style.top = `-${nav.offsetHeight}px`; // hide navbar
  } else {
    nav.style.top = "0"; // show navbar
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// Smooth scrollbar appearance
let timeout;
window.addEventListener("scroll", () => {
  document.body.classList.add("show-scrollbar");
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    document.body.classList.remove("show-scrollbar");
  }, 800);
});

// =========================
// Accordion
// =========================
document.querySelectorAll(".accordion-header").forEach(btn => {
  btn.addEventListener("click", () => {
    const content = btn.nextElementSibling;
    content.style.display = content.style.display === "block" ? "none" : "block";

    btn.innerHTML = btn.innerHTML.includes("▾")
      ? btn.innerHTML.replace("▾", "▸")
      : btn.innerHTML.replace("▸", "▾");
  });
});

// =========================
// Sidebar Collapse
// =========================
const sidebar = document.getElementById('sidebar');
const toggle = document.getElementById('sidebarToggle');

toggle.addEventListener('click', () => {
  sidebar.classList.toggle("collapsed");
  document.body.classList.toggle("sidebar-collapsed");
});
