import { redirect } from "next/navigation";

export default async function TeacherAvailabilityPage({
  params,
  searchParams,
}: {
  params: Promise<{ schoolId: string; teacherId: string }>;
  searchParams: Promise<{ academicPeriodId?: string | string[] }>;
}) {
  const { schoolId, teacherId } = await params;
  const { academicPeriodId } = await searchParams;
  const query = new URLSearchParams({ teacherId });
  if (typeof academicPeriodId === "string")
    query.set("academicPeriodId", academicPeriodId);
  redirect(
    `/schools/${encodeURIComponent(schoolId)}/teacher-schedules?${query}`,
  );
}
