import { MasterPage } from "@/components/masters/master-page";
import { config } from "@/lib/masters/configs/rooms";

export const metadata = { title: "Ruangan — Academy" };
export default async function RoomsPage({
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
