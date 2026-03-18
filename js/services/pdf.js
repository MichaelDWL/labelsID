import { getSize } from "../utils/helpers.js";

export function renderPdfPreview({
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

  const scale = 4;
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
    if (y + labelHeight > pageHeight - marginBottom) break;
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

export async function updatePreviewFromLabels(sizeKey, containerId, previewId) {
  if (!previewId) return;
  const container = document.getElementById(containerId);
  if (!container) return;
  const labelNodes = Array.from(container.querySelectorAll(".label-item"));
  if (!labelNodes.length) {
    const preview = document.getElementById(previewId);
    if (preview) preview.innerHTML = "";
    return;
  }
  if (!window.jspdf || typeof html2canvas !== "function") return;

  const { jsPDF } = window.jspdf;
  const tmpPdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = tmpPdf.internal.pageSize.getWidth();
  const pageHeight = tmpPdf.internal.pageSize.getHeight();
  const size = getSize(sizeKey);
  const labelWidth = size.width;
  const labelHeight = size.height;
  const labelsPerRow = sizeKey === "placa" ? 1 : sizeKey === "bin-sm" ? 3 : 2;
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

export async function handleGeneratePdf(
  sizeKey,
  containerId,
  previewId,
  showModal,
) {
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
  const labelWidth = size.width;
  const labelHeight = size.height;
  const labelsPerRow = sizeKey === "placa" ? 1 : sizeKey === "bin-sm" ? 3 : 2;
  const marginTop = 10;
  const marginBottom = 10;
  const gapX = 2;
  const gapY = 3;
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
  canvases.forEach((canvas) => {
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
  pdf.save(`etiquetas-${sizeKey}.pdf`);
}
