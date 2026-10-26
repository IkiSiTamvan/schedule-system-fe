import "server-only";
import type { MasterConfig } from "./types";
const masters: MasterConfig[] = [];
export function masterConfig(slug: string): MasterConfig | undefined {
  return masters.find((config) => config.slug === slug);
}
