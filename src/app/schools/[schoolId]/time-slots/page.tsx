import { TimeSlotPage } from "@/components/masters/time-slot-page";
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
  const search = await searchParams;
  if (search.view !== "table")
    return (
      <TimeSlotPage params={params} searchParams={Promise.resolve(search)} />
    );
  return (
    <MasterPage params={params} searchParams={searchParams} config={config} />
  );
}
