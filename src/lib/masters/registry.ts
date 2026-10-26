import "server-only";
import type { MasterConfig } from "./types";
import { config as master0 } from "./configs/academic-periods";
const masters: MasterConfig[] = [master0];
export function masterConfig(slug: string): MasterConfig | undefined {
  return masters.find((config) => config.slug === slug);
}
