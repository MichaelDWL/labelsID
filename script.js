document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("excel-input");
  const labelsContainer = document.getElementById("labels-container");

  if (!fileInput || !labelsContainer) return;

  fileInput.addEventListener("change", handleFileChange);

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

