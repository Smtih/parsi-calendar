import { ordinal } from "./parsi.js";

function formatDateICS(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function formatParsiDate(parsiDate, variant) {
  const variantLabel =
    variant.toLowerCase() === "shahenshahi" ? "Shahenshahi" :
    variant.toLowerCase() === "kadmi" ? "Kadmi" : "Fasli";
  return `${parsiDate.day} ${parsiDate.monthName} ${parsiDate.year} YZ (${variantLabel})`;
}

function eventUID(subject, occasion, number) {
  const slug = `${subject}-${occasion}-${number}`.toLowerCase().replace(/[^a-z0-9-]/g, "");
  return `parsi-${slug}@parsi-calendar`;
}

export function generateICS(anniversaries, subject, occasion, variant) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Parsi Calendar//EN",
    "CALSCALE:GREGORIAN",
  ];

  for (const ann of anniversaries) {
    const summary = `${subject} ${ordinal(ann.number)} ${occasion}`;
    const dtstart = formatDateICS(ann.gregorianDate);
    const description = formatParsiDate(ann.parsiDate, variant);

    lines.push(
      "BEGIN:VEVENT",
      `DTSTART;VALUE=DATE:${dtstart}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `UID:${eventUID(subject, occasion, ann.number)}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function generateCancelICS(subject, occasion, count) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Parsi Calendar//EN",
    "METHOD:CANCEL",
  ];

  for (let i = 1; i <= count; i++) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${eventUID(subject, occasion, i)}`,
      "DTSTART;VALUE=DATE:20000101",
      "SEQUENCE:1",
      "STATUS:CANCELLED",
      `SUMMARY:${subject} ${ordinal(i)} ${occasion}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
