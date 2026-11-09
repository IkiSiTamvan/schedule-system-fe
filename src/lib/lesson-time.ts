/** End time for one or more consecutive JP; empty when invalid or crossing midnight. */
export function lessonEnd(start: string, minutes: number, count = 1): string {
  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::00)?$/.exec(start);
  if (
    !match ||
    !Number.isInteger(minutes) ||
    minutes < 1 ||
    !Number.isInteger(count) ||
    count < 1
  )
    return "";
  const end = Number(match[1]) * 60 + Number(match[2]) + minutes * count;
  return end < 1440
    ? `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`
    : "";
}
