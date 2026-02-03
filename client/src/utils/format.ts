export function formatDateLabel(dateString?: string, timeString?: string) {
  if (!dateString) return timeString ? timeString : 'TBA';
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return dateString;
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const datePart = parsed.toLocaleDateString(undefined, options);
  const timePart = timeString ? ` — ${timeString}` : '';
  return `${datePart}${timePart}`;
}

export function formatTimestamp(timestamp?: string) {
  if (!timestamp) return '';
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return timestamp;
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return parsed.toLocaleDateString(undefined, options);
}
