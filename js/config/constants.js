/** Dimensões da etiqueta (mm) */
export const SIZES = {
  "bin-sm": { width: 45, height: 15 },
  "bin-md": { width: 65, height: 20 },
  placa: { width: 180, height: 70 },
};

/** IDs de DOM por modelo */
export const UPLOADS = {
  "bin-sm": {
    sectionId: "upload-sm",
    inputId: "excel-input-sm",
    containerId: "labels-container-sm",
    pdfBtnId: "btn-generate-pdf-sm",
    previewId: "pdf-preview-sm",
    logo1InputId: "logo1-input-sm",
    logo2InputId: "logo2-input-sm",
  },
  "bin-md": {
    sectionId: "upload-md",
    inputId: "excel-input-md",
    containerId: "labels-container-md",
    pdfBtnId: "btn-generate-pdf-md",
    previewId: "pdf-preview-md",
    logo1InputId: "logo1-input-md",
    logo2InputId: "logo2-input-md",
  },
  placa: {
    sectionId: "upload-placa",
    inputId: "excel-input-placa",
    containerId: "labels-container-placa",
    pdfBtnId: "btn-generate-pdf-placa",
    previewId: "pdf-preview-placa",
    logo1InputId: "logo1-input-placa",
    logo2InputId: "logo2-input-placa",
  },
};
