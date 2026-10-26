import { MasterPage } from "@/components/masters/master-page";
import { config } from "@/lib/masters/configs/teachers";

export default async function TeachersPage({
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
