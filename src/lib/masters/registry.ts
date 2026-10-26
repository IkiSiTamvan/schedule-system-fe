import "server-only";
import type { MasterConfig } from "./types";
import { config as master0 } from "./configs/academic-periods";
import { config as master1 } from "./configs/majors";
import { config as master2 } from "./configs/subjects";
import { config as master3 } from "./configs/teachers";
import { config as master4 } from "./configs/class-groups";
import { config as master5 } from "./configs/facilities";
import { config as master6 } from "./configs/rooms";
const masters: MasterConfig[] = [master0, master1, master2, master3, master4, master5, master6];
export function masterConfig(slug: string): MasterConfig | undefined {
  return masters.find((config) => config.slug === slug);
}
