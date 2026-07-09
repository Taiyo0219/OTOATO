const JST_OFFSET_HOURS = 9;

export function createValidationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

export function dateRangeForJstDate(dateText) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    throw createValidationError("dateはYYYY-MM-DD形式で指定してください。");
  }

  const [year, month, day] = dateText.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, day, -JST_OFFSET_HOURS, 0, 0, 0));
  const end = new Date(Date.UTC(year, month - 1, day + 1, -JST_OFFSET_HOURS, 0, 0, 0));

  return { start, end };
}
