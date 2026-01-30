import { generateAnniversaries, gregorianToParsi, ordinal, SHAHENSHAHI, KADMI, FASLI } from "./parsi.js";
import { generateICS } from "./ics.js";

const form = document.getElementById("event-form");
const subjectInput = document.getElementById("subject");
const occasionInput = document.getElementById("occasion");
const dateInput = document.getElementById("date");
const variantSelect = document.getElementById("variant");
const countInput = document.getElementById("count");
const previewContainer = document.getElementById("preview-events");

function todayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

dateInput.value = todayString();

function formatGregorianDisplay(date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function updatePreview() {
  const subject = subjectInput.value || subjectInput.placeholder;
  const occasion = occasionInput.value || occasionInput.placeholder;
  const dateVal = dateInput.value;
  if (!dateVal) {
    previewContainer.innerHTML = "";
    return;
  }

  const [y, m, d] = dateVal.split("-").map(Number);
  const baseDate = new Date(y, m - 1, d);
  const variant = variantSelect.value;

  const preview = generateAnniversaries(baseDate, variant, 3);
  const variantLabel =
    variant === "shahenshahi" ? "Shahenshahi" :
    variant === "kadmi" ? "Kadmi" : "Fasli";

  previewContainer.innerHTML = preview
    .map((ann) => {
      const title = `${subject} ${ordinal(ann.number)} ${occasion}`;
      const greg = formatGregorianDisplay(ann.gregorianDate);
      const parsi = `${ann.parsiDate.day} ${ann.parsiDate.monthName} ${ann.parsiDate.year} YZ (${variantLabel})`;
      return `<div class="preview-event">
        <div class="preview-event-title">${title}</div>
        <div class="preview-event-greg">${greg}</div>
        <div class="preview-event-parsi">${parsi}</div>
      </div>`;
    })
    .join("");
}

[subjectInput, occasionInput, dateInput, variantSelect, countInput].forEach((el) =>
  el.addEventListener("input", updatePreview)
);

updatePreview();

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const subject = subjectInput.value || subjectInput.placeholder;
  const occasion = occasionInput.value || occasionInput.placeholder;
  const dateVal = dateInput.value;
  if (!dateVal) return;

  const [y, m, d] = dateVal.split("-").map(Number);
  const baseDate = new Date(y, m - 1, d);
  const variant = variantSelect.value;
  const count = parseInt(countInput.value, 10) || 100;

  const anniversaries = generateAnniversaries(baseDate, variant, count);
  const ics = generateICS(anniversaries, subject, occasion, variant);

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${subject.replace(/\s+/g, "-")}-${occasion.replace(/\s+/g, "-")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
});
