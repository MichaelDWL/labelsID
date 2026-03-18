import { SIZES } from "../config/constants.js";

export function getSize(sizeKey) {
  return SIZES[sizeKey] || SIZES["bin-md"];
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
