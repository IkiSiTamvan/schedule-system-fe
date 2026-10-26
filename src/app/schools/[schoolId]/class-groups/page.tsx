import { MasterPage } from "@/components/masters/master-page";
import { config } from "@/lib/masters/configs/class-groups";

export default async function ClassGroupsPage({
  params,
  searchParams,
}: {
  params: Promise<{ schoolId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <MasterPage params={params} searchParams={searchParams} config={config} />
  );
}
