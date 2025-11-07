// loadNav.js
document.addEventListener("DOMContentLoaded", () => {
  const navPlaceholder = document.getElementById("nav");
  
  fetch("nav.html")
    .then(response => response.text())
    .then(data => {
      navPlaceholder.innerHTML = data;
    })
});
