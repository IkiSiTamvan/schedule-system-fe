import "server-only";
import type { MasterConfig } from "./types";
import { config as master0 } from "./configs/academic-periods";
import { config as master1 } from "./configs/majors";
const masters: MasterConfig[] = [master0, master1];
export function masterConfig(slug: string): MasterConfig | undefined {
  return masters.find((config) => config.slug === slug);
}
