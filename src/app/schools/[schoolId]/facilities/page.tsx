import { MasterPage } from "@/components/masters/master-page";
import { config } from "@/lib/masters/configs/facilities";

export const metadata = { title: "Fasilitas — Academy" };

export default async function FacilitiesPage({
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
