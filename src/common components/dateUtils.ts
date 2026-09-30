export const getFormattedCurrentDate = (date: Date = new Date()): string => {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }); // e.g. "29 Sep 2026"
};

export const getFormattedCurrentTime = (date: Date = new Date()): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }); // e.g. "04:25 PM"
};

export const getFormattedCurrentDateTime = (date: Date = new Date()): string => {
  return `${getFormattedCurrentDate(date)}, ${getFormattedCurrentTime(date)}`;
};

export const getTodayLabel = (date: Date = new Date()): string => {
  return `Today, ${getFormattedCurrentDate(date)}`;
};

export const getCurrentISODate = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getCurrentMonthYear = (date: Date = new Date(), full = false): string => {
  return date.toLocaleDateString("en-GB", {
    month: full ? "long" : "short",
    year: "numeric",
  });
};
