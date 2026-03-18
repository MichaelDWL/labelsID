/**
 * LabelsID — ponto de entrada da aplicação
 */
import { initAppModal } from "./ui/app-modal.js";
import { initLabelEditor } from "./ui/label-editor.js";
import { handleGeneratePdf, updatePreviewFromLabels } from "./services/pdf.js";
import { createLogosState, initLabelsUpload } from "./features/labels-upload.js";
import { initModelSelection } from "./features/model-selection.js";
import { initNavSmooth } from "./features/nav-smooth.js";

function boot() {
  const { showModal } = initAppModal();
  const logosBySize = createLogosState();
  const { openLabelEditModal } = initLabelEditor({
    showModal,
    onAfterSave: (sizeKey, containerId, previewId) =>
      updatePreviewFromLabels(sizeKey, containerId, previewId),
  });
  initLabelsUpload({
    showModal,
    logosBySize,
    openLabelEditModal,
    generatePdf: (sizeKey, containerId, previewId) =>
      handleGeneratePdf(sizeKey, containerId, previewId, showModal),
  });
  initModelSelection();
  initNavSmooth();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
