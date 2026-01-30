export function ordinal(n) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  const mod10 = n % 10;
  if (mod10 === 1) return `${n}st`;
  if (mod10 === 2) return `${n}nd`;
  if (mod10 === 3) return `${n}rd`;
  return `${n}th`;
}

const MONTH_NAMES = [
  "Fravardin", "Ardibehesht", "Khordad", "Tir", "Amardad", "Shehrevar",
  "Meher", "Avan", "Adar", "Dae", "Bahman", "Asfandarmad"
];

export const SHAHENSHAHI = "shahenshahi";
export const KADMI = "kadmi";
export const FASLI = "fasli";

const EPOCH_GREGORIAN = {
  [SHAHENSHAHI]: new Date(2025, 7, 15),
  [KADMI]: new Date(2025, 6, 16),
  [FASLI]: new Date(2025, 2, 21),
};

const EPOCH_PARSI_YEAR = 1394;

function daysBetween(a, b) {
  const msPerDay = 86400000;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utcB - utcA) / msPerDay);
}

export function gregorianToParsi(gregDate, variant) {
  const epoch = EPOCH_GREGORIAN[variant];
  let totalDays = daysBetween(epoch, gregDate);

  const parsiYearLength = 365;
  let year = EPOCH_PARSI_YEAR;

  if (totalDays < 0) {
    while (totalDays < 0) {
      year--;
      totalDays += parsiYearLength;
    }
  } else {
    while (totalDays >= parsiYearLength) {
      totalDays -= parsiYearLength;
      year++;
    }
  }

  const dayOfYear = totalDays;
  if (dayOfYear >= 360) {
    return { day: dayOfYear - 360 + 1, month: 13, year, monthName: "Gatha" };
  }

  const month = Math.floor(dayOfYear / 30) + 1;
  const day = (dayOfYear % 30) + 1;
  return { day, month, year, monthName: MONTH_NAMES[month - 1] };
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isFasliLeapYear(fasliYear) {
  const gregApproxYear = fasliYear + 631;
  return (gregApproxYear % 4 === 0 && gregApproxYear % 100 !== 0) || gregApproxYear % 400 === 0;
}

export function generateAnniversaries(baseGregorianDate, variant, count) {
  const anniversaries = [];
  let currentDate = new Date(baseGregorianDate);

  const baseParsi = gregorianToParsi(currentDate, variant);
  if (variant === FASLI) {
    currentDate = addDays(currentDate, isFasliLeapYear(baseParsi.year) ? 366 : 365);
  } else {
    currentDate = addDays(currentDate, 365);
  }

  for (let i = 0; i < count; i++) {
    const parsiDate = gregorianToParsi(currentDate, variant);
    anniversaries.push({
      number: i + 1,
      gregorianDate: new Date(currentDate),
      parsiDate,
    });

    if (variant === FASLI) {
      const nextYearLength = isFasliLeapYear(parsiDate.year) ? 366 : 365;
      currentDate = addDays(currentDate, nextYearLength);
    } else {
      currentDate = addDays(currentDate, 365);
    }
  }

  return anniversaries;
}
