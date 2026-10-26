import "server-only";
import type { MasterConfig } from "./types";
import { config as master0 } from "./configs/academic-periods";
import { config as master1 } from "./configs/majors";
import { config as master2 } from "./configs/subjects";
const masters: MasterConfig[] = [master0, master1, master2];
export function masterConfig(slug: string): MasterConfig | undefined {
  return masters.find((config) => config.slug === slug);
}
