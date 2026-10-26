import "server-only";
import { config as periods } from "./configs/academic-periods";
import { config as majors } from "./configs/majors";
import { config as subjects } from "./configs/subjects";
import { config as teachers } from "./configs/teachers";
import { config as classes } from "./configs/class-groups";
import { config as facilities } from "./configs/facilities";
import { config as rooms } from "./configs/rooms";
import { config as slots } from "./configs/time-slots";
import type { MasterConfig } from "./types";

const masters = [
  periods,
  majors,
  subjects,
  teachers,
  classes,
  facilities,
  rooms,
  slots,
];
export function masterConfig(slug: string): MasterConfig | undefined {
  return masters.find((config) => config.slug === slug);
}
