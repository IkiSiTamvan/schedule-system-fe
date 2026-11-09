export type DaySlot = {
  id: number;
  label: string;
  sequenceNumber: number;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  kind: "LESSON" | "BREAK" | "ACTIVITY" | "OTHER";
  kindLabel: string;
};
export type SlotDay = { slots: DaySlot[]; revision: string };

export function previewDay(slots: DaySlot[], start: string) {
  const validStart = /^([01]\d|2[0-3]):[0-5]\d$/.test(start);
  let minute = validStart
    ? Number(start.slice(0, 2)) * 60 + Number(start.slice(3, 5))
    : NaN;
  const time = (value: number) =>
    Number.isFinite(value) && value >= 0 && value < 1440
      ? `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`
      : "";
  return slots.map((slot, index) => {
    const startsAt = time(minute);
    minute +=
      Number.isInteger(slot.durationMinutes) && slot.durationMinutes > 0
        ? slot.durationMinutes
        : NaN;
    return {
      ...slot,
      sequenceNumber: index + 1,
      startsAt,
      endsAt: time(minute),
    };
  });
}
