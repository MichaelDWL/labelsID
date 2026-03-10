document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("excel-input");
  const labelsContainer = document.getElementById("labels-container");
  const pdfButton = document.getElementById("btn-generate-pdf");

  if (!fileInput || !labelsContainer) return;

  fileInput.addEventListener("change", handleFileChange);

  if (pdfButton) {
    pdfButton.addEventListener("click", handleGeneratePdf);
  }

  function handleFileChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];

      // sheet_to_json com header:1 retorna matriz de linhas (arrays)
      const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        blankrows: false,
      });

      renderLabels(rows);
    };

    reader.readAsArrayBuffer(file);
  }

  async function handleGeneratePdf() {
    const labelNodes = Array.from(
      document.querySelectorAll(".label-item")
    );

    if (!labelNodes.length) {
      alert("Nenhuma etiqueta gerada. Faça o upload da planilha primeiro.");
      return;
    }

    if (!window.jspdf || typeof html2canvas !== "function") {
      alert("Bibliotecas de geração de PDF não foram carregadas.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "mm", format: "a4" });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const labelWidth = 65; // 6,5 cm
    const labelHeight = 20; // 2 cm
    const labelsPerRow = 2; // duas colunas
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
        })
      )
    );

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

    pdf.save("etiquetas.pdf");
  }

  function renderLabels(rows) {
    labelsContainer.innerHTML = "";

    rows.forEach((row) => {
      if (!Array.isArray(row)) return;

      // Junta todas as células não vazias em um único texto
      const text = row
        .map((cell) => (cell != null ? String(cell).trim() : ""))
        .filter((cell) => cell.length > 0)
        .join(" - ");

      if (!text) return;

      const labelEl = document.createElement("div");
      labelEl.className = "label-item";

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

