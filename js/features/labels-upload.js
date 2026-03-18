import { UPLOADS } from "../config/constants.js";
import { escapeHtml, getSize } from "../utils/helpers.js";
import { updatePreviewFromLabels } from "../services/pdf.js";

export function createLogosState() {
  return {
    "bin-sm": [null, null],
    "bin-md": [null, null],
    placa: [null, null],
  };
}

export function initLabelsUpload({
  showModal,
  logosBySize,
  openLabelEditModal,
  generatePdf,
}) {
  function handleLogoChange(event, sizeKey, index) {
    const input = event.target;
    if (input.disabled) return;
    const file = input.files && input.files[0];
    const field = input.closest(".upload-logo-field");
    const statusEl = field ? field.querySelector(".upload-logo-status") : null;
    if (!file) {
      logosBySize[sizeKey][index] = null;
      if (field) field.classList.remove("upload-logo-field--uploaded");
      if (statusEl) statusEl.textContent = "";
      return;
    }
    if (!file.type || !file.type.startsWith("image/")) {
      showModal(
        "Selecione um arquivo de imagem. Formato recomendado: PNG com fundo transparente.",
      );
      input.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      logosBySize[sizeKey][index] = e.target.result;
      if (field) field.classList.add("upload-logo-field--uploaded");
      if (statusEl) statusEl.textContent = "Enviado ✓";
    };
    reader.readAsDataURL(file);
  }

  function lockLogoUploads(sizeKey) {
    const cfg = UPLOADS[sizeKey];
    if (!cfg || !cfg.logo1InputId || !cfg.logo2InputId) return;
    const logo1Input = document.getElementById(cfg.logo1InputId);
    const logo2Input = document.getElementById(cfg.logo2InputId);
    if (logo1Input) logo1Input.disabled = true;
    if (logo2Input) logo2Input.disabled = true;
    const uploadLogosEl = document.querySelector(
      `.upload[data-size="${sizeKey}"] .upload-logos`,
    );
    if (uploadLogosEl) uploadLogosEl.classList.add("upload-logos--locked");
  }

  function renderLabels(rows, sizeKey, containerId, previewId) {
    const labelsContainer = document.getElementById(containerId);
    if (!labelsContainer) return;
    if (labelsContainer.children.length > 0) {
      const overwrite = confirm(
        "Já existem etiquetas geradas. Deseja substituí-las?",
      );
      if (!overwrite) return;
    }
    labelsContainer.innerHTML = "";
    const size = getSize(sizeKey);
    rows.forEach((row) => {
      if (!Array.isArray(row)) return;
      const text = row
        .map((cell) => (cell != null ? String(cell).trim() : ""))
        .filter((cell) => cell.length > 0)
        .join(" - ");
      if (!text) return;
      const labelEl = document.createElement("div");
      labelEl.className = `label-item label-item--${sizeKey}`;
      labelEl.style.width = `${size.width}mm`;
      labelEl.style.height = `${size.height}mm`;
      const logos = logosBySize[sizeKey] || [null, null];
      const logo1 = logos[0];
      const logo2 = logos[1];
      const logosHtml =
        logo1 || logo2
          ? `
          <div class="label-logos">
            ${logo1 ? `<img src="${escapeHtml(logo1)}" alt="Logo 1" class="label-logo" />` : ""}
            ${logo2 ? `<img src="${escapeHtml(logo2)}" alt="Logo 2" class="label-logo" />` : ""}
          </div>`
          : "";
      labelEl.innerHTML = `
        <div class="label-inner">
          <button type="button" class="label-edit-btn" aria-label="Editar etiqueta">
            <i class="fa-solid fa-paintbrush"></i>
          </button>
          ${logosHtml}
          <div class="label-text">
            <span class="label-text-value">${escapeHtml(text)}</span>
          </div>
        </div>
      `;
      labelsContainer.appendChild(labelEl);
    });
    updatePreviewFromLabels(sizeKey, containerId, previewId);
  }

  function handleFileChange(event, sizeKey, containerId, previewId) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          blankrows: false,
        });
        renderLabels(rows, sizeKey, containerId, previewId);
        lockLogoUploads(sizeKey);
      } catch (error) {
        console.error(error);
        showModal(
          "Não foi possível ler a planilha. Verifique se o arquivo é um Excel válido.",
        );
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function enableLabelEditButtons(sizeKey, containerId, previewId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.addEventListener("click", (event) => {
      const btn = event.target.closest(".label-edit-btn");
      if (!btn) return;
      const labelEl = btn.closest(".label-item");
      if (!labelEl) return;
      const textEl = labelEl.querySelector(".label-text-value");
      if (!textEl) return;
      openLabelEditModal({ sizeKey, containerId, previewId, textEl });
    });
  }

  Object.keys(UPLOADS).forEach((sizeKey) => {
    const cfg = UPLOADS[sizeKey];
    const input = document.getElementById(cfg.inputId);
    const pdfButton = document.getElementById(cfg.pdfBtnId);
    const logo1Input = cfg.logo1InputId
      ? document.getElementById(cfg.logo1InputId)
      : null;
    const logo2Input = cfg.logo2InputId
      ? document.getElementById(cfg.logo2InputId)
      : null;
    if (input) {
      input.addEventListener("change", (event) =>
        handleFileChange(event, sizeKey, cfg.containerId, cfg.previewId),
      );
    }
    if (pdfButton) {
      pdfButton.addEventListener("click", () =>
        generatePdf(sizeKey, cfg.containerId, cfg.previewId),
      );
    }
    enableLabelEditButtons(sizeKey, cfg.containerId, cfg.previewId);
    if (logo1Input) {
      logo1Input.addEventListener("change", (e) =>
        handleLogoChange(e, sizeKey, 0),
      );
    }
    if (logo2Input) {
      logo2Input.addEventListener("change", (e) =>
        handleLogoChange(e, sizeKey, 1),
      );
    }
  });

}
