document.addEventListener("DOMContentLoaded", function () {
  // configuração de tamanhos (mm) por tipo
  const SIZES = {
    "bin-sm": { width: 45, height: 15 }, // 4,5 x 1,5 cm
    "bin-md": { width: 65, height: 20 }, // 6,5 x 2 cm
    placa: { width: 180, height: 70 }, // 18 x 7 cm
  };

  // mapeia cada section de upload
  const UPLOADS = {
    "bin-sm": {
      sectionId: "upload-sm",
      inputId: "excel-input-sm",
      containerId: "labels-container-sm",
      pdfBtnId: "btn-generate-pdf-sm",
      previewId: "pdf-preview-sm",
    },
    "bin-md": {
      sectionId: "upload-md",
      inputId: "excel-input-md",
      containerId: "labels-container-md",
      pdfBtnId: "btn-generate-pdf-md",
      previewId: "pdf-preview-md",
    },
    placa: {
      sectionId: "upload-placa",
      inputId: "excel-input-placa",
      containerId: "labels-container-placa",
      pdfBtnId: "btn-generate-pdf-placa",
      previewId: "pdf-preview-placa",
    },
  };

  function getSize(sizeKey) {
    return SIZES[sizeKey] || SIZES["bin-md"];
  }

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

  const selectButtons = document.querySelectorAll(".btn-select");
  const uploadSections = document.querySelectorAll(".upload");
  const optionCards = document.querySelectorAll(".options .container-bin");

  // listeners dos botões de seleção de modelo
  selectButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const sizeKey = btn.getAttribute("data-size");
      if (!sizeKey || !UPLOADS[sizeKey]) return;

      // ativa somente a section de upload correspondente
      uploadSections.forEach((sec) => {
        if (sec.getAttribute("data-size") === sizeKey) {
          sec.classList.add("upload--active");
        } else {
          sec.classList.remove("upload--active");
        }
      });

      // marca visualmente o card selecionado
      optionCards.forEach((card) => {
        if (card.classList.contains(sizeKey)) {
          card.classList.add("ativo");
        } else {
          card.classList.remove("ativo");
        }
      });
    });
  });

  // inicializa cada upload (input + botão PDF)
  Object.keys(UPLOADS).forEach((sizeKey) => {
    const cfg = UPLOADS[sizeKey];
    const input = document.getElementById(cfg.inputId);
    const pdfButton = document.getElementById(cfg.pdfBtnId);

    if (input) {
      input.addEventListener("change", (event) =>
        handleFileChange(event, sizeKey, cfg.containerId, cfg.previewId),
      );
    }

    if (pdfButton) {
      pdfButton.addEventListener("click", () =>
        handleGeneratePdf(sizeKey, cfg.containerId, cfg.previewId),
      );
    }
  });

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
      } catch (error) {
        console.error(error);
        showModal(
          "Não foi possível ler a planilha. Verifique se o arquivo é um Excel válido.",
        );
      }
    };

    reader.readAsArrayBuffer(file);
  }

  async function handleGeneratePdf(sizeKey, containerId, previewId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const labelNodes = Array.from(container.querySelectorAll(".label-item"));

    if (!labelNodes.length) {
      showModal("Nenhuma etiqueta gerada. Faça o upload da planilha primeiro.");
      return;
    }

    if (!window.jspdf || typeof html2canvas !== "function") {
      showModal("Bibliotecas de geração de PDF não foram carregadas.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "mm", format: "a4" });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const size = getSize(sizeKey);

    const labelWidth = size.width; // em mm
    const labelHeight = size.height; // em mm
    const labelsPerRow =
      sizeKey === "placa" ? 1 : sizeKey === "bin-sm" ? 3 : 2; // pequenas: 3 por linha, placas: 1, demais: 2
    const marginTop = 10;
    const marginBottom = 10;

    const gapX = 2; // espaço horizontal entre etiquetas (mm)
    const gapY = 3; // espaço vertical entre etiquetas (mm)

    const effectiveLabelWidth = labelWidth + gapX;
    const totalLabelsWidth = labelsPerRow * effectiveLabelWidth - gapX;
    const marginX = (pageWidth - totalLabelsWidth) / 2;

    const canvases = await Promise.all(
      labelNodes.map((node) =>
        html2canvas(node, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        }),
      ),
    );

    // Atualiza a pré-visualização da primeira página antes de gerar o PDF
    renderPdfPreview({
      sizeKey,
      previewId,
      canvases,
      pageWidth,
      pageHeight,
      labelWidth,
      labelHeight,
      labelsPerRow,
      marginTop,
      marginBottom,
      gapX,
      gapY,
    });

    let x = marginX;
    let y = marginTop;
    let labelIndex = 0;

    canvases.forEach((canvas, index) => {
      const imgData = canvas.toDataURL("image/png");

      if (y + labelHeight > pageHeight - marginBottom) {
        pdf.addPage();
        x = marginX;
        y = marginTop;
      }

      pdf.addImage(imgData, "PNG", x, y, labelWidth, labelHeight);

      labelIndex++;
      if (labelIndex % labelsPerRow === 0) {
        x = marginX;
        y += labelHeight + gapY;
      } else {
        x += effectiveLabelWidth;
      }
    });

    const fileName = `etiquetas-${sizeKey}.pdf`;
    pdf.save(fileName);
  }

  function renderPdfPreview({
    sizeKey,
    previewId,
    canvases,
    pageWidth,
    pageHeight,
    labelWidth,
    labelHeight,
    labelsPerRow,
    marginTop,
    marginBottom,
    gapX,
    gapY,
  }) {
    if (!previewId) return;

    const previewContainer = document.getElementById(previewId);
    if (!previewContainer) return;

    if (!canvases || !canvases.length) {
      previewContainer.innerHTML = "";
      return;
    }

    const scale = 4; // pixels por mm para a miniatura
    const canvasWidth = pageWidth * scale;
    const canvasHeight = pageHeight * scale;

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvasWidth;
    pageCanvas.height = canvasHeight;

    const ctx = pageCanvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    let x = (pageWidth - (labelsPerRow * (labelWidth + gapX) - gapX)) / 2;
    let y = marginTop;
    let labelIndex = 0;

    for (let i = 0; i < canvases.length; i++) {
      const canvas = canvases[i];

      if (y + labelHeight > pageHeight - marginBottom) {
        // Só mostramos a primeira página na pré-visualização
        break;
      }

      const drawX = x * scale;
      const drawY = y * scale;
      const drawW = labelWidth * scale;
      const drawH = labelHeight * scale;

      ctx.drawImage(canvas, drawX, drawY, drawW, drawH);

      labelIndex++;
      if (labelIndex % labelsPerRow === 0) {
        x = (pageWidth - (labelsPerRow * (labelWidth + gapX) - gapX)) / 2;
        y += labelHeight + gapY;
      } else {
        x += labelWidth + gapX;
      }
    }

    const img = document.createElement("img");
    img.src = pageCanvas.toDataURL("image/png");
    img.alt = `Pré-visualização da primeira página (${sizeKey})`;

    previewContainer.innerHTML = "";
    previewContainer.appendChild(img);
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

      // Junta todas as células não vazias em um único texto
      const text = row
        .map((cell) => (cell != null ? String(cell).trim() : ""))
        .filter((cell) => cell.length > 0)
        .join(" - ");

      if (!text) return;

      const labelEl = document.createElement("div");
      labelEl.className = `label-item label-item--${sizeKey}`;
      labelEl.style.width = `${size.width}mm`;
      labelEl.style.height = `${size.height}mm`;

      labelEl.innerHTML = `
        <div class="label-inner">
          <div class="label-logos">
            <img
              src="./assets/CMI-cc.png"
              alt="Logo Centro Materno Infantil"
              class="logo-cmi"
            />
            <img
              src="./assets/Logo-Prefeitura.png"
              alt="Logo Prefeitura"
              class="logo-prefeitura"
            />
          </div>
          <div class="label-text">
            <span>${escapeHtml(text)}</span>
          </div>
        </div>
      `;

      labelsContainer.appendChild(labelEl);
    });

    // Atualiza a pré-visualização assim que as etiquetas são geradas
    updatePreviewFromLabels(sizeKey, containerId, previewId);
  }

  async function updatePreviewFromLabels(sizeKey, containerId, previewId) {
    if (!previewId) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    const labelNodes = Array.from(container.querySelectorAll(".label-item"));
    if (!labelNodes.length) {
      const preview = document.getElementById(previewId);
      if (preview) preview.innerHTML = "";
      return;
    }

    if (!window.jspdf || typeof html2canvas !== "function") {
      return;
    }

    const { jsPDF } = window.jspdf;
    const tmpPdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = tmpPdf.internal.pageSize.getWidth();
    const pageHeight = tmpPdf.internal.pageSize.getHeight();

    const size = getSize(sizeKey);
    const labelWidth = size.width;
    const labelHeight = size.height;
    const labelsPerRow =
      sizeKey === "placa" ? 1 : sizeKey === "bin-sm" ? 3 : 2;
    const marginTop = 10;
    const marginBottom = 10;
    const gapX = 2;
    const gapY = 3;

    const canvases = await Promise.all(
      labelNodes.map((node) =>
        html2canvas(node, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        }),
      ),
    );

    renderPdfPreview({
      sizeKey,
      previewId,
      canvases,
      pageWidth,
      pageHeight,
      labelWidth,
      labelHeight,
      labelsPerRow,
      marginTop,
      marginBottom,
      gapX,
      gapY,
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
