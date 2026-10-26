import { MasterPage } from "@/components/masters/master-page";
import { config } from "@/lib/masters/configs/majors";

export const metadata = { title: "Jurusan — Academy" };

export default async function MajorsPage({
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
