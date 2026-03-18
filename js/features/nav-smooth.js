export function initNavSmooth() {
  const linksInternos = document.querySelectorAll(".js-nav a[href^='#']");
  linksInternos.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const href = event.currentTarget.getAttribute("href");
      const section = document.querySelector(href);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}
