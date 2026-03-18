export function initAppModal() {
  const modalOverlay = document.getElementById("app-modal");
  const modalMessage = document.getElementById("modal-message");
  const modalCloseButton = document.getElementById("modal-close");

  function showModal(message) {
    if (!modalOverlay || !modalMessage) {
      alert(message);
      return;
    }
    modalMessage.textContent = message;
    modalOverlay.classList.add("modal-overlay--visible");
  }

  if (modalCloseButton && modalOverlay) {
    modalCloseButton.addEventListener("click", () => {
      modalOverlay.classList.remove("modal-overlay--visible");
    });
    modalOverlay.addEventListener("click", (event) => {
      if (event.target === modalOverlay) {
        modalOverlay.classList.remove("modal-overlay--visible");
      }
    });
  }

  return { showModal };
}
