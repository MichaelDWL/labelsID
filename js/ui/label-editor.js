/**
 * Modal de edição de texto da etiqueta
 */
export function initLabelEditor({ showModal, onAfterSave }) {
  const labelEditOverlay = document.getElementById("label-edit-modal");
  const labelEditInput = document.getElementById("label-edit-input");
  const labelEditCancel = document.getElementById("label-edit-cancel");
  const labelEditSave = document.getElementById("label-edit-save");

  const state = {
    isOpen: false,
    activeSizeKey: null,
    activeContainerId: null,
    activePreviewId: null,
    activeTextEl: null,
  };

  function openLabelEditModal({ sizeKey, containerId, previewId, textEl }) {
    if (!labelEditOverlay || !labelEditInput) return;
    state.isOpen = true;
    state.activeSizeKey = sizeKey;
    state.activeContainerId = containerId;
    state.activePreviewId = previewId;
    state.activeTextEl = textEl;
    labelEditInput.value = (textEl && textEl.textContent) || "";
    labelEditOverlay.classList.add("modal-overlay--visible");
    window.setTimeout(() => {
      labelEditInput.focus();
      labelEditInput.select();
    }, 0);
  }

  function closeLabelEditModal() {
    if (!labelEditOverlay) return;
    labelEditOverlay.classList.remove("modal-overlay--visible");
    state.isOpen = false;
    state.activeSizeKey = null;
    state.activeContainerId = null;
    state.activePreviewId = null;
    state.activeTextEl = null;
  }

  if (labelEditOverlay) {
    labelEditOverlay.addEventListener("click", (event) => {
      if (event.target === labelEditOverlay) closeLabelEditModal();
    });
  }
  if (labelEditCancel) {
    labelEditCancel.addEventListener("click", () => closeLabelEditModal());
  }
  if (labelEditSave) {
    labelEditSave.addEventListener("click", async () => {
      if (!state.activeTextEl || !labelEditInput) {
        closeLabelEditModal();
        return;
      }
      const newText = String(labelEditInput.value || "").trim();
      if (!newText) {
        showModal("Digite um texto válido para a etiqueta.");
        return;
      }
      state.activeTextEl.textContent = newText;
      const { activeSizeKey, activeContainerId, activePreviewId } = state;
      closeLabelEditModal();
      if (activeSizeKey && activeContainerId && activePreviewId) {
        await onAfterSave(activeSizeKey, activeContainerId, activePreviewId);
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (!state.isOpen) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeLabelEditModal();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      if (labelEditSave) labelEditSave.click();
    }
  });

  return { openLabelEditModal, state };
}
