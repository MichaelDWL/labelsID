import { UPLOADS } from "../config/constants.js";

export function initModelSelection() {
  const selectButtons = document.querySelectorAll(".btn-select");
  const uploadSections = document.querySelectorAll(".upload");
  const optionCards = document.querySelectorAll(".options .container-bin");

  selectButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const sizeKey = btn.getAttribute("data-size");
      if (!sizeKey || !UPLOADS[sizeKey]) return;
      uploadSections.forEach((sec) => {
        if (sec.getAttribute("data-size") === sizeKey) {
          sec.classList.add("upload--active");
        } else {
          sec.classList.remove("upload--active");
        }
      });
      optionCards.forEach((card) => {
        if (card.classList.contains(sizeKey)) {
          card.classList.add("ativo");
        } else {
          card.classList.remove("ativo");
        }
      });
    });
  });
}
