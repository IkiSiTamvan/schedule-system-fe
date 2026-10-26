import { MasterPage } from "@/components/masters/master-page";
import { config } from "@/lib/masters/configs/time-slots";

export const metadata = { title: "Slot waktu — Academy" };

export default async function TimeSlotsPage({
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
