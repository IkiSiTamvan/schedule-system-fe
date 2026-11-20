import type { DaySlot } from "@/lib/time-slot-day";

export type TeacherAvailability = {
  academicYearId: number;
  availableSlotIds: number[];
  slots: (DaySlot & { dayOfWeek: number; dayName: string })[];
};
