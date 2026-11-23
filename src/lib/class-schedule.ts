import type { DaySlot } from "@/lib/time-slot-day";

export type SchedulePeriod = {
  id: number;
  academicYearId: number;
  academicYearName: string;
  name: string;
  startsOn: string;
  endsOn: string;
};

export type ScheduleClass = { id: number; name: string };

export type ScheduleVersion = {
  id: number;
  versionNumber: number;
  name: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

export type ScheduleEntry = {
  id: number;
  classGroupId: number;
  requirementId: number;
  teacherId: number;
  roomId: number | null;
  timeSlotIds: number[];
};

export type ScheduleRequirement = {
  requirementId: number;
  subjectId: number;
  subjectName: string;
  weeklyJp: number;
  scheduledJp: number;
  requiresLab: boolean;
};

export type ScheduleTeacher = {
  id: number;
  name: string;
  active: boolean;
  external: boolean;
  subjectIds: number[];
};

export type ScheduleRoom = { id: number; name: string; roomType: string };
export type ScheduleSlot = DaySlot & { dayOfWeek: number; dayName: string };
export type ExternalTeacherAvailability = Record<number, number[] | undefined>;

export function schedulePath(schoolId: number) {
  return "/schools/" + schoolId + "/class-schedules";
}
